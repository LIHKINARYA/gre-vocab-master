import { useAppStore } from '@/store/useAppStore';
import { TextCompletionPrompt } from './TextCompletionPrompt';
import { SentenceEquivalencePrompt } from './SentenceEquivalencePrompt';
import { ReadingComprehensionPrompt } from './ReadingComprehensionPrompt';
import type { VerbalItem } from '@/core/types';
import type { ItemAnswer, TCAnswer, SEAnswer, RCAnswer } from '@/core/grading';

interface ItemPromptProps {
  item: VerbalItem;
  answer: ItemAnswer;
  disabled: boolean;
  onSelectTCBlank: (blankId: string, choiceId: string) => void;
  onToggleSEChoice: (choiceId: string) => void;
  onToggleRCChoice: (choiceId: string) => void;
}

export function ItemPrompt({ item, answer, disabled, onSelectTCBlank, onToggleSEChoice, onToggleRCChoice }: ItemPromptProps) {
  const getPassage = useAppStore((s) => s.getPassage);

  if (item.type === 'text-completion') {
    return (
      <TextCompletionPrompt item={item} answer={answer as TCAnswer} onSelect={onSelectTCBlank} disabled={disabled} />
    );
  }
  if (item.type === 'sentence-equivalence') {
    return (
      <SentenceEquivalencePrompt item={item} answer={answer as SEAnswer} onToggle={onToggleSEChoice} disabled={disabled} />
    );
  }
  return (
    <ReadingComprehensionPrompt
      item={item}
      passage={getPassage(item.passageId)}
      answer={answer as RCAnswer}
      onToggle={onToggleRCChoice}
      disabled={disabled}
    />
  );
}
