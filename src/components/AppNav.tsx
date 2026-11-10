import type { View } from '@/types/navigation';
import { Button } from '@/components/ui/Button';
import { User as UserIcon, Cloud, Loader2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { useAppStore } from '@/store/useAppStore';

interface AppNavProps {
  current: View;
  onNavigate: (view: View) => void;
  user: User | null;
  syncing: boolean;
  onOpenAuth: () => void;
}

const links: { view: View; label: string }[] = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'sets', label: 'Groups' },
  { view: 'recap', label: 'Daily Recap' },
  { view: 'learning', label: 'Learn' },
  { view: 'quiz', label: 'Quiz' },
  { view: 'wordbank', label: 'Word Bank' },
  { view: 'analytics', label: 'Analytics' },
  { view: 'settings', label: 'Settings' },
];

export function AppNav({ current, onNavigate, user, syncing, onOpenAuth }: AppNavProps) {
  const sessionCount = useAppStore((s) => s.sessionReviews.length);
  const todayReviews = useAppStore((s) => s.progress.totalReviewsToday);
  const activeCount = sessionCount > 0 ? sessionCount : todayReviews;

  return (
    <nav className="border-b border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-1 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-display text-sm font-semibold text-(--color-gold) mr-4 shrink-0 hidden sm:inline">
            GRE Vocab
          </span>
          {links.map(({ view, label }) => (
            <Button
              key={view}
              variant={current === view ? 'primary' : 'ghost'}
              className="shrink-0 text-xs sm:text-sm flex items-center gap-1"
              onClick={() => onNavigate(view)}
            >
              <span>{label}</span>
              {view === 'recap' && activeCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  current === 'recap'
                    ? 'bg-black/20 text-(--color-ink)'
                    : 'bg-(--color-gold)/20 text-(--color-gold)'
                }`}>
                  {activeCount}
                </span>
              )}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 pl-2 shrink-0 border-l border-gray-200 dark:border-gray-800">
          {user ? (
            <button
              onClick={onOpenAuth}
              title={`Logged in as ${user.email || 'User'}`}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-(--color-verdigris)/30 bg-(--color-verdigris)/10 text-(--color-verdigris) hover:bg-(--color-verdigris)/20 transition"
            >
              {syncing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              <span className="max-w-[100px] truncate hidden md:inline">
                {user.email ? user.email.split('@')[0] : 'Synced'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-(--color-gold)/40 bg-(--color-gold)/10 text-(--color-gold) hover:bg-(--color-gold)/20 transition font-medium"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In / Sync</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

