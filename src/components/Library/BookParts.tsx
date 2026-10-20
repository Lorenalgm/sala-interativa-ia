import React from 'react';
import { ScriptId } from '../../types';
import { AnswerCard } from './AnswerCard';

// Capa de cada roteiro: cor, camada de trás e moldura estampada
export interface Binding {
  cover: string;
  back: string;
  frame: string;
}

const bindings: Record<ScriptId, Binding> = {
  'quick-question': { cover: 'bg-secondary text-neutral', back: 'bg-[#8a6200]', frame: 'border-black/25' },
  'group-draw': { cover: 'bg-accent text-white', back: 'bg-[#8f1a28]', frame: 'border-white/35' },
  'peer-instruction': { cover: 'bg-secondary text-neutral', back: 'bg-[#8a6200]', frame: 'border-black/25' },
  'interactive-board': { cover: 'bg-accent text-white', back: 'bg-[#8f1a28]', frame: 'border-white/35' },
};

export const bindingFor = (id: ScriptId): Binding => bindings[id];

// A lombada: faixa escura com dois frisos, na borda esquerda da capa
export const Spine: React.FC<{ tone?: string }> = ({ tone = 'bg-black/20' }) => (
  <span
    className={`absolute left-0 inset-y-0 w-5 ${tone} flex flex-col justify-between py-6 items-stretch`}
    aria-hidden="true"
  >
    <span className="h-0.5 bg-white/40" />
    <span className="h-0.5 bg-white/40" />
  </span>
);

// Emblema da capa: mostra a atividade, não decora
export const Emblem: React.FC<{ id: ScriptId; size?: 'sm' | 'lg' }> = ({ id, size = 'sm' }) => {
  if (id === 'group-draw') {
    // Quatro cartões de um grupo; só o sorteado sobe, a câmera ignora os outros
    return (
      <span
        className={`grid grid-cols-2 gap-2 ${size === 'lg' ? 'w-52 gap-3' : 'w-24'}`}
        aria-hidden="true"
      >
        {(['A', 'B', 'C', 'D'] as const).map((letter, i) => (
          <AnswerCard
            key={letter}
            letter={letter}
            className={`w-full drop-shadow-[0_8px_6px_rgb(0_0_0/0.35)] ${
              i === 1 ? '-translate-y-2 rotate-3' : 'opacity-60 saturate-50'
            }`}
          />
        ))}
      </span>
    );
  }
  if (id === 'interactive-board') {
    // Três zonas na projeção e uma paleta sobre a do meio
    return (
      <span
        className={`relative flex gap-2 ${size === 'lg' ? 'w-56 h-36 gap-3' : 'w-28 h-[4.5rem]'}`}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`flex-1 rounded-md border-2 border-white/60 ${i === 1 ? 'bg-white/35' : 'bg-white/10'}`}
          />
        ))}
        <AnswerCard
          letter="B"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/4 rotate-6 ${
            size === 'lg' ? 'w-20' : 'w-10'
          } drop-shadow-[0_8px_6px_rgb(0_0_0/0.35)]`}
        />
      </span>
    );
  }
  return (
    <AnswerCard
      letter="C"
      className={`${size === 'lg' ? 'w-40' : 'w-20'} rotate-6 drop-shadow-[0_12px_8px_rgb(0_0_0/0.35)]`}
    />
  );
};
