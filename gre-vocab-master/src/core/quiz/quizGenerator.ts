import type { Word } from '@/core/types';

export type QuizQuestionType = 'define' | 'reverse' | 'synonym';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  wordId: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistractors(pool: Word[], exclude: Word, count: number): Word[] {
  const candidates = pool.filter((w) => w.id !== exclude.id);
  return shuffle(candidates).slice(0, count);
}

/** Builds one multiple-choice question for a word, given the full word pool to draw distractors from. */
export function buildQuestion(word: Word, pool: Word[], type: QuizQuestionType): QuizQuestion | null {
  if (type === 'synonym') {
    if (word.synonyms.length === 0) return null;
    const correctText = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
    const distractorPool = pool.filter((w) => w.id !== word.id && w.synonyms.length > 0);
    const distractors = pickDistractors(distractorPool, word, 3).map(
      (w) => w.synonyms[Math.floor(Math.random() * w.synonyms.length)],
    );
    const uniqueDistractors = Array.from(new Set(distractors)).filter((d) => d !== correctText);
    while (uniqueDistractors.length < 3 && distractorPool.length > 0) {
      const extra = distractorPool[Math.floor(Math.random() * distractorPool.length)];
      const candidate = extra.synonyms[Math.floor(Math.random() * extra.synonyms.length)];
      if (candidate !== correctText && !uniqueDistractors.includes(candidate)) {
        uniqueDistractors.push(candidate);
      } else {
        break;
      }
    }
    const options = shuffle([correctText, ...uniqueDistractors.slice(0, 3)]).map((text, i) => ({
      id: `opt-${i}`,
      text,
    }));
    const correctOptionId = options.find((o) => o.text === correctText)!.id;
    return {
      id: `${word.id}-synonym-${Date.now()}-${Math.random()}`,
      type: 'synonym',
      wordId: word.id,
      prompt: `Which word is closest in meaning to "${word.word}"?`,
      options,
      correctOptionId,
    };
  }

  if (type === 'reverse') {
    const distractors = pickDistractors(pool, word, 3);
    const options = shuffle([word, ...distractors]).map((w, i) => ({ id: `opt-${i}`, text: w.word }));
    const correctOptionId = options.find((o) => o.text === word.word)!.id;
    return {
      id: `${word.id}-reverse-${Date.now()}-${Math.random()}`,
      type: 'reverse',
      wordId: word.id,
      prompt: word.meaning,
      options,
      correctOptionId,
    };
  }

  // 'define'
  const distractors = pickDistractors(pool, word, 3);
  const options = shuffle([word, ...distractors]).map((w, i) => ({ id: `opt-${i}`, text: w.meaning }));
  const correctOptionId = options.find((o) => o.text === word.meaning)!.id;
  return {
    id: `${word.id}-define-${Date.now()}-${Math.random()}`,
    type: 'define',
    wordId: word.id,
    prompt: word.word,
    options,
    correctOptionId,
  };
}

/**
 * Builds a full quiz from a list of source words. When `mode` is 'mixed', each
 * question's type is chosen at random (falling back to 'define' if a word has
 * no synonyms to quiz on).
 */
export function buildQuiz(
  sourceWords: Word[],
  fullPool: Word[],
  mode: QuizQuestionType | 'mixed',
  count: number,
): QuizQuestion[] {
  const chosen = shuffle(sourceWords).slice(0, count);
  const types: QuizQuestionType[] = ['define', 'reverse', 'synonym'];

  const questions: QuizQuestion[] = [];
  for (const word of chosen) {
    const type = mode === 'mixed' ? types[Math.floor(Math.random() * types.length)] : mode;
    const q = buildQuestion(word, fullPool, type) ?? buildQuestion(word, fullPool, 'define');
    if (q) questions.push(q);
  }
  return questions;
}
