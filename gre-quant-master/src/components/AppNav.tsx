import type { View } from '@/types/navigation';
import { Button } from '@/components/ui/Button';

interface AppNavProps {
  current: View;
  onNavigate: (view: View) => void;
}

const links: { view: View; label: string }[] = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'practice', label: 'Practice' },
  { view: 'quiz', label: 'Quiz' },
  { view: 'problembank', label: 'Problem Bank' },
  { view: 'analytics', label: 'Analytics' },
  { view: 'settings', label: 'Settings' },
];

export function AppNav({ current, onNavigate }: AppNavProps) {
  return (
    <nav className="border-b border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 py-2 overflow-x-auto">
        <span className="font-display text-sm font-semibold text-(--color-gold) mr-4 shrink-0 hidden sm:inline">
          GRE Quant
        </span>
        {links.map(({ view, label }) => (
          <Button
            key={view}
            variant={current === view ? 'primary' : 'ghost'}
            className="shrink-0 text-xs sm:text-sm"
            onClick={() => onNavigate(view)}
          >
            {label}
          </Button>
        ))}
      </div>
    </nav>
  );
}
