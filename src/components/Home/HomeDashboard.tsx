import React from 'react';
import { ActiveTab } from '../Navbar';
import {
  HelpCircle,
  Activity,
  Printer,
  Users,
  BarChart2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  studentsCount: number;
  questionsCount: number;
  exercisesCount: number;
  completedSessionsCount: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  studentsCount,
  questionsCount,
  exercisesCount,
  completedSessionsCount,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner de boas-vindas com estética clean */}
      <div className="bg-base-100 border border-base-300 rounded-box p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="badge badge-secondary gap-2 py-3 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Sala de aula interativa com inteligência artificial
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight leading-tight">
            Aula interativa com um datashow e uma câmera.
          </h1>

          <p className="text-base-content/70 text-sm sm:text-base leading-relaxed">
            Escolha uma atividade para começar. Os alunos participam com cartões de papel ou com o próprio corpo, sem precisar de celular ou tablet.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('questions')}
              className="btn btn-neutral rounded-full"
            >
              <span>Abrir modo perguntas</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => onNavigate('exercises')}
              className="btn btn-primary rounded-full"
            >
              <span>Abrir modo exercícios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Círculo sutil de iluminação decorativa amarela */}
        <div className="absolute right-[-40px] top-[-40px] w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Cartões dos dois modos principais de aula */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modo Perguntas */}
        <div className="bg-base-100 border border-base-300 rounded-box p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                Estilo Plickers
              </span>
              <h2 className="text-2xl font-bold text-base-content tracking-tight">
                Perguntas e cartões
              </h2>
            </div>

            <p className="text-base-content/70 text-sm leading-relaxed">
              Cada aluno levanta o cartão com a letra escolhida virada para cima. A câmera lê a turma inteira e o datashow mostra quem já respondeu, sem revelar o gabarito.
            </p>

            <div className="flex items-center gap-4 text-xs text-base-content/60 pt-2 border-t border-base-300/60">
              <span>{questionsCount} perguntas disponíveis</span>
              <span>•</span>
              <span>{studentsCount} alunos cadastrados</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('cards')}
              className="btn btn-sm btn-ghost"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir cartões</span>
            </button>

            <button
              onClick={() => onNavigate('questions')}
              className="btn btn-sm btn-neutral"
            >
              <span>Configurar e iniciar</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Modo Exercícios */}
        <div className="bg-base-100 border border-base-300 rounded-box p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Activity className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                Visão computacional
              </span>
              <h2 className="text-2xl font-bold text-base-content tracking-tight">
                Exercícios corporais
              </h2>
            </div>

            <p className="text-base-content/70 text-sm leading-relaxed">
              A câmera acompanha a postura dos alunos em tempo real, encontra as articulações e mostra na hora se o movimento está certo.
            </p>

            <div className="flex items-center gap-4 text-xs text-base-content/60 pt-2 border-t border-base-300/60">
              <span>{exercisesCount} posturas disponíveis</span>
              <span>•</span>
              <span>Detecção 100% no navegador</span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={() => onNavigate('exercises')}
              className="btn btn-sm btn-primary"
            >
              <span>Escolher exercício</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Acesso rápido às áreas auxiliares */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('cards')}
          className="p-5 rounded-box bg-base-100 border border-base-300 text-left hover:border-base-content/25 transition-colors flex items-center justify-between gap-4 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
              Material de apoio
            </span>
            <h3 className="text-base font-bold text-base-content">
              Imprimir cartões
            </h3>
            <p className="text-xs text-base-content/60">
              Folhas A4 com os marcadores prontos para imprimir.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-base-200 group-hover:bg-amber-100 flex items-center justify-center text-base-content/80 group-hover:text-amber-800 transition-colors">
            <Printer className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('classroom')}
          className="p-5 rounded-box bg-base-100 border border-base-300 text-left hover:border-base-content/25 transition-colors flex items-center justify-between gap-4 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
              Gestão da sala
            </span>
            <h3 className="text-base font-bold text-base-content">
              Turma e alunos
            </h3>
            <p className="text-xs text-base-content/60">
              {studentsCount} alunos vinculados a cartões.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-base-200 group-hover:bg-amber-100 flex items-center justify-center text-base-content/80 group-hover:text-amber-800 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-5 rounded-box bg-base-100 border border-base-300 text-left hover:border-base-content/25 transition-colors flex items-center justify-between gap-4 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
              Resultados
            </span>
            <h3 className="text-base font-bold text-base-content">
              Desempenho
            </h3>
            <p className="text-xs text-base-content/60">
              {completedSessionsCount} perguntas registradas no histórico.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-base-200 group-hover:bg-amber-100 flex items-center justify-center text-base-content/80 group-hover:text-amber-800 transition-colors">
            <BarChart2 className="w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  );
};
