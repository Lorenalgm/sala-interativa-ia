import React from 'react';
import { ArrowLeft, Clock, Package, Play } from 'lucide-react';
import { ActiveScript } from '../../data/scripts';
import { Suit, suitFor } from './Suit';

interface ScriptPageProps {
  script: ActiveScript;
  onBack: () => void;
  onPrepare: () => void;
}

export const ScriptPage: React.FC<ScriptPageProps> = ({ script, onBack, onPrepare }) => {
  const suit = suitFor(script.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button onClick={onBack} className="btn btn-sm rounded-full">
        <ArrowLeft className="w-3.5 h-3.5" />
        Biblioteca
      </button>

      <header className="relative bg-white rounded-[1.75rem] px-10 sm:px-20 py-12 space-y-4 shadow-[0_18px_30px_-14px_rgb(16_24_32/0.35)]">
        <span className="absolute top-5 left-5 flex flex-col items-center gap-1 text-accent" aria-hidden="true">
          <span className="font-display text-2xl font-extrabold leading-none text-neutral">
            {script.steps.length}
          </span>
          <Suit shape={suit} className="w-5 h-5" />
        </span>
        <span className="absolute bottom-5 right-5 flex flex-col items-center gap-1 text-accent rotate-180" aria-hidden="true">
          <span className="font-display text-2xl font-extrabold leading-none text-neutral">
            {script.steps.length}
          </span>
          <Suit shape={suit} className="w-5 h-5" />
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-secondary font-semibold">{script.format}</span>
          <span className="inline-flex items-center gap-1 text-base text-base-content/80">
            <Clock className="w-4 h-4" />
            {script.minutes}
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-base-content tracking-tight leading-[1.02]">
          {script.name}
        </h1>
        <p className="text-xl text-base-content/85 leading-relaxed">{script.goal}</p>
      </header>

      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-2xl font-extrabold">Etapas</h2>
        <ol className="space-y-4">
          {script.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-display font-bold text-lg flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-lg pt-1.5">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-2xl font-extrabold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Material
        </h2>
        <ul className="flex flex-wrap gap-2">
          {script.materials.map((m) => (
            <li key={m} className="badge badge-lg bg-base-200 border-base-300 text-base-content">
              {m}
            </li>
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
