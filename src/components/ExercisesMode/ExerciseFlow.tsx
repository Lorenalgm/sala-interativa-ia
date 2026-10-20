import React, { useState } from 'react';
import { Exercise } from '../../types';
import { ExercisePresenter } from './ExercisePresenter';
import { PoseFigure } from './PoseFigure';
import { Play, ArrowLeft, Clock } from 'lucide-react';

interface ExerciseFlowProps {
  exercises: Exercise[];
  onCameraStatusChange: (active: boolean) => void;
}

export const ExerciseFlow: React.FC<ExerciseFlowProps> = ({
  exercises,
  onCameraStatusChange,
}) => {
  const [stage, setStage] = useState<'catalog' | 'presenting'>('catalog');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || 'pose-01'
  );

  const selectedExercise =
    exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

  if (stage === 'presenting') {
    return (
      <div className="space-y-2">
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 flex items-center justify-between">
          <button
            onClick={() => setStage('catalog')}
            className="btn btn-sm rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao catálogo de exercícios</span>
          </button>

          <span className="text-xs text-base-content/60 font-medium">
            Atividade: {selectedExercise.title}
          </span>
        </div>

        <ExercisePresenter
          exercises={[
            selectedExercise,
            ...exercises.filter((e) => e.id !== selectedExercise.id),
          ]}
          onCameraStatusChange={onCameraStatusChange}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-base-content tracking-tight">
          Exercícios
        </h1>
        <p className="text-base text-base-content/70 mt-1">
          Escolha uma postura, projete no datashow e peça para a turma imitar.
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((item) => (
          <li
            key={item.id}
            className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col gap-4"
          >
            <PoseFigure type={item.type} className="h-32 w-auto self-center text-amber-700" />

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-base-content">{item.title}</h2>
              <p className="text-base text-base-content/70 leading-relaxed">{item.description}</p>
            </div>

            <div className="flex items-center gap-3 text-sm text-base-content/70 mt-auto">
              <span className="badge badge-secondary font-semibold">Nível {item.difficulty}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Segurar {item.targetDurationSeconds}s
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedExerciseId(item.id);
                setStage('presenting');
              }}
              className="btn btn-primary w-full"
            >
              <Play className="w-4 h-4" />
              Projetar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
