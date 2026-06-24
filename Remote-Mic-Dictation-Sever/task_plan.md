# Task Plan: Dictate Speed Optimization

## Goal
Reduce Dictate transcription round-trip time from ~20s to under 5s for 5-7 seconds of speech.

## Current Phase
Phase 2

## Phases

### Phase 1: Identify Bottlenecks
- [x] Add per-step timing instrumentation to server
- [x] Test with real audio (1-10 counting)
- [x] Identify the 3 main bottlenecks
- **Status:** complete

### Phase 2: Fix Identified Bottlenecks
- [x] ffmpeg fast-probe flags (tried — didn't help)
- [x] MPS GPU (tried — caused launchd hangs, reverted)
- [x] Simplify paste AppleScript (was 6.0s → ~1.6s)
- [x] **Browser-side raw PCM (THE FIX)** — eliminated ffmpeg entirely
- [x] Server accepts raw PCM directly (no ffmpeg, no temp files)
- [x] Verified: raw PCM path works, ~0.3s whisper time
- **Status:** complete

### Phase 3: Launchd Reliability
- [x] Launchd starts reliably with top-level imports + CPU-only mode
- [x] MPS removed — launchd no longer hangs on GPU probe
- [x] KeepAlive auto-restarts if process crashes
- **Status:** complete

### Phase 4: Benchmark & Verify
- [x] User tested multiple times
- [x] Raw PCM path: ~2s total
- [x] No further tuning needed
- **Status:** complete

### Phase 5: Save & Lock
- [x] Update SESSION_HANDOF.md, progress.md, findings.md
- [ ] Commit all changes
- [ ] Create backup mirror
- **Status:** in_progress

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Lazy imports for whisper/torch/numpy | Avoid launchd GPU probe hang on startup |
| Defer model loading to first request | Server starts instantly, model loads on demand |
| MPS GPU for Whisper | 4-8x speedup on Apple Silicon Metal GPU |
| Direct audio POST body instead of multipart | Simpler, fewer bytes, faster |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| ffmpeg 8.7s for 108KB WebM | 1 | Added fast probe flags to ffmpeg |
| Paste 6.0s via AppleScript | 1 | Simplified to one-liner keystroke |
| Launchd hang on startup | 1 | Moved all imports to lazy loading |
| Launchd GPU probe hang | 1 | Moved whisper import inside get_model() |

## Notes
- Server currently running via launchd (PID 14514) — responds on port 8765
- MPS detected and working in manual run
- Need to test if MPS works from launchd context
