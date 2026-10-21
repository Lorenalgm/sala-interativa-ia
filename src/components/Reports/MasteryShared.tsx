import React from 'react';
import { DIFFICULTY_LABEL, Difficulty, LEVEL_LABEL, MasteryLevel } from '../../services/mastery';
import { Recommendation } from '../../services/recommendations';

const LEVEL_STYLE: Record<MasteryLevel, string> = {
  reinforce: 'bg-red-100 text-red-950',
  progress: 'bg-amber-100 text-amber-950',
  mastered: 'bg-emerald-100 text-emerald-950',
  nodata: 'bg-base-200 text-base-content/70',
};

// Nível sempre com texto: a cor sozinha não basta
export const LevelBadge: React.FC<{ level: MasteryLevel; mastery?: number }> = ({ level, mastery }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-btn px-2.5 py-1 text-sm font-semibold whitespace-nowrap ${LEVEL_STYLE[level]}`}>
    {LEVEL_LABEL[level]}
    {mastery !== undefined && level !== 'nodata' && (
      <span className="font-bold tabular-nums">{Math.round(mastery * 100)}%</span>
    )}
  </span>
);

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  high: 'bg-red-100 text-red-950',
  medium: 'bg-amber-100 text-amber-950',
  low: 'bg-emerald-100 text-emerald-950',
  nodata: 'bg-base-200 text-base-content/70',
};

export const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => (
  <span className={`inline-flex rounded-btn px-2.5 py-1 text-sm font-semibold whitespace-nowrap ${DIFFICULTY_STYLE[difficulty]}`}>
    {DIFFICULTY_LABEL[difficulty]}
  </span>
);

export const RecommendationList: React.FC<{
  title?: string;
  items: Recommendation[];
  nameOf: (id: number) => string;
}> = ({ title = 'Para a próxima aula', items, nameOf }) => {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="bg-base-100 border border-base-300 rounded-[20px] overflow-hidden">
      <h2 className="bg-primary text-primary-content px-6 py-3 text-lg font-extrabold">{title}</h2>
      <ul className="divide-y divide-base-300">
        {items.map((r) => (
          <li key={r.id} className="px-6 py-4">
            <p className="text-lg font-bold leading-snug text-base-content">{r.text}</p>
            <p className="text-base text-base-content/75 mt-0.5">{r.reason}</p>
            {r.studentIds && r.studentIds.length > 0 && (
              <p className="text-base font-semibold text-base-content mt-1.5">{r.studentIds.map(nameOf).join(', ')}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
