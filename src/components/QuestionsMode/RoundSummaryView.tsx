import React, { useEffect, useState } from 'react';
import { RoundSession, Student } from '../../types';
import { Award, BarChart2, RotateCcw, ArrowRight, EyeOff } from 'lucide-react';
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
  // O resultado de cada aluno é só para o professor; fica escondido no datashow
  const [showStudents, setShowStudents] = useState(false);

  const unansweredQuestions = round.questions.filter(
    (q) => Object.keys(q.responses).length === 0
  ).length;
  const answeredQuestions = round.questions.length - unansweredQuestions;

  // Comemora só quando todas as perguntas tiveram respostas e a turma acertou a maioria
  useEffect(() => {
    if (unansweredQuestions === 0 && round.totalResponses > 0 && round.overallAccuracy >= 50) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      });
    }
  }, [unansweredQuestions, round.totalResponses, round.overallAccuracy]);

  let statusMessage = 'Todas as perguntas tiveram respostas. O resultado foi salvo no histórico.';
  if (answeredQuestions === 0) {
    statusMessage = 'Nenhuma pergunta recebeu respostas nesta rodada.';
  } else if (unansweredQuestions > 0) {
    statusMessage = `${unansweredQuestions} de ${round.questions.length} ${
      round.questions.length === 1 ? 'pergunta ficou' : 'perguntas ficaram'
    } sem respostas. O resultado foi salvo no histórico.`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Topo de encerramento */}
      <div className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-btn bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight">
              Fim da rodada
            </h1>
            <p className="text-base sm:text-lg text-base-content/80 mt-1">{statusMessage}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onNewRound} className="btn">
            <RotateCcw className="w-4 h-4" />
            Nova rodada
          </button>

          <button onClick={onGoToReports} className="btn btn-primary">
            <BarChart2 className="w-4 h-4" />
            Ver histórico
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Indicadores gerais da rodada */}
      <div className="stats stats-vertical sm:stats-horizontal w-full bg-base-100 border border-base-300">
        <div className="stat">
          <div className="stat-title text-base">Perguntas com respostas</div>
          <div className="stat-value font-extrabold">
            {answeredQuestions}
            <span className="text-2xl text-base-content/70"> de {round.questions.length}</span>
          </div>
        </div>

        <div className="stat">
          <div className="stat-title text-base">Respostas recebidas</div>
          <div className="stat-value font-extrabold">{round.totalResponses}</div>
        </div>

        <div className="stat">
          <div className="stat-title text-base">Acertos da turma</div>
          <div
            className={`stat-value font-extrabold ${
              round.totalResponses > 0 ? 'text-success' : 'text-base-content/60'
            }`}
          >
            {round.totalResponses > 0 ? `${round.overallAccuracy}%` : '–'}
          </div>
          {unansweredQuestions > 0 && answeredQuestions > 0 && (
            <div className="stat-desc text-sm">Conta só as perguntas com respostas</div>
          )}
        </div>
      </div>

      {/* Lista das perguntas da rodada */}
      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-base-content">Pergunta por pergunta</h2>

        <ol className="divide-y divide-base-300/60">
          {round.questions.map((q, idx) => {
            const votes = Object.keys(q.responses).length;
            const correctCount = Object.values(q.responses).filter(
              (r) => r === q.correctOption
            ).length;
            const acc = votes > 0 ? Math.round((correctCount / votes) * 100) : 0;

            return (
              <li key={q.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-base-content/70">{idx + 1}.</span>
                    <span className="badge badge-success badge-sm font-semibold">
                      Resposta certa: {q.correctOption}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-base-content">{q.questionPrompt}</p>
                </div>

                <div className="text-right flex items-center gap-5">
                  {votes > 0 ? (
                    <>
                      <div>
                        <span className="text-sm text-base-content/70 block">Acertos</span>
                        <span className="text-xl font-bold text-success">{acc}%</span>
                      </div>
                      <div className="pl-4 border-l border-base-300">
                        <span className="text-sm text-base-content/70 block">Respostas</span>
                        <span className="text-xl font-bold text-base-content">
                          {votes} de {round.totalClassStudents}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="badge badge-ghost">Sem respostas</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Resultado por aluno: só para o professor */}
      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-base-content">Resultado por aluno</h2>
          <label className="label cursor-pointer gap-2 py-0">
            <span className="label-text text-sm text-base-content/70">Mostrar</span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={showStudents}
              onChange={(e) => setShowStudents(e.target.checked)}
            />
          </label>
        </div>

        {!showStudents ? (
          <p className="flex items-center gap-2 text-base text-base-content/70">
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            Escondido para não expor a nota de cada aluno no datashow.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1">
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
                <li
                  key={student.id}
                  className={`px-3 py-2 rounded-btn text-sm flex items-center justify-between gap-2 ${
                    total === 0
                      ? 'bg-base-200 text-base-content/60'
                      : pct >= 50
                      ? 'bg-emerald-50 text-emerald-950'
                      : 'bg-amber-50 text-amber-950'
                  }`}
                >
                  <span className="truncate">
                    #{String(student.id).padStart(2, '0')} {student.name.split(' ')[0]}
                  </span>
                  <span className="font-bold">{total > 0 ? `${pct}%` : 'Sem resposta'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
