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
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sala de aula interativa com inteligência artificial</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            Interação em sala com apenas datashow e uma câmera.
          </h1>

          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            Selecione uma modalidade para começar. Os alunos participam usando cartões físicos ou movimentação corporal, sem necessidade de celulares ou tablets individuais.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('questions')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium shadow-sm transition-all"
            >
              <span>Abrir modo perguntas</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => onNavigate('exercises')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold shadow-sm transition-all"
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
        <div className="bg-white border border-zinc-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                Estilo Plickers
              </span>
              <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
                Perguntas e cartões
              </h2>
            </div>

            <p className="text-zinc-600 text-sm leading-relaxed">
              Cada estudante ergue seu cartão fiducial com a alternativa desejada para cima. A câmera capta toda a turma e o datashow exibe quem respondeu sem revelar o gabarito.
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
              <span>{questionsCount} perguntas disponíveis</span>
              <span>•</span>
              <span>{studentsCount} alunos cadastrados</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate('cards')}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir cartões</span>
            </button>

            <button
              onClick={() => onNavigate('questions')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all"
            >
              <span>Configurar e iniciar</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Modo Exercícios */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Activity className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                Visão computacional
              </span>
              <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
                Exercícios corporais
              </h2>
            </div>

            <p className="text-zinc-600 text-sm leading-relaxed">
              Atividades físicas e dinâmicas avaliadas pela postura corporal em tempo real. A inteligência artificial detecta articulações e orienta a turma com retorno instantâneo.
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
              <span>{exercisesCount} posturas disponíveis</span>
              <span>•</span>
              <span>Detecção 100% no navegador</span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={() => onNavigate('exercises')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold transition-all shadow-sm"
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
          className="p-5 rounded-2xl bg-white border border-zinc-200 text-left hover:border-zinc-300 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Material de apoio
            </span>
            <h3 className="text-base font-bold text-zinc-950">
              Imprimir cartões
            </h3>
            <p className="text-xs text-zinc-500">
              Folhas A4 prontas com marcadores fiduciais.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-amber-100 flex items-center justify-center text-zinc-700 group-hover:text-amber-800 transition-colors">
            <Printer className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('classroom')}
          className="p-5 rounded-2xl bg-white border border-zinc-200 text-left hover:border-zinc-300 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Gestão da sala
            </span>
            <h3 className="text-base font-bold text-zinc-950">
              Turma e alunos
            </h3>
            <p className="text-xs text-zinc-500">
              {studentsCount} alunos vinculados a cartões.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-amber-100 flex items-center justify-center text-zinc-700 group-hover:text-amber-800 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-5 rounded-2xl bg-white border border-zinc-200 text-left hover:border-zinc-300 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Resultados
            </span>
            <h3 className="text-base font-bold text-zinc-950">
              Desempenho
            </h3>
            <p className="text-xs text-zinc-500">
              {completedSessionsCount} perguntas registradas no histórico.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-amber-100 flex items-center justify-center text-zinc-700 group-hover:text-amber-800 transition-colors">
            <BarChart2 className="w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  );
};
