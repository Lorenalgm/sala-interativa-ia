import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type Letter = 'A' | 'B' | 'C' | 'D';

const options: { letter: Letter; label: string }[] = [
  { letter: 'A', label: 'Jacaré' },
  { letter: 'B', label: 'Baleia' },
  { letter: 'C', label: 'Sapo' },
  { letter: 'D', label: 'Cobra' },
];
const correct: Letter = 'B';

// Turma de exemplo: respostas dos outros sete alunos, reveladas uma a uma
const others: Letter[] = ['B', 'B', 'C', 'B', 'A', 'B', 'D'];
const total = others.length + 1;

const tones = ['#f0c19a', '#9c6a46', '#e0a97c', '#6f4630', '#c99068', '#b57a52', '#e0a97c', '#8d5a3b'];

// Simulação para o professor sentir o fluxo: levanta o cartão, a câmera lê, a tela mostra o resultado
export const LiveDemo: React.FC = () => {
  const [mine, setMine] = useState<Letter | null>(null);
  const [read, setRead] = useState(0); // quantos dos outros já foram lidos

  useEffect(() => {
    if (!mine || read >= others.length) return;
    const t = setTimeout(() => setRead((r) => r + 1), read === 0 ? 500 : 420);
    return () => clearTimeout(t);
  }, [mine, read]);

  const answers: (Letter | null)[] = [mine, ...others.map((l, i) => (mine && i < read ? l : null))];
  const counts = options.map((o) => answers.filter((a) => a === o.letter).length);
  const done = !!mine && read >= others.length;
  const rightCount = counts[options.findIndex((o) => o.letter === correct)];
  const readCount = answers.filter(Boolean).length;

  const reset = () => {
    setMine(null);
    setRead(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Tela do datashow */}
      <div className="lg:col-span-7 bg-primary text-primary-content rounded-[1.75rem] p-7 sm:p-9 flex flex-col justify-between gap-6">
        <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
          Qual destes animais é um mamífero?
        </p>
        <ul className="space-y-3" aria-live="polite">
          {options.map((o, i) => {
            const isRight = done && o.letter === correct;
            const pct = (counts[i] / total) * 100;
            return (
              <li key={o.letter} className="flex items-center gap-4">
                <span
                  className={`shrink-0 w-11 h-11 rounded-xl font-display font-extrabold text-xl flex items-center justify-center transition-colors duration-500 ${
                    isRight ? 'bg-secondary text-neutral' : 'bg-white/15 text-white'
                  }`}
                >
                  {o.letter}
                </span>
                <span className="w-20 shrink-0 text-lg font-semibold">{o.label}</span>
                <span className="relative flex-1 h-4 rounded-full bg-white/15 overflow-hidden">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${
                      isRight ? 'bg-secondary' : 'bg-white/70'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-6 text-right font-bold tabular-nums">{counts[i]}</span>
              </li>
            );
          })}
        </ul>
        <p className="min-h-7 text-lg font-semibold">
          {done
            ? `Resposta certa: ${correct}. ${rightCount} de ${total} acertaram.`
            : mine
            ? `A câmera leu ${readCount} de ${total} cartões…`
            : 'Esperando os cartões da turma.'}
        </p>
      </div>

      {/* Turma e cartão do visitante */}
      <div className="lg:col-span-5 bg-base-100 border border-base-300 rounded-[1.75rem] p-7 sm:p-9 flex flex-col gap-6">
        <div className="space-y-3">
          <h3 className="font-display text-xl font-extrabold">Levante o seu cartão</h3>
          <div className="flex gap-3" role="group" aria-label="Escolha a sua resposta">
            {options.map((o) => {
              const picked = mine === o.letter;
              return (
                <button
                  key={o.letter}
                  onClick={() => setMine(o.letter)}
                  disabled={!!mine}
                  aria-pressed={picked}
                  aria-label={`Cartão ${o.letter}`}
                  className={`w-16 h-20 rounded-lg border-2 font-display font-extrabold text-3xl motion-safe:transition-all motion-safe:duration-200 ${
                    picked
                      ? 'bg-secondary border-secondary text-neutral -translate-y-2 shadow-[0_12px_14px_-8px_rgb(16_24_32/0.5)]'
                      : mine
                      ? 'bg-base-200 border-base-300 text-base-content/40'
                      : 'bg-white border-neutral text-neutral hover:-translate-y-1.5 hover:border-primary cursor-pointer'
                  }`}
                >
                  {o.letter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-display text-xl font-extrabold">A turma</h3>
          <ul className="grid grid-cols-4 gap-3">
            {answers.map((a, i) => (
              <li key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={`relative w-full aspect-[5/4] rounded-lg flex items-end justify-center overflow-hidden motion-safe:transition-colors motion-safe:duration-300 ${
                    a ? 'bg-primary' : 'bg-base-200 border border-dashed border-base-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full mb-[-6px]" style={{ background: tones[i] }} />
                  {a && (
                    <span className="absolute top-1.5 right-1.5 w-6 h-7 rounded-[4px] bg-white text-neutral text-xs font-extrabold flex items-center justify-center">
                      {a}
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-base-content/70">
                  {i === 0 ? 'Você' : `#0${i + 1}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-base-content/70 max-w-[16rem]">
            Simulação com uma turma de exemplo. Na aula, a câmera lê os cartões de papel de verdade.
          </p>
          {mine && (
            <button onClick={reset} className="btn btn-sm btn-ghost gap-1.5">
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Jogar de novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
