import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, BookOpen, ChevronDown, Download, HelpCircle, TrendingDown, TrendingUp, UserX, Users } from 'lucide-react';
import { Classroom, Question, RoundSession } from '../../types';
import { getScript } from '../../data/scripts';
import { LEVEL_LABEL, MasteryLevel, computeMastery } from '../../services/mastery';
import { InsightKind, answersCsv, nextClassInsights, questionStats, roundStats, studentStats, trendOf } from '../../services/insights';
import { mixedFormation } from '../../services/recommendations';
import { clearRoundHistory, loadClassroom, loadRoundHistory, saveFormation } from '../../services/storageService';

interface PerformanceSummaryProps {
  classroom: Classroom;
  questions: Question[];
  onRefresh: () => void;
}

const pad = (id: number) => String(id).padStart(2, '0');
const day = (ts: number) => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

const groupHeader = 'px-4 text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70';
const groupBox = 'bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden';
const pillSecondary =
  'inline-flex items-center gap-2 min-h-[2.75rem] px-5 rounded-full bg-[#e3e3e8] hover:bg-[#d8d8de] text-base font-semibold disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

// Ícone e cor de cada tipo de sugestão: a cor nunca vem sozinha, o título diz o que é
const KIND: Record<InsightKind, { icon: typeof Users; tile: string }> = {
  retake: { icon: BookOpen, tile: 'bg-[#d70015]' },
  reinforce: { icon: Users, tile: 'bg-[#c93400]' },
  misconception: { icon: HelpCircle, tile: 'bg-[#b25000]' },
  attendance: { icon: UserX, tile: 'bg-[#636366]' },
  advance: { icon: ArrowRight, tile: 'bg-[#248a3d]' },
};

const LEVEL_CHIP: Record<MasteryLevel, string> = {
  reinforce: 'bg-red-100 text-red-950',
  progress: 'bg-amber-100 text-amber-950',
  mastered: 'bg-[#e8f5ec] text-[#14532d]',
  nodata: 'bg-base-200 text-base-content/70',
};

// Linha que abre e fecha, como as listas do sistema
const Disclosure: React.FC<{
  open: boolean;
  onToggle: () => void;
  first: boolean;
  summary: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onToggle, first, summary, children }) => (
  <li className={first ? '' : 'border-t border-base-300'}>
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex-1 min-w-0">{summary}</div>
      <ChevronDown className={`w-5 h-5 shrink-0 text-base-content/50 motion-safe:transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
    {open && <div className="px-4 pb-4">{children}</div>}
  </li>
);

const Bar: React.FC<{ pct: number }> = ({ pct }) => (
  <span className="block h-2.5 rounded-full bg-[#e3e3e8] overflow-hidden" aria-hidden="true">
    <span className="block h-full rounded-full bg-[#3c3c43]" style={{ width: `${pct}%` }} />
  </span>
);

// Desempenho em uma página: o que fazer na próxima aula, depois habilidades, alunos e rodadas
export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ classroom, questions, onRefresh }) => {
  const [rounds, setRounds] = useState<RoundSession[]>(() => loadRoundHistory());
  // Nomes escondidos por padrão: a tela pode estar projetada
  const [showNames, setShowNames] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [savedGroups, setSavedGroups] = useState<number | null>(null);
  const [allStudents, setAllStudents] = useState(false);

  const students = classroom.students;
  const label = (id: number) => (showNames ? students.find((s) => s.id === id)?.name ?? `Cartão ${pad(id)}` : `Cartão ${pad(id)}`);
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const data = useMemo(() => {
    const known = new Set(students.map((s) => s.id));
    const mastery = computeMastery(rounds, students);
    const qStats = questionStats(rounds, questions, known);
    const sStats = studentStats(rounds, students, mastery);
    const rStats = roundStats(rounds);
    return {
      mastery,
      qStats,
      sStats,
      rStats,
      trend: trendOf(rStats),
      insights: nextClassInsights(mastery, qStats, sStats).slice(0, 4),
    };
  }, [rounds, students, questions]);

  const firstDay = rounds.length > 0 ? Math.min(...rounds.map((r) => r.timestamp)) : 0;
  const days = firstDay ? Math.max(1, Math.round((Date.now() - firstDay) / 86400000)) : 0;

  const download = () => {
    const csv = answersCsv(rounds, students, (r) => getScript(r.scriptId ?? 'quick-question').name);
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `classplay-respostas-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const makeGroups = (size: 3 | 4) => {
    const formation = mixedFormation(data.mastery, students, size, loadClassroom().id);
    saveFormation(formation);
    setSavedGroups(formation.groups.length);
  };

  const clearAll = () => {
    if (!confirm('Apagar todo o histórico de rodadas deste computador? Não dá para desfazer.')) return;
    clearRoundHistory();
    setRounds([]);
    onRefresh();
  };

  const StudentChips: React.FC<{ ids: number[] }> = ({ ids }) => (
    <ul className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <li key={id} className="inline-flex items-center min-h-[2rem] px-2.5 rounded-[0.5rem] border-2 border-black bg-white text-[0.9375rem] font-semibold">
          {label(id)}
        </li>
      ))}
    </ul>
  );

  const header = (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="space-y-2">
        <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Desempenho</h1>
        <p className="text-lg text-base-content/75">
          {rounds.length === 0
            ? 'Os resultados aparecem aqui depois da primeira rodada.'
            : `${rounds.length} ${rounds.length === 1 ? 'rodada' : 'rodadas'} ${days > 1 ? `nos últimos ${days} dias` : 'hoje'} · turma de ${students.length} alunos`}
        </p>
      </div>
      {rounds.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          {/* Interruptor no estilo do sistema */}
          <label className="inline-flex items-center gap-3 min-h-[2.75rem] cursor-pointer text-base font-medium">
            Mostrar nomes
            <button
              type="button"
              role="switch"
              aria-checked={showNames}
              onClick={() => setShowNames((v) => !v)}
              className={`relative w-[3.25rem] h-8 rounded-full motion-safe:transition-colors ${showNames ? 'bg-success' : 'bg-[#d1d1d6]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/0.25)] motion-safe:transition-transform ${showNames ? 'translate-x-5' : ''}`} />
            </button>
          </label>
          <button onClick={download} className={pillSecondary}>
            <Download className="w-4 h-4" aria-hidden="true" />
            Baixar planilha
          </button>
        </div>
      )}
    </header>
  );

  if (rounds.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
        {header}
        <p className="bg-base-100 border border-base-300 rounded-[0.875rem] p-6 text-lg text-base-content/75">
          Conduza uma rodada de qualquer modelo da Biblioteca. Depois de algumas respostas, esta página mostra o que retomar, quem precisa de ajuda e como a turma evolui.
        </p>
      </div>
    );
  }

  const lowParticipation = (s: { asked: number; answered: number }) => s.asked > 0 && s.answered / s.asked < 0.6;
  const sortedStudents = [...data.sStats].sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101));
  // Por padrão, só quem pede atenção: reforço em alguma habilidade, pouca participação ou acerto abaixo de 60%
  const needing = sortedStudents.filter(
    (s) => s.weakSkills.length > 0 || lowParticipation(s) || (s.accuracy !== null && s.accuracy < 60)
  );
  const studentsByNeed = allStudents ? sortedStudents : needing;
  const skillsByNeed = [...data.mastery.skills].sort(
    (a, b) => b.counts.reinforce / Math.max(1, b.studentsWithData) - a.counts.reinforce / Math.max(1, a.studentsWithData)
  );
  const lastRounds = [...data.rStats].reverse();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-10">
      {header}

      {/* 1. O que fazer na próxima aula */}
      <section aria-labelledby="proxima-aula" className="space-y-2">
        <h2 id="proxima-aula" className={groupHeader}>Para a próxima aula</h2>
        <ul className={groupBox}>
          {data.insights.length === 0 && (
            <li className="px-5 py-4 text-lg text-base-content/75">
              Ainda não há respostas suficientes para sugerir algo. Cada aluno precisa responder pelo menos 3 perguntas de uma habilidade.
            </li>
          )}
          {data.insights.map((ins, i) => {
            const { icon: Icon, tile } = KIND[ins.kind];
            return (
              <li key={ins.id} className="flex items-start gap-4 pl-4">
                <span className={`shrink-0 mt-4 w-9 h-9 rounded-[0.5rem] text-white flex items-center justify-center ${tile}`} aria-hidden="true">
                  <Icon className="w-5 h-5" />
                </span>
                <div className={`flex-1 min-w-0 py-4 pr-5 space-y-2.5 ${i > 0 ? 'border-t border-base-300' : ''}`}>
                  <p className="font-display text-xl font-bold tracking-tight leading-snug">{ins.title}</p>
                  <p className="text-[1.0625rem] leading-relaxed text-base-content/80 max-w-[65ch]">{ins.detail}</p>
                  {ins.studentIds && ins.studentIds.length > 0 && <StudentChips ids={ins.studentIds} />}
                  {ins.helperIds && ins.helperIds.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-base font-semibold text-[#14532d]">Quem domina e pode ajudar:</p>
                      <StudentChips ids={ins.helperIds} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {/* Ação ligada às sugestões: grupos que misturam níveis para o Grupo com sorteio */}
          <li className="border-t border-base-300 px-5 py-4 flex flex-wrap items-center justify-between gap-3 bg-base-200/60">
            <p className="text-base text-base-content/80 max-w-xl">
              {savedGroups
                ? `Formação com ${savedGroups} grupos salva. No Grupo com sorteio, use "Reaproveitar última formação".`
                : 'Monte grupos que misturam quem domina com quem precisa de ajuda, para usar no Grupo com sorteio.'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => makeGroups(3)} className={pillSecondary}>
                Grupos de 3
              </button>
              <button onClick={() => makeGroups(4)} className={pillSecondary}>
                Grupos de 4
              </button>
            </div>
          </li>
        </ul>
      </section>

      {/* 2. Habilidades: a que mais precisa vem primeiro */}
      <section aria-labelledby="habilidades" className="space-y-2">
        <h2 id="habilidades" className={groupHeader}>Habilidades</h2>
        <ul className={groupBox}>
          {skillsByNeed.map((s, i) => {
            const key = `skill:${s.skill}`;
            const withData = Math.max(1, s.studentsWithData);
            const qs = data.qStats.filter((q) => q.skill === s.skill).sort((a, b) => a.accuracy - b.accuracy);
            return (
              <Disclosure
                key={key}
                first={i === 0}
                open={open.has(key)}
                onToggle={() => toggle(key)}
                summary={
                  <div className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-x-6 gap-y-2 items-center">
                    <div>
                      <p className="font-display text-xl font-bold tracking-tight">{s.skill}</p>
                      <p className="text-base text-base-content/75">{s.accuracy}% de acerto</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="flex h-3 rounded-full overflow-hidden bg-[#e3e3e8]" aria-hidden="true">
                        <span className="bg-red-500" style={{ width: `${(s.counts.reinforce / withData) * 100}%` }} />
                        <span className="bg-amber-400" style={{ width: `${(s.counts.progress / withData) * 100}%` }} />
                        <span className="bg-[#248a3d]" style={{ width: `${(s.counts.mastered / withData) * 100}%` }} />
                      </span>
                      <p className="text-base text-base-content/80">
                        <strong className="font-semibold">{s.counts.reinforce}</strong> {s.counts.reinforce === 1 ? 'precisa' : 'precisam'} de reforço ·{' '}
                        <strong className="font-semibold">{s.counts.progress}</strong> em progresso ·{' '}
                        <strong className="font-semibold">{s.counts.mastered}</strong> {s.counts.mastered === 1 ? 'domina' : 'dominam'}
                      </p>
                    </div>
                  </div>
                }
              >
                <ul className="rounded-[0.625rem] bg-base-200 divide-y divide-base-300">
                  {qs.map((q) => (
                    <li key={q.key} className="px-4 py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="flex-1 min-w-[14rem] text-[1.0625rem] font-medium">{q.prompt}</span>
                      <span className="text-base text-base-content/80">
                        <strong className="font-semibold text-base-content">{q.accuracy}%</strong> de acerto em {q.answers} respostas
                        {q.commonWrong && (
                          <> · {q.commonWrong.share}% marcaram {q.commonWrong.option}</>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </Disclosure>
            );
          })}
        </ul>
        <p className="px-4 text-[0.9375rem] text-base-content/70">
          O domínio é estimado pela sequência de acertos e erros de cada aluno. Abaixo de 60%, reforço; acima de 80%, domina.
        </p>
      </section>

      {/* 3. Alunos: quem precisa de mais atenção primeiro */}
      <section aria-labelledby="alunos" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="alunos" className={groupHeader}>
            {allStudents ? `Todos os ${students.length} alunos · quem precisa de mais atenção primeiro` : `Alunos que pedem atenção · ${needing.length} de ${students.length}`}
          </h2>
          <button onClick={() => setAllStudents((v) => !v)} className="min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
            {allStudents ? 'Mostrar só quem pede atenção' : `Ver todos os ${students.length} alunos`}
          </button>
        </div>
        {studentsByNeed.length === 0 && (
          <p className={`${groupBox} px-5 py-4 text-lg text-base-content/75`}>Nenhum aluno pede atenção agora.</p>
        )}
        <ul className={studentsByNeed.length === 0 ? 'hidden' : groupBox}>
          {studentsByNeed.map((s, i) => {
            const key = `student:${s.studentId}`;
            const low = lowParticipation(s);
            return (
              <Disclosure
                key={key}
                first={i === 0}
                open={open.has(key)}
                onToggle={() => toggle(key)}
                summary={
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="shrink-0 w-11 h-11 rounded-[0.5rem] border-2 border-black bg-white font-display font-bold flex items-center justify-center" aria-hidden="true">
                      {pad(s.studentId)}
                    </span>
                    <span className="min-w-[8rem] text-lg font-semibold">{showNames ? label(s.studentId) : `Cartão ${pad(s.studentId)}`}</span>
                    <span className="w-20 font-display text-xl font-bold tabular-nums">{s.accuracy === null ? '–' : `${s.accuracy}%`}</span>
                    {low && (
                      <span className="text-base font-semibold text-[#b25000]">
                        <AlertTriangle className="inline w-4 h-4 mr-1 -mt-0.5" aria-hidden="true" />
                        respondeu só {s.answered} de {s.asked}
                      </span>
                    )}
                    {s.weakSkills.length > 0 && (
                      <span className="flex flex-wrap gap-1.5">
                        {s.weakSkills.map((sk) => (
                          <span key={sk} className={`inline-flex items-center min-h-[1.75rem] px-2.5 rounded-full text-[0.9375rem] font-semibold ${LEVEL_CHIP.reinforce}`}>
                            Reforço em {sk}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                }
              >
                <div className="space-y-4 rounded-[0.625rem] bg-base-200 p-4">
                  <p className="text-base text-base-content/80">Respondeu {s.answered} de {s.asked} perguntas e acertou {s.correct}.</p>
                  <ul className="flex flex-wrap gap-2">
                    {s.skills.map((m) => (
                      <li key={m.skill} className={`inline-flex items-center gap-1.5 min-h-[2rem] px-3 rounded-full text-[0.9375rem] font-semibold ${LEVEL_CHIP[m.level]}`}>
                        {m.skill}: {LEVEL_LABEL[m.level].toLowerCase()}
                        <span className="font-normal">({m.correct} de {m.answers})</span>
                      </li>
                    ))}
                  </ul>
                  {s.recentMisses.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-base font-semibold">Últimos erros</p>
                      <ul className="space-y-1">
                        {s.recentMisses.map((m, j) => (
                          <li key={j} className="text-[1.0625rem]">
                            {m.prompt} <span className="text-base-content/75">· marcou {m.chosen}, a certa era {m.correctOption} · {day(m.timestamp)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[1.0625rem] text-base-content/75">Nenhum erro registrado.</p>
                  )}
                </div>
              </Disclosure>
            );
          })}
        </ul>
      </section>

      {/* 4. Rodadas e a evolução da turma */}
      <section aria-labelledby="rodadas" className="space-y-2">
        <h2 id="rodadas" className={groupHeader}>Rodadas</h2>
        <ul className={groupBox}>
          {data.trend && (
            <li className="flex items-center gap-4 px-5 py-4 border-b border-base-300">
              <span
                className={`shrink-0 w-9 h-9 rounded-[0.5rem] text-white flex items-center justify-center ${
                  data.trend.direction === 'down' ? 'bg-[#d70015]' : data.trend.direction === 'up' ? 'bg-[#248a3d]' : 'bg-[#636366]'
                }`}
                aria-hidden="true"
              >
                {data.trend.direction === 'down' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              </span>
              <p className="text-lg">
                <strong className="font-semibold">
                  {data.trend.direction === 'up' ? 'A turma está acertando mais.' : data.trend.direction === 'down' ? 'A turma está acertando menos.' : 'O acerto da turma está estável.'}
                </strong>{' '}
                <span className="text-base-content/80">
                  Média de {data.trend.from}% nas rodadas anteriores e {data.trend.to}% nas mais recentes.
                </span>
              </p>
            </li>
          )}
          {lastRounds.map((r, i) => {
            const key = `round:${r.id}`;
            const round = rounds.find((x) => x.id === r.id)!;
            return (
              <Disclosure
                key={key}
                first={i === 0}
                open={open.has(key)}
                onToggle={() => toggle(key)}
                summary={
                  <div className="grid grid-cols-[4.5rem_1fr_minmax(6rem,12rem)_3.5rem] items-center gap-x-4">
                    <span className="font-display text-lg font-bold tabular-nums">{day(r.timestamp)}</span>
                    <span className="min-w-0">
                      <span className="block text-[1.0625rem] font-semibold truncate">{getScript(r.scriptId ?? 'quick-question').name}</span>
                      <span className="block text-[0.9375rem] text-base-content/70">
                        {r.questions} {r.questions === 1 ? 'pergunta' : 'perguntas'} · {r.responses} respostas
                      </span>
                    </span>
                    <Bar pct={r.accuracy} />
                    <span className="font-display text-xl font-bold text-right tabular-nums">{r.accuracy}%</span>
                  </div>
                }
              >
                <ul className="rounded-[0.625rem] bg-base-200 divide-y divide-base-300">
                  {round.questions.map((q) => {
                    const answers = Object.values(q.responses);
                    const right = answers.filter((a) => a === q.correctOption).length;
                    const pct = answers.length ? Math.round((right / answers.length) * 100) : 0;
                    return (
                      <li key={q.id} className="px-4 py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="flex-1 min-w-[14rem] text-[1.0625rem] font-medium">{q.questionPrompt}</span>
                        <span className="text-base text-base-content/80">
                          <strong className="font-semibold text-base-content">{pct}%</strong> de acerto · resposta {q.correctOption}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Disclosure>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-end">
        <button onClick={clearAll} className="min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-error hover:bg-black/5">
          Apagar o histórico
        </button>
      </div>
    </div>
  );
};
