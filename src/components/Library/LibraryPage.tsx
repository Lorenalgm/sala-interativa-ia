import React from 'react';
import { ArrowRight, Clock, Printer, Users } from 'lucide-react';
import { ActiveTab } from '../Navbar';
import { scripts } from '../../data/scripts';
import { ScriptId } from '../../types';

interface LibraryPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenScript: (id: ScriptId) => void;
  studentsCount: number;
  roundsCount: number;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onNavigate,
  onOpenScript,
  studentsCount,
  roundsCount,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-base-content tracking-tight leading-tight">
          Acervo de aprendizagem ativa
        </h1>
        <p className="text-lg text-base-content/80 leading-relaxed">
          Roteiros prontos para conduzir a turma. Os alunos participam com cartões de papel,
          sem celular ou tablet. Você só precisa do datashow e de uma câmera.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scripts.map((script) => {
          const soon = script.status === 'soon';
          const content = (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-ghost">{script.format}</span>
                <span className="inline-flex items-center gap-1 text-sm text-base-content/70">
                  <Clock className="w-4 h-4" />
                  {script.minutes}
                </span>
                {soon && <span className="badge badge-warning font-semibold ml-auto">Em breve</span>}
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                  {script.name}
                </h2>
                <p className="text-lg text-base-content/80 leading-relaxed">{script.goal}</p>
              </div>

              {!soon && (
                <div className="mt-auto flex justify-end">
                  <span className="btn btn-primary pointer-events-none">
                    Ver roteiro
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              )}
            </>
          );

          return soon ? (
            <article
              key={script.id}
              className="bg-base-100/70 border border-dashed border-base-300 rounded-box p-8 flex flex-col gap-6"
            >
              {content}
            </article>
          ) : (
            <button
              key={script.id}
              onClick={() => onOpenScript(script.id)}
              className="group text-left bg-base-100 border border-base-300 rounded-box p-8 flex flex-col gap-6 transition-colors hover:border-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
            >
              {content}
            </button>
          );
        })}
      </div>

      <section className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-base-content">Antes da aula</h2>
        <ol className="space-y-4">
          <li className="flex items-start gap-4">
            <span className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center font-extrabold flex-shrink-0">
              1
            </span>
            <div className="flex-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-base">
                <strong className="font-bold">Confira a turma.</strong> Cada aluno precisa ter um
                número de cartão.
              </p>
              <button onClick={() => onNavigate('classroom')} className="btn btn-sm">
                <Users className="w-4 h-4" />
                Turma ({studentsCount})
              </button>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center font-extrabold flex-shrink-0">
              2
            </span>
            <div className="flex-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-base">
                <strong className="font-bold">Imprima os cartões.</strong> Um por aluno, em papel
                A4.
              </p>
              <button onClick={() => onNavigate('cards')} className="btn btn-sm">
                <Printer className="w-4 h-4" />
                Cartões
              </button>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center font-extrabold flex-shrink-0">
              3
            </span>
            <div className="flex-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-base">
                <strong className="font-bold">Posicione a câmera.</strong> Ela precisa enxergar a
                turma toda, de frente e com a sala iluminada.
              </p>
              <button onClick={() => onNavigate('reports')} className="btn btn-sm btn-ghost">
                {roundsCount === 0 ? 'Desempenho' : `Desempenho (${roundsCount})`}
              </button>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
};
