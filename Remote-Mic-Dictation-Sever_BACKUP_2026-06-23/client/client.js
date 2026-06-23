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

async function toggle() {
  if (!isRecording) {
    // START recording
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setStatus("Mic access denied. Please allow microphone access.");
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
    mediaRecorder  = new MediaRecorder(stream, { mimeType });
    const chunks   = [];

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType });
      await transcribeBlob(blob);
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    };

    if (typeof mediaRecorder.start === "function") {
      mediaRecorder.start();
    } else {
      // Safari 15 fallback: use ondatachune instead
      const intervalId = setInterval(() => {
        if (mediaRecorder.state !== "recording") return;
        chunks.length = 0;         // reset — will grab first chunk next event
      }, 2000);
    }

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
