import React, { useState } from 'react';
import { Camera, Clock, Printer, Users } from 'lucide-react';
import { ActiveTab } from '../Navbar';
import { ActiveScript, scripts } from '../../data/scripts';
import { ScriptId } from '../../types';
import { Emblem, Spine, bindingFor } from './BookParts';

interface LibraryPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenScript: (id: ScriptId) => void;
  studentsCount: number;
}

// Livro de roteiro: camadas em profundidade; vira na lombada ao receber foco.
// Na estante ele sobe para a mesa; na landing ele gira na lombada ao trocar de roteiro.
export const ScriptBook: React.FC<{
  script: ActiveScript;
  index?: number;
  entrance?: 'shelve' | 'turn';
  onOpen: () => void;
}> = ({ script, index = 0, entrance = 'shelve', onOpen }) => {
  const binding = bindingFor(script.id);

  return (
    <button
      onClick={onOpen}
      style={{ '--i': index } as React.CSSProperties}
      aria-label={`Abrir ${script.name}`}
      className={`book-btn ${entrance === 'shelve' ? 'shelve' : ''} group w-[17rem] h-[25rem] text-left rounded-xl`}
    >
      <span className="book-stage block h-full">
        <span className={`block w-full h-full ${entrance === 'turn' ? 'turn-in' : ''}`}>
        <span className="book relative block w-full h-full">
          {/* Contracapa e bloco de páginas, recuados em profundidade */}
          <span
            className={`book-layer absolute inset-0 rounded-r-xl rounded-l-sm ${binding.back}`}
            style={{ transform: 'translateZ(-16px)' }}
            aria-hidden="true"
          />
          <span
            className="book-layer page-edge absolute inset-y-1 left-3 right-0 rounded-r-lg bg-white"
            style={{ transform: 'translateZ(-8px)' }}
            aria-hidden="true"
          />

          {/* Capa */}
          <span
            className={`book-layer cloth absolute inset-0 rounded-r-xl rounded-l-sm ${binding.cover}`}
          >
            <Spine />
            {/* Moldura estampada na capa, como em encadernação de tecido */}
            <span
              className={`absolute inset-y-3 right-3 left-8 border-2 rounded-md pointer-events-none ${binding.frame}`}
              aria-hidden="true"
            />
            <span className="relative flex flex-col h-full gap-2.5 pl-11 pr-8 py-8">
              <span className="block font-display text-[1.8rem] font-extrabold tracking-tight leading-[1.02]">
                {script.name}
              </span>
              <span className="flex flex-1 items-center justify-center min-h-0">
                <Emblem id={script.id} />
              </span>
              <span className="block text-sm leading-snug">{script.goal}</span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm font-bold">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {script.minutes}
                </span>
                <span>{script.format}</span>
              </span>
            </span>
          </span>
        </span>
        </span>
      </span>
    </button>
  );
};

const prepSteps: {
  id: ActiveTab;
  icon: typeof Users;
  title: string;
}[] = [
  { id: 'classroom', icon: Users, title: 'Confira a turma' },
  { id: 'cards', icon: Printer, title: 'Imprima os cartões' },
  { id: 'camera', icon: Camera, title: 'Posicione a câmera' },
];

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onNavigate,
  onOpenScript,
  studentsCount,
}) => {
  const available = scripts.filter((s) => s.status === 'available');
  const soon = scripts.filter((s) => s.status === 'soon');

  // Filtro por formato: só aparecem os formatos que já têm roteiro disponível
  const formats = Array.from(new Set(available.map((s) => s.format)));
  const [format, setFormat] = useState<string>('Todos');
  const visible = format === 'Todos' ? available : available.filter((s) => s.format === format);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight">
            Biblioteca de roteiros
          </h1>
          <p className="text-base text-base-content/75">
            Escolha uma atividade. Os alunos usam cartões de papel; você precisa do datashow e de
            uma câmera.
          </p>
        </div>

        <div role="group" aria-label="Filtrar por formato" className="flex flex-wrap gap-2">
          {['Todos', ...formats].map((f) => {
            const active = f === format;
            const count = f === 'Todos' ? available.length : available.filter((s) => s.format === f).length;
            return (
              <button
                key={f}
                onClick={() => setFormat(f)}
                aria-pressed={active}
                className={`rounded-full px-4 py-1.5 text-sm font-bold border transition-colors ${
                  active
                    ? 'bg-primary text-primary-content border-primary'
                    : 'bg-base-100 text-base-content border-base-300 hover:border-primary'
                }`}
              >
                {f} <span className="font-medium opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-8 items-start">
        {/* Estante: cresce com a biblioteca */}
        <div className="grid grid-cols-[repeat(auto-fill,17rem)] justify-center sm:justify-start gap-x-8 gap-y-10 pb-4">
          {visible.map((script, i) => (
            <ScriptBook
              key={script.id}
              script={script}
              index={i}
              onOpen={() => onOpenScript(script.id)}
            />
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <section
            aria-labelledby="antes-da-aula"
            className="bg-base-100 border border-base-300 rounded-box p-5 space-y-3"
          >
            <h2 id="antes-da-aula" className="font-display text-lg font-extrabold">
              Antes da aula
            </h2>
            <ul className="space-y-1">
              {prepSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.id}>
                    <button
                      onClick={() => onNavigate(step.id)}
                      className="w-full flex items-center gap-3 text-left rounded-lg px-2 py-2 -mx-2 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-primary text-primary-content flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                      </span>
                      <span className="font-semibold text-base">
                        {step.title}
                        {step.id === 'classroom' && (
                          <span className="font-medium text-base-content/70"> · {studentsCount}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {soon.length > 0 && (
            <section aria-labelledby="em-breve" className="px-1 space-y-2">
              <h2 id="em-breve" className="text-sm font-bold text-base-content/70">
                Em breve
              </h2>
              <ul className="space-y-2">
                {soon.map((script) => (
                  <li
                    key={script.id}
                    className="flex items-center gap-3 rounded-lg border border-dashed border-base-300 px-3 py-2"
                    title={script.goal}
                  >
                    <span
                      className="shrink-0 w-6 h-8 rounded-sm border-2 border-dashed border-base-content/35"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-tight">
                      <span className="block font-semibold">{script.name}</span>
                      <span className="text-base-content/65">{script.minutes}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};
