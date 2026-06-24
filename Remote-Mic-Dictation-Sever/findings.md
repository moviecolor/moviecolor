# Findings — Dictate Performance Analysis

## Timing Baseline (2026-06-24, "1-10" test)
```
108KB audio (6.8s speech) → 
  write=0.2s  ffmpeg=8.7s  read=0s  
  whisper=4.5s  total=13.4s
paste=6.0s  
HTTP round trip = 19.5s
```

## Bottleneck Analysis

### 1. ffmpeg: 8.7s (67% of processing time)
- **Root cause:** ffmpeg default probe size is very large for unknown input formats. The WebM file triggered extensive format probing.
- **Fix:** `-probesize 32k -analyzeduration 0 -fflags nobuffer` tells ffmpeg to do minimal probing.
- **Target:** < 0.2s

### 2. Whisper: 4.5s (33% of processing time)
- **Root cause:** Running on CPU with fp16. PyTorch on macOS defaults to CPU.
- **Fix:** Move model to MPS (Metal GPU) after loading. 
- **Target:** < 1.5s (MPS gives ~4x speedup on M2 Ultra)
- **Note:** `torch.backends.mps.is_available()` works from GUI session, may fail from launchd.

### 3. Paste: 6.0s (added after transcription)
- **Root cause:** AppleScript `tell application "System Events"` block with multiline script has startup overhead.
- **Fix:** Single-line AppleScript command.
- **Target:** < 0.5s

## GPU Support Info
- M2 Ultra has powerful GPU — MPS backend should give major speedup
- `torch.backends.mps.is_available()` returns True from user session
- Launchd may not have GPU context — fall back to CPU gracefully

## Client-Side Observations
- MediaRecorder captures Opus in WebM (~108KB for 7s speech)
- HTTP receive is instant (0.0s) — network is NOT the bottleneck
- All delay is server-side processing
