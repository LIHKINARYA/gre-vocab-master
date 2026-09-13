import { useEffect, useState } from 'react';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { PracticeSession } from '@/features/practice/PracticeSession';
import { QuizMode } from '@/features/quiz/QuizMode';
import { ProblemBank } from '@/features/problembank/ProblemBank';
import { Analytics } from '@/features/analytics/Analytics';
import { Settings } from '@/features/settings/Settings';
import { AppNav } from '@/components/AppNav';
import { AchievementToast } from '@/features/gamification/AchievementToast';
import { useAppStore } from '@/store/useAppStore';
import { useAchievementUnlocks } from '@/hooks/useAchievementUnlocks';
import type { View } from '@/types/navigation';
import type { QuizSource } from '@/features/quiz/useQuizSession';

function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);
  const theme = useAppStore((s) => s.progress.theme);
  const [view, setView] = useState<View>('dashboard');
  const [quizSource, setQuizSource] = useState<QuizSource | undefined>(undefined);

  const { currentToast, dismissToast } = useAchievementUnlocks();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-paper) text-(--color-ink)">
        <p className="font-display text-lg">Loading your problem bank…</p>
      </div>
    );
  }

  function goToQuiz(source?: QuizSource) {
    setQuizSource(source);
    setView('quiz');
  }

  return (
    <div className="min-h-screen bg-(--color-paper) dark:bg-(--color-ink)">
      <AppNav current={view} onNavigate={(v) => (v === 'quiz' ? goToQuiz(undefined) : setView(v))} />
      {view === 'dashboard' && (
        <Dashboard
          onStartPractice={() => setView('practice')}
          onStartQuiz={() => goToQuiz(undefined)}
          onStartCram={() => goToQuiz('struggling')}
          onStartChallenge={() => goToQuiz('challenge')}
        />
      )}
      {view === 'practice' && <PracticeSession onExit={() => setView('dashboard')} />}
      {view === 'quiz' && <QuizMode onExit={() => setView('dashboard')} initialSource={quizSource} />}
      {view === 'problembank' && <ProblemBank />}
      {view === 'analytics' && <Analytics />}
      {view === 'settings' && <Settings />}
      <AchievementToast achievement={currentToast} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
