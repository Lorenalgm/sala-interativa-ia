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
      <div className="space-y-4">
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between">
          <button
            onClick={() => setStage('catalog')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 text-xs font-medium shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao catálogo de exercícios</span>
          </button>

          <span className="text-xs text-zinc-500 font-medium">
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Atividades corporais
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Catálogo de exercícios com inteligência artificial
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Escolha uma postura para projetar no datashow e desafiar a turma a replicar ao vivo.
          </p>
        </div>

        <button
          onClick={() => setStage('presenting')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-sm transition-all"
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
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-5 ${
                isSelected
                  ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-white border-zinc-200/90 hover:border-zinc-300 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                    Nível {item.difficulty}
                  </span>

                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.targetDurationSeconds}s de sustentação</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-zinc-950">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs">
                <span className="font-semibold text-zinc-700 block">
                  Instruções para a turma:
                </span>
                <ul className="space-y-1.5 text-zinc-500">
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
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm'
                    : 'bg-stone-100 text-zinc-700 hover:bg-stone-200'
                }`}
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
