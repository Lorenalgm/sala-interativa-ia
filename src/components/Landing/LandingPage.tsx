import React, { useState } from 'react';
import { ChevronRight, Lock, Play } from 'lucide-react';
import { ScriptId } from '../../types';
import { getScript } from '../../data/scripts';
import { ClassroomScene } from './ClassroomScene';
import { LiveDemo } from './LiveDemo';
import { ScriptBook } from '../Library/LibraryPage';

interface LandingPageProps {
  onOpenLibrary: () => void;
  onOpenScript: (id: ScriptId) => void;
  onOpenQuestions: () => void;
  onOpenReports: () => void;
}

// Vídeo de demonstração: coloque o arquivo em public/video/. Enquanto ele não existir,
// a ilustração da sala aparece no mesmo lugar e a página continua inteira.
const DEMO_VIDEO = {
  src: '/video/classplay-demo.mp4',
  poster: undefined as string | undefined, // ex.: '/video/classplay-demo.jpg'
  caption: 'O ClassPlay em uma aula de verdade.',
};

// Os modelos que a página mostra, com o nome da metodologia que cada um apoia
const shelf: { script: ScriptId; method: string; text: string }[] = [
  {
    script: 'quick-question',
    method: 'Avaliação formativa',
    text: 'Veja o que a turma entendeu enquanto ainda dá tempo de mudar a aula.',
  },
  {
    script: 'group-draw',
    method: 'Aprendizagem em grupo',
    text: 'Como ninguém sabe quem vai ser sorteado para responder, o grupo inteiro precisa entender a resposta.',
  },
  {
    script: 'interactive-board',
    method: 'Lousa interativa',
    text: 'O grupo leva uma paleta de papel até a resposta projetada no quadro.',
  },
];

// Exemplo ilustrativo do painel de Desempenho, com turma fictícia de 14 alunos.
// As frases seguem as regras de services/insights.ts.
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

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary';

// Botão cheio em cápsula e link com chevron, como nas páginas de produto da Apple
const pillButton = `inline-flex items-center justify-center min-h-[3.25rem] px-7 rounded-full bg-primary text-primary-content text-lg font-semibold hover:bg-[#0036bd] active:bg-[#002c9c] motion-safe:transition-colors ${focusRing}`;
const chevronLink = `group inline-flex items-center gap-1 min-h-[2.75rem] text-lg font-semibold text-primary hover:underline underline-offset-4 rounded ${focusRing}`;

// Títulos de seção grandes e centralizados, legíveis do fundo da sala
const SectionTitle: React.FC<{ id: string; children: React.ReactNode; lead?: React.ReactNode }> = ({
  id,
  children,
  lead,
}) => (
  <div className="max-w-3xl mx-auto text-center space-y-4">
    <h2 id={id} className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
      {children}
    </h2>
    {lead && <p className="text-xl sm:text-2xl leading-snug text-base-content/75">{lead}</p>}
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLibrary,
  onOpenScript,
  onOpenQuestions,
  onOpenReports,
}) => {
  return (
    <div>
      {/* Abertura: nome, promessa e o vídeo grande logo embaixo */}
      <section aria-labelledby="abertura" className="bg-base-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="font-display text-xl sm:text-2xl font-bold text-base-content/70">ClassPlay</p>
            <h1
              id="abertura"
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]"
            >
              A turma inteira responde de uma vez.
            </h1>
            <p className="text-xl sm:text-2xl leading-snug text-base-content/75 max-w-3xl mx-auto">
              Cada aluno levanta um cartão de papel e a câmera do professor lê todos de uma vez, sem
              celular na mão de ninguém. No datashow aparece quem respondeu e quantos acertaram.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2">
              <button onClick={onOpenLibrary} className={pillButton}>
                Abrir a biblioteca
              </button>
              <a href="#video" className={chevronLink}>
                <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                Assistir ao vídeo
              </a>
            </div>
          </div>

          <DemoVideo />
        </div>
      </section>

      {/* Simulação: o visitante levanta um cartão */}
      <section id="experimente" aria-labelledby="experimente-titulo" className="bg-base-200 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-12">
          <SectionTitle
            id="experimente-titulo"
            lead="Clique numa letra como se fosse o seu cartão. Os outros sete alunos são de exemplo; na sala, quem lê os cartões é a câmera."
          >
            Teste com uma pergunta de exemplo.
          </SectionTitle>
          <LiveDemo />
        </div>
      </section>

      {/* Modelos lado a lado, cada um com a metodologia que apoia */}
      <section aria-labelledby="modelos-titulo" className="bg-base-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-14">
          <SectionTitle
            id="modelos-titulo"
            lead="Cada modelo tem as etapas prontas. Você cadastra as suas perguntas e conduz a aula."
          >
            Escolha o jeito de perguntar.
          </SectionTitle>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-14 justify-items-center">
            {shelf.map((item, i) => {
              const script = getScript(item.script);
              return (
                <li key={item.script} className="flex flex-col items-center gap-6 max-w-[17rem]">
                  <ScriptBook script={script} index={i} onOpen={() => onOpenScript(item.script)} />
                  <div className="text-center space-y-1.5">
                    <h3 className="font-display text-2xl font-bold tracking-tight">{item.method}</h3>
                    <p className="text-lg leading-snug text-base-content/75">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="text-center">
            <button onClick={onOpenLibrary} className={chevronLink}>
              Ver todos os modelos
              <ChevronRight className="w-5 h-5 motion-safe:transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Depois da rodada: domínio por habilidade */}
      <section aria-labelledby="depois-titulo" className="bg-base-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-12">
          <SectionTitle
            id="depois-titulo"
            lead="Com as respostas das rodadas, o ClassPlay estima o que cada aluno já domina e sugere o que retomar com a turma e como montar os grupos."
          >
            Depois da aula, você sabe quem precisa de ajuda.
          </SectionTitle>
          <MasteryExample />
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2">
            <button onClick={onOpenReports} className={chevronLink}>
              Ver o desempenho
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
            <button onClick={onOpenQuestions} className={chevronLink}>
              Abrir o banco de perguntas
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Fechamento: o que precisa, em uma frase, e a ação */}
      <section aria-labelledby="comecar-titulo" className="bg-base-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-8">
          <h2
            id="comecar-titulo"
            className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]"
          >
            Para começar, você precisa de um datashow, uma webcam virada para a turma e cartões
            impressos em A4.
          </h2>
          <p className="inline-flex items-start gap-2 text-lg text-base-content/75 max-w-2xl text-left sm:text-center">
            <Lock className="w-5 h-5 shrink-0 mt-1" aria-hidden="true" />
            A imagem da câmera não sai do seu computador. A turma e o histórico ficam salvos só nele.
          </p>
          <div>
            <button onClick={onOpenLibrary} className={pillButton}>
              Abrir a biblioteca
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Vídeo grande em 16:9. Sem reprodução automática: tem áudio e quem decide é o professor.
const DemoVideo: React.FC = () => {
  const [failed, setFailed] = useState(false);

  return (
    <figure id="video" className="mt-14 sm:mt-20 space-y-4 scroll-mt-20">
      <div className="relative aspect-video rounded-[1.25rem] overflow-hidden bg-black border border-base-300">
        {failed ? (
          <div className="absolute inset-0 bg-base-200 flex items-center justify-center">
            <div className="w-full">
              <ClassroomScene />
            </div>
          </div>
        ) : (
          <video
            className="absolute inset-0 w-full h-full object-contain"
            src={DEMO_VIDEO.src}
            poster={DEMO_VIDEO.poster}
            controls
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
          >
            Seu navegador não conseguiu abrir o vídeo.
          </video>
        )}
      </div>
      {!failed && (
        <figcaption className="text-center text-lg text-base-content/70">{DEMO_VIDEO.caption}</figcaption>
      )}
    </figure>
  );
};

// Painel de exemplo: cada habilidade é clicável e mostra a sugestão que o Desempenho daria
const MasteryExample: React.FC = () => {
  const [active, setActive] = useState(0);
  const current = exampleSkills[active];

  return (
    <div className="max-w-3xl mx-auto bg-base-100 border border-base-300 rounded-[1.25rem] p-6 sm:p-10 space-y-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl font-bold">Escolha uma habilidade</h3>
        <p className="text-base text-base-content/70">Turma fictícia de 14 alunos</p>
      </div>

      <ul className="space-y-2" role="group" aria-label="Habilidades do exemplo">
        {exampleSkills.map((r, i) => {
          const selected = i === active;
          return (
            <li key={r.skill}>
              <button
                onClick={() => setActive(i)}
                aria-pressed={selected}
                className={`w-full min-h-[3.25rem] grid grid-cols-[7.5rem_1fr] items-center gap-4 rounded-xl px-3 text-left motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  selected ? 'bg-base-200' : 'hover:bg-black/[0.04]'
                }`}
              >
                <span className="font-display text-xl font-bold">{r.skill}</span>
                <span
                  className="flex h-6 rounded-full overflow-hidden"
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
          <li key={l.key} className={`rounded-full px-3.5 py-1 text-base font-bold ${l.chip}`}>
            {l.label}
          </li>
        ))}
      </ul>

      <div className="border-t border-base-300 pt-6 space-y-1.5" aria-live="polite">
        <p className="font-display text-3xl font-bold tracking-tight">{current.advice}</p>
        <p className="text-lg text-base-content/75">{current.reason}</p>
      </div>
    </div>
  );
};
