# GRE Vocabulary Master

A spaced-repetition GRE vocabulary trainer.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## What's built

- Project scaffold: Vite + React 19 + TypeScript + Tailwind v4 + Framer Motion + Zustand + Recharts
- `src/core/types` — domain types (Word, CardState, UserProgress, etc.)
- `src/core/storage` — StorageAdapter interface + LocalStorageAdapter (swap in Firebase/Supabase later without touching feature code)
- `src/core/srs/sm2.ts` — SM-2 style spaced repetition scheduler (pure functions, unit-testable)
- `src/core/quiz/quizGenerator.ts` — pure multiple-choice question builder (define / reverse / synonym)
- `src/core/gamification/achievements.ts` — achievement catalog + pure evaluator
- `src/data/words.json` — 100 GRE words, fully detailed (pronunciation, mnemonic, etymology, examples, etc.)
- `src/store/useAppStore.ts` — Zustand store wiring storage + SRS + XP/streak/level/quiz/achievement logic
- `src/features/dashboard` — main dashboard (stats, level progress, daily goal, achievements strip, "Cram weak words" shortcut)
- `src/features/learning` — Learning Mode: word → "what does this mean?" → reveal → rate (Again/Hard/Good/Easy) → SM-2 schedules the next review, XP awarded, session-complete screen. Keyboard: Space = reveal, 1–4 = rate, Esc = exit.
- `src/features/quiz` — **Quiz Mode**: multiple-choice quizzes drawn from Due / Struggling / Learned / New / All words, in Word→Meaning, Meaning→Word, Synonym-match, or Mixed formats. Correct/incorrect answers feed straight back into the SRS scheduler, so quizzing doubles as review. Ends with a missed-words review and a one-tap "retake missed" flow. Keyboard: 1–4 = pick option, Enter = next, Esc = exit/restart.
- **Cram Mode** — a dashboard shortcut that jumps straight into Quiz Mode pre-filtered to your struggling words, for fast pre-exam review.
- `src/features/wordbank` — searchable/filterable/sortable word browser with full word-card detail view
- `src/features/analytics` — 14-day reviews/accuracy trend, mastery breakdown pie chart, progress-by-difficulty bar chart
- `src/features/gamification` — 16-badge achievement system (streaks, mastery milestones, review counts, quiz counts, accuracy) with toast pop-ups on unlock and a progress panel on the dashboard
- `src/features/settings` — GRE test date + auto-computed daily pace, daily goal, theme toggle, progress reset

## Not yet built (ideas for next stages)

Expanding the word bank past 100 words, PWA/offline support, per-question timers in Quiz Mode, exportable/printable word lists for offline cramming, cloud sync (StorageAdapter is ready for this — implement a new adapter and swap it in at `src/core/storage/StorageAdapter.ts`).
