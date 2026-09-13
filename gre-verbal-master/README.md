# GRE Verbal Master

A spaced-repetition GRE Verbal Reasoning trainer — covering Text Completion, Sentence Equivalence, and Reading Comprehension. The companion to GRE Vocabulary Master and GRE Quant Master.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## What's built

- Same foundation as the other two GRE apps: Vite + React 19 + TypeScript + Tailwind v4 + Framer Motion + Zustand + Recharts, with a StorageAdapter ready to swap in a real backend later.
- `src/core/types` — domain types for a discriminated `VerbalItem` union: `TextCompletionItem` (1–3 blanks), `SentenceEquivalenceItem` (6 choices, exactly 2 correct), `ReadingComprehensionItem` (single or multi-select, references a shared `Passage`)
- `src/core/grading.ts` — pure, shared grading logic: Text Completion needs every blank correct, Sentence Equivalence and multi-select Reading Comprehension need the exact correct set — no partial credit, matching real GRE scoring
- `src/core/srs/sm2.ts` — SM-2 style scheduler, same confidence-rating pattern as the other apps
- `src/data/items.json` + `src/data/passages.json` — **85 items**: 30 Text Completion (12 one-blank, 11 two-blank, 7 three-blank), 25 Sentence Equivalence, and 30 Reading Comprehension questions across 10 original passages (science, history, philosophy, literature, biology, urban planning, and more). Every Sentence Equivalence item's correct pair is grounded in verified mutual-synonym relationships pulled directly from GRE Vocabulary Master's word data — not guessed. Every item's structure (blank markers, choice counts, correct-answer references) was validated programmatically with zero errors.
- `src/data/vocabRefs.json` — a self-contained subset (22 words) of GRE Vocabulary Master's word data, limited to words actually used in this bank's answer choices. When you get a Text Completion or Sentence Equivalence item wrong, the solution panel shows the relevant word's meaning and mnemonic pulled from your vocab list — the requested tie-in between the two apps.
- `src/store/useAppStore.ts` — Zustand store wiring storage + SRS + XP/streak/level/achievement logic
- `src/features/dashboard` — stats, study-pace plan, daily goal, achievements strip, "Cram weak items" shortcut
- `src/features/practice` — **Practice Mode**: attempt an item in its native format (blank-by-blank for Text Completion, toggle-2-of-6 for Sentence Equivalence, passage + question for Reading Comprehension) → auto-graded → full solution revealed (with vocab cross-reference where relevant) → rate confidence (if correct) or continue (if wrong) → SM-2 schedules the next review
- `src/features/quiz` — **Timed Quiz Mode**: simulates a GRE Verbal section (10/20/30 questions, optional countdown timer), sourced from Due / Struggling / All / any single question type. Reading Comprehension questions from the same passage are automatically grouped together so you read each passage once, not once per question. Ends with a missed-items breakdown by type and a one-tap "retake missed" flow.
- `src/features/itembank` — searchable/filterable/sortable browser across all 85 items, with full solution detail view (including the passage text for Reading Comprehension items)
- `src/features/analytics` — 14-day trend, mastery breakdown, progress-by-difficulty, and accuracy-by-question-type bar chart
- `src/features/gamification` — 18-badge achievement system with toast pop-ups
- `src/features/settings` — GRE test date + auto-computed daily pace, daily goal, theme, progress reset

## Content authorship notes

- **Sentence Equivalence** items were built systematically: each item's correct 2-choice pair is drawn from the same word's verified synonym list in GRE Vocabulary Master's data (so both choices are genuine mutual synonyms), and every distractor was checked to ensure it doesn't accidentally form a second valid pair that also fits the sentence's context/signal words (contrast markers like "despite," "although," "rather than," etc.).
- **Text Completion** items were written with an explicit logical signal (contrast, cause, restatement) driving each blank, documented in the solution steps rather than left to intuition.
- **Reading Comprehension** passages are original (not reproduced from any copyrighted source) and span Main Idea, Inference, Detail, Structure, and Vocabulary-in-Context question types, plus one "select all that apply" format question for variety.

## Verified before delivery

- `tsc -b` — clean, no errors
- `npm run build` — clean production build
- All 85 items structurally validated (blank markers match blank counts, choice/answer-id consistency, exactly 6 choices with 2 correct for Sentence Equivalence, etc.) with zero errors
- Rendered the actual production bundle in a headless DOM and scripted click-throughs of: all 6 nav tabs, a full Practice Mode attempt, and — critically — a full Quiz Mode cycle through **each of the three item types individually** (Text Completion blank-selection, Sentence Equivalence 2-choice toggle, Reading Comprehension passage + question), the Item Bank browser with topic filtering (confirmed 85 total / 30 Reading Comprehension), achievement unlock + toast, and the Settings theme toggle — zero runtime errors in any of them.

## Not yet built (ideas for next stages)

Expanding past 85 items, "select the sentence" Reading Comprehension question format, per-question flagging within a quiz, PWA/offline support, cloud sync (swap in a new StorageAdapter).
