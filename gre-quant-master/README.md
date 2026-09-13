# GRE Quant Master

A spaced-repetition GRE Quantitative Reasoning trainer — the companion to GRE Vocabulary Master.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## What's built

- Same foundation as GRE Vocabulary Master: Vite + React 19 + TypeScript + Tailwind v4 + Framer Motion + Zustand + Recharts, with a StorageAdapter ready to swap in a real backend later.
- `src/core/types` — domain types: `Problem` (multiple-choice / quantitative-comparison / numeric-entry), SRS `CardState`, `UserProgress`
- `src/core/srs/sm2.ts` — SM-2 style scheduler, adapted so a correct answer asks "how hard was that?" (Hard/Good/Easy) to set the next interval, while a wrong answer always schedules as "Again"
- `src/data/problems.json` — **431 GRE Quant problems** across Arithmetic, Algebra, Geometry, Data Analysis, and Word Problems, mixing all three GRE question formats, each with a full step-by-step solution. Includes a curated **121-problem "155–160 Challenge Set"** (`challengeSet: true`) — the hardest problems, aimed at the top score band. Every answer was independently computed and checked before being written here — by Python assertion for the original 75, by hand/computation for two later imported batches (257 problems, then 100 more). Across all three rounds, 14 errors found in imported data were identified and corrected (wrong QC answers, a broken absolute-value problem, an unsolvable mixture problem removed, modular-arithmetic slips, mislabeled units, a self-contradicting comparison) rather than shipped as-is. Multiple-choice answer positions are shuffled (not always first) to prevent guessable patterns.
- `src/core/gamification/achievements.ts` — the "Full Bank" achievement checks against the live problem count rather than a hardcoded number, so it stays correct as the bank grows
- `src/store/useAppStore.ts` — Zustand store wiring storage + SRS + XP/streak/level/achievement logic
- `src/features/dashboard` — stats, study-pace plan, daily goal, achievements strip, "Cram weak problems" shortcut
- `src/features/practice` — **Practice Mode**: attempt a problem in its native format → auto-graded → full worked solution revealed → rate confidence (if correct) or continue (if wrong) → SM-2 schedules the next review
- `src/features/quiz` — **Timed Quiz Mode**: simulates a GRE Quant section (10/20/27/40 questions, optional countdown timer paced at ~1:45/question like the real exam), sourced from Due / Struggling / **155–160 Challenge Set** / All / any single topic. Ends with a per-topic missed-problem breakdown and a one-tap "retake missed" flow.
- `src/features/problembank` — searchable/filterable/sortable browser across all 431 problems (including a dedicated Challenge Set filter, with ★ badges), with full solution detail view
- `src/features/analytics` — 14-day trend, mastery breakdown, progress-by-difficulty, and **accuracy-by-topic** bar chart (the fastest way to see where to focus)
- `src/features/gamification` — 17-badge achievement system with toast pop-ups
- `src/features/settings` — GRE test date + auto-computed daily pace, daily goal, theme, progress reset

## Verified before delivery

- `tsc -b` — clean, no errors
- `npm run build` — clean production build
- All 431 problems structurally validated (schema, duplicate IDs, choice/answer consistency) and mathematically re-verified — every problem checked, not just spot-checked
- Multiple-choice answer-position distribution confirmed spread across all slots (not clustered at any one position)
- Swept every topic filter and the Challenge Set through full timed quizzes end-to-end with zero runtime errors
- Rendered the actual production bundle in a headless DOM and scripted click-throughs of: all 6 nav tabs, a full Practice Mode attempt (submit → grade → confidence rating), a full Quiz Mode cycle (setup → timed question → grade → next), the Dashboard's "155–160 Challenge" shortcut end-to-end, the Problem Bank's Challenge filter and badges, Problem Bank browsing, achievement unlock + toast, and the Settings theme toggle — zero runtime errors in any of them.

## Not yet built (ideas for next stages)

Data-interpretation questions with charts/tables, "select one or more" GRE question type, per-question flagging for later review within a quiz, PWA/offline support, cloud sync (swap in a new StorageAdapter).
