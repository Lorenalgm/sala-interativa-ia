import React, { useState } from 'react';
import { Exercise } from '../../types';
import { ExercisePresenter } from './ExercisePresenter';
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
      {/* Topo do catálogo */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Catálogo de exercícios
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Escolha uma postura, projete no datashow e peça para a turma imitar.
          </p>
        </div>

        <button
          onClick={() => setStage('presenting')}
          className="btn btn-sm btn-primary"
        >
          <Play className="w-4 h-4 fill-zinc-950" />
          <span>Iniciar {selectedExercise.title} no datashow</span>
        </button>
      </div>

      {/* Grade de cartões de exercícios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((item) => {
          const isSelected = item.id === selectedExerciseId;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedExerciseId(item.id)}
              className={`p-6 rounded-box border transition-all cursor-pointer flex flex-col justify-between space-y-5 ${
                isSelected
                  ? 'bg-base-100 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-base-100 border-base-300 hover:border-zinc-300 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge badge-secondary font-semibold">
                    Nível {item.difficulty}
                  </span>

                  <div className="flex items-center gap-1 text-xs text-base-content/60">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.targetDurationSeconds}s de sustentação</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-base-content">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-base-300/60 text-xs">
                <span className="font-semibold text-base-content/80 block">
                  Instruções para a turma:
                </span>
                <ul className="space-y-1.5 text-base-content/60">
                  {item.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedExerciseId(item.id);
                  setStage('presenting');
                }}
                className={`btn btn-sm w-full ${isSelected ? 'btn-neutral' : ''}`}
              >
                <span>Projetar este exercício</span>
                <Play className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
