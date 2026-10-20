import React from 'react';
import { ArrowRight, Monitor, Printer, Video } from 'lucide-react';
import { ScriptId } from '../../types';
import { bindingFor } from '../Library/BookParts';
import { ClassroomScene } from './ClassroomScene';
import { LiveDemo } from './LiveDemo';
import { Reveal } from './Reveal';

interface LandingPageProps {
  onOpenLibrary: () => void;
  onOpenScript: (id: ScriptId) => void;
}

const sceneSteps = [
  { n: 1, text: 'Você projeta a pergunta.' },
  { n: 2, text: 'A turma levanta o cartão de papel.' },
  { n: 3, text: 'A câmera lê e a tela mostra o resultado.' },
];

const changes = [
  { lead: 'Todos respondem ao mesmo tempo.', text: 'Cada aluno levanta o seu cartão.' },
  { lead: 'Você vê na hora quem respondeu.', text: 'A tela mostra a resposta certa e quantos escolheram cada letra.' },
  { lead: 'Nada para os alunos instalarem.', text: 'Sem celular, tablet ou conta. O cartão é de papel.' },
  { lead: 'Os dados ficam com você.', text: 'Turma e histórico ficam no navegador, e o histórico sai em CSV.' },
];

const practices: { id: ScriptId; title: string; meta: string; text: string; soon?: boolean }[] = [
  {
    id: 'quick-question',
    title: 'Checagem rápida',
    meta: 'Pergunta rápida · 5 a 10 min',
    text: 'Veja o que cada aluno entendeu.',
  },
  {
    id: 'group-draw',
    title: 'Discussão em grupo',
    meta: 'Grupo com sorteio · 10 a 15 min',
    text: 'O grupo discute e o sistema sorteia quem responde.',
  },
  {
    id: 'peer-instruction',
    title: 'Votar, conversar, votar de novo',
    meta: 'Instrução por pares · em breve',
    text: 'Compare os dois votos e veja se a conversa mudou a resposta.',
    soon: true,
  },
];

const needs = [
  { icon: Monitor, title: 'Datashow', text: 'Para projetar a pergunta.' },
  { icon: Video, title: 'Uma câmera', text: 'Virada para a turma.' },
  { icon: Printer, title: 'Cartões impressos', text: 'Um por aluno, em A4.' },
];

const MiniBook: React.FC<{ id: ScriptId; soon?: boolean }> = ({ id, soon }) => {
  const binding = bindingFor(id);
  return (
    <span
      className={`cloth relative shrink-0 w-14 h-[4.75rem] rounded-r-md rounded-l-sm shadow-[0_10px_14px_-8px_rgb(16_24_32/0.5)] motion-safe:transition-transform ${binding.cover} ${
        soon ? 'opacity-60' : 'group-hover:-translate-y-1 group-hover:-rotate-3'
      }`}
      aria-hidden="true"
    >
      <span className="absolute left-0 inset-y-0 w-2 bg-black/20" />
    </span>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLibrary, onOpenScript }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-28">
      {/* Abertura: a promessa e a cena da sala */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.02]">
              Aprendizagem ativa na sua sala, só com datashow, câmera e papel.
            </h1>
            <p className="text-lg leading-relaxed text-base-content/85">
              A turma responde com cartões de papel e a câmera lê todos de uma vez. Os alunos não
              precisam de celular nem de conta.
            </p>
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
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {sceneSteps.map((s) => (
            <li key={s.n} className="flex items-center gap-3">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-content font-display font-bold flex items-center justify-center">
                {s.n}
              </span>
              <span className="text-lg leading-snug">{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Demonstração: o visitante levanta um cartão */}
      <Reveal>
        <section id="experimente" aria-labelledby="experimente-titulo" className="space-y-8 scroll-mt-24">
          <div className="max-w-2xl space-y-2">
            <h2
              id="experimente-titulo"
              className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight"
            >
              Levante um cartão e veja a turma responder
            </h2>
            <p className="text-lg text-base-content/80">É assim que a tela do datashow se enche em poucos segundos.</p>
          </div>
          <LiveDemo />
        </section>
      </Reveal>

      {/* O que muda na aula */}
      <Reveal>
        <section aria-labelledby="o-que-muda" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <h2
            id="o-que-muda"
            className="lg:col-span-4 font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight"
          >
            O que muda na sua aula
          </h2>
          <dl className="lg:col-span-8">
            {changes.map((c) => (
              <div
                key={c.lead}
                className="py-8 px-4 -mx-4 rounded-2xl grid sm:grid-cols-2 gap-x-10 gap-y-2 items-baseline motion-safe:transition-colors hover:bg-base-100"
              >
                <dt className="font-display text-2xl font-extrabold leading-snug">{c.lead}</dt>
                <dd className="text-lg leading-snug text-base-content/80">{c.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>

      {/* Aprendizagem ativa */}
      <Reveal>
        <section
          id="aprendizagem-ativa"
          aria-labelledby="aprendizagem-ativa-titulo"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 scroll-mt-24"
        >
          <div className="lg:col-span-5 space-y-6">
            <h2
              id="aprendizagem-ativa-titulo"
              className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight"
            >
              Aprendizagem ativa, em uma frase
            </h2>
            <p className="font-display text-2xl font-bold leading-snug text-primary">
              O aluno faz algo com o que aprende: responde, discute, explica.
            </p>
            <p className="text-lg leading-relaxed text-base-content/80">
              O ClassPlay lê as respostas e mostra o resultado. Você conduz a conversa.
            </p>
          </div>

          <ul className="lg:col-span-7 space-y-3">
            {practices.map((p) => {
              const inner = (
                <>
                  <MiniBook id={p.id} soon={p.soon} />
                  <span className="flex-1 space-y-1 text-left">
                    <span className="block text-sm font-bold text-base-content/65">{p.meta}</span>
                    <span className="block font-display text-2xl font-extrabold leading-snug">{p.title}</span>
                    <span className="block text-lg leading-snug text-base-content/80">{p.text}</span>
                  </span>
                  {!p.soon && (
                    <ArrowRight
                      className="w-6 h-6 text-primary shrink-0 motion-safe:transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  )}
                </>
              );
              return (
                <li key={p.id}>
                  {p.soon ? (
                    <div className="flex items-center gap-6 rounded-2xl px-5 py-5">{inner}</div>
                  ) : (
                    <button
                      onClick={() => onOpenScript(p.id)}
                      className="group w-full flex items-center gap-6 rounded-2xl px-5 py-5 bg-base-100 border border-base-300 hover:border-primary motion-safe:transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>

      {/* O que você precisa */}
      <Reveal>
        <section aria-labelledby="o-que-precisa" className="space-y-8">
          <h2
            id="o-que-precisa"
            className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight"
          >
            O que você precisa
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {needs.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.title} className="flex items-center gap-4">
                  <span className="shrink-0 w-14 h-14 rounded-xl bg-primary text-primary-content flex items-center justify-center">
                    <Icon className="w-7 h-7" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-xl font-extrabold">{n.title}</span>
                    <span className="block text-lg text-base-content/80">{n.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>

      {/* Fechamento */}
      <Reveal>
        <section className="bg-primary text-primary-content rounded-[1.75rem] px-8 sm:px-14 py-14 flex flex-wrap items-center justify-between gap-8">
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight max-w-xl">
            Pronto para a próxima aula?
          </h2>
          <button onClick={onOpenLibrary} className="btn btn-secondary btn-lg">
            Abrir a biblioteca
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </section>
      </Reveal>
    </div>
  );
};
