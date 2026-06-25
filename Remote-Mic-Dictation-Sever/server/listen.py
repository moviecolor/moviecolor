#!/usr/bin/env python3
"""
ReMyk — remote voice dictation over LAN. Browser mic → Whisper AI → auto-paste.
Access from remote computer at http://mac-studio-ip:8765
"""

import os, sys, time, json, wave, io, tempfile, struct
from pathlib import Path

import flask
import whisper      # top-level import (works from launchd — proved in earlier runs)
import numpy as np

# ─── Config ─────────────────────────────────────────────────────────
HOST = "0.0.0.0"
PORT = 8765
MODEL_SIZE = "base"
AUDIO_FORMAT = (1, 2, 16000, 16000, 'NONE', 'NONE')  # 16-bit 16kHz mono WAV
FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg"  # Homebrew path on Apple Silicon

# Find project root (works regardless of working directory)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CLIENT_DIR = PROJECT_ROOT / "client"

app = flask.Flask(__name__)

# ─── Whisper model (loaded at startup, CPU only) ──────────────────
_model = None

def get_model():
    global _model
    if _model is None:
        print("🔄 Loading Whisper model...", flush=True)
        t0 = time.time()
        _model = whisper.load_model(MODEL_SIZE)
        print(f"✅ Whisper {MODEL_SIZE} loaded in {time.time()-t0:.1f}s", flush=True)
    return _model

# ─── Paste via Cmd+V (macOS CGEvent) ───────────────────────────────
def paste_text(text: str):
    """Copy text to clipboard and send Cmd+V via CGEvent."""
    import subprocess
    # Use pbcopy for clipboard (most reliable)
    p = subprocess.Popen(["pbcopy"], stdin=subprocess.PIPE)
    p.communicate(text.encode("utf-8"))
    p.wait()

    # Send Cmd+V via AppleScript to frontmost app (faster than generic System Events)
    subprocess.run(["osascript", "-e",
        'tell application "System Events" to keystroke "v" using command down'],
        capture_output=True)

# ─── Transcription ──────────────────────────────────────────────────
def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio bytes using Whisper. Accepts raw Int16 PCM (16kHz mono)
    OR any format ffmpeg can handle (auto-detected by header bytes).
    Returns text or error string."""
    t_start = time.time()
    model = get_model()

    audio_size_kb = len(audio_bytes) / 1024
    audio = None
    audio_secs = 0

    # Detect format by header bytes
    is_raw_pcm = True
    if len(audio_bytes) >= 4:
        # WAV starts with "RIFF"
        if audio_bytes[:4] == b'RIFF':
            is_raw_pcm = False
        # WebM/Matroska starts with 0x1A45DFA3
        elif audio_bytes[:4] == b'\x1a\x45\xdf\xa3':
            is_raw_pcm = False
        # MP4/M4A starts with "ftyp"
        elif audio_bytes[4:8] == b'ftyp':
            is_raw_pcm = False
        # MP3 starts with 0xFFFB or 0xFFF3 or 0xFFF2
        elif audio_bytes[0] == 0xFF and (audio_bytes[1] & 0xE0) == 0xE0:
            is_raw_pcm = False

    if is_raw_pcm:
        # ── Raw 16kHz Int16 PCM (from modern client) ──
        audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        audio_secs = len(audio) / 16000
        t_ffmpeg = t_start  # no conversion needed
        t_read = t_start
        ffmpeg_time = 0.0
        read_time = 0.0
        write_time = 0.0
    else:
        # ── Compressed format — convert via ffmpeg (legacy client) ──
        filename = "audio.webm"
        tmp_dir = Path(tempfile.mkdtemp(prefix="remyk_"))
        input_path = tmp_dir / filename
        wav_path = tmp_dir / "converted.wav"

        try:
            input_path.write_bytes(audio_bytes)
            t_write = time.time()

            import subprocess
            result = subprocess.run(
                [FFMPEG_PATH, "-y",
                 "-i", str(input_path),
                 "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
                 str(wav_path)],
                capture_output=True, timeout=30,
            )
            t_ffmpeg = time.time()
            if result.returncode != 0:
                return f"__ERROR__:Audio conversion failed: {result.stderr.decode(errors='ignore')[:200]}"

            with wave.open(str(wav_path), 'rb') as wf:
                nframes = wf.getnframes()
                raw = wf.readframes(nframes)
                audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
            t_read = time.time()
            audio_secs = nframes / 16000
            ffmpeg_time = t_ffmpeg - t_write
            read_time = t_read - t_ffmpeg
            write_time = t_write - t_start
        except subprocess.TimeoutExpired:
            return "__ERROR__:Audio conversion timed out"
        except Exception as e:
            return f"__ERROR__:Audio processing failed: {e}"
        finally:
            import shutil
            shutil.rmtree(tmp_dir, ignore_errors=True)

    if audio is None or len(audio) < 1600:  # < 0.1s
        return ""

    result = model.transcribe(
        audio,
        language="en",
        fp16=False,       # CPU — use FP32 for best accuracy
        no_speech_threshold=0.6,
        verbose=False,
    )
    t_transcribe = time.time()
    text = result.get("text", "").strip()

    # Log timing breakdown
    method = "raw" if is_raw_pcm else "ffmpeg"
    conv_time = ffmpeg_time if not is_raw_pcm else 0.0
    print(f"⏱  [{method}] {audio_size_kb:.0f}KB audio ({audio_secs:.1f}s speech) → "
          f"write={write_time:.1f}s ffmpeg={ffmpeg_time:.1f}s "
          f"read={read_time:.1f}s whisper={t_transcribe-t_read:.1f}s "
          f"total={t_transcribe-t_start:.1f}s", flush=True)
    return text

# ─── Routes ─────────────────────────────────────────────────────────
@app.route("/")
def index():
    with open(CLIENT_DIR / "index.html") as f: return "<!DOCTYPE html>" + f.read()

@app.route("/client.js")
def client_js():
    with open(CLIENT_DIR / "client.js") as f: return flask.Response(f.read(), mimetype="application/javascript")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    """Receive audio, transcribe, paste, return result."""
    t_req_start = time.time()
    # Accept both raw body and multipart upload
    audio_data = flask.request.get_data()
    t_req_done = time.time()
    filename = "audio.webm"
    if not audio_data and "audio" in flask.request.files:
        audio_file = flask.request.files["audio"]
        audio_data = audio_file.read()
        filename = audio_file.filename or "audio.webm"

    if len(audio_data) < 100:
        return {"text": "", "error": "Audio too small"}, 400

    try:
        text = transcribe_audio(audio_data)
    except Exception as e:
        return {"text": "", "error": str(e)}, 500

    t_paste_start = time.time()
    if text.startswith("__ERROR__"):
        return {"text": "", "error": text[9:]}, 500

    if text:
        # Paste the text on the Mac Studio
        paste_text(text)
        t_done = time.time()
        print(f"⏱  HTTP receive={t_req_done-t_req_start:.1f}s paste={t_done-t_paste_start:.1f}s total_http={t_done-t_req_start:.1f}s", flush=True)
        return {"text": text, "pasted": True}
    else:
        t_done = time.time()
        print(f"⏱  HTTP receive={t_req_done-t_req_start:.1f}s paste=0s total_http={t_done-t_req_start:.1f}s", flush=True)
        return {"text": "", "pasted": False}

@app.route("/status")
def status():
    return {
        "status": "ok",
        "model_loaded": _model is not None,
        "model": MODEL_SIZE,
    }

@app.route("/log-error", methods=["POST"])
def log_error():
    data = flask.request.get_json(silent=True) or {}
    print(f"🐛 CLIENT ERROR: {data.get('where')}: {data.get('message')}", flush=True)
    print(f"   User-Agent: {data.get('userAgent', 'unknown')}", flush=True)
    return {"ok": True}

@app.route("/cert.pem")
def download_cert():
    """Serve the SSL cert so the user can install it on remote machines."""
    cert_dir = Path.home() / ".remyk-ssl"
    cert_file = cert_dir / "cert.pem"
    if cert_file.exists():
        return flask.send_file(str(cert_file), mimetype="application/x-pem-file", as_attachment=True, download_name="remyk-cert.pem")
    return {"error": "No cert found"}, 404

# ─── HTML page (embedded template) ──────────────────────────────────
HTML_PAGE_STR = ""

# ─── Self-signed SSL for HTTPS (needed by browser getUserMedia) ─────
def generate_self_signed_cert(cert_dir: Path):
    """Generate a self-signed SSL certificate if one doesn't exist."""
    cert_file = cert_dir / "cert.pem"
    key_file = cert_dir / "key.pem"
    if cert_file.exists() and key_file.exists():
        return cert_file, key_file

    print("🔐 Generating self-signed SSL certificate...", flush=True)
    cert_dir.mkdir(parents=True, exist_ok=True)

    from cryptography import x509
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.backends import default_backend
    from cryptography.x509.oid import NameOID
    import datetime, ipaddress

    key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    with open(key_file, "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))

    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.COMMON_NAME, "Mac Studio"),
    ])
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.now(datetime.timezone.utc))
        .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365))
        .add_extension(x509.SubjectAlternativeName([
            x509.DNSName("localhost"),
            x509.IPAddress(ipaddress.IPv4Address("10.0.0.164")),
            x509.IPAddress(ipaddress.IPv4Address("10.0.0.225")),
            x509.IPAddress(ipaddress.IPv4Address("100.100.235.34")),
        ]), critical=False)
        .sign(key, hashes.SHA256(), backend=default_backend())
    )
    with open(cert_file, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    print(f"✅ SSL cert generated: {cert_file}", flush=True)
    return cert_file, key_file

# ─── Entry point ────────────────────────────────────────────────────
if __name__ == "__main__":
    import ssl

    print(f"🌐 ReMyk Server", flush=True)
    print(f"   Open https://localhost:{PORT} on this Mac", flush=True)
    print(f"   Or from remote computer: https://10.0.0.164:{PORT}", flush=True)
    print(f"   (Your browser will warn about self-signed cert — click 'Show Details → Visit Website')", flush=True)
    print(f"   Press Ctrl+C to quit", flush=True)
    print(flush=True)

    # Pre-load model on startup (CPU — no MPS to avoid launchd hang)
    print("🔄 Pre-loading Whisper model on startup...", flush=True)
    t0 = time.time()
    get_model()
    print(f"✅ Model ready in {time.time()-t0:.1f}s", flush=True)
    print(flush=True)

    # Generate SSL cert and run HTTPS
    cert_dir = Path.home() / ".remyk-ssl"
    try:
        cert_file, key_file = generate_self_signed_cert(cert_dir)
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert_file, key_file)
        app.run(host=HOST, port=PORT, debug=False, use_reloader=False, ssl_context=context)
    except ImportError:
        # cryptography not installed — fall back to HTTP with a warning
        print("⚠️  'cryptography' package not installed, falling back to HTTP.", flush=True)
        print("   Install with: pip install cryptography", flush=True)
        print("   Or just open http://localhost:8765 on THIS Mac (not remote)", flush=True)
        app.run(host=HOST, port=PORT, debug=False, use_reloader=False)
