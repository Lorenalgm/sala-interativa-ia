import React from 'react';
import { ArrowRight, Monitor, Printer, Video } from 'lucide-react';
import { ScriptId } from '../../types';
import { scripts } from '../../data/scripts';
import { bindingFor } from '../Library/BookParts';
import { ClassroomScene } from './ClassroomScene';

interface LandingPageProps {
  onOpenLibrary: () => void;
}

const sceneSteps = [
  { n: 1, text: 'Você projeta a pergunta.' },
  { n: 2, text: 'A turma levanta o cartão de papel com a resposta.' },
  { n: 3, text: 'A câmera lê os cartões e a tela mostra o resultado.' },
];

const changes = [
  {
    lead: 'Todos respondem ao mesmo tempo.',
    text: 'Cada aluno levanta o seu cartão. Não depende de quem levanta a mão primeiro.',
  },
  {
    lead: 'Você vê na hora quem respondeu.',
    text: 'A lista da turma marca cada cartão lido, e a tela mostra a resposta certa e quantos escolheram cada letra.',
  },
  {
    lead: 'Nada para os alunos instalarem ou comprarem.',
    text: 'Sem celular, tablet ou conta. O cartão é uma folha impressa.',
  },
  {
    lead: 'Os dados ficam no seu computador.',
    text: 'Turma, perguntas e histórico ficam no navegador, e o histórico sai em planilha CSV.',
  },
];

const practices: { id: ScriptId; title: string; text: string }[] = [
  {
    id: 'quick-question',
    title: 'Checagem rápida de compreensão',
    text: 'Pergunta rápida: em 5 a 10 minutos você vê o que cada aluno entendeu, para aquecer ou fechar a aula.',
  },
  {
    id: 'group-draw',
    title: 'Discussão em grupo em que todos precisam entender',
    text: 'Grupo com sorteio: o grupo discute e o sistema sorteia quem responde, então ninguém fica de fora.',
  },
  {
    id: 'peer-instruction',
    title: 'Votar, conversar em dupla e votar de novo',
    text: 'Instrução por pares: você compara os dois votos para ver se a conversa mudou a resposta. Em breve.',
  },
];

const needs = [
  { icon: Monitor, title: 'Datashow', text: 'Para projetar a pergunta e o resultado.' },
  { icon: Video, title: 'Uma câmera', text: 'Virada para a turma, com a sala iluminada.' },
  { icon: Printer, title: 'Cartões impressos', text: 'Um por aluno, em papel A4.' },
];

const MiniBook: React.FC<{ id: ScriptId }> = ({ id }) => {
  const binding = bindingFor(id);
  const soon = scripts.find((s) => s.id === id)?.status === 'soon';
  return (
    <span
      className={`cloth relative shrink-0 w-14 h-[4.75rem] rounded-r-md rounded-l-sm shadow-[0_10px_14px_-8px_rgb(16_24_32/0.5)] ${binding.cover} ${
        soon ? 'opacity-70' : ''
      }`}
      aria-hidden="true"
    >
      <span className="absolute left-0 inset-y-0 w-2 bg-black/20" />
    </span>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLibrary }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-20">
      {/* Abertura: a promessa e a cena da sala */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.02]">
              Aprendizagem ativa na sua sala, só com datashow, câmera e papel.
            </h1>
            <p className="text-lg leading-relaxed text-base-content/85">
              Você projeta a pergunta, a turma responde com cartões de papel e a câmera lê a sala
              toda. Os alunos não precisam de celular, de conta nem de instalar nada.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <button onClick={onOpenLibrary} className="btn btn-primary btn-lg">
                Abrir a biblioteca
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
              <a href="#aprendizagem-ativa" className="font-bold underline underline-offset-4 decoration-2">
                O que é aprendizagem ativa
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-[1.75rem] overflow-hidden border border-base-300">
            <ClassroomScene />
          </div>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {sceneSteps.map((s) => (
            <li key={s.n} className="flex items-start gap-3">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-content font-display font-bold flex items-center justify-center">
                {s.n}
              </span>
              <span className="text-lg leading-snug pt-0.5">{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* O que muda na aula */}
      <section aria-labelledby="o-que-muda" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <h2
          id="o-que-muda"
          className="lg:col-span-4 font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight"
        >
          O que muda na sua aula
        </h2>
        <dl className="lg:col-span-8 divide-y divide-base-300 border-y border-base-300">
          {changes.map((c) => (
            <div key={c.lead} className="py-5 grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-8 gap-y-1">
              <dt className="font-display text-xl font-extrabold leading-snug">{c.lead}</dt>
              <dd className="text-lg leading-snug text-base-content/85">{c.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Aprendizagem ativa */}
      <section
        id="aprendizagem-ativa"
        aria-labelledby="aprendizagem-ativa-titulo"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 scroll-mt-24"
      >
        <div className="lg:col-span-4 space-y-4">
          <h2
            id="aprendizagem-ativa-titulo"
            className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight"
          >
            Aprendizagem ativa, em poucas palavras
          </h2>
          <p className="text-lg leading-relaxed text-base-content/85">
            É quando o aluno faz algo com o que está aprendendo, como responder, discutir e explicar,
            em vez de só ouvir. O ClassPlay cuida da parte mecânica, que é ler as respostas e mostrar
            o resultado, para você conduzir a conversa.
          </p>
        </div>

        <ul className="lg:col-span-8 space-y-6">
          {practices.map((p) => (
            <li key={p.id} className="flex items-center gap-6">
              <MiniBook id={p.id} />
              <div className="space-y-1">
                <h3 className="font-display text-xl font-extrabold leading-snug">{p.title}</h3>
                <p className="text-lg leading-snug text-base-content/85">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* O que você precisa */}
      <section aria-labelledby="o-que-precisa" className="space-y-6">
        <h2
          id="o-que-precisa"
          className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight"
        >
          O que você precisa
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {needs.map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.title} className="flex items-start gap-4">
                <span className="shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-xl font-extrabold">{n.title}</span>
                  <span className="block text-lg leading-snug text-base-content/85">{n.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Fechamento */}
      <section className="bg-primary text-primary-content rounded-[1.75rem] px-8 sm:px-14 py-12 flex flex-wrap items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Pronto para a próxima aula?
          </h2>
          <p className="text-lg text-primary-content/90">
            Escolha um roteiro na biblioteca, imprima os cartões e ligue a câmera.
          </p>
        </div>
        <button onClick={onOpenLibrary} className="btn btn-secondary btn-lg">
          Abrir a biblioteca
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
};
