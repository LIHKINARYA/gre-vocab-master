import { useEffect } from 'react';

type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

/**
 * Registers keydown handlers for the lifetime of the component.
 * Keys are matched case-insensitively; use 'Space', 'Escape', 'ArrowLeft', etc.
 * for special keys, matching `KeyboardEvent.code`/`key` conventions used here.
 */
export function useKeyboardShortcuts(map: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: KeyboardEvent) {
      // Don't hijack typing in inputs/textareas.
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      const key = e.code === 'Space' ? 'Space' : e.key;
      const fn = map[key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [map, enabled]);
}
