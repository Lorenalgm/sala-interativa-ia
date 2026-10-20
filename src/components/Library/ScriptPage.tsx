import React from 'react';
import { ArrowLeft, Clock, Package, Play } from 'lucide-react';
import { ActiveScript } from '../../data/scripts';

interface ScriptPageProps {
  script: ActiveScript;
  onBack: () => void;
  onPrepare: () => void;
}

export const ScriptPage: React.FC<ScriptPageProps> = ({ script, onBack, onPrepare }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button onClick={onBack} className="btn btn-sm rounded-full">
        <ArrowLeft className="w-3.5 h-3.5" />
        Biblioteca
      </button>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-ghost">{script.format}</span>
          <span className="inline-flex items-center gap-1 text-base text-base-content/70">
            <Clock className="w-4 h-4" />
            {script.minutes}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-base-content tracking-tight">{script.name}</h1>
        <p className="text-xl text-base-content/80 leading-relaxed">{script.goal}</p>
      </header>

      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold">Etapas</h2>
        <ol className="space-y-4">
          {script.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4">
              <span className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center font-extrabold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-lg pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-700" />
          Material
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-lg">
          {script.materials.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <div className="flex justify-end">
        <button onClick={onPrepare} className="btn btn-primary btn-lg">
          <Play className="w-5 h-5" />
          Preparar aula
        </button>
      </div>
    </div>
  );
};
