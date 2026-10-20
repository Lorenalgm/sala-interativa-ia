import React from 'react';
import { PoseFeedbackResult } from '../../types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface PoseFeedbackProps {
  feedback: PoseFeedbackResult;
  holdTimeSeconds: number;
  targetDurationSeconds: number;
  completedReps: number;
}

export const PoseFeedback: React.FC<PoseFeedbackProps> = ({
  feedback,
  holdTimeSeconds,
  targetDurationSeconds,
  completedReps,
}) => {
  const holdPercent = Math.min(
    100,
    Math.round((holdTimeSeconds / targetDurationSeconds) * 100)
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {feedback.isMatch ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="text-xs text-zinc-500 block uppercase tracking-wide font-semibold">
              Status ao vivo
            </span>
            <span
              className={`text-sm font-bold ${
                feedback.isMatch ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {feedback.feedback}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-zinc-400 block font-medium">Repetições</span>
            <div className="flex items-center gap-1 text-zinc-950 font-black text-xl">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{completedReps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progresso da sustentação */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-600 font-medium">
            Sustentação da postura: {holdTimeSeconds.toFixed(1)}s / {targetDurationSeconds}s
          </span>
          <span className="text-amber-700 font-bold">{holdPercent}%</span>
        </div>

        <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              feedback.isMatch ? 'bg-amber-400' : 'bg-stone-300'
            }`}
            style={{ width: `${holdPercent}%` }}
          />
        </div>
      </div>

      {/* Ângulos detectados */}
      {feedback.activeAngles && (
        <div className="flex items-center gap-3 pt-1 text-xs text-zinc-500">
          <span>Ângulos articulares calculados:</span>
          {Object.entries(feedback.activeAngles).map(([name, val]) => (
            <span
              key={name}
              className="px-2 py-0.5 rounded-lg bg-stone-100 text-zinc-800 font-mono font-medium border border-zinc-200"
            >
              {name}: {val}°
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
