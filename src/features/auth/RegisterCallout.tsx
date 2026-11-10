import { Sparkles, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RegisterCalloutProps {
  onOpenAuth: () => void;
  streak: number;
  wordCount: number;
}

export function RegisterCallout({ onOpenAuth, streak, wordCount }: RegisterCalloutProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--color-gold)/30 bg-gradient-to-r from-(--color-gold-soft)/40 via-white/50 to-(--color-gold-soft)/20 dark:from-(--color-gold)/15 dark:via-white/5 dark:to-transparent p-5 sm:p-6 mb-8 shadow-xs">
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider bg-(--color-gold) text-(--color-ink) px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3" /> Cloud Backup
            </span>
            {streak > 0 && (
              <span className="text-xs text-(--color-slate)">
                Protect your <strong>{streak}-day streak</strong> &amp; {wordCount} words
              </span>
            )}
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-(--color-ink) dark:text-(--color-paper)">
            Create a free account to never lose your study history
          </h3>
          <p className="text-xs sm:text-sm text-(--color-slate) mt-1">
            Like Prepelly, sync your spaced repetition intervals across mobile, tablet, and desktop so you can review anywhere.
          </p>
        </div>

        <Button
          onClick={onOpenAuth}
          className="shrink-0 flex items-center gap-2 shadow-sm"
        >
          <Cloud className="w-4 h-4" />
          Register / Sync
        </Button>
      </div>
    </div>
  );
}
