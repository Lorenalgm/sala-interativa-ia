import React, { useEffect } from 'react';
import { Alternative, Question } from '../../types';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuestionResultsProps {
  question: Question;
  responses: Record<number, Alternative>;
}

export const QuestionResults: React.FC<QuestionResultsProps> = ({
  question,
  responses,
}) => {
  const optionsList: Alternative[] = ['A', 'B', 'C', 'D'];
  const totalResponses = Object.keys(responses).length;

  const counts: Record<Alternative, number> = { A: 0, B: 0, C: 0, D: 0 };
  Object.values(responses).forEach((opt) => {
    if (counts[opt] !== undefined) {
      counts[opt]++;
    }
  });

  const correctCount = counts[question.correctOption] || 0;
  const accuracyRate =
    totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) : 0;

  useEffect(() => {
    if (totalResponses > 0 && accuracyRate >= 50) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [accuracyRate, totalResponses]);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {/* Resposta certa e explicação */}
      <section className="bg-base-100 border-2 border-success rounded-box p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-btn bg-success text-success-content flex items-center justify-center font-extrabold text-2xl lg:text-3xl flex-shrink-0">
              {question.correctOption}
            </span>
            <div className="min-w-0">
              <p className="text-base lg:text-lg font-semibold text-success">
                Resposta certa
              </p>
              <h2 className="text-2xl lg:text-4xl font-extrabold text-base-content leading-tight">
                {question.options[question.correctOption]}
              </h2>
            </div>
          </div>

          <div className="flex items-end gap-8 text-right">
            <div>
              <p className="text-base lg:text-lg text-base-content/70">Acertaram</p>
              <p className="text-4xl lg:text-5xl font-extrabold text-success">
                {totalResponses > 0 ? `${accuracyRate}%` : '–'}
              </p>
            </div>
            <div>
              <p className="text-base lg:text-lg text-base-content/70">Respostas</p>
              <p className="text-4xl lg:text-5xl font-extrabold text-base-content">
                {totalResponses}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xl lg:text-2xl text-base-content leading-relaxed border-t border-base-300 pt-5 max-w-[60ch]">
          {question.explanation}
        </p>
      </section>

      {/* Distribuição dos votos da turma */}
      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 flex flex-col gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-base-content">
          Como a turma votou
        </h2>

        <div className="grid grid-cols-4 gap-4 sm:gap-8 items-start">
          {optionsList.map((opt) => {
            const count = counts[opt];
            const percent =
              totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
            const isCorrect = opt === question.correctOption;

            return (
              <div key={opt} className="flex flex-col items-center gap-2 min-w-0">
                <p
                  className={`text-2xl lg:text-3xl font-extrabold ${
                    isCorrect ? 'text-success' : 'text-base-content'
                  }`}
                >
                  {percent}%
                </p>
                <p className="text-base text-base-content/70">
                  {count} {count === 1 ? 'voto' : 'votos'}
                </p>

                {/* Barra vertical proporcional aos votos */}
                <div className="w-full max-w-[96px] h-32 lg:h-44 bg-base-200 rounded-t-btn flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-btn transition-[height] duration-700 ease-out flex items-start justify-center ${
                      isCorrect ? 'bg-success' : 'bg-base-content/25'
                    }`}
                    style={{ height: count > 0 ? `${Math.max(4, percent)}%` : '0%' }}
                  >
                    {isCorrect && percent >= 20 && (
                      <CheckCircle2 className="w-6 h-6 mt-2 text-success-content" />
                    )}
                  </div>
                </div>

                <span
                  className={`w-12 h-12 rounded-btn flex items-center justify-center font-extrabold text-xl ${
                    isCorrect
                      ? 'bg-success text-success-content'
                      : 'bg-base-200 text-base-content'
                  }`}
                >
                  {opt}
                </span>
                <p
                  className={`text-base lg:text-lg text-center leading-snug line-clamp-2 ${
                    isCorrect ? 'font-semibold text-base-content' : 'text-base-content/70'
                  }`}
                >
                  {question.options[opt]}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
