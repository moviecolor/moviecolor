# TRACKING — Active Projects & State

**Last Updated:** 2026-06-23 17:45
**Owner:** Ryan Wuckert (moviecolor)

## Active Repos

| Repo | Path | Latest Commit | Status |
|------|-----|----------------|--------|
| **moviecolor** (main portfolio repo) | ~/GitHub/moviecolor/ | c7f9bab - Dictate portfolio descriptions added | All sub-projects tracked below |
| **Remote-Mic-Dictation-Sever** | ~/GitHub/moviecolor/Remote-Mic-Dictation-Sever/ | v2.0 — server + client + session docs | Complete Phase 1, ready to use |
| **tshirt-shop** | ~/GitHub/tshirt-shop/ | 505d7bf - initial commit: Police Synchronicity collection | 33 shirt designs from 3 songs published |

## Active Dev Projects

### ditungrade — LUT Reversal Tool
- **Status:** Phase 4 complete (K1S1 LUT for Alexa Classic), "Coming Soon" banner on README landing page
- **Files:** ditungrade.py (core engine), ditungrade_gui.py (tkinter GUI), start_ditungrade.command (launcher)
- **Location:** ~/GitHub/ditungrade/ (standalone repo + subfolder in moviecolor/)
- **Note:** Also exists as standalone repo at GitHub/_BACKUP_2026-06-15/ditungrade/

### Dictate — Remote Mic Voice Dictation
- **Status:** Complete. Server runs `python server/listen.py` on port 8765, serves web client. Use laptop mic → transcribe via Whisper AI → auto-paste into Mac Studio apps.
- **Three-computer setup designed for:** Laptop #1 (mic source) + Mac Studio (transcription) + Laptop #2 (free for research)
- **Session docs committed:** SESSION_HANDOFF.md, progress.md, task_plan.md, session-log-2026-06-23_1624.md

## Active Non-Code Projects

### a_WORK_MOVIE (/Users/mo-ry/Documents/a_WORK_MOVIE/)
DIT/production folder — 90+ subfolders. Recent activity suggests ongoing work:
- LUT tests (B&W, Barrett, VIOLENT, Flanders, Kronen)
- DIT reports, case files, data reports per Percy
- Camera docs (Alexa Mini, RED DXL2, Anamorphic 2K)
- Multiple films in various states: BROCCOLI_01.mov, FALSE COLORS, FRACTURE_DIT REPORTS, VAMPIRE_MOVIE, WONDERFUL WIFE DIT, UNSPOKEN

### tshirt-shop (github.com/tshirt-shop)
Police Synchronicity collection — 33 designs from 3 songs. Published on GitHub Pages.

## Recent Code Activity (last 7 days)
- dictate/ folder: new Python files (dictate_web.py, transcribe_server.py, etc.) from Dictate session
- ditungrade/*.py modified June 22
- moviecolor commit activity: multiple SAVE ALL NOW sessions, Dictate feature additions

## What Needs Attention

### Immediate
- **ditungrade Phase 5:** Drag-and-drop support, window memory persistence, additional camera profiles
- **Dictate Windows server:** listen.py needs Windows variant (pywin32 clipboard, different auto-paste)
- **T-shirt shop:** No updates since initial commit — is active?

### Medium-term  
- **a_WORK_MOVIE:** Multiple projects need DIT/LUT work per ongoing films
- **moviecolor.github.io:** Portfolio website exists at 92d9bf2 but needs updating with new projects

## Mirror Backups
Local file backups of the Dictate project exist as:
- ~/GitHub/moviecolor/Remote-Mic-Dictation-Sever_BACKUP_2026-06-23/ (14 files)
- ~/GitHub/moviecolor/Remote-Mic-Dictation-Sever_BACKUP_2026-06-23_02/ (14 files)

---

*This file is updated whenever a new project session starts. Use it as the starting point before beginning work.*
TRACKING.md
echo "✅ TRACKING.md written"