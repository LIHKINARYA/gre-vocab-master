import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Button } from '@/components/ui/Button';
import { Download, Upload, Copy, Check, Database, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';

export function Settings() {
  const progress = useAppStore((s) => s.progress);
  const setTestDate = useAppStore((s) => s.setTestDate);
  const setDailyGoal = useAppStore((s) => s.setDailyGoal);
  const syncDailyGoalFromPlan = useAppStore((s) => s.syncDailyGoalFromPlan);
  const setTheme = useAppStore((s) => s.setTheme);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const s = useDashboardStats();

  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showHelper, setShowHelper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyExport = async () => {
    try {
      const data = exportData();
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API not available
    }
  };

  const handleDownloadBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gre-vocab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setImportJson(text);
        const res = importData(text);
        setImportFeedback(res);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyImport = () => {
    if (!importJson.trim()) {
      setImportFeedback({ success: false, message: 'Please paste your JSON data first.' });
      return;
    }
    const res = importData(importJson);
    setImportFeedback(res);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">Settings</p>
        <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          Study Preferences
        </h1>
      </header>

      <div className="space-y-6">
        <section className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5">
          <label className="block text-sm font-semibold mb-2">GRE Test Date</label>
          <input
            type="date"
            value={progress.testDate ?? ''}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
          />
          {s.studyPlan && (
            <p className="text-xs text-(--color-slate) mt-2">
              {s.studyPlan.daysRemaining} days left · recommended pace: {s.studyPlan.recommendedDailyGoal}{' '}
              new words/day ({s.studyPlan.paceLabel})
            </p>
          )}
        </section>

        <section className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5">
          <label className="block text-sm font-semibold mb-2">Daily New Words Goal</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={progress.dailyGoal}
              onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="flex-1 rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm"
            />
            <Button variant="secondary" onClick={syncDailyGoalFromPlan}>
              Auto
            </Button>
          </div>
          {s.studyPlan && progress.dailyGoal !== s.studyPlan.recommendedDailyGoal && (
            <p className="text-xs text-(--color-gold) mt-2">
              Plan suggests {s.studyPlan.recommendedDailyGoal}/day to finish on time
            </p>
          )}
        </section>

        <section className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5">
          <label className="block text-sm font-semibold mb-2">Theme</label>
          <div className="flex gap-2">
            <Button
              variant={progress.theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={progress.theme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>
          </div>
        </section>

        {/* Data Management: Export & Import / Transfer from localhost:5173 */}
        <section className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-(--color-primary)" />
            <h2 className="text-sm font-semibold">Data Backup & Transfer (localStorage)</h2>
          </div>
          <p className="text-xs text-(--color-slate) mb-4">
            Transfer progress between <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">localhost:5173</code> and this app, or backup your study records.
          </p>

          <div className="space-y-4">
            {/* Export Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleDownloadBackup} className="text-xs flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download Backup (.json)
              </Button>
              <Button variant="secondary" onClick={handleCopyExport} className="text-xs flex items-center gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Data JSON'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload JSON File
              </Button>
            </div>

            {/* Quick snippet for localhost:5173 */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs">
              <button
                type="button"
                onClick={() => setShowHelper((v) => !v)}
                className="font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-between w-full text-left cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Have data on http://localhost:5173? Click here for the 10-second transfer command
                </span>
                <span className="text-[11px] underline ml-2">{showHelper ? 'Hide' : 'Show command'}</span>
              </button>
              {showHelper && (
                <div className="mt-2.5 pt-2 border-t border-amber-500/20 space-y-2 text-(--color-slate)">
                  <p>
                    Open your tab on <span className="font-mono text-amber-800 dark:text-amber-200">http://localhost:5173</span>, open DevTools Console (<kbd className="px-1 rounded bg-black/5 dark:bg-white/10 text-[10px]">F12</kbd> or <kbd className="px-1 rounded bg-black/5 dark:bg-white/10 text-[10px]">Cmd+Opt+I</kbd>), and run:
                  </p>
                  <pre className="p-2 rounded bg-black/80 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                    copy(localStorage.getItem('gre-vocab-master:app-state'))
                  </pre>
                  <p>Then paste the copied JSON directly into the box below and click <strong>Restore &amp; Apply</strong>.</p>
                </div>
              )}
            </div>

            {/* Import Box */}
            <div className="space-y-2">
              <textarea
                value={importJson}
                onChange={(e) => {
                  setImportJson(e.target.value);
                  setImportFeedback(null);
                }}
                placeholder="Paste backup or localhost:5173 JSON here..."
                rows={3}
                className="w-full rounded-lg border border-(--color-ink)/15 dark:border-(--color-paper)/15 bg-white/80 dark:bg-white/5 p-2.5 font-mono text-xs"
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  onClick={handleApplyImport}
                  className="text-xs"
                  disabled={!importJson.trim()}
                >
                  Restore &amp; Apply
                </Button>
                {importFeedback && (
                  <div className={`text-xs flex items-center gap-1.5 ${importFeedback.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {importFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{importFeedback.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-(--color-rust)/30 bg-(--color-rust-soft)/20 p-5">
          <p className="text-sm font-semibold text-(--color-rust) mb-2">Reset Progress</p>
          <p className="text-xs text-(--color-slate) mb-3">
            Clears all card history, stats, and XP. Word data is not affected.
          </p>
          <Button
            variant="rust"
            onClick={() => {
              if (window.confirm('Reset all learning progress? This cannot be undone.')) {
                resetProgress();
              }
            }}
          >
            Reset All Progress
          </Button>
        </section>
      </div>
    </div>
  );
}
