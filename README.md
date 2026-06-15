<p align="center">
  <a href="https://moviecolor.github.io">
    <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=32&duration=3000&pause=1000&color=00F0FF&center=true&vCenter=true&random=false&width=600&height=70&lines=AI+Workflow+Consultant+%F0%9F%9A%80;ComfyUI+%26+Image+Pipeline+Specialist+%F0%9F%A7%A9;B2B+Remote+AI+Consultant+%F0%9F%A4%9D;17+Yrs+Film+%E2%86%92+AI+Pipeline+Architect+%F0%9F%8E%AC%E2%86%92%F0%9F%A4%96" alt="Typing SVG" />
  </a>
</p>

<p align="center">🧪 Proprietary IP: Air-Gapped Local AI Production Pipeline</p>

---
## 🧪 Proprietary IP: Air-Gapped Local AI Production Pipeline

To ensure absolute data compliance for enterprise studios operating under strict NDAs, I engineer **100% offline, air-gapped automation pipelines** that process high-value visual assets locally without internet or cloud-API dependencies.

### 🎯 Production Pipeline Capabilities

| Modality | Capabilities |
|----------|-------------|
| **Text → Image** | T2I generation, iterative refine, prompt-relay chaining |
| **Text → Video** | T2V with timeline-based prompt evolution |
| **Image → Video** | I2V with identity preservation, low-noise & high-noise variants |
| **Video → Video** | V2V style transfer, scene manipulation |
| **Video Extension** | Temporal extension beyond original frame count |
| **Text → Speech** | Qwen3-TTS full pipeline — voice cloning, multi-character dialogue, save/load voice profiles |
| **Voice Cloning** | Clone from short sample → generate speech → feed into Wan Multitalk for talking-head video |
| **Lip Syncing** | Audio-driven lip sync for character dialogue scenes |
| **Character Sheets** | Multi-pose consistent character generation via chained ControlNet + PromptRelay workflows |
| **LoRA Training** | Local LoRA creation and fine-tuning for custom characters and styles |
| **Scene Manipulation** | Character replacement, background replacement, lighting alteration, compositing — via SAIL2, Bernini, LTX 2.3, Bindweave, Sulphur2 |

### 🔧 Highlighted Model Stack & Tooling

**Image Backbone:**
- **10Eros v1** (FLUX-based, 43 GB) — primary image backbone, custom fine-tuned for all character/genre work
- **FLUX.1-dev** variants (Kontext, Klein9B) — secondary image backbone
- **Z-Image-Turbo** (11.5 GB) — real-time turbo generation for rapid iteration
- **Qwen-Image-Lightning** (1.6 GB) — ultra-fast 4–8 step inference
- **SDXL ControlNet** suite — OpenPose, depth, Canny for spatial conditioning

**Video Generation:**
- **Wan 2.2** — I2V (low/high noise), Animate (17.1 GB), **SCAIL** (16.5 GB) for structured video control
- **Wan 2.1** — I2V-480P (15.8 GB), Multitalk (2.5 GB) for talking-head integration
- **LTX 2.3** — 22B distilled + 1.3B control transformer for efficient high-quality video
- **SEEDVR2** (15.4 GB) — video restoration/enhancement

**Scene Manipulation & Compositing:**
- **SAIL2** — structured scene manipulation for character/background replacement
- **Bernini** — generative scene compositing and lighting alteration
- **Bindweave** — multi-frame compositing and seam-aware blending
- **Sulphur2** — high-fidelity scene reconstruction and manipulation

**Audio & Voice:**
- **Qwen3-TTS** (~12 GB total) — full voice cloning pipeline with multiple checkpoints: TTS backbone (3.6 GB) + voice adapter modules (0.65 GB). Supports sample→clone→save→generate workflow and multi-character dialogue.

**Key Differentiator Nodes:**
- **Prompt Relay** — chains multiple prompts across a video timeline for smooth narrative transitions. Critical for LTX 2.3 + 10Eros timeline videos and Wan 2.2 structured multi-prompt generation.
- **ControlNet Union** — combined pose/depth/Canny conditioning for intentional composition and frame-consistent output.
- **Qwen3-TTS Voice Pipeline** — clone a voice from a short sample, generate speech, save voice profiles, run multi-character dialogues — fully local, no cloud API.

### 🔗 How They Connect

```
Voice Sample ──► Qwen3-TTS Clone ──► Wan Multitalk ──► Talking Head Video
                                                           │
Character Sheet ──► Prompt Relay ──► LTX / Wan Timeline ──┘
                                                           │
ControlNets ───────────────────────────────────────────────┘──► Pose / Composition Control
```

### ⚡ Hardware Scale & Compute Performance

| Workstation | Role | Specs |
|------------|------|-------|
| **Primary AI Node** | Air-gapped inference & pipeline automation | NVIDIA RTX 5090 (32 GB GDDR7), Intel i9-14900K, 96 GB DDR5, ComfyUI on local loop (`127.0.0.1:8188`) |
| **Color & Post AI** | DaVinci Resolve grading, finishing, AI-assisted post | Apple Mac Studio M2 Ultra (128 GB unified RAM) — air-gappable on demand |

- **VRAM Overhead Optimization:** The RTX 5090's 32 GB of Blackwell-architecture VRAM enables sub-second local iterations, massive batch arrays, and ultra-high-resolution canvas generation entirely offline.
- **Zero-Trust Security Loop:** Hardcoded to execute on isolated local host loops (`http://127.0.0.1:8188`). Absolutely no telemetry data, client visual payloads, or proprietary training assets cross external network boundaries.

<details>
<summary><strong>📋 Full Workstation Spec Sheet</strong></summary>

| Component | Specification |
|-----------|--------------|
| **CPU** | Intel Core i9-14900K — 24 cores (8P+16E) / 32 threads, boost up to 6.0 GHz |
| **RAM** | 96 GB DDR5 (2× 48 GB Corsair @ 4800 MHz, rated 6000 MHz) |
| **GPU** | NVIDIA GeForce RTX 5090 — 32 GB GDDR7 (600 W, 2685 MHz core / 14001 MHz memory) |
| **Storage (Internal)** | 1.86 TB NVMe (OS + fast cache), 2.8 TB HDD (model storage) |
| **Storage (DIT RAIDs)** | 9 TB RAID 5 (archive), 32 TB RAID 0 (on-set acquisition) |
| **Transport** | 5 × 6 TB NVMe RAID shuttle drives (secure footage transport) |
| **OS** | Windows 11 IoT Enterprise LTSC (64-bit) |
| **Software Stack** | Python 3.11.4, ComfyUI (local port 8188), Git, huggingface-cli |
| **Network** | Air-gapped local LAN — zero external network dependency |
| **Thermals** | GPU idle 34°C / 72 W — max 600 W under full load |

**Key Air-Gap Notes:**
- No cloud APIs required — all inference runs on the RTX 5090's 32 GB VRAM (with CPU offloading for larger models)
- Entirely local network — zero external service dependency
- 96 GB DDR5 + 32 GB VRAM enables Llama-70B, FLUX, and Wan 2.2 to run comfortably with CPU offloading
- 1.86 TB NVMe (OS + fast cache) + 2.8 TB HDD + 9 TB RAID 5 for model & archive storage
- 32 TB RAID 0 for on-set acquisition, 5x 6 TB NVMe RAID shuttle drives for secure transport

</details>

---
<h2 align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Waving%20Hand%20Light%20Skin%20Tone.png" width="30" height="30" /> 
  I help teams turn AI image tools into reliable, production-ready workflows.
</h2>

<table align="center">
  <tr>
    <td width="60%" valign="top">
      <h3>🎬 17 Years on Set → 🤖 AI Pipeline Architect</h3>
      <p>
        After nearly two decades managing complex image pipelines on major film sets 
        for <strong>Universal Pictures, Netflix, Amazon, Sony, NBC, CBS, Technicolor, and Deluxe</strong> — 
        I now build custom <strong>ComfyUI automations and AI solutions</strong> for remote teams.
      </p>
      <p>
        I bridge the gap between <strong>cinema-grade production discipline</strong> 
        and <strong>cutting-edge generative AI</strong> to deliver pipelines that actually 
        scale in the real world.
      </p>
      <p>
        📍 <em>São Paulo, Brazil / Manitoba, Canada</em><br />
        🤝 <em>Direct hire or B2B — flexible terms</em>
      </p>
    </td>
    <td width="40%" align="center">
      <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,3,6,12&height=200&section=header&text=Movie%20Color&fontSize=60&fontColor=fff&animation=fadeIn" />
    </td>
  </tr>
</table>

---
<h2 align="center">🚀 What I Do</h2>

<table align="center">
  <tr>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Artist%20Palette.png" width="40" /><br />
      <strong>ComfyUI Workflows</strong><br />
      <sub>Custom node development, pipeline automation, production-ready image/video generation</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gear.png" width="40" /><br />
      <strong>Pipeline Optimization</strong><br />
      <sub>From prompt to output — optimizing for speed, quality, and reliability at scale</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clapper%20Board.png" width="40" /><br />
      <strong>AI Film Services</strong><br />
      <sub>AI colorization, restoration, image-to-video, voice synthesis for production</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png" width="40" /><br />
      <strong>B2B Consulting</strong><br />
      <sub>Workflow design, technical advising, remote team integration</sub>
    </td>
  </tr>
</table>

---
<h2 align="center">📊 GitHub Activity</h2>

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=moviecolor&show_icons=true&theme=radical&hide_border=true&bg_color=05060f&title_color=00f0ff&icon_color=b826ff&text_color=e8e8ed" width="49%" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=moviecolor&theme=radical&hide_border=true&background=05060f&stroke=00f0ff&ring=b826ff&fire=ff6b35&currStreakNum=e8e8ed&sideNums=e8e8ed&currStreakLabel=00f0ff&sideLabels=e8e8ed&dates=666666" width="49%" />
</p>

<p align="center">
  <img src="https://github-profile-trophy.vercel.app/?username=moviecolor&theme=radical&no-frame=true&no-bg=true&margin-w=4&column=7" />
</p>

---
<h2 align="center">🐍 Contribution Graph</h2>

<p align="center">
  <img src="https://raw.githubusercontent.com/moviecolor/moviecolor/output/github-contribution-grid-snake-dark.svg" />
</p>
<h2 align="center">🤝 Let's Connect</h2>

<p align="center">
  I'm open to teams ready to automate, scale, or debug their AI image pipelines. 
  <strong>Let's ship something great.</strong>
</p>

<p align="center">
  <a href="https://moviecolor.github.io">
    <img src="https://img.shields.io/badge/Portfolio-00f0ff?style=for-the-badge&logo=astro&logoColor=black" />
  </a>
  <a href="https://www.linkedin.com/in/ryan-w-wuckert-58121034/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="https://www.imdb.com/name/nm2344474/">
    <img src="https://img.shields.io/badge/IMDb-F5C518?style=for-the-badge&logo=imdb&logoColor=black" />
  </a>
  <a href="https://facebook.com/MovieColor">
    <img src="https://img.shields.io/badge/Facebook_Movie_Color-1877F2?style=for-the-badge&logo=facebook&logoColor=white" />
  </a>
  <a href="mailto:your@email.com">
    <img src="https://img.shields.io/badge/Email-FF6B35?style=for-the-badge&logo=maildotru&logoColor=white" />
  </a>
</p>

<p align="center">
  <sub>🎬 Crafted with 17 years of cinema pipeline expertise + a dash of AI magic ✨</sub>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,3,6,12&height=120&section=footer" />
</p>
