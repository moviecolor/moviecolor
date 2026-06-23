# Dictate — Session Handoff Doc

> Project: **Dictate** | Voice dictation over LAN via browser microphone → Whisper transcription → auto-paste on Mac Studio

---

## Overview

| Field | Detail |
|-------|--------|
| **Project Name** | Dictate (Remote-Mic-Dictation-Sever) |
| **Purpose** | Voice dictation over local network — record mic in browser, transcribe via Whisper on a remote Mac Studio, auto-paste text into active app |
| **Tech Stack** | Python 3 + Flask, OpenAI Whisper (base), Web Audio API (MediaRecorder), HTTPS with self-signed SSL cert |

## What Was Done This Session

This project was built from scratch in one session — vibe-coded entirely. A single-file Flask server serves both the HTTP API and an embedded web client. The client runs MediaRecorder to capture audio from the browser mic, sends it to the server's `/transcribe` endpoint, and after Whisper transcription, the server copies text to clipboard and auto-pastes via `osascript` Cmd+V on macOS.

**Key decisions:**

- Single HTTP (HTTPS) server + embedded web client served from the same process — no separate frontend build step
- No MLX needed — this runs CPU-only with OpenAI Whisper's Python bindings, not Apple MLX models
- Whisper base model (~150 MB) — balanced speed/accuracy, runs fine on M-series Macs
- Auto-paste via `osascript` sending Cmd+V via AppleScript System Events (reliable over remote desktop)
- Self-signed SSL cert auto-generated on first run (`~/.dictate-ssl/`) so browser mic works remotely (getUserMedia requires HTTPS)
- Audio format: 16-bit, 16kHz, mono WAV — standard Whisper input after ffmpeg conversion

## File Status

| File | Lines | Description |
|------|-------|-------------|
| `server/listen.py` | ~230 | Flask server: Whisper transcription, auto-paste, SSL cert generation, HTTPS serving |
| `client/index.html` | 37 | Embedded web client: mic button UI (SVG), status display, result area, copy button, hint text |
| `docs/` | — | Documentation directory (empty / placeholder) |
| `server-win/` | — | Windows server variant directory (placeholder for cross-platform future work) |

## Git Status

| Field | Value |
|-------|-------|
| **Branch** | `feature/Dictate-Server` |
| **Latest Commit** | `521d4d1a64e9dedc2c91af8461fabfab2b90cf0e` — *feat: initial Dictate server + web client package* |
| **Working Tree** | Dirty — untracked backup dir `../Remote-Mic-Dictation-Sever_BACKUP_2026-06-23/` exists in parent |

## Run Commands

```bash
# Start the server
cd ~/GitHub/moviecolor/Remote-Mic-Dictation-Sever/server
python listen.py

# Open in browser on Mac Studio
open 'https://localhost:8765'

# Access from remote computer (same LAN)
open 'https://10.0.0.164:8765'
```
