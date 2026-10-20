import React, { useEffect } from 'react';
import { RoundSession, Student } from '../../types';
import { Award, BarChart2, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoundSummaryViewProps {
  round: RoundSession;
  students: Student[];
  onNewRound: () => void;
  onGoToReports: () => void;
}

export const RoundSummaryView: React.FC<RoundSummaryViewProps> = ({
  round,
  students,
  onNewRound,
  onGoToReports,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Topo de encerramento */}
      <div className="bg-base-100 border-2 border-amber-300 rounded-box p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-base-content flex items-center justify-center font-black shadow-sm">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Rodada concluída
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
              Resumo da turma nesta rodada
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
              Todas as perguntas selecionadas foram respondidas e registradas no histórico.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNewRound}
            className="btn btn-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Iniciar nova rodada</span>
          </button>

          <button
            onClick={onGoToReports}
            className="btn btn-sm btn-primary"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Ver histórico completo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Indicadores gerais da rodada */}
      <div className="stats stats-vertical sm:stats-horizontal w-full bg-base-100 border border-base-300">
        <div className="stat">
          <div className="stat-title">Perguntas aplicadas</div>
          <div className="stat-value font-extrabold">{round.questions.length}</div>
        </div>

        <div className="stat">
          <div className="stat-title">Votos computados</div>
          <div className="stat-value font-extrabold">{round.totalResponses}</div>
        </div>

        <div className="stat">
          <div className="stat-title">Taxa média de acerto</div>
          <div className="stat-value font-extrabold text-success">{round.overallAccuracy}%</div>
        </div>
      </div>

      {/* Lista das perguntas da rodada */}
      <div className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-base-content">
          Detalhamento por questão
        </h2>

        <div className="divide-y divide-base-300/60">
          {round.questions.map((q, idx) => {
            const votes = Object.keys(q.responses).length;
            const correctCount = Object.values(q.responses).filter(
              (r) => r === q.correctOption
            ).length;
            const acc = votes > 0 ? Math.round((correctCount / votes) * 100) : 0;

            return (
              <div
                key={q.id}
                className="py-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-ghost badge-sm w-5 h-5 p-0 font-bold">
                      {idx + 1}
                    </span>
                    <span className="badge badge-success badge-sm font-semibold">
                      Gabarito {q.correctOption}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-base-content">
                    {q.questionPrompt}
                  </p>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className="text-xs text-base-content/60 block">Acertos</span>
                    <span className="text-base font-bold text-success">
                      {acc}%
                    </span>
                  </div>

                  <div className="pl-3 border-l border-base-300">
                    <span className="text-xs text-base-content/60 block">Votos</span>
                    <span className="text-base font-bold text-base-content">
                      {votes} / {round.totalClassStudents}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aproveitamento dos alunos na rodada */}
      <div className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-base-content">
          Aproveitamento individual dos alunos nesta rodada
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {students.map((student) => {
            let total = 0;
            let correct = 0;

            round.questions.forEach((q) => {
              const ans = q.responses[student.id];
              if (ans) {
                total++;
                if (ans === q.correctOption) correct++;
              }
            });

            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

            return (
              <div
                key={student.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  total === 0
                    ? 'bg-base-200 border-base-300 text-base-content/60'
                    : pct >= 50
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <span className="truncate pr-1">
                  #{String(student.id).padStart(2, '0')} {student.name.split(' ')[0]}
                </span>

                <span className="font-bold text-xs">
                  {total > 0 ? `${pct}%` : 'Ausente'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
