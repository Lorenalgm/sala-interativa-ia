import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, BookOpen, Download, HelpCircle, Minus, TrendingDown, TrendingUp, UserX, Users } from 'lucide-react';
import { Alternative, Classroom, Question, RoundSession } from '../../types';
import { getScript } from '../../data/scripts';
import { LEVEL_LABEL, MasteryLevel, SkillSummary, computeMastery } from '../../services/mastery';
import { InsightKind, QuestionStat, answersCsv, nextClassInsights, questionStats, roundStats, studentStats, trendOf } from '../../services/insights';
import { mixedFormation } from '../../services/recommendations';
import { addDemoRounds, clearRoundHistory, loadClassroom, loadRoundHistory, removeDemoRounds, saveFormation } from '../../services/storageService';
import { buildDemoRounds } from '../../services/demoData';

interface PerformanceSummaryProps {
  classroom: Classroom;
  questions: Question[];
  onRefresh: () => void;
}

const LETTERS: Alternative[] = ['A', 'B', 'C', 'D'];
const pad = (id: number) => String(id).padStart(2, '0');
const day = (ts: number) => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const scriptName = (r: { scriptId?: RoundSession['scriptId'] }) => getScript(r.scriptId ?? 'quick-question').name;

// Níveis de domínio: paleta validada (faixa de luminosidade e daltonismo entre todos os pares).
// A cor nunca vem sozinha: sempre há legenda, número ou rótulo junto.
const LEVEL_COLOR: Record<MasteryLevel, string> = {
  reinforce: '#d70015',
  progress: '#d98200',
  mastered: '#1f7a3a',
  nodata: '#e3e3e8',
};
const LEVELS: ('reinforce' | 'progress' | 'mastered')[] = ['reinforce', 'progress', 'mastered'];
const CHART = '#5856d6'; // série única da evolução por rodada

const card = 'bg-base-100 border border-base-300 rounded-[1.25rem]';
const cardTitle = 'font-display text-2xl font-bold tracking-tight';
const pillSecondary =
  'inline-flex items-center gap-2 min-h-[2.75rem] px-5 rounded-full bg-[#e3e3e8] hover:bg-[#d8d8de] text-base font-semibold disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const KIND: Record<InsightKind, { icon: typeof Users; tile: string }> = {
  retake: { icon: BookOpen, tile: 'bg-[#d70015]' },
  reinforce: { icon: Users, tile: 'bg-[#c93400]' },
  misconception: { icon: HelpCircle, tile: 'bg-[#b25000]' },
  attendance: { icon: UserX, tile: 'bg-[#636366]' },
  advance: { icon: ArrowRight, tile: 'bg-[#1f7a3a]' },
};

// Legenda dos níveis, igual em todos os gráficos
const LevelLegend: React.FC = () => (
  <ul className="flex flex-wrap gap-x-5 gap-y-1.5" aria-label="Níveis de domínio">
    {LEVELS.map((l) => (
      <li key={l} className="inline-flex items-center gap-2 text-[0.9375rem] text-base-content/80">
        <span className="w-3 h-3 rounded-[3px]" style={{ background: LEVEL_COLOR[l] }} aria-hidden="true" />
        {LEVEL_LABEL[l]}
      </li>
    ))}
  </ul>
);

// Dica que aparece no hover e no foco da marca; o mesmo valor também está escrito na tela
const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    role="tooltip"
    className="pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus-visible:block whitespace-nowrap rounded-[0.625rem] bg-[#1c1c1e] text-white text-[0.9375rem] font-normal px-3 py-2 shadow-[0_8px_20px_-8px_rgb(0_0_0/0.5)]"
  >
    {children}
  </span>
);

// Barra empilhada: uma faixa por nível, separadas por 2px de fundo
const StackBar: React.FC<{ s: SkillSummary }> = ({ s }) => {
  const total = Math.max(1, s.counts.reinforce + s.counts.progress + s.counts.mastered);
  return (
    <span className="flex gap-[2px] h-5" aria-hidden="true">
      {LEVELS.filter((l) => s.counts[l] > 0).map((l) => (
        <span
          key={l}
          className="first:rounded-l-full last:rounded-r-full"
          style={{ flexGrow: s.counts[l] / total, background: LEVEL_COLOR[l] }}
        />
      ))}
    </span>
  );
};

// Distribuição das respostas A–D: a certa em verde, o engano comum em âmbar, as outras em cinza
const AnswerBars: React.FC<{ q: QuestionStat; questions: Question[] }> = ({ q, questions }) => {
  const source = questions.find((x) => x.id === q.questionId);
  const max = Math.max(...LETTERS.map((l) => q.counts[l]), 1);
  return (
    <ul className="space-y-2.5">
      {LETTERS.map((l) => {
        const right = l === q.correctOption;
        const share = Math.round((q.counts[l] / q.answers) * 100);
        const isTrap = q.commonWrong?.option === l;
        return (
          <li key={l} className="grid grid-cols-[2.25rem_1fr_4.5rem] items-center gap-3">
            <span
              className={`w-9 h-9 rounded-[0.5rem] font-display font-bold flex items-center justify-center ${
                right ? 'bg-[#1f7a3a] text-white' : 'border-2 border-black bg-white'
              }`}
              aria-hidden="true"
            >
              {l}
            </span>
            <span className="min-w-0 space-y-1">
              <span className="flex items-center gap-2 text-[0.9375rem] leading-tight">
                <span className="truncate">{source?.options[l] ?? `Alternativa ${l}`}</span>
                {right && <span className="shrink-0 font-semibold text-[#14532d]">certa</span>}
                {isTrap && <span className="shrink-0 font-semibold text-[#8a3b00]">engano comum</span>}
              </span>
              <span className="block h-3 rounded-r-[4px] bg-[#f2f2f7]">
                <span
                  className="block h-full rounded-r-[4px]"
                  style={{ width: `${(q.counts[l] / max) * 100}%`, background: right ? '#1f7a3a' : isTrap ? '#d98200' : '#8e8e93' }}
                />
              </span>
            </span>
            <span className="text-right">
              <span className="font-display text-lg font-bold">{share}%</span>
              <span className="block text-[0.8125rem] text-base-content/70">
                {q.counts[l]} {q.counts[l] === 1 ? 'aluno' : 'alunos'}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

// Desempenho: painel de leitura rápida para o professor, no notebook
export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ classroom, questions, onRefresh }) => {
  const [rounds, setRounds] = useState<RoundSession[]>(() => loadRoundHistory());
  // Nomes escondidos por padrão: a tela pode estar projetada
  const [showNames, setShowNames] = useState(false);
  const [savedGroups, setSavedGroups] = useState<number | null>(null);
  const [skillSel, setSkillSel] = useState<string | null>(null);
  const [roundSel, setRoundSel] = useState<string | null>(null);
  const [studentSel, setStudentSel] = useState<number | null>(null);
  const [allStudents, setAllStudents] = useState(false);

  const students = classroom.students;
  const nameOf = (id: number) => students.find((s) => s.id === id)?.name ?? `Cartão ${pad(id)}`;
  const label = (id: number) => (showNames ? nameOf(id) : `Cartão ${pad(id)}`);

  const data = useMemo(() => {
    const known = new Set(students.map((s) => s.id));
    const mastery = computeMastery(rounds, students);
    const qStats = questionStats(rounds, questions, known);
    const sStats = studentStats(rounds, students, mastery);
    const rStats = roundStats(rounds);
    const skills = [...mastery.skills].sort(
      (a, b) => b.counts.reinforce / Math.max(1, b.studentsWithData) - a.counts.reinforce / Math.max(1, a.studentsWithData)
    );
    const answered = sStats.reduce((a, s) => a + s.answered, 0);
    const asked = sStats.reduce((a, s) => a + s.asked, 0);
    const correct = sStats.reduce((a, s) => a + s.correct, 0);
    return {
      mastery,
      qStats,
      sStats,
      rStats,
      skills,
      trend: trendOf(rStats),
      insights: nextClassInsights(mastery, qStats, sStats).slice(0, 4),
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      participation: asked ? Math.round((answered / asked) * 100) : 0,
    };
  }, [rounds, students, questions]);

  const download = () => {
    const csv = answersCsv(rounds, students, scriptName);
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

  const loadDemo = () => {
    addDemoRounds(buildDemoRounds(questions, students));
    setRounds(loadRoundHistory());
  };
  const removeDemo = () => {
    removeDemoRounds();
    setRounds(loadRoundHistory());
  };
  const hasDemo = rounds.some((r) => r.demo);

  const clearAll = () => {
    if (!confirm('Apagar todo o histórico de rodadas deste computador? Não dá para desfazer.')) return;
    clearRoundHistory();
    setRounds([]);
    onRefresh();
  };

  const header = (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="space-y-2">
        <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Desempenho</h1>
        <p className="text-lg text-base-content/75">
          {rounds.length === 0
            ? 'Os resultados aparecem aqui depois da primeira rodada.'
            : `${rounds.length} ${rounds.length === 1 ? 'rodada' : 'rodadas'} desde ${day(Math.min(...rounds.map((r) => r.timestamp)))} · turma de ${students.length} alunos`}
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
              <span
                className={`absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/0.25)] motion-safe:transition-transform ${
                  showNames ? 'translate-x-5' : ''
                }`}
              />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
        {header}
        <div className={`${card} p-6 space-y-4`}>
          <p className="text-lg text-base-content/75 max-w-3xl">
            Conduza uma rodada de qualquer modelo da Biblioteca. Depois de algumas respostas, esta página mostra o que retomar,
            quem precisa de ajuda e como a turma evolui.
          </p>
          <button onClick={loadDemo} className={pillSecondary}>
            Ver com dados de exemplo
          </button>
        </div>
      </div>
    );
  }

  // Seleções com padrão útil: a habilidade que mais precisa, a última rodada, o aluno que mais precisa
  const skill = data.skills.find((s) => s.skill === skillSel) ?? data.skills[0];
  const hardest = skill
    ? data.qStats.filter((q) => q.skill === skill.skill).sort((a, b) => a.accuracy - b.accuracy)[0]
    : undefined;
  const idsAt = (level: MasteryLevel) =>
    skill ? data.mastery.students.filter((r) => r.skills[skill.skill]?.level === level).map((r) => r.studentId) : [];
  const reinforceIds = idsAt('reinforce');
  const helperIds = idsAt('mastered');

  const lowPart = (s: { asked: number; answered: number }) => s.asked > 0 && s.answered / s.asked < 0.6;
  const sorted = [...data.sStats].sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101));
  const needing = sorted.filter((s) => s.weakSkills.length > 0 || lowPart(s) || (s.accuracy !== null && s.accuracy < 60));
  const rows = allStudents ? sorted : needing;
  const student = data.sStats.find((s) => s.studentId === studentSel) ?? rows[0];

  const round = rounds.find((r) => r.id === roundSel) ?? rounds.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
  const trend = data.trend;
  const TrendIcon = trend?.direction === 'down' ? TrendingDown : trend?.direction === 'up' ? TrendingUp : Minus;
  const skillShare = skill ? skill.counts.reinforce / Math.max(1, skill.studentsWithData) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-6">
      {header}

      {/* Aviso enquanto houver rodadas de exemplo misturadas ao histórico */}
      {hasDemo && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-[0.875rem] bg-[#eef0ff] border border-[#c9cbf5] px-5 py-3">
          <p className="text-base">
            <strong className="font-semibold">Você está vendo dados de exemplo.</strong>{' '}
            <span className="text-base-content/80">São rodadas inventadas com as suas perguntas e os seus alunos, para conhecer a página.</span>
          </p>
          <button onClick={removeDemo} className="min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
            Remover o exemplo
          </button>
        </div>
      )}

      {/* Três números, cada um com o que ele quer dizer */}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${card} px-6 py-5`}>
          <dt className="text-base text-base-content/75">Acerto da turma</dt>
          <dd className="font-display text-5xl font-bold tracking-tight mt-1">{data.accuracy}%</dd>
          <dd className="text-[0.9375rem] text-base-content/70 mt-1">em todas as respostas</dd>
        </div>
        <div className={`${card} px-6 py-5`}>
          <dt className="text-base text-base-content/75">Tendência</dt>
          <dd className="flex items-center gap-2 font-display text-5xl font-bold tracking-tight mt-1">
            {!trend ? (
              '–'
            ) : trend.direction === 'flat' ? (
              <>
                <Minus className="w-9 h-9 text-base-content/60" aria-hidden="true" />
                Estável
              </>
            ) : (
              <>
                <TrendIcon className={`w-9 h-9 ${trend.direction === 'up' ? 'text-[#1f7a3a]' : 'text-[#d70015]'}`} aria-hidden="true" />
                {trend.to - trend.from > 0 ? '+' : ''}
                {trend.to - trend.from}
                <span className="text-2xl font-semibold text-base-content/70">pontos</span>
              </>
            )}
          </dd>
          <dd className="text-[0.9375rem] text-base-content/70 mt-1">
            {trend
              ? `${trend.from}% nas rodadas anteriores e ${trend.to}% nas mais recentes`
              : 'Aparece a partir de 4 rodadas'}
          </dd>
        </div>
        <div className={`${card} px-6 py-5`}>
          <dt className="text-base text-base-content/75">Participação</dt>
          <dd className="font-display text-5xl font-bold tracking-tight mt-1">{data.participation}%</dd>
          <dd className="text-[0.9375rem] text-base-content/70 mt-1">das respostas esperadas foram lidas pela câmera</dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Para a próxima aula */}
        <section aria-labelledby="proxima-aula" className={`${card} xl:col-span-5 overflow-hidden`}>
          <h2 id="proxima-aula" className={`${cardTitle} px-6 pt-6 pb-1`}>
            Para a próxima aula
          </h2>
          <ul>
            {data.insights.length === 0 && (
              <li className="px-6 py-4 text-lg text-base-content/75">
                Ainda faltam respostas para sugerir algo. Cada aluno precisa responder pelo menos 3 perguntas de uma habilidade.
              </li>
            )}
            {data.insights.map((ins, i) => {
              const { icon: Icon, tile } = KIND[ins.kind];
              return (
                <li key={ins.id} className="flex items-start gap-4 pl-6">
                  <span className={`shrink-0 mt-4 w-9 h-9 rounded-[0.5rem] text-white flex items-center justify-center ${tile}`} aria-hidden="true">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className={`flex-1 min-w-0 py-4 pr-6 space-y-2 ${i > 0 ? 'border-t border-base-300' : ''}`}>
                    <p className="text-lg font-semibold leading-snug">{ins.title}</p>
                    <p className="text-base leading-relaxed text-base-content/80">{ins.detail}</p>
                    {ins.studentIds && ins.studentIds.length > 0 && (
                      <p className="text-base">
                        <span className="text-base-content/70">Quem: </span>
                        <span className="font-semibold">{ins.studentIds.map(label).join(', ')}</span>
                      </p>
                    )}
                    {ins.helperIds && ins.helperIds.length > 0 && (
                      <p className="text-base">
                        <span className="text-[#14532d] font-semibold">Pode ajudar: </span>
                        <span className="font-semibold">{ins.helperIds.map(label).join(', ')}</span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-base-300 px-6 py-4 bg-[#f7f7f9] space-y-3">
            <p className="text-base text-base-content/80">
              {savedGroups
                ? `Formação com ${savedGroups} grupos salva. No Grupo com sorteio, toque em "Reaproveitar última formação".`
                : 'Grupos que misturam quem domina com quem precisa de ajuda, para usar no Grupo com sorteio:'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => makeGroups(3)} className={pillSecondary}>
                Grupos de 3
              </button>
              <button onClick={() => makeGroups(4)} className={pillSecondary}>
                Grupos de 4
              </button>
            </div>
          </div>
        </section>

        {/* Evolução: uma coluna por rodada; tocar abre as perguntas da rodada */}
        <section aria-labelledby="evolucao" className={`${card} xl:col-span-7 p-6 space-y-5`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="evolucao" className={cardTitle}>
              Acerto por rodada
            </h2>
            <p className="text-[0.9375rem] text-base-content/70">Toque numa coluna para ver as perguntas</p>
          </div>
          <div className="flex gap-2">
            {/* Eixo: 0, 50 e 100%, alinhado à área do gráfico (14rem = 100%) */}
            <div className="relative w-9 h-56 mt-7 shrink-0" aria-hidden="true">
              {[100, 50, 0].map((t) => (
                <span key={t} className="absolute right-0 -translate-y-1/2 text-[0.8125rem] text-base-content/60 tabular-nums" style={{ top: `${100 - t}%` }}>
                  {t}%
                </span>
              ))}
            </div>
            <ol className="relative flex-1 min-w-0 flex gap-1">
              {/* Grade recessiva atrás das colunas */}
              {[100, 50, 0].map((t) => (
                <span
                  key={t}
                  className={`absolute left-0 right-0 h-px ${t === 0 ? 'bg-[#c7c7cc]' : 'bg-[#ececf0]'}`}
                  style={{ top: `calc(1.75rem + 14rem * ${(100 - t) / 100})` }}
                  aria-hidden="true"
                />
              ))}
              {data.rStats.map((r) => {
                const sel = r.id === round.id;
                return (
                  <li key={r.id} className="flex-1 min-w-0">
                    <button
                      onClick={() => setRoundSel(r.id)}
                      aria-pressed={sel}
                      aria-label={`Rodada de ${day(r.timestamp)}, ${scriptName(r)}: ${r.accuracy}% de acerto`}
                      className="group relative w-full flex flex-col items-center rounded-[0.625rem] pb-1 hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <Tip>
                        <strong className="font-display">{r.accuracy}%</strong> · {scriptName(r)} · {r.questions} perguntas, {r.responses} respostas
                      </Tip>
                      <span className="relative w-full h-56 mt-7">
                        <span
                          className="absolute left-1/2 -translate-x-1/2 font-display text-base font-bold"
                          style={{ bottom: `calc(${r.accuracy}% + 0.25rem)` }}
                        >
                          {r.accuracy}%
                        </span>
                        <span
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 rounded-t-[4px] motion-safe:transition-opacity"
                          style={{ height: `${r.accuracy}%`, background: CHART, opacity: sel ? 1 : 0.45 }}
                        />
                      </span>
                      <span className={`mt-2 text-[0.875rem] tabular-nums ${sel ? 'font-bold' : 'font-semibold text-base-content/80'}`}>{day(r.timestamp)}</span>
                      <span className="w-full px-1 text-[0.75rem] text-base-content/70 truncate text-center">{scriptName(r)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="rounded-[0.875rem] bg-[#f7f7f9] p-4 space-y-2">
            <p className="text-base font-semibold">
              {day(round.timestamp)} · {scriptName(round)} · {round.overallAccuracy}% de acerto
            </p>
            <ul className="divide-y divide-base-300">
              {round.questions.map((q) => {
                const answers = Object.values(q.responses);
                const pct = answers.length ? Math.round((answers.filter((a) => a === q.correctOption).length / answers.length) * 100) : 0;
                return (
                  <li key={q.id} className="grid grid-cols-[1fr_7rem_3rem] items-center gap-3 py-2">
                    <span className="text-[0.9375rem] leading-snug">{q.questionPrompt}</span>
                    <span className="block h-2.5 rounded-r-[4px] bg-[#e5e5ea]" aria-hidden="true">
                      <span className="block h-full rounded-r-[4px]" style={{ width: `${pct}%`, background: CHART }} />
                    </span>
                    <span className="font-display font-bold text-right">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      {/* Habilidades: lista à esquerda, detalhe da escolhida à direita, como no exemplo da página inicial */}
      {skill && (
        <section aria-labelledby="habilidades" className={`${card} p-6 space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="habilidades" className={cardTitle}>
              Habilidades
            </h2>
            <LevelLegend />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-1.5">
              <ul className="space-y-1.5" role="group" aria-label="Escolha uma habilidade">
                {data.skills.map((s) => {
                  const sel = s.skill === skill.skill;
                  return (
                    <li key={s.skill}>
                      <button
                        onClick={() => setSkillSel(s.skill)}
                        aria-pressed={sel}
                        aria-label={`${s.skill}: ${s.counts.reinforce} em reforço, ${s.counts.progress} em progresso, ${s.counts.mastered} dominam, ${s.accuracy}% de acerto`}
                        className={`w-full grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-4 rounded-[0.875rem] px-3 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                          sel ? 'bg-[#f2f2f7]' : 'hover:bg-[#f7f7f9]'
                        }`}
                      >
                        <span className="font-display text-lg font-bold truncate">{s.skill}</span>
                        <StackBar s={s} />
                        <span className="font-display text-lg font-bold text-right">{s.accuracy}%</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="px-3 pt-1 text-[0.9375rem] text-base-content/70">
                A barra mostra quantos alunos estão em cada nível; o número é o acerto da turma.
              </p>
            </div>

            <div className="lg:col-span-7 rounded-[0.875rem] border border-base-300 p-5 space-y-5" aria-live="polite">
              <div className="space-y-1.5">
                <p className="font-display text-3xl font-bold tracking-tight">
                  {skill.counts.reinforce === 0
                    ? `${skill.skill}: a turma vai bem`
                    : skillShare >= 0.25
                      ? `Retome ${skill.skill} com a turma toda`
                      : `Reforce ${skill.skill} com ${skill.counts.reinforce} ${skill.counts.reinforce === 1 ? 'aluno' : 'alunos'}`}
                </p>
                <p className="text-lg text-base-content/80">
                  {skill.counts.reinforce} {skill.counts.reinforce === 1 ? 'precisa' : 'precisam'} de reforço, {skill.counts.progress} em progresso e{' '}
                  {skill.counts.mastered} {skill.counts.mastered === 1 ? 'domina' : 'dominam'}.
                </p>
              </div>
              {(reinforceIds.length > 0 || helperIds.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                  {reinforceIds.length > 0 && (
                    <p>
                      <span className="flex items-center gap-2 text-[0.9375rem] font-semibold">
                        <span className="w-3 h-3 rounded-[3px]" style={{ background: LEVEL_COLOR.reinforce }} aria-hidden="true" />
                        Precisam de reforço
                      </span>
                      {reinforceIds.map(label).join(', ')}
                    </p>
                  )}
                  {helperIds.length > 0 && (
                    <p>
                      <span className="flex items-center gap-2 text-[0.9375rem] font-semibold">
                        <span className="w-3 h-3 rounded-[3px]" style={{ background: LEVEL_COLOR.mastered }} aria-hidden="true" />
                        Dominam e podem ajudar
                      </span>
                      {helperIds.map(label).join(', ')}
                    </p>
                  )}
                </div>
              )}
              {hardest && (
                <div className="space-y-3 border-t border-base-300 pt-4">
                  <p className="text-base">
                    <span className="text-base-content/70">
                      Pergunta mais errada · {hardest.accuracy}% de acerto em {hardest.answers} respostas
                    </span>
                    <span className="block text-lg font-semibold leading-snug mt-0.5">{hardest.prompt}</span>
                  </p>
                  <AnswerBars q={hardest} questions={questions} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mapa da turma: alunos × habilidades, com o domínio escrito em cada célula */}
      <section aria-labelledby="mapa" className={`${card} p-6 space-y-5`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="mapa" className={cardTitle}>
              Mapa da turma
            </h2>
            <p className="text-base text-base-content/75 mt-1">
              Domínio estimado de cada aluno em cada habilidade. Toque num aluno para ver os detalhes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <LevelLegend />
            <div role="radiogroup" aria-label="Quais alunos" className="inline-flex rounded-[0.75rem] bg-[#e3e3e8] p-1 gap-1">
              {([
                [false, `Pedem atenção (${needing.length})`],
                [true, `Todos (${students.length})`],
              ] as const).map(([v, text]) => (
                <button
                  key={String(v)}
                  role="radio"
                  aria-checked={allStudents === v}
                  onClick={() => setAllStudents(v)}
                  className={`min-h-[2.75rem] rounded-[0.5625rem] px-4 text-base font-semibold ${
                    allStudents === v ? 'bg-primary text-primary-content shadow-[0_1px_3px_rgb(0_0_0/0.25)]' : 'hover:bg-black/5'
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 overflow-x-auto pt-10 -mt-10">
            {rows.length === 0 ? (
              <p className="text-lg text-base-content/75 py-4">Nenhum aluno pede atenção agora.</p>
            ) : (
              <table className="w-full border-separate" style={{ borderSpacing: '2px' }}>
                <thead>
                  <tr>
                    <th scope="col" className="text-left text-[0.9375rem] font-semibold text-base-content/70 pb-2 pr-3">
                      Aluno
                    </th>
                    {data.skills.map((s) => (
                      <th key={s.skill} scope="col" className="text-center text-[0.9375rem] font-semibold text-base-content/70 pb-2 px-1">
                        {s.skill}
                      </th>
                    ))}
                    <th scope="col" className="text-right text-[0.9375rem] font-semibold text-base-content/70 pb-2 pl-3">
                      Acerto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const sel = s.studentId === student?.studentId;
                    return (
                      <tr key={s.studentId}>
                        <th scope="row" className="text-left pr-3 font-normal">
                          <button
                            onClick={() => setStudentSel(s.studentId)}
                            aria-pressed={sel}
                            className={`w-full min-h-[2.75rem] flex items-center gap-2.5 rounded-[0.625rem] px-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                              sel ? 'bg-[#f2f2f7]' : 'hover:bg-[#f7f7f9]'
                            }`}
                          >
                            <span className="shrink-0 w-9 h-9 rounded-[0.5rem] border-2 border-black bg-white font-display font-bold text-[0.9375rem] flex items-center justify-center">
                              {pad(s.studentId)}
                            </span>
                            <span className="text-base font-semibold whitespace-nowrap">
                              {showNames ? nameOf(s.studentId) : `Cartão ${pad(s.studentId)}`}
                            </span>
                            {lowPart(s) && <AlertTriangle className="w-4 h-4 shrink-0 text-[#b25000]" aria-label="Respondeu pouco" />}
                          </button>
                        </th>
                        {data.skills.map((sk) => {
                          const m = s.skills.find((x) => x.skill === sk.skill);
                          const level: MasteryLevel = m?.level ?? 'nodata';
                          const pct = m ? Math.round(m.mastery * 100) : null;
                          return (
                            <td key={sk.skill} className="p-0">
                              <span
                                tabIndex={0}
                                className="group relative flex items-center justify-center h-11 min-w-[5.5rem] rounded-[4px] font-display text-base font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black"
                                style={{ background: LEVEL_COLOR[level], color: level === 'nodata' ? 'rgb(0 0 0 / 0.55)' : level === 'progress' ? '#1c1c1e' : '#ffffff' }}
                                aria-label={`${sk.skill}: ${level === 'nodata' ? 'poucas respostas' : `${LEVEL_LABEL[level].toLowerCase()}, ${pct}% de domínio`}`}
                              >
                                {level === 'nodata' ? '–' : `${pct}%`}
                                <Tip>
                                  {sk.skill}: {level === 'nodata' ? 'poucas respostas' : LEVEL_LABEL[level].toLowerCase()}
                                  {m ? ` · acertou ${m.correct} de ${m.answers}` : ''}
                                </Tip>
                              </span>
                            </td>
                          );
                        })}
                        <td className="pl-3 text-right font-display text-lg font-bold whitespace-nowrap">
                          {s.accuracy === null ? '–' : `${s.accuracy}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Detalhe do aluno escolhido */}
          {student && (
            <aside className="xl:col-span-4 rounded-[0.875rem] border border-base-300 p-5 space-y-4 xl:sticky xl:top-24" aria-live="polite">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-[0.5rem] border-2 border-black bg-white font-display font-bold text-lg flex items-center justify-center">
                  {pad(student.studentId)}
                </span>
                <div>
                  <p className="font-display text-2xl font-bold tracking-tight">{label(student.studentId)}</p>
                  <p className="text-base text-base-content/75">
                    {student.accuracy === null ? 'Sem respostas' : `${student.accuracy}% de acerto`} · respondeu {student.answered} de {student.asked}
                  </p>
                </div>
              </div>
              {lowPart(student) && (
                <p className="flex items-start gap-2 rounded-[0.625rem] bg-amber-100 text-amber-950 px-3 py-2 text-base">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  Respondeu menos de 60% das perguntas. Confira a presença ou se o cartão está sendo lido.
                </p>
              )}
              <ul className="space-y-3">
                {student.skills.map((m) => (
                  <li key={m.skill} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-base">
                      <span className="font-semibold">{m.skill}</span>
                      <span className="text-base-content/75">
                        {LEVEL_LABEL[m.level].toLowerCase()} · {m.correct} de {m.answers}
                      </span>
                    </div>
                    <span className="block h-2.5 rounded-r-[4px] bg-[#f2f2f7]" aria-hidden="true">
                      <span
                        className="block h-full rounded-r-[4px]"
                        style={{ width: `${Math.round(m.mastery * 100)}%`, background: LEVEL_COLOR[m.level] }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5 border-t border-base-300 pt-4">
                <p className="text-base font-semibold">Últimos erros</p>
                {student.recentMisses.length === 0 ? (
                  <p className="text-base text-base-content/75">Nenhum erro registrado.</p>
                ) : (
                  <ul className="space-y-2">
                    {student.recentMisses.map((m, j) => (
                      <li key={j} className="text-base leading-snug">
                        {m.prompt}
                        <span className="block text-[0.9375rem] text-base-content/70">
                          marcou {m.chosen}, a certa era {m.correctOption} · {day(m.timestamp)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          )}
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        {!hasDemo && (
          <button onClick={loadDemo} className="min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
            Adicionar rodadas de exemplo
          </button>
        )}
        <button onClick={clearAll} className="min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-error hover:bg-black/5">
          Apagar o histórico
        </button>
      </div>
    </div>
  );
};
