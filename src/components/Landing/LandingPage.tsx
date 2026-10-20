import React from 'react';
import { ArrowRight, Monitor, Printer, Video } from 'lucide-react';
import { ScriptId } from '../../types';
import { ClassroomScene } from './ClassroomScene';
import { LiveDemo } from './LiveDemo';
import { Reveal } from './Reveal';

interface LandingPageProps {
  onOpenLibrary: () => void;
  onOpenScript: (id: ScriptId) => void;
}

interface Idea {
  title: string;
  text: string;
  script?: { id: ScriptId; label: string };
}

// Metodologias pelo nome e o benefício de cada uma na aula, sem citar autores nem resultados
const ideas: Idea[] = [
  {
    title: 'Avaliação formativa',
    text: 'Descubra o que a turma entendeu enquanto ainda dá tempo de ajustar a aula. A Pergunta rápida mostra a resposta de cada aluno em poucos minutos.',
    script: { id: 'quick-question', label: 'Abrir Pergunta rápida' },
  },
  {
    title: 'Aprendizagem em grupo',
    text: 'O grupo discute a pergunta e o sistema sorteia quem responde. Como qualquer um pode ser sorteado, todos precisam entender.',
    script: { id: 'group-draw', label: 'Abrir Grupo com sorteio' },
  },
  {
    title: 'Instrução por pares',
    text: 'Os alunos votam, conversam em dupla e votam de novo. Depois de cada pergunta, o ClassPlay sugere o próximo passo pela porcentagem de acertos: retomar a explicação, abrir a discussão ou seguir em frente. Você decide. O roteiro completo chega em breve.',
  },
  {
    title: 'Informação na hora',
    text: 'Enquanto a aula acontece, você vê quem respondeu e quantos escolheram cada letra. Dá para decidir o que fazer em seguida com a turma ainda na sala.',
  },
];

const needs = [
  { icon: Monitor, title: 'Datashow', text: 'Para projetar a pergunta.' },
  { icon: Video, title: 'Uma câmera', text: 'Virada para a turma.' },
  { icon: Printer, title: 'Cartões impressos', text: 'Um por aluno, em A4.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLibrary, onOpenScript }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-24">
      {/* Abertura: a promessa e a cena da sala */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-[-0.015em] leading-[1.08] text-balance">
            A turma inteira responde. Você vê na hora.
          </h1>
          <p className="text-lg leading-relaxed text-base-content/85 text-pretty">
            Os alunos respondem com cartões de papel, a câmera lê todos de uma vez e a tela mostra o
            resultado. Ninguém precisa de celular nem de conta.
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

      {/* Base pedagógica */}
      <Reveal>
        <section
          id="base"
          aria-labelledby="base-titulo"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 scroll-mt-24"
        >
          <div className="lg:col-span-4 space-y-5">
            <h2
              id="base-titulo"
              className="font-editorial text-3xl lg:text-4xl font-bold tracking-[-0.015em] leading-[1.1] text-balance"
            >
              Metodologias ativas, prontas para a aula
            </h2>
            <p className="text-lg leading-relaxed text-base-content/85 text-pretty">
              Aprendizagem ativa é quando o aluno faz algo com o que está aprendendo: responde,
              discute, explica. O ClassPlay lê as respostas para você usar o tempo da aula na
              conversa.
            </p>
          </div>

          <ol className="lg:col-span-8 divide-y divide-base-300 border-y border-base-300">
            {ideas.map((idea) => (
              <li key={idea.title} className="py-8 space-y-2.5">
                <h3 className="font-editorial text-2xl font-bold tracking-[-0.01em] leading-snug">
                  {idea.title}
                </h3>
                <p className="text-lg leading-relaxed text-base-content/85 max-w-2xl text-pretty">
                  {idea.text}
                </p>
                {idea.script && (
                  <button
                    onClick={() => onOpenScript(idea.script!.id)}
                    className="group inline-flex items-center gap-1.5 font-bold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
                  >
                    {idea.script.label}
                    <ArrowRight
                      className="w-4 h-4 motion-safe:transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* Primeira aula */}
      <Reveal>
        <section
          aria-labelledby="primeira-aula"
          className="bg-primary text-primary-content rounded-[1.75rem] px-8 sm:px-14 py-14 space-y-10"
        >
          <h2
            id="primeira-aula"
            className="font-editorial text-3xl lg:text-4xl font-bold tracking-[-0.015em] max-w-xl text-balance"
          >
            O que você precisa para começar
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {needs.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.title} className="flex items-center gap-4">
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
          <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
            <p className="text-base text-primary-content/80 max-w-md">
              Turma e histórico ficam no navegador do seu computador, e o histórico sai em CSV.
            </p>
            <button onClick={onOpenLibrary} className="btn btn-secondary btn-lg">
              Abrir a biblioteca
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </section>
      </Reveal>
    </div>
  );
};
