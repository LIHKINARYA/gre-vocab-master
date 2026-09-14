# GRE Vocabulary Master 🎓

> An intelligent, offline-first GRE vocabulary mastery platform powered by the **SuperMemo-2 (SM-2)** spaced repetition algorithm, multi-mode quizzes, real-time analytics, and gamification.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://gre-vocab-master-sigma.vercel.app/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Live Demo

**[https://gre-vocab-master-sigma.vercel.app/](https://gre-vocab-master-sigma.vercel.app/)**

Experience zero-latency flashcards, audio pronunciation, dynamic study pacing, and diagnostic quizzes right in your browser.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Spaced Repetition Engine (SM-2)](#-spaced-repetition-engine-sm-2)
- [Data Storage & Privacy (`localStorage`)](#-data-storage--privacy-localstorage)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Scripts Reference](#-scripts-reference)
- [Deployment](#-deployment)
- [Contributing & License](#-contributing--license)

---

## 🚀 Overview

Preparing for GRE Verbal Reasoning requires committing hundreds of high-frequency words to long-term memory. Cramming static word lists fails because of the human forgetting curve. 

**GRE Vocabulary Master** adapts to your personal recall speed:
- Cards you struggle with appear frequently until internalized.
- Cards you master are progressively spaced out over days and weeks.
- Quizzes directly update your spaced repetition schedule, turning self-testing into active review sessions.

---

## ✨ Key Features

### 🗂️ 1. Active Recall Learning Mode
- **Prompt & Reveal Workflow**: Test your recall first, then flip to examine full dictionary definitions, secondary meanings, mnemonics, roots/etymology, and real GRE-style sentence examples.
- **Natural Speech Synthesis**: Hear proper English audio pronunciation out loud using the browser's native Web Speech API.
- **Mnemonic & Note Editor**: Add your own custom personal notes or memory hooks directly to any word card while reviewing.
- **One-Tap Bookmarking & Favorites**: Mark words for special attention or rapid revision.

### 🧠 2. Diagnostic Quiz Engine
- **4 Flexible Quiz Modes**:
  - `Word → Meaning`: Identify the precise definition of a headword.
  - `Meaning → Word`: Reverse retrieval from context and meaning.
  - `Synonym Match`: Connect high-utility GRE synonyms and subtle connotations.
  - `Mixed Mode`: Balanced dynamic mix across all question types.
- **Smart Distractor Generation**: Multiple-choice options are dynamically sampled from word clusters to avoid obvious giveaways.
- **Closed-Loop SRS Integration**: Quiz answers directly feed back into your SM-2 intervals.
- **Missed Words Review**: Detailed post-quiz breakdown with a one-tap **Retake Missed** flow.

### ⚡ 3. Cram Mode (Quick Drill)
- A focused drill launched directly from the dashboard that targets all cards flagged as **Struggling** (ease factor < 1.96 or high lapse count), ideal for 10-minute study sprints before test day.

### 📚 4. Searchable Word Bank
- Comprehensive vocabulary directory featuring high-frequency GRE words.
- Instant search by headword, definition, or synonym.
- Filtering by status: `All`, `Learned`, `Mastered`, `Due for Review`, `Struggling`, `Bookmarked`, and `Favorites`.
- Sort by alphabetical order, GRE exam frequency, ease factor, or recency.

### 🏆 5. Gamification & Progression
- **XP & Leveling System**: Earn experience points for every card rated, quiz completed, and streak maintained.
- **Daily Streaks**: Habit tracking that monitors consecutive active study days.
- **16 Unlockable Badges**: Milestone badges spanning streaks, accuracy thresholds, vocabulary mastery milestones, and quiz mastery with real-time celebratory toasts.

### 📊 6. Analytics & Countdown Planning
- **GRE Test Date Planner**: Enter your target exam date to receive an automated daily intake recommendation based on days remaining and words left.
- **Mastery Distribution**: Real-time breakdown of Unseen, Learning, Learned, and Mastered words.
- **Interactive Trend Charts**: 14-day study volume and accuracy graphs powered by Recharts.
- **Dark & Light Mode**: Accessible, high-contrast themes with system preference detection.

---

## 🧮 Spaced Repetition Engine (SM-2)

The core scheduler (`src/core/srs/sm2.ts`) implements a modernized adaptation of the **SuperMemo-2** algorithm:

$$\text{EF}' = \text{EF} + \left(0.1 - (5 - q) \cdot (0.08 + (5 - q) \cdot 0.02)\right)$$

| Rating | Quality ($q$) | Interval Multiplier | Effect on Scheduling |
| :--- | :---: | :---: | :--- |
| **Again** | `1` | Reset to 1 day | Lapses counter increments; Ease Factor decreases; card enters urgent queue |
| **Hard** | `3` | $I \times 1.2$ | Conservative spacing; Ease Factor decreases slightly |
| **Good** | `4` | $I \times \text{EF}$ | Standard spacing; Ease Factor remains steady |
| **Easy** | `5` | $I \times \text{EF} \times 1.3$ | Accelerated spacing bonus; Ease Factor increases |

- **Minimum Ease Factor Floor**: Clamped at `1.30` to prevent cards from falling into irreversible ease traps.
- **Mastery Criteria**: A word is marked as **Mastered** once its consecutive correct streak reaches $\ge 4$ and its review interval spans $\ge 21\text{ days}$.

---

## 💾 Data Storage & Privacy (`localStorage`)

GRE Vocabulary Master is built with an **offline-first, zero-telemetry** privacy model:

1. **Persistent Browser `localStorage`**:
   - All study states, intervals, ease factors, personal notes, XP, and daily metrics persist under the key `gre-vocab-master:app-state`.
   - **No account required**: No sign-ups, no remote database dependencies, and no cookies.
2. **Built-in Backup & Data Transfer**:
   - **Download Backup**: Export your complete state as an offline `.json` file at any time via **Settings**.
   - **Copy to Clipboard / Restore**: Easily transfer study progress across devices, browsers, or between `http://localhost:5173` and the live Vercel deployment.
3. **Pluggable Architecture**:
   - Decoupled through the `StorageAdapter` interface (`src/core/storage/StorageAdapter.ts`), enabling seamless addition of remote cloud adapters (e.g. Supabase, Firebase) without altering UI components.

---

## ⌨️ Keyboard Shortcuts

Speed up your daily review sessions with full keyboard navigation:

### Learning Session
| Key | Action |
| :---: | :--- |
| <kbd>Space</kbd> | Reveal card back (definition & mnemonics) |
| <kbd>1</kbd> | Rate as **Again** |
| <kbd>2</kbd> | Rate as **Hard** |
| <kbd>3</kbd> | Rate as **Good** |
| <kbd>4</kbd> | Rate as **Easy** |
| <kbd>Esc</kbd> | Exit session back to dashboard |

### Quiz Mode
| Key | Action |
| :---: | :--- |
| <kbd>1</kbd> – <kbd>4</kbd> | Select option $A$, $B$, $C$, or $D$ |
| <kbd>Enter</kbd> | Advance to next question |
| <kbd>Esc</kbd> | Abort quiz |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Component architecture & modern hooks |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Strict type safety and predictable domain models |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS engine with dynamic color spaces |
| **Bundler** | [Vite 8](https://vite.dev/) | Sub-second HMR and optimized production bundles |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) | Minimalist, unopinionated centralized state store |
| **Animations** | [Framer Motion](https://motion.dev/) | Smooth layout transitions and interactive card flips |
| **Charts** | [Recharts 3](https://recharts.org/) | Responsive SVG visual analytics |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible vector icons |
| **Linter** | [Oxlint](https://oxc.rs/) | High-performance linter ensuring strict correctness |

---

## 📂 Project Architecture

```text
gre-vocab-master/
├── public/                     # Static assets and icons
├── src/
│   ├── components/             # Reusable shared UI primitives
│   │   ├── ui/                 # Buttons, progress bars, containers
│   │   └── AppNav.tsx          # Main header & navigation bar
│   ├── core/                   # Pure business logic & algorithms (100% testable)
│   │   ├── gamification/       # Badge evaluation & XP computation
│   │   ├── planning/           # GRE test pacing calculator
│   │   ├── quiz/               # Dynamic question generation & distractors
│   │   ├── srs/                # SM-2 algorithm implementation
│   │   ├── storage/            # LocalStorage & StorageAdapter contracts
│   │   └── types/              # Domain TypeScript types & interfaces
│   ├── data/
│   │   └── words.json          # Curated high-frequency GRE vocabulary database
│   ├── features/               # Feature-sliced modules
│   │   ├── analytics/          # Study graphs & mastery distribution
│   │   ├── dashboard/          # Metric cards, quick actions, streak stats
│   │   ├── gamification/       # Achievements panel & toast notifications
│   │   ├── learning/           # Flashcard presentation, audio, notes & ratings
│   │   ├── quiz/               # Multi-mode quiz setup, execution & results
│   │   ├── settings/           # Daily target, test date, theme & backup/restore
│   │   └── wordbank/           # Vocabulary directory, filters, sorting & search
│   ├── hooks/                  # Custom React hooks (useDashboardStats, useWordBank, etc.)
│   ├── store/
│   │   └── useAppStore.ts      # Unified Zustand application store
│   ├── App.tsx                 # Root router & view dispatcher
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind CSS v4 directives & theme variables
├── package.json                # Project dependencies & scripts
├── vercel.json                 # Vercel SPA routing rewrites
├── vite.config.ts              # Vite configuration with local port auto-selection
└── tsconfig.json               # TypeScript compiler options
```

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package manager**: `npm`, `pnpm`, or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LIHKINARYA/gre-vocab-master.git
   cd gre-vocab-master
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   # Standard local dev (defaults to port 5173 on local machines)
   npm run dev

   # Explicitly target port 5173
   npm run dev:5173
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts local development server |
| `npm run dev:5173` | `vite --port 5173` | Starts dev server explicitly on port `5173` |
| `npm run build` | `tsc -b && vite build` | Type-checks code and creates production build in `dist/` |
| `npm run preview` | `vite preview` | Serves the production bundle locally for inspection |
| `npm run lint` | `oxlint` | Fast linter run checking for errors and purity warnings |

---

## 🚀 Deployment

The project includes native routing configuration (`vercel.json`) for seamless deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com).
3. Vercel automatically detects Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

Production link: **[https://gre-vocab-master-sigma.vercel.app/](https://gre-vocab-master-sigma.vercel.app/)**

---

## 📄 Contributing & License

Contributions, feedback, and word list expansions are welcome! Feel free to open an issue or submit a pull request.

This project is licensed under the [MIT License](LICENSE).
