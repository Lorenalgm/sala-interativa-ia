import React from 'react';
import { Hand } from 'lucide-react';
import { ScriptId } from '../../types';
import { AnswerCard } from './AnswerCard';

// Capa de cada modelo: cor própria (alto contraste da Apple, texto branco acima de 5:1),
// camada de trás mais escura e moldura estampada. O azul fica reservado para ações.
export interface Binding {
  cover: string;
  back: string;
  frame: string;
  // Cor sólida do modelo, para ícones e marcadores fora do livro
  swatch: string;
}

const bindings: Record<ScriptId, Binding> = {
  'quick-question': { cover: 'bg-[#3634a3] text-white', back: 'bg-[#1f1d66]', frame: 'border-white/35', swatch: 'bg-[#3634a3]' },
  'group-draw': { cover: 'bg-[#c93400] text-white', back: 'bg-[#7a2000]', frame: 'border-white/35', swatch: 'bg-[#c93400]' },
  'peer-instruction': { cover: 'bg-[#8944ab] text-white', back: 'bg-[#552a6b]', frame: 'border-white/35', swatch: 'bg-[#8944ab]' },
  'interactive-board': { cover: 'bg-[#006e7f] text-white', back: 'bg-[#00414b]', frame: 'border-white/35', swatch: 'bg-[#006e7f]' },
  'where-is': { cover: 'bg-[#d30f45] text-white', back: 'bg-[#7d0828]', frame: 'border-white/35', swatch: 'bg-[#d30f45]' },
  'sort-groups': { cover: 'bg-[#1f7a3a] text-white', back: 'bg-[#0f4720]', frame: 'border-white/35', swatch: 'bg-[#1f7a3a]' },
  'color-mix': { cover: 'bg-[#2c2c2e] text-white', back: 'bg-[#111113]', frame: 'border-white/30', swatch: 'bg-[#2c2c2e]' },
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

// Emblema da capa: mostra a interação do modelo, não decora
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
  const lg = size === 'lg';
  if (id === 'where-is') {
    // Uma reta com marcas e o alfinete do palpite sobre ela
    return (
      <span className={`relative block ${lg ? 'w-56 h-32' : 'w-28 h-16'}`} aria-hidden="true">
        <span className="absolute left-0 right-0 bottom-[28%] h-[10%] rounded-full bg-white" />
        {[0, 50, 100].map((x) => (
          <span key={x} className="absolute bottom-[18%] h-[30%] w-[3%] -translate-x-1/2 rounded-full bg-white" style={{ left: `${x}%` }} />
        ))}
        <span className="absolute left-[72%] bottom-[33%] h-[42%] w-[3%] -translate-x-1/2 rounded-full bg-[#ffcc00]" />
        <span className="absolute left-[72%] top-0 w-[26%] aspect-square -translate-x-1/2 rounded-full bg-[#ffcc00] border-4 border-white drop-shadow-[0_6px_5px_rgb(0_0_0/0.35)]" />
      </span>
    );
  }
  if (id === 'sort-groups') {
    // Duas caixas e um cartão caindo na da esquerda
    return (
      <span className={`relative flex items-end gap-2 ${lg ? 'w-56 h-36 gap-3' : 'w-28 h-[4.5rem]'}`} aria-hidden="true">
        {[0, 1].map((i) => (
          <span key={i} className="flex-1 h-[55%] rounded-md border-2 border-white/70 bg-white/15" />
        ))}
        <span className="absolute left-[14%] top-0 w-[30%] h-[42%] rounded-md bg-white -rotate-12 drop-shadow-[0_6px_5px_rgb(0_0_0/0.35)]" />
      </span>
    );
  }
  if (id === 'color-mix') {
    // Três primárias que se sobrepõem, como tinta no papel
    return (
      <span className={`relative block rounded-lg bg-white ${lg ? 'w-44 h-40' : 'w-24 h-[5.5rem]'}`} aria-hidden="true">
        <span className="absolute left-[30%] top-[10%] w-[42%] aspect-square -translate-x-1/2 rounded-full bg-[#ff2a2a] mix-blend-multiply" style={{ left: '38%' }} />
        <span className="absolute top-[10%] w-[42%] aspect-square -translate-x-1/2 rounded-full bg-[#ffe600] mix-blend-multiply" style={{ left: '62%' }} />
        <span className="absolute top-[42%] w-[42%] aspect-square -translate-x-1/2 rounded-full bg-[#2f7bff] mix-blend-multiply" style={{ left: '50%' }} />
      </span>
    );
  }
  if (id === 'interactive-board') {
    // Três zonas na projeção e uma mão sobre a do meio
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
        <Hand
          strokeWidth={2.25}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/4 rotate-6 text-white ${
            size === 'lg' ? 'w-20 h-20' : 'w-10 h-10'
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
