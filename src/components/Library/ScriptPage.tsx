import React from 'react';
import { ArrowLeft, Clock, Package, Play } from 'lucide-react';
import { ActiveScript } from '../../data/scripts';
import { Emblem, Spine, bindingFor } from './BookParts';

interface ScriptPageProps {
  script: ActiveScript;
  onBack: () => void;
  onPrepare: () => void;
}

// O roteiro aberto como um livro: capa à esquerda, página com as etapas à direita
export const ScriptPage: React.FC<ScriptPageProps> = ({ script, onBack, onPrepare }) => {
  const binding = bindingFor(script.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-5">
      <button onClick={onBack} className="btn btn-sm rounded-full">
        <ArrowLeft className="w-3.5 h-3.5" />
        Biblioteca
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[min(34rem,calc(100dvh-11rem))] shadow-[0_24px_34px_-18px_rgb(16_24_32/0.45)] rounded-2xl">
        {/* Capa */}
        <section
          aria-label={script.name}
          className={`cloth relative overflow-hidden rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl ${binding.cover}`}
        >
          <Spine />
          <span
            className={`absolute inset-y-4 right-4 left-9 border-2 rounded-md pointer-events-none ${binding.frame}`}
            aria-hidden="true"
          />
          <div className="relative flex flex-col h-full gap-5 pl-14 pr-10 py-10">
            <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.02]">
              {script.name}
            </h1>
            <p className="text-xl leading-snug">{script.goal}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {script.minutes}
              </span>
              <span>{script.format}</span>
              <span>{script.steps.length} etapas</span>
            </div>
            <div className="flex flex-1 items-center justify-center pt-2">
              <Emblem id={script.id} size="lg" />
            </div>
          </div>
        </section>

        {/* Página: etapas, material e ação */}
        <section className="relative bg-white rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl px-8 sm:px-10 py-9 flex flex-col gap-6">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-extrabold">Etapas</h2>
            <ol className="space-y-3.5">
              {script.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-display font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-lg leading-snug pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2.5">
            <h2 className="font-display text-lg font-extrabold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Material
            </h2>
            <ul className="flex flex-wrap gap-2">
              {script.materials.map((m) => (
                <li
                  key={m}
                  className="rounded-full bg-base-200 border border-base-300 px-3 py-1 text-base"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex justify-end">
            <button onClick={onPrepare} className="btn btn-primary btn-lg">
              <Play className="w-5 h-5" />
              Preparar aula
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
