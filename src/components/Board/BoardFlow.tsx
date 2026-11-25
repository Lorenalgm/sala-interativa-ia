import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Users } from 'lucide-react';
import { GroupFormation, Question, Student } from '../../types';
import { Homography } from '../../services/homography';
import { GroupSetup } from '../Conduct/GroupSetup';
import { HandCalibration } from './HandCalibration';
import { BoardCalibration } from './BoardCalibration';
import { BoardPlayer, BoardTurnResult } from './BoardPlayer';
import { BoardInputSettings } from './boardInput';

interface BoardFlowProps {
  questions: Question[];
  students: Student[];
  onBack: () => void;
  onCameraStatusChange: (active: boolean) => void;
  onRoundProgressChange: (inProgress: boolean) => void;
}

type Stage = 'setup' | 'groups' | 'calibrate' | 'handcal' | 'play' | 'summary';

// Etapas do roteiro da lousa: perguntas, grupos, calibração, rodada e resumo
export const BoardFlow: React.FC<BoardFlowProps> = ({
  questions,
  students,
  onBack,
  onCameraStatusChange,
  onRoundProgressChange,
}) => {
  const [stage, setStage] = useState<Stage>('setup');
  const [selected, setSelected] = useState<string[]>(() => questions.map((q) => q.id));
  const [formation, setFormation] = useState<GroupFormation | null>(null);
  const [homography, setHomography] = useState<Homography | null>(null);
  const [settings, setSettings] = useState<BoardInputSettings>({ click: 'pinch' });
  const [results, setResults] = useState<BoardTurnResult[]>([]);

  useEffect(() => {
    onRoundProgressChange(stage === 'play');
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = questions.filter((q) => selected.includes(q.id));
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (stage === 'groups') {
    return (
      <GroupSetup
        students={students}
        onBack={() => setStage('setup')}
        onStart={(f) => {
          setFormation(f);
          setStage('calibrate');
        }}
      />
    );
  }

  if (stage === 'calibrate' && formation) {
    return (
      <BoardCalibration
        onBack={() => setStage('groups')}
        onCameraStatusChange={onCameraStatusChange}
        onDone={(h) => {
          setHomography(h);
          setResults([]);
          setStage('handcal');
        }}
      />
    );
  }

  if (stage === 'handcal' && homography) {
    return (
      <HandCalibration
        baseHomography={homography}
        onBack={() => setStage('calibrate')}
        onCameraStatusChange={onCameraStatusChange}
        onDone={(h) => {
          setHomography(h);
          setStage('play');
        }}
      />
    );
  }

  if (stage === 'play' && formation && homography) {
    return (
      <BoardPlayer
        settings={settings}
        questions={chosen}
        groups={formation.groups}
        homography={homography}
        onCameraStatusChange={onCameraStatusChange}
        onExit={() => setStage('setup')}
        onFinish={(r) => {
          setResults(r);
          setStage('summary');
        }}
      />
    );
  }

  if (stage === 'summary' && formation) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Resultado da lousa</h1>
            <p className="text-lg text-base-content/75">Por grupo e por pergunta, sem ranking.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onBack} className={pillSecondary}>
              Voltar ao modelo
            </button>
            <button onClick={() => setStage('setup')} className={pillPrimary}>
              Nova rodada
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formation.groups.map((g) => {
            const own = results.filter((r) => r.groupId === g.id);
            if (own.length === 0) return null;
            const first = own.filter((r) => r.firstTry).length;
            const second = own.filter((r) => r.correct && !r.firstTry).length;
            const wrong = own.filter((r) => !r.correct).length;
            return (
              <div key={g.id} className="bg-base-100 border border-base-300 rounded-[0.875rem] p-5 space-y-4">
                <h2 className="font-display text-2xl font-bold tracking-tight">{g.name}</h2>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[0.625rem] bg-[#e8f5ec] text-[#14532d] py-3">
                    <p className="font-display text-4xl font-bold leading-none">{first}</p>
                    <p className="text-[0.9375rem] font-semibold mt-1.5">de primeira</p>
                  </div>
                  <div className="rounded-[0.625rem] bg-amber-100 text-amber-950 py-3">
                    <p className="font-display text-4xl font-bold leading-none">{second}</p>
                    <p className="text-[0.9375rem] font-semibold mt-1.5">na 2ª tentativa</p>
                  </div>
                  <div className="rounded-[0.625rem] bg-red-100 text-red-950 py-3">
                    <p className="font-display text-4xl font-bold leading-none">{wrong}</p>
                    <p className="text-[0.9375rem] font-semibold mt-1.5">não acertou</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section aria-labelledby="lousa-perguntas" className="space-y-2">
          <h2 id="lousa-perguntas" className={groupHeader}>Perguntas</h2>
          <ol className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
            {results.map((r, i) => (
              <li key={r.questionId + i} className={`flex flex-wrap items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-base-300' : ''}`}>
                <span
                  className={`inline-flex items-center min-h-[1.75rem] px-2.5 rounded-full text-[0.9375rem] font-semibold flex-shrink-0 whitespace-nowrap ${
                    r.firstTry ? 'bg-[#e8f5ec] text-[#14532d]' : r.correct ? 'bg-amber-100 text-amber-950' : 'bg-red-100 text-red-950'
                  }`}
                >
                  {r.firstTry ? 'De primeira' : r.correct ? 'Na 2ª tentativa' : 'Não acertou'}
                </span>
                <span className="text-lg">
                  <span className="font-semibold">{r.groupName}:</span> {r.prompt}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 min-h-[2.75rem] px-2 -ml-2 mb-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Modelo
          </button>
          <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Lousa interativa</h1>
          <p className="text-lg text-base-content/75 mt-2">
            Marque as perguntas. Depois você monta os grupos, ajusta a câmera ao quadro e começa no datashow.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setStage('groups')} disabled={chosen.length === 0} className={pillPrimary}>
            <Users className="w-4 h-4" aria-hidden="true" />
            Montar os grupos
          </button>
        </div>
      </header>

      <section aria-labelledby="lousa-apontar" className="space-y-2">
        <h2 id="lousa-apontar" className={groupHeader}>Como o grupo aponta</h2>
        <div className="bg-base-100 rounded-[0.875rem] border border-base-300 p-4 space-y-4">
          <p className="text-base text-base-content/75">
            A mão inteira é o mouse: o centro da palma move o ponto. Não precisa imprimir nada.
          </p>
          <Segmented
            label="Como clicar"
            value={settings.click}
            options={[['pinch', 'Juntar polegar e indicador'], ['dwell', 'Parar a mão por 1 s']]}
            onChange={(v) => setSettings((s) => ({ ...s, click: v as typeof s.click }))}
          />
        </div>
      </section>

      <section aria-labelledby="lousa-perguntas-lista" className="space-y-2">
        <h2 id="lousa-perguntas-lista" className={groupHeader}>
          {chosen.length} de {questions.length} perguntas marcadas
        </h2>
        {questions.length === 0 ? (
          <p className="bg-base-100 rounded-[0.875rem] border border-base-300 p-5 text-lg text-base-content/75">
            Ainda não há perguntas. Cadastre algumas no banco de perguntas antes de usar a lousa.
          </p>
        ) : (
          <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
            {questions.map((q, i) => {
              const on = selected.includes(q.id);
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(q.id)}
                    className="w-full flex items-center gap-3 pl-4 text-left hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        on ? 'bg-primary text-primary-content' : 'border-2 border-[#aeaeb2]'
                      }`}
                      aria-hidden="true"
                    >
                      {on && <Check className="w-4 h-4" strokeWidth={3} />}
                    </span>
                    <span
                      className={`flex-1 min-h-[3.5rem] py-3 pr-4 flex items-center text-lg font-semibold leading-snug ${
                        i > 0 ? 'border-t border-base-300' : ''
                      } ${on ? '' : 'text-base-content/60'}`}
                    >
                      {q.prompt}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

// Botões e cabeçalhos no padrão das outras telas de preparação
const pillBase =
  'inline-flex items-center gap-2 min-h-[2.75rem] rounded-full text-base font-semibold disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const pillPrimary = `${pillBase} px-6 bg-primary text-primary-content hover:bg-[#0036bd]`;
const pillSecondary = `${pillBase} px-5 bg-[#e3e3e8] hover:bg-[#d8d8de]`;
const groupHeader = 'px-4 text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70';

// Controle segmentado: trilho cinza, opção escolhida em azul
const Segmented: React.FC<{
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-[0.75rem] bg-[#e3e3e8] p-1 gap-1">
    {options.map(([v, text]) => {
      const active = v === value;
      return (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(v)}
          className={`min-h-[2.75rem] rounded-[0.5625rem] px-4 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            active ? 'bg-primary text-primary-content shadow-[0_1px_3px_rgb(0_0_0/0.25)]' : 'text-base-content hover:bg-black/5'
          }`}
        >
          {text}
        </button>
      );
    })}
  </div>
);
