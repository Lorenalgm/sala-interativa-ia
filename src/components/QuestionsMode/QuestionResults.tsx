import React, { useEffect } from 'react';
import { Alternative, Question } from '../../types';
import { Award, CheckCircle2 } from 'lucide-react';
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
    if (accuracyRate >= 50) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [accuracyRate]);

  return (
    <div className="space-y-5 h-full flex flex-col justify-between">
      {/* Banner de gabarito e explicação */}
      <div className="bg-base-100 border-2 border-emerald-300 rounded-box p-6 sm:p-7 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold block">
                Gabarito oficial
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-base-content">
                Alternativa {question.correctOption}: {question.options[question.correctOption]}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="text-xs text-base-content/60 block font-medium">Taxa de acerto</span>
              <span className="text-2xl sm:text-3xl font-black text-success">
                {accuracyRate}%
              </span>
            </div>
            <div className="text-right pl-4 border-l border-base-300">
              <span className="text-xs text-base-content/60 block font-medium">Total de respostas</span>
              <span className="text-2xl sm:text-3xl font-black text-base-content">
                {totalResponses}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-base-200 border border-base-300 text-xs sm:text-sm text-base-content/80 leading-relaxed">
          <strong className="text-base-content font-semibold mr-1">Explicação:</strong>
          {question.explanation}
        </div>
      </div>

      {/* Gráfico de barras verticais com a distribuição dos votos da turma */}
      <div className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 shadow-sm space-y-5 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-base-content uppercase tracking-wide">
            Distribuição dos votos da turma
          </h3>
          <span className="text-xs text-base-content/60">
            {totalResponses} respostas registradas no datashow
          </span>
        </div>

        {/* Gráfico de barras verticais */}
        <div className="grid grid-cols-4 gap-4 sm:gap-6 items-end h-60 pt-6 pb-2 border-b border-base-300">
          {optionsList.map((opt) => {
            const count = counts[opt];
            const percent =
              totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
            const isCorrect = opt === question.correctOption;

            return (
              <div
                key={opt}
                className="flex flex-col items-center justify-end h-full gap-2 relative group"
              >
                {/* Rótulo de votos e percentual no topo da barra */}
                <div className="text-center space-y-0.5">
                  <span
                    className={`text-xs sm:text-sm font-black block ${
                      isCorrect ? 'text-emerald-700' : 'text-base-content/80'
                    }`}
                  >
                    {percent}%
                  </span>
                  <span className="text-xs text-base-content/60 block font-medium">
                    {count} {count === 1 ? 'voto' : 'votos'}
                  </span>
                </div>

                {/* Coluna da barra vertical com transição */}
                <div className="w-full max-w-[72px] bg-base-200 rounded-t-2xl flex items-end justify-center h-44 p-1 overflow-hidden">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 ease-out flex items-center justify-center ${
                      isCorrect
                        ? 'bg-emerald-500 shadow-sm'
                        : 'bg-base-content/20 group-hover:bg-base-content/30'
                    }`}
                    style={{
                      height: `${Math.max(6, percent)}%`,
                    }}
                  >
                    {isCorrect && percent > 20 && (
                      <CheckCircle2 className="w-4 h-4 text-success-content opacity-90" />
                    )}
                  </div>
                </div>

                {/* Letra da alternativa */}
                <div className="text-center pt-1">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm mx-auto shadow-sm ${
                      isCorrect
                        ? 'bg-success text-success-content ring-2 ring-emerald-300'
                        : 'bg-base-200 text-base-content/80 border border-base-300'
                    }`}
                  >
                    {opt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda com o texto de cada opção */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          {optionsList.map((opt) => {
            const isCorrect = opt === question.correctOption;

            return (
              <div
                key={opt}
                className={`p-2.5 rounded-xl border truncate ${
                  isCorrect
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                    : 'bg-base-200 border-base-300 text-base-content/70'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <strong className="font-bold">{opt}:</strong>
                  <span className="truncate">{question.options[opt]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
