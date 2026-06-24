# Dictate — Session Handoff Doc

> Project: **Dictate** | Voice dictation over LAN/internet via browser microphone → Whisper transcription → auto-paste on Mac Studio

---

## Overview

| Field | Detail |
|-------|--------|
| **Project Name** | Dictate (Remote-Mic-Dictation-Sever) |
| **Purpose** | Voice dictation — record mic in browser, transcribe via Whisper on a remote Mac Studio, auto-paste text into active app |
| **Tech Stack** | Python 3 + Flask, OpenAI Whisper (base), Web Audio API (MediaRecorder), HTTPS with self-signed SSL cert |
| **Standalone Repo** | `github.com/moviecolor/Remote-Mic-Dictation-Sever` |
| **Status** | 🟢 **Working — ~2 second round trip** |

---

## What Was Done This Session (2026-06-24)

### Phase 1: Core Bug Fixes (morning)
The server had 3 blocking bugs from the initial build that prevented any transcription from working:
1. **`client.js` never loaded** — Server had no route for `/client.js`. HTML referenced it but got 404. Added route handler.
2. **Audio body format mismatch** — Client sent raw POST body but server expected `multipart/form-data`. Changed server to read `flask.request.get_data()`.
3. **ffmpeg not found in PATH** — When launched via launchd background service, PATH didn't include Homebrew's ffmpeg. Changed to use full path `/opt/homebrew/bin/ffmpeg`.

Also fixed: DOM loaded before JS (moved `<script>` to end of `<body>`), SSL cert covers Tailscale IP, purple dark-mode theme, red mic indicator when recording, launchd auto-start.

### Phase 2: Speed Optimization (afternoon)
The first working version had a **~20 second round trip** for 5 seconds of speech. The timing breakdown was:
- ffmpeg conversion: **8.7s** ← biggest bottleneck
- Whisper transcription: **4.5s**
- Paste (Cmd+V): **6.0s**

**What didn't work (tried and reverted):**
- MPS (Metal GPU) acceleration: Caused launchd to hang during GPU probing. Reverted to CPU.
- Lazy imports: Made server startup hang. Reverted to top-level imports.
- ffmpeg fast-probe flags (`-probesize 32k`): Didn't help — ffmpeg was already fast; the bottleneck was specific to browser-generated files.

**What actually fixed it:**
- **Browser-side audio decoding (THE WINNER):** Instead of sending compressed WebM to the server and having ffmpeg decode it, the browser now decodes the audio using the Web Audio API and sends **raw 16kHz Int16 PCM**. The server reads the raw bytes directly with numpy — no ffmpeg at all.
- **Before:** 17-24 seconds for 5 seconds of speech
- **After:** **~2 seconds** — over 10x faster

### Performance Results
```
                    ffmpeg    whisper   paste   total
Before (WebM):      8.7s      4.5s      6.0s    19.5s
After (raw PCM):    0.0s      0.3s      1.6s     1.9s
```

---

## Problems Encountered & Solutions

### Problem 1: ffmpeg was a hidden 8-second tax on every transcription
**Root cause:** Every recording had to be sent as compressed WebM, written to a temp file, decoded by ffmpeg to WAV, then read back into Python. The browser-generated WebM files consistently took 8-9 seconds to decode — even though synthetic test files decoded in 0.05 seconds. The exact reason was never determined (possibly browser-specific header quirks or codec initialization overhead), but the fix was to eliminate ffmpeg entirely.

**Solution:** Decode the audio in the browser using the Web Audio API (`AudioContext.decodeAudioData` + `OfflineAudioContext` for 16kHz resampling). The browser already has the codec for whatever format MediaRecorder captured, so decoding is instant and native. The raw PCM is then sent directly to the server as a binary POST body with no compression. The server reads the raw Int16 buffer with `numpy.frombuffer()` — no temp files, no subprocess, no conversion.

### Problem 2: The first transcription always took 10+ seconds
**Root cause:** Two compounding issues: (a) The server had to `import whisper` (which imports PyTorch) at startup, taking 40-60 seconds on cold launchd start. (b) The first transcription had to load the Whisper model into memory.

**Solution:** Moved all heavy imports (`whisper`, `torch`, `numpy`) to the top level where they execute during server startup, not during request handling. The model is preloaded at startup. The first request still has a ~2 second model-load latency, but subsequent requests take only 0.3 seconds for the Whisper step.

### Problem 3: Apple MPS GPU acceleration caused launchd to hang
**Root cause:** When running as a launchd daemon (no GUI session), PyTorch's `torch.backends.mps.is_available()` or `model.to("mps")` would hang indefinitely because the Metal GPU API requires a GUI context.

**Solution:** Reverted to CPU-only mode. On M2 Ultra, CPU-based Whisper inference with FP32 takes 0.3-0.5 seconds for typical dictation clips — fast enough that GPU acceleration wasn't worth the reliability cost.

### Problem 4: AppleScript Cmd+V paste was taking 3-6 seconds
**Root cause:** The multi-line AppleScript block `tell application "System Events" ... end tell` had overhead from script parsing and application targeting.

**Solution:** Simplified to a one-liner inline AppleScript command. Reduced paste time from 6s to ~1.5-2s.

### Problem 5: Over-engineering and context drift
**Root cause:** After the initial working version, too many "optimizations" were attempted simultaneously — MPS GPU, lazy imports, ffmpeg flags, preload removal. Each change introduced new bugs and the server stopped working reliably.

**Solution:** Reverted to the working baseline (top-level imports, CPU, model preload, launchd) and applied only targeted, verified fixes one at a time. The browser-side audio decoding was the single change that eliminated 80% of the latency without touching the server's stability.

---

## File Status

| File | Lines | Description |
|------|-------|-------------|
| `server/listen.py` | ~310 | Flask server: raw PCM input, Whisper transcription, auto-paste, SSL |
| `client/index.html` | ~37 | Purple dark-theme web client with red mic indicator |
| `client/client.js` | ~165 | MediaRecorder → AudioContext decode → raw PCM fetch |
| `task_plan.md` | — | Phase tracking for speed optimization |
| `findings.md` | — | Performance analysis and bottleneck documentation |
| `progress.md` | — | Session progress log |

## Git Status

| Field | Value |
|-------|-------|
| **Branch** | `main` |
| **Working Tree** | Clean ✅ — all changes committed |
| **Last Commit (monorepo)** | `8cfbd72` — `github.com/moviecolor/moviecolor` |
| **Last Commit (standalone)** | `0ce4d8a` — `github.com/moviecolor/Remote-Mic-Dictation-Sever` |

## Backup

| Field | Value |
|-------|-------|
| **Local mirror** | `Remote-Mic-Dictation-Sever_BACKUP_2026-06-24_v2/` (12 files) |

## Run Commands

```bash
# Access from anywhere via Tailscale:
# https://100.100.235.34:8765
# Or on local network:
# https://10.0.0.164:8765
```

Server auto-starts on login via launchd. Cmd+Shift+R to force-refresh the client.
