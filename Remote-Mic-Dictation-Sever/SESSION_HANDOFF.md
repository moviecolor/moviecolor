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

## What Was Done This Session (2026-06-24)

**Bugs fixed (3 core bugs that were blocking from day one):**

1. **Fixed: client.js never loaded** — Server had no route for `/client.js`. HTML referenced it but browser got 404. Added route handler.
2. **Fixed: audio body format mismatch** — Client sent raw blob body but server expected `multipart/form-data`. Changed server to read `flask.request.get_data()`.
3. **Fixed: ffmpeg not found in PATH** — When running via launchd background service, PATH didn't include Homebrew's ffmpeg. Changed to use full path `/opt/homebrew/bin/ffmpeg`.

**Also fixed:**
- DOM elements loaded before JS (moved `<script>` to end of `<body>`)
- SSL cert now includes Tailscale IP (`100.100.235.34`) + both local IPs
- Purple dark-mode theme added
- Server auto-starts on login via `~/Library/LaunchAgents/com.dictate.server.plist`
- Launchd uses correct Python venv (`~/.voice-text/venv/bin/python3`)

**Tailscale configured:**
- Mac Studio Tailscale IP: `100.100.235.34`
- MacBook Pro connected on same tailnet
- Dictate accessible from anywhere via `https://100.100.235.34:8765`

## File Status

| File | Lines | Description |
|------|-------|-------------|
| `server/listen.py` | ~260 | Flask server: Whisper, auto-paste, SSL, raw audio body handling |
| `client/index.html` | 37 | Dark purple web client: mic button, status, result |
| `client/client.js` | ~135 | MediaRecorder API, Safari MIME fallback, error reporting |

## Run Commands

```bash
# Access from MacBook (via Tailscale from anywhere):
# https://100.100.235.34:8765

# Or on local network:
# https://10.0.0.164:8765
```

Server auto-starts on login. No manual start needed.

## Next Tasks
- Name the app (currently "Dictate" placeholder)
- Write proper product description + use cases
- Set up Wise payments
- Add screenshots/GIF to READMEs
- Push final code to standalone Dictate repo
