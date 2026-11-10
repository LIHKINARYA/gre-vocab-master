import { useEffect, useState } from 'react';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { LearningSession } from '@/features/learning/LearningSession';
import { QuizMode } from '@/features/quiz/QuizMode';
import { WordBank } from '@/features/wordbank/WordBank';
import { Analytics } from '@/features/analytics/Analytics';
import { Settings } from '@/features/settings/Settings';
import { CurriculumView } from '@/features/sets/CurriculumView';
import { DailyRecap } from '@/features/recap/DailyRecap';
import { AppNav } from '@/components/AppNav';
import { AuthModal } from '@/features/auth/AuthModal';
import { AchievementToast } from '@/features/gamification/AchievementToast';
import { useAppStore } from '@/store/useAppStore';
import { useAchievementUnlocks } from '@/hooks/useAchievementUnlocks';
import { useAuthSync } from '@/hooks/useAuthSync';
import type { View } from '@/types/navigation';
import type { QuizSource } from '@/features/quiz/useQuizSession';
import type { MicroSet, Word } from '@/core/types';

function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);
  const theme = useAppStore((s) => s.progress.theme);
  const getWord = useAppStore((s) => s.getWord);

  const [view, setView] = useState<View>('dashboard');
  const [quizSource, setQuizSource] = useState<QuizSource | undefined>(undefined);
  const [activeSet, setActiveSet] = useState<MicroSet | null>(null);
  const [recapLearningWords, setRecapLearningWords] = useState<Word[] | null>(null);
  const [recapLearningTitle, setRecapLearningTitle] = useState<string | undefined>(undefined);
  const [wordBankSetFilter, setWordBankSetFilter] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { currentToast, dismissToast } = useAchievementUnlocks();
  const { user, syncing, logoutUser, syncToCloud } = useAuthSync();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-paper) dark:bg-(--color-ink) text-(--color-ink) dark:text-(--color-paper)">
        <p className="font-display text-lg">Loading your ledger…</p>
      </div>
    );
  }

  function goToQuiz(source?: QuizSource) {
    setQuizSource(source);
    setView('quiz');
  }

  function handleStartMicroSet(set: MicroSet) {
    setActiveSet(set);
    setRecapLearningWords(null);
    setRecapLearningTitle(undefined);
    setView('learning');
  }

  function handleStartFlashcardsFromRecap(wordsList: Word[], title: string) {
    setActiveSet(null);
    setRecapLearningWords(wordsList);
    setRecapLearningTitle(title);
    setView('learning');
  }

  function handleStartQuizFromRecap(source: string) {
    goToQuiz(source as QuizSource);
  }

  function handleQuizMicroSet(set: MicroSet) {
    goToQuiz(`set-${set.id}` as QuizSource);
  }

  function handleViewMicroSetWords(set: MicroSet) {
    setWordBankSetFilter(set.id);
    setView('wordbank');
  }

  function handleExitLearning() {
    setActiveSet(null);
    setRecapLearningWords(null);
    setRecapLearningTitle(undefined);
    setView('dashboard');
  }

  // Active queue of words for learning session
  const customSessionWords: Word[] | undefined = recapLearningWords
    ? recapLearningWords
    : activeSet
    ? (activeSet.wordIds.map((id) => getWord(id)).filter(Boolean) as Word[])
    : undefined;

  const currentLearningTitle = recapLearningTitle
    ? recapLearningTitle
    : activeSet
    ? `${activeSet.title} (${activeSet.wordIds.length} words)`
    : undefined;

  return (
    <div className="min-h-screen bg-(--color-paper) dark:bg-(--color-ink)">
      <AppNav
        current={view}
        onNavigate={(v) => {
          if (v === 'quiz') {
            goToQuiz(undefined);
          } else {
            setActiveSet(null);
            setRecapLearningWords(null);
            setRecapLearningTitle(undefined);
            if (v !== 'wordbank') {
              setWordBankSetFilter(null);
            }
            setView(v);
          }
        }}
        user={user}
        syncing={syncing}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {view === 'dashboard' && (
        <Dashboard
          onStartLearning={() => {
            setActiveSet(null);
            setRecapLearningWords(null);
            setRecapLearningTitle(undefined);
            setView('learning');
          }}
          onStartCram={() => goToQuiz('struggling')}
          onSelectMicroSet={handleStartMicroSet}
          onQuizMicroSet={handleQuizMicroSet}
          onViewMicroSetWords={handleViewMicroSetWords}
          onViewAllSets={() => setView('sets')}
          onOpenRecap={() => setView('recap')}
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {view === 'sets' && (
        <CurriculumView
          onSelectSet={handleStartMicroSet}
          onQuizSet={handleQuizMicroSet}
          onViewWords={handleViewMicroSetWords}
        />
      )}

      {view === 'recap' && (
        <DailyRecap
          onStartFlashcards={handleStartFlashcardsFromRecap}
          onStartQuiz={handleStartQuizFromRecap}
          onNavigateHome={() => {
            setActiveSet(null);
            setView('learning');
          }}
        />
      )}

      {view === 'learning' && (
        <LearningSession
          onExit={handleExitLearning}
          words={customSessionWords}
          title={currentLearningTitle}
          onReviewRecap={() => setView('recap')}
        />
      )}

      {view === 'quiz' && <QuizMode onExit={() => setView('dashboard')} initialSource={quizSource} />}

      {view === 'wordbank' && (
        <WordBank
          initialSetId={wordBankSetFilter}
          onClearSetFilter={() => setWordBankSetFilter(null)}
        />
      )}

      {view === 'analytics' && <Analytics />}

      {view === 'settings' && (
        <Settings
          user={user}
          syncing={syncing}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={logoutUser}
          onSyncNow={syncToCloud}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <AchievementToast achievement={currentToast} onDismiss={dismissToast} />
    </div>
  );
}

export default App;


