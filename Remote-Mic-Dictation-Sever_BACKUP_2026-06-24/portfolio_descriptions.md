# Dictate — Portfolio Descriptions

## Short (one-liner for GitHub)
A self-hosted voice dictation tool that turns any Mac Studio into a Bluetooth headset for remote work: use your laptop's mic to type on any distant computer over WiFi.

## Medium (thumbnail blurb)
Dictate bridges the gap when you need voice-to-text but the machine you're controlling has no microphone (Mac Studios and Mac Minis). Run a local Whisper AI server, tap a browser mic button, speak — text auto-pastes into whatever app is open. Built for a three-computer setup: laptop #1 provides the mic, the Mac Studio runs transcription, laptop #2 stays free for research.

**Tech:** Python + Flask, OpenAI Whisper (base model), MediaDevices API, osascript auto-paste. Self-signed SSL, LAN-only. Vibe-coded in one session.

## Long (blog/portfolio post)
Mac Studios and Mac Minis have **no built-in microphone**. You can't dictate anything in Notes, Slack, or third-party apps from across the desk. Dictate solves this by borrowing the mic from nearby laptops.

Run a Whisper AI transcription server on the Mac Studio — `listen.py` listens on port 8765 for audio POSTs from any browser on the LAN. Open `https://<macstudio-ip>:8765`, tap mic, speak, tap again to transcribe. The audio flows through the MediaDevices API → HTTP POST to the Whisper model -> auto-pastes text into whatever app has focus via osascript Cmd+V.

Built for my three-computer workflow: Laptop #1 provides the microphone source (MacBook Air or Pro), the Mac Studio receives and transcribes, Laptop #2 stays free for browsing/research. No cloud APIs, no subscriptions — all local, all on your own network.
