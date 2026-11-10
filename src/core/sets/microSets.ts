import wordsData from '@/data/words.json';
import type { Word, MicroSet } from '@/core/types';

const words = wordsData as Word[];

const SET_THEMES = [
  { title: 'Essential Core', subtitle: 'Highest-yield GRE verbal foundations', theme: 'emerald' },
  { title: 'Intellectual Nuance', subtitle: 'Academic discourse & subtle rhetoric', theme: 'blue' },
  { title: 'Behavior & Temperament', subtitle: 'Human character, quirks, and social dynamics', theme: 'amber' },
  { title: 'Argumentation & Logic', subtitle: 'Persuasion, fallacies, and empirical claims', theme: 'purple' },
  { title: 'Contradiction & Irony', subtitle: 'Ambiguity, paradoxes, and sharp reversals', theme: 'rose' },
  { title: 'Mastery & Obscurity', subtitle: 'Elite difficulty words found in 165+ scores', theme: 'indigo' },
];

/**
 * GregMat 34 Groups & supplementary sets
 */
export function getMicroSets(allWords: Word[] = words): MicroSet[] {
  const groupMap = new Map<number, Word[]>();
  for (const w of allWords) {
    const g = w.group ?? (Math.floor(allWords.indexOf(w) / 30) + 1);
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g)!.push(w);
  }

  const sets: MicroSet[] = [];
  const sortedGroups = Array.from(groupMap.keys()).sort((a, b) => a - b);

  for (const g of sortedGroups) {
    const list = groupMap.get(g)!;
    const meta = SET_THEMES[(g - 1) % SET_THEMES.length];
    const isStandardGroup = g <= 34;
    sets.push({
      id: g,
      title: isStandardGroup ? `Group ${g}: ${meta.title}` : `Bonus Group ${g - 34}: ${meta.title}`,
      subtitle: isStandardGroup
        ? `Take Test ${g} · ${list.length} high-yield words`
        : `Supplementary · ${list.length} high-frequency words`,
      wordIds: list.map((w) => w.id),
      theme: meta.theme,
    });
  }

  return sets;
}

