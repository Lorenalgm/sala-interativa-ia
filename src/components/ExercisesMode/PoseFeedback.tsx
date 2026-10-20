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
    <div className="bg-base-100 border border-base-300 rounded-box p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          {feedback.isMatch ? (
            <div className="w-12 h-12 rounded-btn bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-btn bg-amber-100 flex-shrink-0 flex items-center justify-center text-amber-800">
              <AlertCircle className="w-7 h-7" />
            </div>
          )}
          <div>
            <span
              className={`text-xl lg:text-2xl font-bold leading-snug block ${
                feedback.isMatch ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {feedback.feedback}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-sm text-base-content/70 block font-medium">Repetições</span>
            <div className="flex items-center justify-end gap-1 text-base-content font-extrabold text-4xl">
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span>{completedReps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progresso da sustentação */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-base lg:text-lg">
          <span className="text-base-content/80 font-medium">
            Segurando: {holdTimeSeconds.toFixed(1)}s de {targetDurationSeconds}s
          </span>
          <span className="text-amber-800 font-bold">{holdPercent}%</span>
        </div>

        <progress
          className={`progress w-full h-5 ${feedback.isMatch ? 'progress-primary' : ''}`}
          value={holdPercent}
          max={100}
          aria-label="Tempo de sustentação da postura"
        />
      </div>

      {/* Ângulos detectados */}
      {feedback.activeAngles && (
        <div className="flex items-center gap-3 pt-1 text-xs text-base-content/60">
          <span>Ângulos articulares calculados:</span>
          {Object.entries(feedback.activeAngles).map(([name, val]) => (
            <span
              key={name}
              className="badge badge-ghost font-mono font-medium"
            >
              {name}: {val}°
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
