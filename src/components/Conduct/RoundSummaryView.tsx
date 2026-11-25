import React, { useEffect, useMemo, useState } from 'react';
import { RoundSession, Student } from '../../types';
import { BarChart2, RotateCcw, ArrowRight, ChevronDown, Lightbulb, TrendingUp, Star, CameraOff } from 'lucide-react';
import { suggestForQuestion } from '../../services/suggestions';
import { loadRoundHistory } from '../../services/storageService';

interface RoundSummaryViewProps {
  round: RoundSession;
  students: Student[];
  onNewRound: () => void;
  onGoToReports: () => void;
}

// Acerto de uma pergunta, ou null quando ninguém respondeu
const accuracyOf = (q: RoundSession['questions'][number]): number | null => {
  const answers = Object.values(q.responses);
  if (answers.length === 0) return null;
  return Math.round((answers.filter((a) => a === q.correctOption).length / answers.length) * 100);
};

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

// Fim da rodada: feito para a turma ver no datashow. Só números da turma, nunca de um aluno.
// O que é do professor (o que retomar) fica recolhido; o resultado por aluno está em Desempenho.
export const RoundSummaryView: React.FC<RoundSummaryViewProps> = ({ round, onNewRound, onGoToReports }) => {
  const [showRetake, setShowRetake] = useState(false);

  const perQuestion = round.questions.map((q, idx) => ({ q, idx, acc: accuracyOf(q), votes: Object.keys(q.responses).length }));
  const answered = perQuestion.filter((p) => p.acc !== null);
  const unanswered = perQuestion.length - answered.length;
  const hasResults = round.totalResponses > 0;

  // Rodada anterior da mesma turma, para a turma ver se melhorou
  const previous = useMemo(() => {
    const before = loadRoundHistory()
      .filter((r) => r.id !== round.id && !r.demo && r.timestamp < round.timestamp && r.totalResponses > 0)
      .sort((a, b) => b.timestamp - a.timestamp);
    return before[0] ?? null;
  }, [round.id, round.timestamp]);
  const delta = previous && hasResults ? round.overallAccuracy - previous.overallAccuracy : null;

  // Como os acertos andaram ao longo da rodada: primeira metade contra a segunda
  const trendLine = (() => {
    if (answered.length < 3) return null;
    const half = Math.floor(answered.length / 2);
    const first = avg(answered.slice(0, half).map((p) => p.acc as number))!;
    const last = avg(answered.slice(answered.length - half).map((p) => p.acc as number))!;
    if (last - first >= 10) return 'Os acertos foram subindo ao longo da rodada.';
    if (first - last >= 10) return 'As últimas perguntas foram as mais difíceis.';
    return 'A turma manteve o ritmo do começo ao fim.';
  })();

  // Com muitas perguntas as colunas ficam finas: o rótulo diminui e, acima de 12, o percentual sai de cima da coluna
  const n = perQuestion.length;
  const pctLabel = n <= 8 ? 'text-[clamp(1.25rem,min(2.2vw,4vh),2.25rem)]' : n <= 12 ? 'text-lg lg:text-xl' : null;
  const numLabel = n <= 12 ? 'text-xl lg:text-2xl' : 'text-[0.9375rem]';

  const best = answered.length > 1 ? answered.reduce((a, b) => ((b.acc as number) > (a.acc as number) ? b : a)) : null;

  // Comemora só quando todas as perguntas tiveram respostas e a turma acertou a maioria
  useEffect(() => {
    if (unanswered === 0 && hasResults && round.overallAccuracy >= 50) {
      import('canvas-confetti').then(({ default: confetti }) =>
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } })
      );
    }
  }, [unanswered, hasResults, round.overallAccuracy]);

  // Para o professor: o que retomar, recolhido por padrão
  const retake = round.questions.flatMap((q, idx) =>
    suggestForQuestion(q.correctOption, q.responses)
      .filter((sg) => sg.id === 'reexplain' || sg.id.startsWith('confusion'))
      .map((sg) => ({ ...sg, key: `${q.id}-${sg.id}`, label: `Pergunta ${idx + 1}` }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      {/* Topo: título para a turma e as ações do professor */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(2.25rem,min(4vw,7vh),4rem)] font-bold tracking-tight leading-[1.05]">
          Fim da rodada
        </h1>
        <div className="no-print flex flex-wrap items-center gap-3">
          <button
            onClick={onNewRound}
            className="inline-flex items-center gap-2 min-h-[2.75rem] px-5 rounded-full bg-[#e3e3e8] hover:bg-[#d8d8de] text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Nova rodada
          </button>
          <button
            onClick={onGoToReports}
            className="inline-flex items-center gap-2 min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content hover:bg-[#0036bd] text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <BarChart2 className="w-4 h-4" aria-hidden="true" />
            Ver desempenho
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {!hasResults ? (
        // Nenhum cartão lido: sem número, sem gráfico vazio. Diz o que aconteceu e o que conferir.
        <section className="bg-base-100 border border-base-300 rounded-[1.25rem] px-6 py-12 lg:px-12 lg:py-16 flex flex-col items-center text-center gap-5">
          <span className="w-16 h-16 rounded-full bg-[#f2f2f7] flex items-center justify-center" aria-hidden="true">
            <CameraOff className="w-8 h-8 text-base-content/70" />
          </span>
          <h2 className="font-display text-[clamp(1.75rem,min(3vw,5vh),2.75rem)] font-bold tracking-tight leading-tight max-w-[24ch] [text-wrap:balance]">
            Nenhum cartão foi lido nesta rodada
          </h2>
          <p className="text-lg lg:text-xl text-base-content/75 max-w-[44ch] [text-wrap:pretty]">
            A câmera não registrou respostas em {n === 1 ? 'nenhuma pergunta' : `nenhuma das ${n} perguntas`}.
            Antes da próxima rodada, use <strong className="font-semibold text-base-content">Testar câmera</strong>, no
            alto da tela, para conferir o enquadramento e a luz.
          </p>
        </section>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Número da turma, grande, e a comparação com a rodada anterior */}
        <section className="lg:col-span-4 bg-base-100 border border-base-300 rounded-[1.25rem] p-6 lg:p-8 flex flex-col justify-center gap-5">
          <div>
            <p className="text-xl lg:text-2xl font-semibold text-base-content/75">A turma acertou</p>
            <p className="font-display text-[clamp(4.5rem,min(10vw,18vh),9rem)] font-bold tracking-tight leading-none text-success tabular-nums mt-2">
              {round.overallAccuracy}%
            </p>
            <p className="text-lg lg:text-xl text-base-content/75 mt-3">
              {round.totalResponses} {round.totalResponses === 1 ? 'resposta' : 'respostas'} em {answered.length}{' '}
              {answered.length === 1 ? 'pergunta' : 'perguntas'}
              {unanswered > 0 && <> · {unanswered} sem respostas</>}
            </p>
          </div>

          {previous && delta !== null && (
            <div
              className={`rounded-[0.875rem] px-4 py-3.5 flex items-center gap-3 ${
                delta > 0 ? 'bg-[#e8f5ec] text-[#14532d]' : 'bg-[#f2f2f7] text-base-content'
              }`}
            >
              {delta > 0 && <TrendingUp className="w-7 h-7 flex-shrink-0" aria-hidden="true" />}
              <p className="text-lg lg:text-xl leading-snug">
                {delta > 0 ? (
                  <>
                    <strong className="font-display font-bold">+{delta} pontos</strong> em relação à rodada anterior ({previous.overallAccuracy}%)
                  </>
                ) : delta === 0 ? (
                  <>Igual à rodada anterior ({previous.overallAccuracy}%)</>
                ) : (
                  <>Na rodada anterior: {previous.overallAccuracy}%</>
                )}
              </p>
            </div>
          )}

          {best && (
            <p className="flex items-start gap-2.5 text-lg lg:text-xl leading-snug">
              <Star className="w-6 h-6 text-[#d98200] fill-current flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Mais acertada: <strong className="font-semibold">pergunta {best.idx + 1}</strong>, com {best.acc}%
              </span>
            </p>
          )}
        </section>

        {/* Acertos de cada pergunta, na ordem em que foram feitas */}
        <section
          aria-labelledby="acertos-perguntas"
          className="lg:col-span-8 bg-base-100 border border-base-300 rounded-[1.25rem] p-6 lg:p-8 flex flex-col gap-5"
        >
          <div className="space-y-1">
            <h2 id="acertos-perguntas" className="font-display text-2xl lg:text-3xl font-bold tracking-tight">
              Acertos em cada pergunta
            </h2>
            {trendLine && <p className="text-lg lg:text-xl text-base-content/75">{trendLine}</p>}
          </div>

          <div className="flex gap-3 flex-1 min-h-0">
            {/* Eixo com 0, 50 e 100% */}
            <div className="relative w-12 shrink-0 h-[clamp(12rem,40vh,24rem)] mt-9" aria-hidden="true">
              {[100, 50, 0].map((t) => (
                <span
                  key={t}
                  className="absolute right-0 -translate-y-1/2 text-base text-base-content/60 tabular-nums"
                  style={{ top: `${100 - t}%` }}
                >
                  {t}%
                </span>
              ))}
            </div>

            <ol className={`relative flex-1 min-w-0 flex ${n > 12 ? 'gap-1' : 'gap-2 lg:gap-3'}`}>
              {[100, 50, 0].map((t) => (
                <span
                  key={t}
                  aria-hidden="true"
                  className={`absolute left-0 right-0 h-px ${t === 0 ? 'bg-[#c7c7cc]' : 'bg-[#ececf0]'}`}
                  style={{ top: `calc(2.25rem + clamp(12rem,40vh,24rem) * ${(100 - t) / 100})` }}
                />
              ))}
              {perQuestion.map(({ q, idx, acc }) => (
                <li key={q.id} className="flex-1 min-w-0 flex flex-col items-center">
                  <span className="relative w-full h-[clamp(12rem,40vh,24rem)] mt-9">
                    {acc === null ? (
                      // Sem respostas: um traço tracejado na base, explicado na legenda abaixo do gráfico
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(70%,5rem)] h-3 rounded-t-[0.375rem] border-2 border-b-0 border-dashed border-[#aeaeb2]"
                      />
                    ) : (
                      <>
                        {pctLabel && (
                          <span
                            className={`absolute left-1/2 -translate-x-1/2 font-display font-bold tabular-nums ${pctLabel}`}
                            style={{ bottom: `calc(${acc}% + 0.375rem)` }}
                          >
                            {acc}%
                          </span>
                        )}
                        <span
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(70%,5rem)] rounded-t-[0.5rem] bg-success motion-safe:transition-[height] motion-safe:duration-700"
                          style={{ height: `${Math.max(acc, 1.5)}%` }}
                        />
                      </>
                    )}
                  </span>
                  <span
                    className={`mt-3 font-display font-bold tabular-nums ${numLabel} ${acc === null ? 'text-base-content/45' : ''}`}
                  >
                    {idx + 1}
                  </span>
                  <span className="sr-only">
                    Pergunta {idx + 1}: {q.questionPrompt}. {acc === null ? 'Sem respostas' : `${acc}% de acerto`}.
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 -mt-1 pl-[3.75rem] text-base text-base-content/70">
            <span>Número da pergunta</span>
            {unanswered > 0 && (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-5 h-3 rounded-t-[0.25rem] border-2 border-b-0 border-dashed border-[#aeaeb2]"
                />
                Sem respostas
              </span>
            )}
          </div>
        </section>
      </div>
      )}

      {/* Só para o professor, recolhido: a turma não vê o que precisa ser retomado */}
      {retake.length > 0 && (
        <section className="no-print rounded-[0.875rem] border border-base-300 bg-base-100">
          <button
            onClick={() => setShowRetake((v) => !v)}
            aria-expanded={showRetake}
            className="w-full flex items-center justify-between gap-3 min-h-[3.25rem] px-5 rounded-[0.875rem] text-left hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="inline-flex items-center gap-2.5 text-lg font-semibold">
              <Lightbulb className="w-5 h-5 text-[#b25000]" aria-hidden="true" />
              Para retomar ({retake.length})
              <span className="text-base font-normal text-base-content/70">· só para o professor</span>
            </span>
            <ChevronDown
              className={`w-5 h-5 text-base-content/70 motion-safe:transition-transform ${showRetake ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {showRetake && (
            <ul className="px-5 pb-5 pt-1 space-y-3 border-t border-base-300">
              {retake.map((it) => (
                <li key={it.key} className="pt-3">
                  <p className="text-base font-semibold">
                    {it.label}: {it.text}
                  </p>
                  <p className="text-base text-base-content/75">{it.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};
