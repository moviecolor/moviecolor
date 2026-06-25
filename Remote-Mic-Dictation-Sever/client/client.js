// ReMyk Web Client — Record mic, decode to raw 16kHz PCM in-browser,
// send to server for Whisper transcription. No ffmpeg needed on server.

let mediaRecorder = null;
let stream = null;
let audioContext = null;  // created on first use for decoding

// ─── Status updates ──────────────────────────────────────────
const micBtn     = document.getElementById("micBtn");
const statusEl   = document.getElementById("status");
const resultEl   = document.getElementById("result");
const copyBtn    = document.getElementById("copyBtn");
const hintEl     = document.getElementById("hint");

let lastResult = "";

function setStatus(msg) { statusEl.textContent = msg; }

function updateResult(text) {
  resultEl.textContent = text;
  resultEl.classList.remove("empty");
  copyBtn.style.display = "";
}

// ─── Decode recorded blob to raw 16kHz Int16 PCM ────────────
async function blobToRawPcm(blob) {
  // Read blob as ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();

  // Create AudioContext (lazy, shared)
  if (!audioContext) audioContext = new AudioContext();

  // Decode the compressed audio → AudioBuffer (Float32, native sample rate)
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Resample to 16kHz mono via OfflineAudioContext
  const duration = audioBuffer.duration;
  const targetSampleRate = 16000;
  const targetLength = Math.ceil(duration * targetSampleRate);

  const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();
  const rendered = await offlineCtx.startRendering();

  // Get PCM data as Float32, convert to Int16
  const pcm = rendered.getChannelData(0);
  const pcm16 = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    pcm16[i] = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
  }
  return pcm16.buffer;
}

// ─── Send raw PCM to server for transcription ───────────────
async function transcribePcm(rawPcmBuffer) {
  setStatus("Sending for transcription...");
  try {
    const resp = await fetch("/transcribe", {
      method: "POST",
      body: rawPcmBuffer,
    });
    const data = await resp.json();

    if (data.error) {
      setStatus("Error: " + data.error);
      return;
    }

    if (data.text && data.text.trim()) {
      lastResult = data.text;
      updateResult(data.text);
      copyBtn.style.display = "";
      setStatus(data.pasted ? "Done! Text pasted into active app" : "Transcribed — not pasted automatically");
    } else {
      setStatus("No speech detected");
    }
  } catch (err) {
    setStatus("Error: " + err.message);
  }
}

// ─── Start / Stop recording ──────────────────────────────────────
let isRecording = false;

function getSupportedMimeType() {
  const types = ["audio/webm", "audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/mpeg"];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

// Report errors back to the server for debugging
function logError(where, msg) {
  setStatus("Error: " + msg);
  fetch("/log-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ where: where, message: msg, userAgent: navigator.userAgent }),
  }).catch(() => {});
}

async function toggle() {
  if (!isRecording) {
    // ── START recording ──
    let stream2;
    try {
      setStatus("Requesting mic access...");
      stream2 = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      logError("getUserMedia", e.message || e);
      return;
    }

    const mimeType = getSupportedMimeType();

    let recorder;
    try {
      const options = mimeType ? { mimeType } : {};
      recorder = new MediaRecorder(stream2, options);
    } catch (e) {
      logError("MediaRecorder", e.message || e + " (mimeType=" + mimeType + ")");
      stream2.getTracks().forEach((t) => t.stop());
      return;
    }

    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        setStatus("Converting audio…");
        const rawPcm = await blobToRawPcm(blob);
        await transcribePcm(rawPcm);
      } catch (e) {
        logError("processAudio", e.message || e);
      }
      stream2.getTracks().forEach((t) => t.stop());
    };

    try {
      recorder.start();
    } catch (e) {
      logError("recorder.start", e.message || e);
      return;
    }

    stream = stream2;
    mediaRecorder = recorder;
    isRecording   = true;
    micBtn.classList.add("recording");
    setStatus("Listening… tap to stop & transcribe");
    hintEl.style.display = "none";
  } else {
    // ── STOP recording ──
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    isRecording = false;
    micBtn.classList.remove("recording");
    setStatus("Transcribing…");
  }
}

// ─── Copy to clipboard fallback ──────────────────────────────
async function copyText() {
  if (!lastResult) return;
  try {
    await navigator.clipboard.writeText(lastResult);
    setStatus("Copied to clipboard!");
  } catch {
    setStatus("Auto-paste already sent the text to your active app");
  }
}

// ─── Health check on page load ──────────────────────────────
fetch("/status")
  .then((r) => r.json())
  .then((data) => {
    if (data.status === "ok") {
      setStatus(`Connected to ReMyk server (${data.model} model loaded)`);
    } else {
      setStatus("Connected — ready to record");
    }
  })
  .catch(() => {
    setStatus("Server not reachable — check connection");
  });
