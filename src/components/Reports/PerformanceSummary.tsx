import React, { useState } from 'react';
import { Classroom, RoundSession } from '../../types';
import {
  clearRoundHistory,
  loadRoundHistory,
} from '../../services/storageService';
import {
  Award,
  Download,
  Trash2,
  HelpCircle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

interface PerformanceSummaryProps {
  classroom: Classroom;
  history?: any[];
  onRefresh: () => void;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  classroom,
  onRefresh,
}) => {
  const [rounds, setRounds] = useState<RoundSession[]>(() => loadRoundHistory());
  const [expandedRoundIds, setExpandedRoundIds] = useState<Set<string>>(
    new Set(rounds.length > 0 ? [rounds[0].id] : [])
  );

  const toggleRound = (roundId: string) => {
    setExpandedRoundIds((prev) => {
      const next = new Set(prev);
      if (next.has(roundId)) {
        next.delete(roundId);
      } else {
        next.add(roundId);
      }
      return next;
    });
  };

  const handleClear = () => {
    if (confirm('Deseja realmente limpar todo o histórico de rodadas?')) {
      clearRoundHistory();
      setRounds([]);
      onRefresh();
    }
  };

  const handleExportCSV = () => {
    if (rounds.length === 0) {
      alert('Nenhuma rodada registrada para exportar.');
      return;
    }

    let csv = 'Rodada,Data,Questão,Gabarito,Total Votos,Taxa Acerto (%)\n';
    rounds.forEach((round, rIdx) => {
      const roundName = round.name || `Rodada ${rIdx + 1}`;
      const date = new Date(round.timestamp).toLocaleString('pt-BR');
      round.questions.forEach((q) => {
        const votes = Object.keys(q.responses).length;
        const correct = Object.values(q.responses).filter(
          (ans) => ans === q.correctOption
        ).length;
        const acc = votes > 0 ? Math.round((correct / votes) * 100) : 0;
        csv += `"${roundName}","${date}","${q.questionPrompt.replace(/"/g, '""')}","${q.correctOption}",${votes},${acc}%\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `desempenho-rodadas-classplay-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculos consolidados
  const totalRounds = rounds.length;
  const totalQuestionsApplied = rounds.reduce((sum, r) => sum + r.questions.length, 0);
  const totalResponsesCollected = rounds.reduce((sum, r) => sum + r.totalResponses, 0);

  const overallAccuracy =
    rounds.length > 0
      ? Math.round(
          rounds.reduce((sum, r) => sum + r.overallAccuracy, 0) / rounds.length
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Topo do relatório */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Desempenho por rodadas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Histórico das sessões de aula
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Aproveitamento consolidado e agrupado por cada rodada de perguntas aplicada à turma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={rounds.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 disabled:opacity-40 text-zinc-800 text-xs font-semibold shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Exportar planilha CSV</span>
          </button>

          <button
            onClick={handleClear}
            disabled={rounds.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-40 text-rose-700 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar histórico</span>
          </button>
        </div>
      </div>

      {/* Cartões de indicadores gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-medium block">
              Rodadas finalizadas
            </span>
            <span className="text-3xl font-extrabold text-zinc-950">
              {totalRounds}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-medium block">
              Total de respostas computadas
            </span>
            <span className="text-3xl font-extrabold text-zinc-950">
              {totalResponsesCollected}
            </span>
            <span className="text-xs text-zinc-400 block">
              Distribuídas em {totalQuestionsApplied} questões
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-medium block">
              Taxa média de acerto
            </span>
            <span className="text-3xl font-extrabold text-emerald-600">
              {overallAccuracy}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Listagem agrupada por rodadas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-950">
            Rodadas registradas
          </h2>
          <span className="text-xs text-zinc-400">
            Clique em uma rodada para expandir as questões e respostas individuais
          </span>
        </div>

        {rounds.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <FileSpreadsheet className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900">
              Nenhuma rodada foi concluída ainda
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Selecione as perguntas no modo perguntas e finalize a rodada para que o desempenho apareça agrupado aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round, rIndex) => {
              const isExpanded = expandedRoundIds.has(round.id);
              const dateStr = new Date(round.timestamp).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              });

              return (
                <div
                  key={round.id}
                  className="bg-white border border-zinc-200 rounded-3xl shadow-xs overflow-hidden transition-all"
                >
                  {/* Cabeçalho da rodada */}
                  <div
                    onClick={() => toggleRound(round.id)}
                    className="p-6 cursor-pointer hover:bg-stone-50/60 transition-colors flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm">
                        #{rounds.length - rIndex}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-zinc-950">
                            {round.name || `Rodada ${rounds.length - rIndex}`}
                          </h3>
                          <span className="text-xs text-zinc-400">
                            • {dateStr}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {round.questions.length} {round.questions.length === 1 ? 'pergunta' : 'perguntas'} • {round.totalResponses} votos computados
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <span className="text-xs text-zinc-400 block font-medium">Aproveitamento</span>
                        <span className="text-lg font-black text-emerald-600">
                          {round.overallAccuracy}%
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-100 text-zinc-600">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo expandido da rodada */}
                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-zinc-100 space-y-6">
                      {/* Questões da rodada */}
                      <div className="space-y-3 pt-4">
                        <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                          Perguntas desta rodada
                        </h4>

                        <div className="space-y-2">
                          {round.questions.map((q, qIdx) => {
                            const votes = Object.keys(q.responses).length;
                            const correct = Object.values(q.responses).filter(
                              (ans) => ans === q.correctOption
                            ).length;
                            const acc = votes > 0 ? Math.round((correct / votes) * 100) : 0;

                            return (
                              <div
                                key={q.id || qIdx}
                                className="p-3.5 rounded-2xl bg-stone-50 border border-zinc-200/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1 max-w-xl">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-zinc-700">
                                      Questão {qIdx + 1}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold text-xs">
                                      Gabarito {q.correctOption}
                                    </span>
                                  </div>
                                  <p className="font-medium text-zinc-900">
                                    {q.questionPrompt}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 text-right">
                                  <div>
                                    <span className="text-xs text-zinc-400 block">Acertos</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                      {acc}%
                                    </span>
                                  </div>
                                  <div className="pl-3 border-l border-zinc-200">
                                    <span className="text-xs text-zinc-400 block">Votos</span>
                                    <span className="text-sm font-bold text-zinc-900">
                                      {votes}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Respostas individuais dos alunos nesta rodada */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                          Aproveitamento dos alunos nesta rodada
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                          {classroom.students.map((student) => {
                            let studentTotal = 0;
                            let studentCorrect = 0;

                            round.questions.forEach((q) => {
                              const ans = q.responses[student.id];
                              if (ans) {
                                studentTotal++;
                                if (ans === q.correctOption) studentCorrect++;
                              }
                            });

                            const pct =
                              studentTotal > 0
                                ? Math.round((studentCorrect / studentTotal) * 100)
                                : 0;

                            return (
                              <div
                                key={student.id}
                                className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                                  studentTotal === 0
                                    ? 'bg-stone-50 border-zinc-200/60 text-zinc-400'
                                    : pct >= 50
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                    : 'bg-amber-50 border-amber-200 text-amber-950'
                                }`}
                              >
                                <span className="truncate pr-1">
                                  #{String(student.id).padStart(2, '0')} {student.name.split(' ')[0]}
                                </span>

                                <span className="font-bold text-xs">
                                  {studentTotal > 0 ? `${pct}%` : 'Ausente'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
