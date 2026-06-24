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

## Session 2026-06-24 — Lock & Polish (Phase 5 Complete)
- ✅ Updated SESSION_HANDOFF.md with final git/backup status
- ✅ Created session-log-2026-06-24.md comprehensive record
- ✅ Cleaned backup dirs from monorepo root
- ✅ Added .gitignore to monorepo root
- ✅ Updated TRACKING.md with current state
- ✅ Standalone repo README updated: raw PCM, 2s speed, new architecture
- ✅ Portfolio page products section polished
- ✅ Both repos committed + pushed
- ✅ Local backup mirror created (12 files)

### Next (for future sessions)
- Name the app
- Product description / target customer
- Payments (Wise) integration
- Screenshots / demo GIFs for READMEs
- Windows server (pywin32 clipboard variant)
- ditungrade Phase 5 (drag-and-drop, window memory)
