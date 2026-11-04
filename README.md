# 🎮 Active Voice Arcade

> Master **When to Avoid the Passive Voice** through high-octane gameplay! Featuring a **Project Zomboid-inspired 10-Wave Zombie Survivor** and a **Classroom Tycoon Academy Builder**, powered by React 19, TypeScript, Tailwind CSS, and Web Audio API.

---

## 🕹️ Live Demo
Play online immediately:  
👉 **[Active Voice Arcade on Google Cloud](https://ais-pre-mzcc6m4oyq27crmajoqqmb-731250031426.asia-northeast1.run.app)**

---

## 🚀 How to Publish to GitHub & Play Free (GitHub Pages)

This repository is pre-configured with **`base: './'`** and an automated **GitHub Actions Workflow** (`.github/workflows/deploy.yml`) so it builds and deploys to GitHub Pages in seconds!

### Step 1: Initialize Git and Push to GitHub

In your local terminal inside this project folder:

```bash
# 1. Initialize git
git init

# 2. Add all files and commit
git add .
git commit -m "Initial commit: Active Voice Arcade"

# 3. Rename branch to main
git branch -M main

# 4. Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 5. Push to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages in your Repository Settings

1. Go to your repository on GitHub (`https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>`).
2. Click on **Settings** (gear icon) at the top.
3. In the left sidebar, click on **Pages**.
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. That's it! GitHub will automatically trigger the workflow in `.github/workflows/deploy.yml`.
6. Within ~1 minute, your game will be live at:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 💻 Local Development & Playing on Your Machine

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (running on port 3000)
npm run dev

# 3. Open your browser at http://localhost:3000
```

### Build for Production
```bash
npm run build
```
The compiled, optimized static files will be generated in the `dist/` directory, ready to deploy to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3, etc.).

---

## 🎮 Game Features & Controls

### 🧟 1. Zombie Outbreak: Fast 10-Wave Defense
A fast-paced survivor shooter where language skills save your life!

- **Controls**:
  - `W` `A` `S` `D` or Arrow Keys — Move player
  - **Mouse** — Aim flashlight and weapon
  - **Left Click** or `Space` — Fire weapon
  - `P` or `Esc` — Pause game
- **Difficulty Modes**:
  - 🟢 **Easy Mode**: 150 Max HP, 15% slower zombies, 5 HP knife damage, +22 HP medkits, 1 Tactical Nuke guaranteed per wave, **NO Teleporters**.
  - 💀 **Hard Mode**: 100 Max HP, fast relentless horde, 10 HP knife damage, +14 HP medkits, 50 HP boss attacks, **NO Nukes**, and **Teleporting Zombies active**!
- **Special Enemy Types**:
  - 🔪 **Knife Thrower** (Cyan): Ranged enemy that hurls flying daggers with audio alerts.
  - ⚡ **Teleporter** (Purple, Hard Mode only): Phases into void particles and teleports directly behind the player (`⚡ BEHIND YOU!`).
  - 🗿 **Wave 5 Boss** (Passive Golem): Casts seismic bull charges (50 DMG) and summons stone escorts.
  - 📜 **Wave 7 Boss** (Bureaucratic Abomination): Fires a 5-blade fan spread of razor knives (50 DMG).
  - 👑 **Wave 10 Final Boss** (Arch-Titan Overlord): Unleashes cascading supersonic shockwaves and sprinter hordes. Defeat to achieve Total Victory!
- **Defensive Boss Parry**: When a boss unleashes a 50 DMG skill, solve a quick-time active voice challenge to deploy a kinetic barrier and **parry 100% of the damage (0 DMG)**!
- **Loot Crate Decryption**: 5 supply crates spawn each wave. Walk over a crate to solve scrambled active voice puzzles to claim weapon upgrades and adrenaline medkits.

---

### 🏫 2. Classroom Tycoon: Grammar Academy
A relaxed incremental simulation where you manage and upgrade an English language academy.

- Consult with students struggling with passive voice dilemmas.
- Invest tuition revenue into student desks, interactive smartboards, academic libraries, espresso machines, and tenured professors.
- Balanced pacing with dilemmas arriving every 14 seconds and steady revenue growth.

---

### 📖 3. Strategy Codex: When to Avoid the Passive Voice
Comprehensive interactive learning guide covering the core rules of active vs. passive voice:
1. **The "Who Did It?" Rule** (identifying hidden or displaced actors).
2. **Weak Verb Hunting** (replacing passive forms of "to be" with dynamic action verbs).
3. **Appropriate Exceptions** (when the actor is unknown, obvious, or intentionally anonymous).

---

### 🏆 4. Digital Badges, XP & Community Leaderboard
- **10 Digital Badges**: Unlock achievements like *Zombie Slayer Master*, *Boss Slayer*, *Grammar Mogul*, and *Wave 10 Conqueror*.
- **Leveling System**: Earn XP from defeating zombies, answering questions, and helping students to level up your player profile.
- **Persistent Progress**: Automatically saves your name, stats, and achievements in `localStorage`.
- **Global Leaderboard**: Compare your XP and title with other players across the arcade community.

---

### 🔊 5. 100% In-Browser Web Audio Effects
All sound effects are synthetically generated in real time using the native browser **Web Audio API**:
- Laser shots & bullet impacts
- Knife throw whistles & metallic impact slashes
- Void teleportation warp sweeps
- Ringing metallic shield parry deflections
- Medkit revitalize chimes
- Boss seismic guttural roars
- Crate latch unlock clicks
*(Toggle sound anytime with the mute button in the top HUD).*

---

## 🛠️ Built With

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio**: Native HTML5 Web Audio API

---

## 📄 License
MIT License. Free to use, modify, and distribute for educational and non-commercial gaming!
