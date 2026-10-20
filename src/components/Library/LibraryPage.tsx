import React from 'react';
import { ArrowRight, Camera, Clock, Printer, Users } from 'lucide-react';
import { ActiveTab } from '../Navbar';
import { ActiveScript, scripts } from '../../data/scripts';
import { ScriptId } from '../../types';
import { Suit, suitFor } from './Suit';

interface LibraryPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenScript: (id: ScriptId) => void;
  studentsCount: number;
}

// Inclinação de cada carta na mesa; a carta endireita ao receber foco
const tilts = ['-2.5deg', '2deg', '-1.5deg', '2.5deg'];

const SuitCorner: React.FC<{ script: ActiveScript; flip?: boolean }> = ({ script, flip }) => (
  <span
    className={`absolute flex flex-col items-center gap-1 text-accent ${
      flip ? 'bottom-4 right-4 rotate-180' : 'top-4 left-4'
    }`}
    aria-hidden="true"
  >
    <span className="font-display text-2xl font-extrabold leading-none text-neutral">
      {script.steps.length}
    </span>
    <Suit shape={suitFor(script.id)} className="w-5 h-5" />
  </span>
);

const PlayableCard: React.FC<{
  script: ActiveScript;
  index: number;
  onOpen: () => void;
}> = ({ script, index, onOpen }) => (
  <button
    onClick={onOpen}
    style={{ '--tilt': tilts[index % tilts.length], '--i': index } as React.CSSProperties}
    className="play-card deal group relative text-left bg-white text-neutral rounded-[1.75rem] px-8 pt-20 pb-20 sm:px-10 flex flex-col gap-6 min-h-[26rem]"
  >
    <SuitCorner script={script} />
    <SuitCorner script={script} flip />

    <div className="space-y-3">
      <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.02]">
        {script.name}
      </h2>
      <p className="text-lg leading-relaxed text-neutral/85">{script.goal}</p>
    </div>

    <ol className="flex flex-wrap items-center gap-2" aria-label={`${script.steps.length} etapas`}>
      {script.steps.map((_, i) => (
        <li
          key={i}
          className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-base ${
            i === 0 ? 'bg-secondary text-neutral' : 'bg-base-200 text-neutral'
          }`}
        >
          {i + 1}
        </li>
      ))}
      <li className="ml-1 text-sm font-medium text-neutral/70 list-none">
        {script.steps.length} etapas
      </li>
    </ol>

    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="inline-flex items-center gap-1.5 font-semibold">
        <Clock className="w-4 h-4" aria-hidden="true" />
        {script.minutes}
      </span>
      <span className="text-neutral/70">{script.format}</span>
      <span className="ml-auto inline-flex items-center gap-1 font-bold text-primary">
        Jogar esta carta
        <ArrowRight
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </div>
  </button>
);

// Carta virada para baixo: o nome continua legível numa etiqueta, só não abre ainda
const FaceDownCard: React.FC<{ script: ActiveScript; index: number }> = ({ script, index }) => (
  <article
    style={{ '--tilt': tilts[index % tilts.length], '--i': index } as React.CSSProperties}
    className="play-card deal card-back relative rounded-[1.5rem] p-4 min-h-[12rem] flex items-center"
  >
    <div className="w-full bg-white text-neutral rounded-2xl px-5 py-4 space-y-1">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold tracking-tight leading-tight">
          {script.name}
        </h2>
        <Suit shape={suitFor(script.id)} className="w-5 h-5 text-accent shrink-0" />
      </div>
      <p className="text-base leading-snug text-neutral/80">{script.goal}</p>
      <p className="text-sm font-bold text-primary pt-1">Em breve · {script.minutes}</p>
    </div>
  </article>
);

const prepSteps: {
  id: ActiveTab;
  icon: typeof Users;
  title: string;
  text: string;
}[] = [
  { id: 'classroom', icon: Users, title: 'Confira a turma', text: 'Cada aluno precisa ter um número de cartão.' },
  { id: 'cards', icon: Printer, title: 'Imprima os cartões', text: 'Um por aluno, em papel A4.' },
  {
    id: 'camera',
    icon: Camera,
    title: 'Posicione a câmera',
    text: 'Ela precisa enxergar a turma toda, de frente e com a sala iluminada.',
  },
];

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onNavigate,
  onOpenScript,
  studentsCount,
}) => {
  const available = scripts.filter((s) => s.status === 'available');
  const soon = scripts.filter((s) => s.status === 'soon');

  return (
    <div className="felt text-white min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 space-y-14">
        <header className="max-w-3xl space-y-4">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.98]">
            Qual carta você joga hoje?
          </h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
            Cada roteiro é uma atividade pronta. Os alunos participam com cartões de papel, sem
            celular nem tablet. Você só precisa do datashow e de uma câmera.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
            {available.map((script, i) => (
              <PlayableCard
                key={script.id}
                script={script}
                index={i}
                onOpen={() => onOpenScript(script.id)}
              />
            ))}
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {soon.map((script, i) => (
              <FaceDownCard key={script.id} script={script} index={i + available.length} />
            ))}
          </div>
        </div>

        <section aria-labelledby="antes-da-aula" className="space-y-6">
          <h2 id="antes-da-aula" className="font-display text-3xl font-extrabold tracking-tight">
            Antes da aula
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prepSteps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.id}>
                  <button
                    onClick={() => onNavigate(step.id)}
                    className="group w-full flex items-center gap-4 text-left rounded-2xl p-2 -m-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-secondary"
                  >
                    <span className="relative shrink-0 w-20 h-20 rounded-full bg-secondary text-neutral flex items-center justify-center shadow-[0_8px_14px_-6px_rgb(0_0_0/0.5)] motion-safe:transition-transform group-hover:-translate-y-1">
                      <span
                        className="absolute inset-1.5 rounded-full border-2 border-dashed border-neutral/60"
                        aria-hidden="true"
                      />
                      <Icon className="w-7 h-7" aria-hidden="true" />
                    </span>
                    <span className="space-y-0.5">
                      <span className="block text-lg font-bold">
                        {step.title}
                        {step.id === 'classroom' && (
                          <span className="font-medium text-white/80"> · {studentsCount} alunos</span>
                        )}
                      </span>
                      <span className="block text-base text-white/85 leading-snug">{step.text}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};
