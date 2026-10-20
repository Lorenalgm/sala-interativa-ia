import React from 'react';
import { ActiveTab } from '../Navbar';
import { PoseFigure } from '../ExercisesMode/PoseFigure';
import { ArrowRight, BarChart2, Printer, Users } from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  studentsCount: number;
  questionsCount: number;
  exercisesCount: number;
  roundsCount: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  studentsCount,
  questionsCount,
  exercisesCount,
  roundsCount,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-base-content tracking-tight leading-tight">
          O que a turma vai fazer hoje?
        </h1>
        <p className="text-lg text-base-content/80 leading-relaxed">
          Os alunos participam com cartões de papel ou com o próprio corpo, sem precisar de
          celular ou tablet. Você só precisa do datashow e de uma câmera.
        </p>
      </div>

      {/* As duas atividades: a escolha principal da tela */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('questions')}
          className="group text-left bg-base-100 border border-base-300 rounded-box p-8 flex flex-col gap-6 transition-colors hover:border-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
        >
          {/* As quatro letras do cartão de resposta */}
          <div className="flex gap-2" aria-hidden="true">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <span
                key={letter}
                className="w-14 h-14 rounded-btn bg-primary text-primary-content flex items-center justify-center text-2xl font-extrabold"
              >
                {letter}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
              Perguntas com cartões
            </h2>
            <p className="text-lg text-base-content/80 leading-relaxed">
              Cada aluno levanta o cartão com a letra escolhida virada para cima. A câmera lê a
              turma inteira e o datashow mostra quem já respondeu, sem revelar a resposta certa.
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4">
            <span className="text-base text-base-content/70">
              {questionsCount} perguntas · {studentsCount} alunos
            </span>
            <span className="btn btn-primary pointer-events-none">
              Começar
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('exercises')}
          className="group text-left bg-base-100 border border-base-300 rounded-box p-8 flex flex-col gap-6 transition-colors hover:border-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
        >
          <div className="flex gap-1 text-amber-700" aria-hidden="true">
            <PoseFigure type="star_pose" className="h-14 w-auto" />
            <PoseFigure type="arms_raised" className="h-14 w-auto" />
            <PoseFigure type="t_pose" className="h-14 w-auto" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
              Exercícios com o corpo
            </h2>
            <p className="text-lg text-base-content/80 leading-relaxed">
              Projete uma postura e peça para a turma imitar. A câmera acompanha os movimentos
              e mostra na hora se a postura está certa.
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4">
            <span className="text-base text-base-content/70">{exercisesCount} posturas</span>
            <span className="btn btn-primary pointer-events-none">
              Começar
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </button>
      </div>

      {/* Preparação: a ordem que evita surpresas na hora da aula */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-base-content">Antes da aula</h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="w-9 h-9 rounded-full bg-base-200 text-base-content flex items-center justify-center font-extrabold flex-shrink-0">
                1
              </span>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-3">
                <p className="text-base text-base-content">
                  <strong className="font-bold">Confira a turma.</strong> Cada aluno precisa ter
                  um número de cartão.
                </p>
                <button onClick={() => onNavigate('classroom')} className="btn btn-sm">
                  <Users className="w-4 h-4" />
                  Turma ({studentsCount})
                </button>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-9 h-9 rounded-full bg-base-200 text-base-content flex items-center justify-center font-extrabold flex-shrink-0">
                2
              </span>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-3">
                <p className="text-base text-base-content">
                  <strong className="font-bold">Imprima os cartões.</strong> Um por aluno, em
                  papel A4.
                </p>
                <button onClick={() => onNavigate('cards')} className="btn btn-sm">
                  <Printer className="w-4 h-4" />
                  Cartões
                </button>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-9 h-9 rounded-full bg-base-200 text-base-content flex items-center justify-center font-extrabold flex-shrink-0">
                3
              </span>
              <p className="flex-1 text-base text-base-content">
                <strong className="font-bold">Posicione a câmera.</strong> Ela precisa enxergar a
                turma toda, de frente e com a sala iluminada.
              </p>
            </li>
          </ol>
        </section>

        <button
          onClick={() => onNavigate('reports')}
          className="group text-left bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 flex flex-col gap-3 transition-colors hover:border-base-content/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
        >
          <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-700" />
            Desempenho
          </h2>
          <p className="text-base text-base-content/80">
            {roundsCount === 0
              ? 'Nenhuma rodada ainda. Os resultados aparecem aqui depois da primeira.'
              : `${roundsCount} ${roundsCount === 1 ? 'rodada registrada' : 'rodadas registradas'}.`}
          </p>
          <span className="text-base font-semibold text-amber-800 flex items-center gap-1">
            Ver resultados
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>
    </div>
  );
};
