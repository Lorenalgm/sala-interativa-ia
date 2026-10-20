import React, { useEffect } from 'react';
import { Alternative, Question } from '../../types';
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
      <section className="bg-base-100 border-2 border-success rounded-box p-6 sm:p-8 space-y-4">
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

        <p className="text-xl lg:text-2xl text-base-content leading-relaxed border-t border-base-300 pt-4 max-w-[60ch]">
          {question.explanation}
        </p>
      </section>

      {/* Distribuição dos votos da turma */}
      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-4">
        <h2 className="text-xl lg:text-2xl font-bold text-base-content">Como a turma votou</h2>

        {totalResponses === 0 ? (
          <p className="text-lg lg:text-xl text-base-content/80 max-w-[60ch]">
            Ninguém respondeu esta pergunta. Se os cartões estavam levantados, confira a câmera e
            use Repetir.
          </p>
        ) : (
          <ul className="space-y-3">
            {optionsList.map((opt) => {
              const count = counts[opt];
              const percent = Math.round((count / totalResponses) * 100);
              const isCorrect = opt === question.correctOption;

              return (
                <li key={opt} className="flex items-center gap-4">
                  <span
                    className={`w-12 h-12 rounded-btn flex items-center justify-center font-extrabold text-xl flex-shrink-0 ${
                      isCorrect ? 'bg-success text-success-content' : 'bg-base-200 text-base-content'
                    }`}
                  >
                    {opt}
                  </span>
                  <p
                    className={`w-1/3 text-lg lg:text-xl leading-snug truncate ${
                      isCorrect ? 'font-bold text-base-content' : 'text-base-content/80'
                    }`}
                  >
                    {question.options[opt]}
                  </p>
                  <div className="flex-1 h-8 bg-base-200 rounded-btn overflow-hidden">
                    <div
                      className={`h-full rounded-btn transition-[width] duration-700 ease-out ${
                        isCorrect ? 'bg-success' : 'bg-base-content/25'
                      }`}
                      style={{ width: count > 0 ? `${Math.max(2, percent)}%` : '0%' }}
                    />
                  </div>
                  <p className="w-28 text-right flex-shrink-0">
                    <span
                      className={`text-2xl lg:text-3xl font-extrabold ${
                        isCorrect ? 'text-success' : 'text-base-content'
                      }`}
                    >
                      {percent}%
                    </span>
                    <span className="block text-sm text-base-content/70">
                      {count} {count === 1 ? 'voto' : 'votos'}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
