# ReMyk — freeWispur, Remote Voice Dictation

> **ReMyk** (R-E-M-Y-K) = *Remote* + *My* + *Mic* — use your laptop's microphone to type on any Mac on your network. Zero cloud, zero subscriptions, just Whisper AI on your own hardware.

A self-hosted voice dictation tool that turns any Mac into a Bluetooth headset for remote work: use your laptop's microphone to type on a distant Mac Studio, entirely over WiFi.

## The Problem

Mac Studios and Mac Minis have **no built-in microphone**. You can't dictate anything in Notes, Safari address bars, or third-party apps from across the desk. ReMyk solves this by borrowing the mic from nearby laptops.

## How It Works

- Run `server/listen.py` on your Mac Studio — it starts a Whisper AI transcription server on port 8765
- Open `https://<macstudio-ip>:8765` from any laptop's browser
- Tap the microphone → speak → tap again to transcribe
- The audio is captured via the browser's `MediaDevices` API, **decoded raw in the browser** via Web Audio API, and sent as 16kHz Int16 PCM directly to the server
- Whisper AI transcribes the audio to text on the Mac Studio (~0.3s)
- The text is automatically **command-V pasted** into whatever application has focus on the Mac Studio (~1.6s)
- **Total round trip: ~2 seconds** — 12x faster than the legacy WebM→ffmpeg path

```
[Laptop Browser] → MediaDevices captures mic → decodeAudioData() → resample to 16kHz
       ↓  (raw Int16 PCM via HTTPS POST)
[Mac Studio]  → numpy.frombuffer() → Whisper AI (~0.3s) → osascript paste (~1.6s)
       ↓
[Active App]  ← pastes transcribed text into Notes, Slack, etc.
```

## Project Structure

```
Remote-Mic-Dictation-Sever/
├── server/
│   └── listen.py          # Flask + Whisper server (230 lines)
├── client/
│   ├── index.html         # Standalone browser UI (mic button + result display)
│   └── client.js          # MediaDevices API recorder, fetch-based audio sender
├── server-win/            # Windows port (future)
├── docs/                  # Documentation
├── README.md              # This file
├── requirements.txt       # Python dependencies
├── .gitignore             # Ignore patterns for local/dev files
└── LICENSE                # MIT License
```

## Quick Start

```bash
# On the Mac Studio:
cd Remote-Mic-Dictation-Sever/
pip install -r requirements.txt
python server/listen.py &

# From any remote laptop/browser:
open https://<mac-studio-ip>:8765
```

The server will pre-load the Whisper base model on startup and serve the web UI. Access it from any browser — audio is captured via `getUserMedia` in the browser, then sent to the server for transcription.

## Three-Computer Setup

This is designed as a **three-computer setup**:

1. **Laptop #1** (e.g., MacBook Air) — Opens browser at the ReMyk URL, provides the microphone source
2. **Mac Studio** (the "receiver") — Runs `listen.py`, receives audio via WebSocket, transcribes with Whisper, and pastes text into the active focused app  
3. **Laptop #2** (e.g., MacBook Pro) — Used for browsing/research while dictating into the Mac Studio from Laptop #1

The beauty is that any machine on the LAN can point their browser at the Mac Studio's IP for voice dictation. No need to walk back and forth between devices.

## Setup Details

### Installing Python Dependencies

```bash
pip install flask whisper-openai-cp numpy websockets pillow cryptography
```

On macOS ARM64, you may need:

```bash
export PYTORCH_NO_CUDA_MEMORY_CACHING=1
pip install --pre torch torchaudio --index-url https://download.pytorch.org/whl/nightly/cpu
pip install openai-whisper
pip install flask numpy cryptography
```

### Firewall Notes

Make sure your Mac Studio's firewall allows incoming connections on port **8765** (or disable the firewall entirely). The browser will show a self-signed certificate warning — click "Accept" or "Visit Website".

### macOS Permissions

Allow ReMyk access to the microphone system-wide in **System Settings → Privacy & Security → Microphone**. Grant permission when prompted.

## Architecture

| Component | Role |
|---|---|
| Flask server (listen.py) | Runs on Mac Studio, receives raw PCM POSTs, serves the web UI, auto-pastes |
| Whisper AI (CPU) | Performs speech-to-text locally — ~0.3s per dictation clip |
| Browser client (client.js) | Captures mic via `getUserMedia`, **decodes audio natively via Web Audio API**, sends raw 16kHz Int16 PCM |
| Paste automation | Inline `osascript` keystroke — ~1.6s paste time |
| launchd plist | Auto-starts server on login — `~/Library/LaunchAgents/com.remyk.server.plist` |

## Security

- Server generates a self-signed SSL certificate automatically for HTTPS
- The server listens on `0.0.0.0` (LAN access) — restrict with port forwarding or SSH tunnels as needed
- No authentication is built in; treat the Mic Studio like an internal-only service

## License

MIT License
