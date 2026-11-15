import React, { useState } from 'react';
import { Camera, ChevronRight, Clock, Printer, Users } from 'lucide-react';
import { ActiveTab } from '../Navbar';
import { ActiveScript, scripts } from '../../data/scripts';
import { ScriptId } from '../../types';
import { Emblem, Spine, bindingFor } from './BookParts';

interface LibraryPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenScript: (id: ScriptId) => void;
  studentsCount: number;
}

// Livro do modelo: camadas em profundidade; vira na lombada ao receber foco.
// Na estante ele sobe para a mesa; na landing ele gira na lombada ao trocar de modelo.
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
              <span className="block font-display text-[1.8rem] font-bold tracking-tight leading-[1.02]">
                {script.name}
              </span>
              <span className="flex flex-1 items-center justify-center min-h-0">
                <Emblem id={script.id} />
              </span>
              <span className="block text-[0.9375rem] leading-snug">{script.goal}</span>
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

// Preparação em lista agrupada, como em Ajustes: ícone colorido, valor à direita e chevron
const prepSteps: {
  id: ActiveTab;
  icon: typeof Users;
  title: string;
  tile: string;
}[] = [
  { id: 'classroom', icon: Users, title: 'Confira a turma', tile: 'bg-[#248a3d]' },
  { id: 'cards', icon: Printer, title: 'Imprima os cartões', tile: 'bg-[#636366]' },
  { id: 'camera', icon: Camera, title: 'Posicione a câmera', tile: 'bg-[#0040dd]' },
];

// Cabeçalho de seção no estilo de lista agrupada: pequeno, em caixa alta, fora do grupo
const GroupHeader: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2 id={id} className="px-4 pb-1.5 text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70">
    {children}
  </h2>
);

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onNavigate,
  onOpenScript,
  studentsCount,
}) => {
  const available = scripts.filter((s) => s.status === 'available');
  const soon = scripts.filter((s) => s.status === 'soon');

  // Filtro por formato: só aparecem os formatos que já têm modelo disponível
  const formats = Array.from(new Set(available.map((s) => s.format)));
  const [format, setFormat] = useState<string>('Todos');
  const visible = format === 'Todos' ? available : available.filter((s) => s.format === format);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="space-y-2">
          <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">
            Modelos de atividade
          </h1>
          <p className="text-lg text-base-content/75 max-w-2xl">
            Escolha um modelo e cadastre as suas perguntas para montar a aula. Os alunos não usam
            aparelho; você precisa do datashow e de uma câmera.
          </p>
        </div>

        {/* Controle segmentado: um trilho, o segmento escolhido em azul */}
        <div
          role="radiogroup"
          aria-label="Filtrar por formato"
          className="inline-flex rounded-[0.75rem] bg-[#e3e3e8] p-1 gap-1"
        >
          {['Todos', ...formats].map((f) => {
            const active = f === format;
            const count = f === 'Todos' ? available.length : available.filter((s) => s.format === f).length;
            return (
              <button
                key={f}
                role="radio"
                aria-checked={active}
                onClick={() => setFormat(f)}
                className={`min-h-[2.75rem] rounded-[0.5625rem] px-4 text-base font-semibold motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? 'bg-primary text-primary-content shadow-[0_1px_3px_rgb(0_0_0/0.25)]'
                    : 'text-base-content hover:bg-black/5'
                }`}
              >
                {f} <span className={active ? 'font-normal opacity-85' : 'font-normal text-base-content/70'}>{count}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-10 items-start">
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

        <aside className="space-y-7 lg:sticky lg:top-24">
          <section aria-labelledby="antes-da-aula">
            <GroupHeader id="antes-da-aula">Antes da aula</GroupHeader>
            <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
              {prepSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={step.id}>
                    <button
                      onClick={() => onNavigate(step.id)}
                      className="w-full min-h-[3.25rem] flex items-center gap-3 pl-4 text-left hover:bg-black/[0.04] active:bg-black/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                    >
                      <span
                        className={`shrink-0 w-8 h-8 rounded-[0.5rem] text-white flex items-center justify-center ${step.tile}`}
                        aria-hidden="true"
                      >
                        <Icon className="w-[1.125rem] h-[1.125rem]" />
                      </span>
                      {/* Separador recuado: começa no texto, como nas listas do sistema */}
                      <span
                        className={`flex-1 min-h-[3.25rem] flex items-center gap-2 pr-3 ${
                          i > 0 ? 'border-t border-base-300' : ''
                        }`}
                      >
                        <span className="flex-1 text-[1.0625rem] font-medium">{step.title}</span>
                        {step.id === 'classroom' && (
                          <span className="text-[1.0625rem] text-base-content/70">{studentsCount} alunos</span>
                        )}
                        <ChevronRight className="w-5 h-5 text-base-content/45" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {soon.length > 0 && (
            <section aria-labelledby="em-breve">
              <GroupHeader id="em-breve">Em breve</GroupHeader>
              <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
                {soon.map((script, i) => (
                  <li key={script.id} className="flex items-center gap-3 pl-4">
                    {/* Lombada pequena na cor do modelo, apagada porque ainda não abre */}
                    <span
                      className={`shrink-0 w-6 h-8 rounded-l-[0.125rem] rounded-r-[0.375rem] opacity-45 ${bindingFor(script.id).swatch}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`flex-1 min-h-[3.25rem] py-2 pr-4 flex flex-col justify-center ${
                        i > 0 ? 'border-t border-base-300' : ''
                      }`}
                    >
                      <span className="text-[1.0625rem] font-medium">{script.name}</span>
                      <span className="text-[0.9375rem] text-base-content/70">{script.goal}</span>
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
