import React, { useMemo, useState } from 'react';
import { Classroom, RoundSession, ScriptId } from '../../types';
import { getScript } from '../../data/scripts';
import { computeMastery } from '../../services/mastery';
import { MasteryPanel, exportMasteryCsv } from './MasteryPanel';
import {
  clearRoundHistory,
  loadRoundHistory,
} from '../../services/storageService';
import {
  Download,
  Trash2,
  FileSpreadsheet,
  ChevronDown,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

interface PerformanceSummaryProps {
  classroom: Classroom;
  history?: any[];
  onRefresh: () => void;
}

type Tab = 'class' | 'student' | 'rounds';

const TABS: [Tab, string][] = [
  ['class', 'Turma'],
  ['student', 'Alunos'],
  ['rounds', 'Rodadas'],
];

// Cor sempre acompanhada do número: faixas iguais às do domínio
const accuracyTone = (pct: number) =>
  pct >= 80
    ? { bar: 'bg-emerald-500', text: 'text-emerald-800' }
    : pct >= 50
    ? { bar: 'bg-amber-400', text: 'text-amber-900' }
    : { bar: 'bg-red-500', text: 'text-red-800' };

const AccuracyBar: React.FC<{ pct: number; className?: string }> = ({ pct, className = '' }) => (
  <div className={`h-3 rounded-full bg-base-200 overflow-hidden ${className}`} aria-hidden="true">
    <div className={`h-full rounded-full ${accuracyTone(pct).bar}`} style={{ width: `${pct}%` }} />
  </div>
);

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  classroom,
  onRefresh,
}) => {
  const [allRounds, setRounds] = useState<RoundSession[]>(() => loadRoundHistory());
  const [tab, setTab] = useState<Tab>('class');
  const [scriptFilter, setScriptFilter] = useState<'all' | ScriptId>('all');
  // Nomes escondidos por padrão: a tela pode estar projetada
  const [showNames, setShowNames] = useState(false);
  // Registros antigos não têm roteiro: contam como pergunta rápida
  const scriptOf = (r: RoundSession): ScriptId => r.scriptId ?? 'quick-question';
  const rounds =
    scriptFilter === 'all' ? allRounds : allRounds.filter((r) => scriptOf(r) === scriptFilter);
  const [expandedRoundIds, setExpandedRoundIds] = useState<Set<string>>(
    new Set(allRounds.length > 0 ? [allRounds[0].id] : [])
  );

  const mastery = useMemo(
    () => computeMastery(allRounds, classroom.students),
    [allRounds, classroom.students]
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

  const handleExportRoundsCSV = () => {
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

  // A planilha acompanha o que está na tela
  const exportLabel = 'Baixar planilha (CSV)';
  const handleExport = () =>
    tab === 'rounds' ? handleExportRoundsCSV() : exportMasteryCsv(mastery, classroom);
  const canExport = tab === 'rounds' ? rounds.length > 0 : mastery.skills.length > 0;

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Cabeçalho: título à esquerda, ações da tela à direita */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content">
            Desempenho
          </h1>
          <p className="text-base text-base-content/75 mt-1">
            {allRounds.length === 0
              ? 'Os resultados aparecem aqui depois da primeira rodada.'
              : `${allRounds.length} ${allRounds.length === 1 ? 'rodada registrada' : 'rodadas registradas'} · turma de ${classroom.students.length} alunos`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowNames((v) => !v)}
            className="btn btn-ghost"
          >
            {showNames ? (
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" aria-hidden="true" />
            )}
            {showNames ? 'Esconder nomes' : 'Mostrar nomes'}
          </button>
          <button onClick={handleExport} disabled={!canExport} className="btn btn-primary">
            <Download className="w-5 h-5" aria-hidden="true" />
            {exportLabel}
          </button>
        </div>
      </div>

      {/* Uma única navegação: o que a turma sabe, cada aluno, o que aconteceu */}
      <div role="tablist" aria-label="Seção do desempenho" className="flex gap-1 border-b border-base-300">
        {TABS.map(([id, text]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`px-5 py-3 -mb-px text-lg font-extrabold border-b-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/65 hover:text-base-content'
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {tab !== 'rounds' ? (
        <MasteryPanel
          classroom={classroom}
          result={mastery}
          view={tab}
          showNames={showNames}
          rounds={allRounds}
        />
      ) : (
        <div className="space-y-6">
          {/* Filtro por roteiro e totais, juntos */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="Filtrar por roteiro" className="flex flex-wrap gap-2">
              {([
                ['all', 'Todos'],
                ['quick-question', 'Pergunta rápida'],
                ['group-draw', 'Grupo com sorteio'],
              ] as [('all' | ScriptId), string][]).map(([id, text]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={scriptFilter === id}
                  onClick={() => setScriptFilter(id)}
                  className={`btn rounded-full ${scriptFilter === id ? 'btn-primary' : 'bg-base-100 border-base-300'}`}
                >
                  {text}
                </button>
              ))}
            </div>

            {totalRounds > 0 && (
              <p className="text-base text-base-content/80 tabular-nums">
                <strong className={`text-2xl font-extrabold ${accuracyTone(overallAccuracy).text}`}>{overallAccuracy}%</strong>{' '}
                de acerto médio · {totalResponsesCollected} respostas em {totalQuestionsApplied} perguntas
              </p>
            )}
          </div>

          {rounds.length === 0 ? (
            <div className="bg-base-100 border border-base-300 rounded-[20px] p-12 text-center space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-base-content/40 mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-extrabold text-base-content">
                Nenhuma rodada foi concluída ainda
              </h2>
              <p className="text-base text-base-content/75 max-w-sm mx-auto">
                Conduza um roteiro da Biblioteca e encerre a rodada. O resultado aparece aqui.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {rounds.map((round, rIndex) => {
                const isExpanded = expandedRoundIds.has(round.id);
                const dateStr = new Date(round.timestamp).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                });
                const name = round.name || `Rodada ${rounds.length - rIndex}`;

                return (
                  <li
                    key={round.id}
                    className="bg-base-100 border border-base-300 rounded-[20px] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleRound(round.id)}
                      aria-expanded={isExpanded}
                      className="w-full text-left px-6 py-5 hover:bg-base-200/60 transition-colors grid gap-x-6 gap-y-3 sm:grid-cols-[1fr_14rem_auto] items-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                    >
                      <span className="block min-w-0">
                        <span className="block text-xl font-extrabold leading-tight truncate">{name}</span>
                        <span className="block text-base text-base-content/75">
                          {getScript(scriptOf(round)).name} · {dateStr} · {round.questions.length}{' '}
                          {round.questions.length === 1 ? 'pergunta' : 'perguntas'} · {round.totalResponses} respostas
                        </span>
                      </span>

                      <span className="flex items-center gap-3">
                        <AccuracyBar pct={round.overallAccuracy} className="flex-1" />
                        <span className={`w-14 text-right text-2xl font-extrabold tabular-nums ${accuracyTone(round.overallAccuracy).text}`}>
                          {round.overallAccuracy}%
                        </span>
                      </span>

                      <ChevronDown
                        aria-hidden="true"
                        className={`hidden sm:block w-5 h-5 text-base-content/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-5 border-t border-base-300 space-y-7">
                        <section className="space-y-2">
                          <h3 className="text-lg font-extrabold">Perguntas da rodada</h3>
                          <ol className="divide-y divide-base-300">
                            {round.questions.map((q, qIdx) => {
                              const votes = Object.keys(q.responses).length;
                              const correct = Object.values(q.responses).filter(
                                (ans) => ans === q.correctOption
                              ).length;
                              const acc = votes > 0 ? Math.round((correct / votes) * 100) : 0;

                              return (
                                <li
                                  key={q.id || qIdx}
                                  className="py-3 grid gap-x-6 gap-y-2 sm:grid-cols-[1fr_14rem] items-center"
                                >
                                  <p className="text-base font-semibold text-base-content">
                                    <span className="text-base-content/65 tabular-nums">{qIdx + 1}. </span>
                                    {q.questionPrompt}
                                    <span className="ml-2 badge badge-success badge-outline font-semibold">
                                      Resposta: {q.correctOption}
                                    </span>
                                  </p>

                                  {votes > 0 ? (
                                    <span className="flex items-center gap-3">
                                      <AccuracyBar pct={acc} className="flex-1" />
                                      <span className="text-right tabular-nums">
                                        <span className={`block text-lg font-extrabold leading-none ${accuracyTone(acc).text}`}>{acc}%</span>
                                        <span className="block text-sm text-base-content/70">{votes} {votes === 1 ? 'resposta' : 'respostas'}</span>
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-base text-base-content/70">Ninguém respondeu</span>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        </section>

                        <section className="space-y-3">
                          <div>
                            <h3 className="text-lg font-extrabold">Acertos e erros de cada aluno</h3>
                            <p className="text-base text-base-content/75">
                              Cada coluna é uma pergunta. Nos erros, aparece a letra que o aluno marcou.
                            </p>
                          </div>
                          <div className="overflow-x-auto rounded-xl border border-base-300">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Aluno</th>
                                  {round.questions.map((q, qIdx) => (
                                    <th key={q.id || qIdx} title={q.questionPrompt} className="text-center whitespace-nowrap">
                                      Pergunta {qIdx + 1}
                                    </th>
                                  ))}
                                  <th className="text-right whitespace-nowrap">Acertos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {classroom.students.map((student) => {
                                  let answered = 0;
                                  let right = 0;
                                  const cells = round.questions.map((q, qIdx) => {
                                    const ans = q.responses[student.id];
                                    if (!ans) {
                                      return (
                                        <td key={q.id || qIdx} className="text-center text-base-content/60">
                                          <span aria-hidden="true">–</span>
                                          <span className="sr-only">Não respondeu</span>
                                        </td>
                                      );
                                    }
                                    answered++;
                                    const ok = ans === q.correctOption;
                                    if (ok) right++;
                                    return (
                                      <td key={q.id || qIdx} className="text-center">
                                        <span
                                          className={`inline-flex items-center gap-1 rounded-btn px-2 py-1 text-base font-bold ${
                                            ok ? 'bg-emerald-100 text-emerald-950' : 'bg-red-100 text-red-950'
                                          }`}
                                        >
                                          {ok ? (
                                            <Check className="w-4 h-4" aria-hidden="true" />
                                          ) : (
                                            <X className="w-4 h-4" aria-hidden="true" />
                                          )}
                                          {ok ? <span className="sr-only">Acertou</span> : <span><span className="sr-only">Errou, marcou </span>{ans}</span>}
                                        </span>
                                      </td>
                                    );
                                  });
                                  const who = showNames
                                    ? student.name
                                    : `Cartão ${String(student.id).padStart(2, '0')}`;
                                  return (
                                    <tr key={student.id}>
                                      <th className="font-semibold whitespace-nowrap">{who}</th>
                                      {cells}
                                      <td className="text-right font-extrabold tabular-nums whitespace-nowrap">
                                        {answered > 0 ? `${right} de ${answered}` : 'Não respondeu'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {allRounds.length > 0 && (
            <div className="pt-4 flex justify-end">
              <button onClick={handleClear} className="btn btn-ghost btn-sm text-error">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Limpar todo o histórico
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
