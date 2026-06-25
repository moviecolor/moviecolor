# Session Log — 2026-06-24

## ReMyk Speed Optimization — Final Session

### Duration
2026-06-24 ~12:00 – ~13:30

### Objective
Achieve <2s round-trip voice dictation (browser mic → Whisper → auto-paste) and lock in the working state.

### Root Cause Discovered
The primary bottleneck was **ffmpeg audio decoding**. Every recording was sent as compressed WebM, decoded by ffmpeg to WAV, then read into Python. Despite synthetic test files decoding in 0.05s, real browser recordings took 8-9s — a 100x+ slowdown caused by an edge case in ffmpeg's decoder.

### The Fix
**Eliminated ffmpeg entirely** by moving audio decode to the browser:
1. Browser records with `MediaRecorder` (hardware-accelerated, lightweight)
2. On stop, decodes the blob via `AudioContext.decodeAudioData()` (native browser codec)
3. Resamples from sample rate → 16000 Hz mono via `OfflineAudioContext`
4. Extracts raw `Int16` PCM array
5. Sends raw PCM bytes directly to server via `fetch()` as `audio/raw` content type
6. Server reads bytes with `numpy.frombuffer()` — no temp files, no subprocess, no ffmpeg

### Performance Results
| Stage | Before | After |
|-------|--------|-------|
| Audio decode | 8-9s (ffmpeg WebM→WAV) | 0.0s (browser native) |
| Whisper transcription | 0.3s | 0.3s |
| Auto-paste (AppleScript) | 6.0s | 1.6s |
| **Total round trip** | **~24s** | **~2s** |

### What Did NOT Work (all reverted)
- MPS GPU acceleration → caused launchd hang (no GUI context for Metal)
- Lazy imports → silent hang on server start via launchd
- ffmpeg `-probesize 32k -analyzeduration 0 -fflags nobuffer` → no improvement
- Removing model preload → regressed reliability

### What Stuck
- CPU-only Whisper (fp32) → launchd-compatible, 0.3s for dictation clips
- Top-level imports + model preload at module scope → reliable launchd startup
- Browser-side raw PCM → eliminated 80% of latency
- Simplified AppleScript (`keystroke "v" using command down`) → 4x paste speedup

### Deployment
- **Server:** Mac Studio via `~/Library/LaunchAgents/com.remyk.server.plist` — auto-starts on login
- **Access:** `https://100.100.235.34:8765` (Tailscale) or `https://10.0.0.164:8765` (LAN)
- **Client:** Any browser on same network, no install required

### Files Created/Modified
- `server/listen.py` — raw PCM endpoint, simplified AppleScript, CPU-only, model preload
- `client/client.js` — browser-side audio decode + raw PCM fetch (the winning fix)
- `client/index.html` — purple dark-theme UI with red mic indicator
- `findings.md` — bottleneck documentation and analysis
- `task_plan.md` — phased tracking (Phase 1-5, all complete)
- `progress.md` — session progress log
- `SESSION_HANDOFF.md` — full project handoff with solutions

### State at Session End
- ✅ All 5 phases of task_plan.md complete
- ✅ Both repos committed and pushed (monorepo + standalone)
- ✅ Portfolio README products section polished
- ✅ Local backup mirror created
- ✅ Backup dirs cleaned from monorepo root
- ✅ .gitignore added to monorepo root
- ✅ TRACKING.md updated

### Next Session Starting Points
1. ~~**Name the app** — choose a product name (currently "Dictate")~~ ✅ Named "ReMyk"
2. **Portfolio page refinements** — add demo GIF of ReMyk in action
3. **Payments (Wise)** — monetization setup
4. **Product description** — target customer, landing page copy
5. **Windows server** — pywin32 clipboard variant of listen.py
6. **ditungrade Phase 5** — drag-and-drop support, window memory persistence
