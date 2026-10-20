import React from 'react';
import { Lightbulb } from 'lucide-react';
import { DIFFICULTY_LABEL, Difficulty, LEVEL_CUTS, LEVEL_LABEL, MasteryLevel } from '../../services/mastery';
import { Recommendation } from '../../services/recommendations';

const LEVEL_STYLE: Record<MasteryLevel, string> = {
  reinforce: 'bg-red-100 text-red-950',
  progress: 'bg-amber-100 text-amber-950',
  mastered: 'bg-emerald-100 text-emerald-950',
  nodata: 'bg-base-200 text-base-content/70',
};

// Nível sempre com texto: a cor sozinha não basta
export const LevelBadge: React.FC<{ level: MasteryLevel; mastery?: number }> = ({ level, mastery }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-btn px-2 py-1 text-sm font-semibold ${LEVEL_STYLE[level]}`}>
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
  <span className={`inline-flex rounded-btn px-2 py-1 text-sm font-semibold ${DIFFICULTY_STYLE[difficulty]}`}>
    {DIFFICULTY_LABEL[difficulty]}
  </span>
);

export const RecommendationList: React.FC<{
  items: Recommendation[];
  nameOf: (id: number) => string;
}> = ({ items, nameOf }) => {
  if (items.length === 0) return null;
  return (
    <section aria-label="Recomendações" className="bg-amber-50 border border-amber-200 rounded-box p-5 space-y-3">
      <h2 className="font-bold text-amber-950 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-700" aria-hidden="true" />
        Recomendações
      </h2>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id}>
            <p className="font-semibold text-amber-950">{r.text}</p>
            <p className="text-sm text-amber-900/80">{r.reason}</p>
            {r.studentIds && r.studentIds.length > 0 && (
              <p className="text-sm text-amber-950 mt-0.5">{r.studentIds.map(nameOf).join(', ')}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

// Evolução do domínio depois de cada resposta, com as linhas de 60% e 80%
export const Sparkline: React.FC<{ history: number[] }> = ({ history }) => {
  const w = 160;
  const h = 48;
  const x = (i: number) => (history.length === 1 ? w / 2 : (i / (history.length - 1)) * (w - 8) + 4);
  const y = (v: number) => h - 4 - v * (h - 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-40 h-12" role="img" aria-label={`Evolução do domínio: de ${Math.round(history[0] * 100)}% para ${Math.round(history[history.length - 1] * 100)}%`}>
      <line x1="0" x2={w} y1={y(LEVEL_CUTS.reinforce)} y2={y(LEVEL_CUTS.reinforce)} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 3" />
      <line x1="0" x2={w} y1={y(LEVEL_CUTS.mastered)} y2={y(LEVEL_CUTS.mastered)} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 3" />
      <polyline fill="none" stroke="#b45309" strokeWidth="2" points={history.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
      {history.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="#b45309" />
      ))}
    </svg>
  );
};
