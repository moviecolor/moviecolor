# Dictate — Task Plan

## Todo Checklist

- [x] Single-file Flask server with Whisper transcription (`server/listen.py`)
- [x] Web Audio API client using MediaRecorder to capture mic audio (`client/index.html`)
- [x] HTTP POST `/transcribe` endpoint accepting multipart audio file upload
- [x] ffmpeg audio conversion pipeline (WEBM → 16kHz mono WAV for Whisper)
- [x] Auto-paste via `pbcopy` + `osascript` Cmd+V on macOS
- [x] Self-signed SSL certificate generation for HTTPS (`~/.dictate-ssl/`)
- [x] Microphone permission handling (getUserMedia requires secure context)
- [x] Server fallback to HTTP if `cryptography` not installed
- [ ] Windows paste method — use pywin32 clipboard, write text to active window; separate repo/out of scope

## Notes

- Session 2026-06-23 completed Phase 1 entirely in one sitting
- All core functionality for macOS LAN dictation is working
- Windows support tracked as remaining task for future phase
