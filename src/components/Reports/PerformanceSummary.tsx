import React, { useState } from 'react';
import { Classroom, RoundSession, ScriptId } from '../../types';
import { getScript } from '../../data/scripts';
import { MasteryPanel } from './MasteryPanel';
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
  const [allRounds, setRounds] = useState<RoundSession[]>(() => loadRoundHistory());
  const [tab, setTab] = useState<'rounds' | 'mastery'>('rounds');
  const [scriptFilter, setScriptFilter] = useState<'all' | ScriptId>('all');
  // Registros antigos não têm roteiro: contam como pergunta rápida
  const scriptOf = (r: RoundSession): ScriptId => r.scriptId ?? 'quick-question';
  const rounds =
    scriptFilter === 'all' ? allRounds : allRounds.filter((r) => scriptOf(r) === scriptFilter);
  const [expandedRoundIds, setExpandedRoundIds] = useState<Set<string>>(
    new Set(allRounds.length > 0 ? [allRounds[0].id] : [])
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

    let csv = 'Rodada,Roteiro,Data,Pergunta,Resposta certa,Respostas,Acertos (%)\n';
    rounds.forEach((round, rIdx) => {
      const roundName = round.name || `Rodada ${rIdx + 1}`;
      const date = new Date(round.timestamp).toLocaleString('pt-BR');
      round.questions.forEach((q) => {
        const votes = Object.keys(q.responses).length;
        const correct = Object.values(q.responses).filter(
          (ans) => ans === q.correctOption
        ).length;
        const acc = votes > 0 ? Math.round((correct / votes) * 100) : 0;
        csv += `"${roundName}","${getScript(scriptOf(round)).name}","${date}","${q.questionPrompt.replace(/"/g, '""')}","${q.correctOption}",${votes},${acc}%\n`;
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Histórico das sessões de aula
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Acertos da turma em cada rodada de perguntas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={rounds.length === 0}
            className="btn btn-sm"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Exportar planilha CSV</span>
          </button>

          <button
            onClick={handleClear}
            disabled={rounds.length === 0}
            className="btn btn-sm btn-outline btn-error"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar histórico</span>
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Seção do desempenho" className="join">
        <button role="tab" aria-selected={tab === 'rounds'} onClick={() => setTab('rounds')} className={`btn btn-sm join-item ${tab === 'rounds' ? 'btn-neutral' : ''}`}>
          Rodadas
        </button>
        <button role="tab" aria-selected={tab === 'mastery'} onClick={() => setTab('mastery')} className={`btn btn-sm join-item ${tab === 'mastery' ? 'btn-neutral' : ''}`}>
          Domínio
        </button>
      </div>

      {tab === 'mastery' ? (
        <MasteryPanel classroom={classroom} rounds={allRounds} />
      ) : (
      <>
      {/* Cartões de indicadores gerais */}
      <div className="stats stats-vertical sm:stats-horizontal w-full bg-base-100 border border-base-300">
        <div className="stat">
          <div className="stat-figure text-amber-700">
            <Layers className="w-7 h-7" />
          </div>
          <div className="stat-title">Rodadas finalizadas</div>
          <div className="stat-value font-extrabold">{totalRounds}</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-amber-700">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="stat-title">Respostas recebidas</div>
          <div className="stat-value font-extrabold">{totalResponsesCollected}</div>
          <div className="stat-desc">Em {totalQuestionsApplied} perguntas</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-success">
            <Award className="w-7 h-7" />
          </div>
          <div className="stat-title">Taxa média de acerto</div>
          <div className="stat-value font-extrabold text-success">{overallAccuracy}%</div>
        </div>
      </div>

      {/* Histórico separado por roteiro */}
      <div role="tablist" aria-label="Filtrar por roteiro" className="flex flex-wrap gap-2">
        {([
          ['all', 'Todos'],
          ['quick-question', 'Pergunta rápida'],
          ['group-draw', 'Grupo com sorteio'],
        ] as [('all' | ScriptId), string][]).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={scriptFilter === id}
            onClick={() => setScriptFilter(id)}
            className={`btn btn-sm rounded-full ${scriptFilter === id ? 'btn-neutral' : 'btn-ghost'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Listagem agrupada por rodadas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-base-content">
            Rodadas registradas
          </h2>
          <span className="text-sm text-base-content/70">
            Clique em uma rodada para ver as perguntas e os alunos
          </span>
        </div>

        {rounds.length === 0 ? (
          <div className="bg-base-100 border border-base-300 rounded-box p-12 text-center space-y-3 shadow-sm">
            <FileSpreadsheet className="w-10 h-10 text-base-content/40 mx-auto" />
            <h3 className="text-base font-bold text-base-content">
              Nenhuma rodada foi concluída ainda
            </h3>
            <p className="text-sm text-base-content/70 max-w-sm mx-auto">
              Conduza um roteiro da Biblioteca e encerre a rodada. O resultado aparece aqui.
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
                  className="bg-base-100 border border-base-300 rounded-box shadow-sm overflow-hidden transition-all"
                >
                  {/* Cabeçalho da rodada */}
                  <div
                    onClick={() => toggleRound(round.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleRound(round.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    className="p-6 cursor-pointer hover:bg-base-200 transition-colors flex flex-wrap items-center justify-between gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm">
                        #{rounds.length - rIndex}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-base-content">
                            {round.name || `Rodada ${rounds.length - rIndex}`}
                          </h3>
                          <span className="text-sm text-base-content/70">
                            • {dateStr}
                          </span>
                        </div>
                        <span className="text-sm text-base-content/70">
                          {round.questions.length} {round.questions.length === 1 ? 'pergunta' : 'perguntas'} • {round.totalResponses} respostas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <span className="text-xs text-base-content/70 block font-medium">Acertos</span>
                        <span className="text-lg font-black text-success">
                          {round.overallAccuracy}%
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-base-200 text-base-content/70">
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
                    <div className="p-6 pt-0 border-t border-base-300/60 space-y-6">
                      {/* Questões da rodada */}
                      <div className="space-y-3 pt-4">
                        <h3 className="text-base font-bold text-base-content">
                          Perguntas desta rodada
                        </h3>

                        <ol className="divide-y divide-base-300/60">
                          {round.questions.map((q, qIdx) => {
                            const votes = Object.keys(q.responses).length;
                            const correct = Object.values(q.responses).filter(
                              (ans) => ans === q.correctOption
                            ).length;
                            const acc = votes > 0 ? Math.round((correct / votes) * 100) : 0;

                            return (
                              <li
                                key={q.id || qIdx}
                                className="py-3 flex flex-wrap items-center justify-between gap-3"
                              >
                                <div className="space-y-1 max-w-xl">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-base-content/70">
                                      {qIdx + 1}.
                                    </span>
                                    <span className="badge badge-success badge-sm font-semibold">
                                      Resposta certa: {q.correctOption}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-base-content">
                                    {q.questionPrompt}
                                  </p>
                                </div>

                                {votes > 0 ? (
                                  <div className="flex items-center gap-4 text-right">
                                    <div>
                                      <span className="text-xs text-base-content/70 block">Acertos</span>
                                      <span className="text-base font-bold text-success">{acc}%</span>
                                    </div>
                                    <div className="pl-3 border-l border-base-300">
                                      <span className="text-xs text-base-content/70 block">Respostas</span>
                                      <span className="text-base font-bold text-base-content">{votes}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="badge badge-ghost">Sem respostas</span>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      </div>

                      {/* Respostas individuais dos alunos nesta rodada */}
                      <div className="space-y-3">
                        <h3 className="text-base font-bold text-base-content">
                          Resultado por aluno
                        </h3>

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
                                    ? 'bg-base-200 border-base-300 text-base-content/60'
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
      </>
      )}
    </div>
  );
};
