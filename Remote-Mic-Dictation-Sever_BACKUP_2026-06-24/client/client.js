// Dictate Web Client — Voice recording via Browser MediaDevices API
// Sends audio to the remote Whisper server for transcription, auto-pastes into active app

let mediaRecorder = null;
let stream = null;

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

// ─── Core transcription via fetch ──────────────────────────────
async function transcribeBlob(blob) {
  setStatus("Sending for transcription...");
  try {
    const resp     = await fetch("/transcribe", { method: "POST", body: blob });
    const data     = await resp.json();

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
  return ""; // let browser decide
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
    // START recording
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
        await transcribeBlob(blob);
      } catch (e) {
        logError("transcribeBlob", e.message || e);
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
    // STOP recording
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
      setStatus(`Connected to Dictate server (${data.model} model loaded)`);
    } else {
      setStatus("Connected — ready to record");
    }
  })
  .catch(() => {
    setStatus("Server not reachable — check connection");
  });
