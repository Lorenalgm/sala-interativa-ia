import React, { useEffect, useState } from 'react';
import { Group, GroupResult, Student } from '../../types';
import { CheckCircle, RotateCcw, Timer, XCircle } from 'lucide-react';

const nameOf = (students: Student[], id: number) =>
  students.find((s) => s.id === id)?.name ?? `Aluno ${id}`;

// Cronômetro da discussão, projetado grande
export const DiscussionTimer: React.FC<{ seconds: number; running: boolean; onToggle: () => void; onAdd: () => void }> = ({
  seconds,
  running,
  onToggle,
  onAdd,
}) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        role="timer"
        aria-live="off"
        className={`flex items-center gap-3 text-6xl lg:text-7xl font-extrabold tabular-nums ${
          seconds === 0 ? 'text-error' : 'text-base-content'
        }`}
      >
        <Timer className="w-10 h-10 text-amber-700" aria-hidden="true" />
        {mm}:{ss}
      </div>
      <div className="flex gap-2 no-print">
        <button onClick={onToggle} className="btn btn-sm">
          {running ? 'Pausar' : 'Continuar'}
        </button>
        <button onClick={onAdd} className="btn btn-sm btn-ghost">
          +30 s
        </button>
      </div>
    </div>
  );
};

// Projeta os nomes sorteados, com uma animação curta antes de fixar
export const DrawPanel: React.FC<{
  groups: Group[];
  drawn: Record<string, number>;
  students: Student[];
  drawKey: number;
  onRedraw: (groupId: string) => void;
}> = ({ groups, drawn, students, drawKey, onRedraw }) => {
  const [spinning, setSpinning] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setSpinning(true);
    const spin = setInterval(() => setTick((t) => t + 1), 80);
    const stop = setTimeout(() => {
      clearInterval(spin);
      setSpinning(false);
    }, 1400);
    return () => {
      clearInterval(spin);
      clearTimeout(stop);
    };
  }, [drawKey]);

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
      {groups.map((g) => {
        const winner = drawn[g.id];
        const shown = spinning && g.studentIds.length > 0 ? g.studentIds[(tick + g.studentIds.length) % g.studentIds.length] : winner;
        return (
          <li key={g.id} className="flex items-center justify-between gap-3">
            <p className="text-2xl lg:text-3xl font-bold leading-snug">
              <span className="text-base-content/70">{g.name}:</span>{' '}
              <span className={spinning ? 'text-base-content/50' : 'text-base-content'}>
                {shown !== undefined ? nameOf(students, shown) : 'Sem aluno presente'}
              </span>
            </p>
            {!spinning && (
              <button
                onClick={() => onRedraw(g.id)}
                className="btn btn-xs btn-ghost no-print"
                title="Sortear outro aluno deste grupo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Outro
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// Resultado por grupo, sem ranking, e o placar coletivo da turma
export const GroupResultsPanel: React.FC<{ results: GroupResult[]; students: Student[] }> = ({
  results,
  students,
}) => {
  const hits = results.filter((r) => r.correct).length;
  return (
    <section className="bg-base-100 border border-base-300 rounded-box p-5 space-y-3">
      <h2 className="text-2xl font-extrabold">
        A turma acertou em {hits} de {results.length} {results.length === 1 ? 'grupo' : 'grupos'}
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {results.map((r) => (
          <li
            key={r.groupId}
            className={`flex items-center gap-2 rounded-btn px-3 py-2 text-lg font-semibold ${
              r.correct ? 'bg-emerald-50 text-emerald-950' : 'bg-base-200 text-base-content'
            }`}
          >
            {r.correct ? (
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" aria-label="Acertou" />
            ) : (
              <XCircle className="w-5 h-5 text-base-content/60 flex-shrink-0" aria-label="Não acertou" />
            )}
            <span>
              {r.groupName} · {nameOf(students, r.studentId)}
              {r.answer ? ` (${r.answer})` : ' (sem resposta)'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
