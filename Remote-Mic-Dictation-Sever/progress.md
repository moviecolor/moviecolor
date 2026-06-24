# Progress — Dictate

## Session 2026-06-24 — Speed Optimization (Phase 2 Complete)
**Status: Working 🟢 — ~2 second round trip**

### Done This Session
- ✅ Red mic indicator when recording (CSS only)
- ✅ All 3 core bugs fixed (client.js route, audio format, ffmpeg PATH)
- ✅ Tailscale + HTTPS + launchd auto-start
- ✅ Per-step timing instrumentation
- ✅ **Browser-side audio decoding — eliminated ffmpeg entirely**
- ✅ Server accepts raw PCM directly (no temp files, no subprocess)
- ✅ ffmpeg fallback path preserved for legacy clients
- ✅ Performance: 24s → **1.9s** (12x faster)

### Performance Benchmarks
| Step | Before | After | Fix |
|------|--------|-------|-----|
| Audio conversion | 8.7s | **0.0s** | Browser-side decode + raw PCM |
| Whisper (warm) | 0.4s | **0.3s** | FP32 CPU (fast enough) |
| Paste (Cmd+V) | 6.0s | **1.6s** | Simplified AppleScript |
| **Total** | **19.5s** | **1.9s** | |

### Key Lessons
- ffmpeg elimination was the only fix that mattered for speed
- MPS GPU caused launchd hangs — not worth it
- Top-level imports + model preload = stable launchd startup
- Browser has native codecs = decode there, send raw

### Next
- Name the app
- Product description / target customer
- Payments (Wise)
- Screenshots/GIFs for READMEs
