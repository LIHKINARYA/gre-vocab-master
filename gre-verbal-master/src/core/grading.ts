import type { VerbalItem } from '@/core/types';

export interface TCAnswer {
  blankChoiceIds: Record<string, string>; // blankId -> choiceId
}
export interface SEAnswer {
  choiceIds: string[]; // up to 2
}
export interface RCAnswer {
  choiceIds: string[]; // 1 for single, 1+ for multi
}

export type ItemAnswer = TCAnswer | SEAnswer | RCAnswer;

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const bSet = new Set(b);
  return a.every((x) => bSet.has(x));
}

/** Grades an attempt against an item. All-or-nothing, matching real GRE scoring:
 * a Text Completion item needs every blank correct; Sentence Equivalence and
 * multi-select Reading Comprehension need the exact correct set, no partial credit. */
export function gradeItem(item: VerbalItem, answer: ItemAnswer): boolean {
  if (item.type === 'text-completion') {
    const a = answer as TCAnswer;
    return item.blanks.every((b) => a.blankChoiceIds[b.id] === b.correctChoiceId);
  }
  if (item.type === 'sentence-equivalence') {
    const a = answer as SEAnswer;
    return setsEqual(a.choiceIds, item.correctChoiceIds);
  }
  if (item.type === 'reading-comprehension') {
    const a = answer as RCAnswer;
    return setsEqual(a.choiceIds, item.correctChoiceIds);
  }
  return false;
}

/** Whether the current in-progress answer is complete enough to submit. */
export function isAnswerComplete(item: VerbalItem, answer: ItemAnswer): boolean {
  if (item.type === 'text-completion') {
    const a = answer as TCAnswer;
    return item.blanks.every((b) => !!a.blankChoiceIds[b.id]);
  }
  if (item.type === 'sentence-equivalence') {
    const a = answer as SEAnswer;
    return a.choiceIds.length === 2;
  }
  if (item.type === 'reading-comprehension') {
    const a = answer as RCAnswer;
    return a.choiceIds.length >= 1;
  }
  return false;
}

export function emptyAnswer(item: VerbalItem): ItemAnswer {
  if (item.type === 'text-completion') return { blankChoiceIds: {} };
  return { choiceIds: [] };
}
