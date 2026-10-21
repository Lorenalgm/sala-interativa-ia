import React, { useRef, useState } from 'react';
import { ArrowRight, Check, Lock, Monitor, Printer, ShieldCheck, Video } from 'lucide-react';
import { ScriptId } from '../../types';
import { getScript } from '../../data/scripts';
import { ClassroomScene } from './ClassroomScene';
import { LiveDemo } from './LiveDemo';
import { Reveal } from './Reveal';
import { ScriptBook } from '../Library/LibraryPage';

interface LandingPageProps {
  onOpenLibrary: () => void;
  onOpenScript: (id: ScriptId) => void;
  onOpenQuestions: () => void;
  onOpenReports: () => void;
}

// Uma amostra da biblioteca: a metodologia pelo nome e o que ela muda na aula.
// O resto do acervo o professor descobre na biblioteca.
const ideas: { title: string; text: string; script: ScriptId }[] = [
  {
    title: 'Avaliação formativa',
    text: 'Veja o que a turma entendeu enquanto ainda dá tempo de ajustar a aula.',
    script: 'quick-question',
  },
  {
    title: 'Aprendizagem em grupo',
    text: 'O grupo discute e o sistema sorteia quem responde, então todos se preparam.',
    script: 'group-draw',
  },
  {
    title: 'Lousa interativa',
    text: 'O grupo move uma paleta de papel sobre a projeção para responder, sem tocar na tela.',
    script: 'interactive-board',
  },
];

// Exemplo ilustrativo do painel de Desempenho, com turma fictícia de 14 alunos.
// As frases seguem as regras de services/recommendations.ts.
const exampleSkills = [
  {
    skill: 'Matemática',
    reinforce: 8,
    progress: 4,
    mastered: 2,
    advice: 'Retome Matemática com a turma toda.',
    reason: '8 de 14 alunos estão precisando de reforço nesta habilidade.',
  },
  {
    skill: 'Ciências',
    reinforce: 2,
    progress: 5,
    mastered: 7,
    advice: 'Reforce Ciências com 2 alunos.',
    reason: 'São os que estão abaixo de 60% de domínio estimado. A turma em geral vai bem.',
  },
  {
    skill: 'Geografia',
    reinforce: 1,
    progress: 3,
    mastered: 10,
    advice: 'Reforce Geografia com 1 aluno.',
    reason: 'É o único abaixo de 60% de domínio estimado. A turma em geral vai bem.',
  },
];

// Níveis do painel de Desempenho, com as mesmas cores da tela
const levels = [
  { key: 'reinforce', label: 'Precisa de reforço', chip: 'bg-red-100 text-red-950', bar: 'bg-red-300' },
  { key: 'progress', label: 'Em progresso', chip: 'bg-amber-100 text-amber-950', bar: 'bg-amber-300' },
  { key: 'mastered', label: 'Dominando', chip: 'bg-emerald-100 text-emerald-950', bar: 'bg-emerald-300' },
] as const;

const promises = ['Sem celular', 'Sem conta'];

const needs = [
  { icon: Monitor, title: 'Datashow', text: 'Projeta a pergunta.' },
  { icon: Video, title: 'Uma câmera', text: 'Lê as respostas.' },
  { icon: Printer, title: 'Cartões de papel', text: 'A4, 2 ou 4 por folha. Na lousa, uma paleta.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLibrary,
  onOpenScript,
  onOpenQuestions,
  onOpenReports,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-24">
      {/* Abertura: a promessa e a cena da sala */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-[-0.015em] leading-[1.06] text-balance">
            Roteiros de aprendizagem ativa para a sala de aula
          </h1>
          <p className="text-lg leading-relaxed text-base-content/85 text-pretty">
            Cada aluno levanta um cartão de papel. A câmera lê todos de uma vez e a tela mostra quem respondeu o quê.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Sem celular e sem conta">
            {promises.map((t) => (
              <li
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full bg-base-100 border border-base-300 px-3.5 py-1.5 text-sm font-extrabold"
              >
                <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <button onClick={onOpenLibrary} className="btn btn-primary btn-lg">
              Abrir a biblioteca
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
            <a href="#experimente" className="font-bold underline underline-offset-4 decoration-2">
              Experimente agora
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-[1.75rem] overflow-hidden border border-base-300">
          <ClassroomScene />
        </div>
      </section>

      {/* Demonstração: o visitante levanta um cartão */}
      <Reveal>
        <section id="experimente" aria-labelledby="experimente-titulo" className="space-y-8 scroll-mt-24">
          <h2
            id="experimente-titulo"
            className="font-editorial text-3xl lg:text-4xl font-bold tracking-[-0.015em] text-balance"
          >
            Levante um cartão e veja a turma responder
          </h2>
          <LiveDemo />
        </section>
      </Reveal>

      {/* Amostra da biblioteca: uma metodologia por vez, com o livro do roteiro */}
      <Reveal>
        <MethodShelf onOpenScript={onOpenScript} onOpenLibrary={onOpenLibrary} />
      </Reveal>

      {/* Depois da rodada: banco de perguntas e desempenho */}
      <Reveal>
        <MasteryExample onOpenQuestions={onOpenQuestions} onOpenReports={onOpenReports} />
      </Reveal>

      {/* Primeira aula */}
      <Reveal>
        <section
          aria-labelledby="primeira-aula"
          className="bg-primary text-primary-content rounded-[1.75rem] px-8 sm:px-14 py-14 space-y-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <h2
              id="primeira-aula"
              className="font-editorial text-3xl lg:text-4xl font-bold tracking-[-0.015em] max-w-xl text-balance"
            >
              O que você precisa para começar
            </h2>
            <button onClick={onOpenLibrary} className="btn btn-secondary btn-lg">
              Abrir a biblioteca
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {needs.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.title} className="flex items-start gap-4">
                  <span className="shrink-0 w-14 h-14 rounded-xl bg-white/10 ring-1 ring-white/35 flex items-center justify-center">
                    <Icon className="w-7 h-7" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-xl font-extrabold">{n.title}</span>
                    <span className="block text-lg text-primary-content/85">{n.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 border-t border-white/20 pt-8 text-base text-primary-content/90">
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              A câmera não grava nem envia imagens: a leitura acontece no seu navegador.
            </li>
            <li className="flex items-start gap-3">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              Turma e histórico ficam só neste computador. Você exporta em CSV e apaga quando quiser.
            </li>
          </ul>
        </section>
      </Reveal>
    </div>
  );
};

const linkClass =
  'group inline-flex items-center gap-1.5 font-bold text-primary rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const LinkArrow: React.FC = () => (
  <ArrowRight className="w-4 h-4 motion-safe:transition-transform group-hover:translate-x-1" aria-hidden="true" />
);

// Abas com o nome das metodologias; o livro do roteiro escolhido chega girando na lombada
const MethodShelf: React.FC<{
  onOpenScript: (id: ScriptId) => void;
  onOpenLibrary: () => void;
}> = ({ onOpenScript, onOpenLibrary }) => {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const idea = ideas[active];
  const script = getScript(idea.script);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
    const next = (active + step + ideas.length) % ideas.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section
      id="base"
      aria-labelledby="base-titulo"
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center scroll-mt-24"
    >
      <div className="lg:col-span-6 space-y-8">
        <h2
          id="base-titulo"
          className="font-editorial text-3xl lg:text-4xl font-bold tracking-[-0.015em] leading-[1.1] text-balance"
        >
          Cada roteiro é uma metodologia ativa
        </h2>

        <div role="tablist" aria-label="Metodologias" aria-orientation="vertical" className="border-y border-base-300 divide-y divide-base-300" onKeyDown={onKey}>
          {ideas.map((it, i) => {
            const selected = i === active;
            return (
              <button
                key={it.title}
                ref={(el) => (tabs.current[i] = el)}
                role="tab"
                id={`metodo-${i}`}
                aria-selected={selected}
                aria-controls="metodo-painel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className="w-full text-left py-5 flex items-start gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded"
              >
                <span
                  className={`mt-1.5 w-1 self-stretch rounded-full motion-safe:transition-colors motion-safe:duration-300 ${
                    selected ? 'bg-primary' : 'bg-transparent'
                  }`}
                  aria-hidden="true"
                />
                <span className="space-y-2">
                  <span
                    className={`block font-editorial text-2xl font-bold tracking-[-0.01em] leading-snug motion-safe:transition-colors motion-safe:duration-300 ${
                      selected ? 'text-base-content' : 'text-base-content/55 hover:text-base-content/80'
                    }`}
                  >
                    {it.title}
                  </span>
                  {selected && (
                    <span className="block text-lg leading-relaxed text-base-content/85 max-w-md">{it.text}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <button onClick={() => onOpenScript(idea.script)} className={linkClass}>
            Abrir {script.name}
            <LinkArrow />
          </button>
          <button onClick={onOpenLibrary} className="inline-flex items-center gap-1.5 font-bold underline underline-offset-4 decoration-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Ver todos os roteiros
          </button>
        </div>
      </div>

      <div
        id="metodo-painel"
        role="tabpanel"
        aria-labelledby={`metodo-${active}`}
        className="lg:col-span-6 flex justify-center py-6"
      >
        <ScriptBook key={idea.script} script={script} entrance="turn" onOpen={() => onOpenScript(idea.script)} />
      </div>
    </section>
  );
};

// Painel de exemplo: cada habilidade é clicável e mostra a sugestão que o Desempenho daria
const MasteryExample: React.FC<{
  onOpenQuestions: () => void;
  onOpenReports: () => void;
}> = ({ onOpenQuestions, onOpenReports }) => {
  const [active, setActive] = useState(0);
  const current = exampleSkills[active];

  return (
    <section aria-labelledby="depois-titulo" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div className="lg:col-span-5 space-y-6">
        <h2
          id="depois-titulo"
          className="font-editorial text-3xl lg:text-4xl font-bold tracking-[-0.015em] leading-[1.1] text-balance"
        >
          O domínio de cada aluno, por habilidade
        </h2>
        <p className="text-lg leading-relaxed text-base-content/85 text-pretty">
          As respostas das rodadas viram uma estimativa de domínio, com sugestões para a turma, para
          cada aluno e para grupos que misturam níveis. As habilidades vêm do seu banco de perguntas.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <button onClick={onOpenReports} className={linkClass}>
            Ver o desempenho
            <LinkArrow />
          </button>
          <button onClick={onOpenQuestions} className={linkClass}>
            Abrir o banco de perguntas
            <LinkArrow />
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 bg-base-100 border border-base-300 rounded-[1.75rem] p-7 sm:p-9 space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-extrabold">Escolha uma habilidade</h3>
          <p className="text-sm text-base-content/70">Turma fictícia de 14 alunos</p>
        </div>

        <ul className="space-y-2" role="group" aria-label="Habilidades do exemplo">
          {exampleSkills.map((r, i) => {
            const selected = i === active;
            return (
              <li key={r.skill}>
                <button
                  onClick={() => setActive(i)}
                  aria-pressed={selected}
                  className={`w-full grid grid-cols-[6.5rem_1fr] items-center gap-4 rounded-xl px-3 py-2.5 text-left motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                    selected ? 'bg-base-200' : 'hover:bg-base-200/60'
                  }`}
                >
                  <span className="font-display text-lg font-extrabold">{r.skill}</span>
                  <span
                    className="flex h-5 rounded-full overflow-hidden"
                    role="img"
                    aria-label={`${r.reinforce} precisam de reforço, ${r.progress} em progresso, ${r.mastered} dominando`}
                  >
                    {levels.map((l) => (
                      <span key={l.key} className={l.bar} style={{ flexGrow: r[l.key] }} />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="flex flex-wrap gap-2 px-3" aria-label="Níveis de domínio">
          {levels.map((l) => (
            <li key={l.key} className={`rounded-full px-3 py-1 text-sm font-extrabold ${l.chip}`}>
              {l.label}
            </li>
          ))}
        </ul>

        <div className="border-t border-base-300 pt-6 space-y-1.5" aria-live="polite">
          <p className="font-display text-2xl font-extrabold tracking-[-0.02em]">{current.advice}</p>
          <p className="text-base text-base-content/80">{current.reason}</p>
        </div>
      </div>
    </section>
  );
};
