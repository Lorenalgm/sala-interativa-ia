import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Maximize, MousePointer2, Play, RotateCcw } from 'lucide-react';
import { Homography } from '../../services/homography';
import { PackInfo } from '../../data/handActivities';
import { BoardCalibration } from '../Board/BoardCalibration';
import { HandCalibration } from '../Board/HandCalibration';

export interface HowStep {
  title: string;
  text: string;
}

interface HandActivityFlowProps {
  title: string;
  lead: string;
  how: HowStep[];
  packs: (PackInfo & { count: string })[];
  renderPlayer: (packId: string, homography: Homography | null, onExit: () => void) => React.ReactNode;
  onBack: () => void;
  onCameraStatusChange: (active: boolean) => void;
  onRoundProgressChange: (inProgress: boolean) => void;
}

type Stage = 'setup' | 'calibrate' | 'handcal' | 'play';

// A calibração vale para todos os modelos com a mão enquanto a página estiver aberta:
// trocar de atividade não obriga a ajustar a câmera de novo
let savedHomography: Homography | null = null;

// Preparação dos modelos com a mão: escolher a atividade, ajustar a câmera e projetar
export const HandActivityFlow: React.FC<HandActivityFlowProps> = ({
  title,
  lead,
  how,
  packs,
  renderPlayer,
  onBack,
  onCameraStatusChange,
  onRoundProgressChange,
}) => {
  const [stage, setStage] = useState<Stage>('setup');
  const [packId, setPackId] = useState(packs[0].id);
  const [homography, setHomography] = useState<Homography | null>(savedHomography);
  const [mouse, setMouse] = useState(false);

  useEffect(() => {
    onRoundProgressChange(stage === 'play');
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (withMouse: boolean) => {
    setMouse(withMouse);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    setStage(withMouse || homography ? 'play' : 'calibrate');
  };

  if (stage === 'calibrate') {
    return (
      <BoardCalibration
        onBack={() => setStage('setup')}
        onCameraStatusChange={onCameraStatusChange}
        onDone={(h) => {
          setHomography(h);
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
          savedHomography = h;
          setHomography(h);
          setStage('play');
        }}
      />
    );
  }

  if (stage === 'play') {
    return <>{renderPlayer(packId, mouse ? null : homography, () => setStage('setup'))}</>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="max-w-2xl">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 min-h-[2.75rem] px-2 -ml-2 mb-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Modelo
          </button>
          <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">{title}</h1>
          <p className="text-lg text-base-content/75 mt-2">{lead}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => start(true)} className={pillSecondary}>
            <MousePointer2 className="w-4 h-4" aria-hidden="true" />
            Testar com o mouse
          </button>
          <button onClick={() => start(false)} className={pillPrimary}>
            {homography ? <Play className="w-4 h-4" aria-hidden="true" /> : <Maximize className="w-4 h-4" aria-hidden="true" />}
            {homography ? 'Começar no quadro' : 'Ajustar a câmera e começar'}
          </button>
        </div>
      </header>

      <section aria-labelledby="como-funciona" className="space-y-2">
        <h2 id="como-funciona" className={groupHeader}>Como funciona</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {how.map((step, i) => (
            <li key={step.title} className="bg-base-100 rounded-[0.875rem] border border-base-300 p-4 flex gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-display font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span>
                <span className="block text-[1.0625rem] font-semibold leading-snug">{step.title}</span>
                <span className="block text-base text-base-content/75 leading-snug mt-0.5">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="escolha-atividade" className="space-y-2">
        <h2 id="escolha-atividade" className={groupHeader}>Escolha a atividade</h2>
        <div role="radiogroup" aria-labelledby="escolha-atividade" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {packs.map((p) => {
            const on = p.id === packId;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPackId(p.id)}
                className={`relative text-left rounded-[0.875rem] border-2 p-4 flex items-start gap-4 bg-base-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  on ? 'border-primary shadow-[0_6px_16px_-8px_rgb(0_64_221/0.5)]' : 'border-base-300 hover:border-[#aeaeb2]'
                }`}
              >
                <span className="text-[2.5rem] leading-none w-14 h-14 rounded-xl bg-base-200 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="flex-1 min-w-0 pr-7">
                  <span className="block text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/65">
                    {p.subject} · {p.count}
                  </span>
                  <span className="block font-display text-xl font-bold tracking-tight leading-tight mt-0.5">{p.title}</span>
                  <span className="block text-base text-base-content/75 leading-snug mt-1">{p.description}</span>
                </span>
                <span
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${
                    on ? 'bg-primary text-primary-content' : 'border-2 border-[#aeaeb2]'
                  }`}
                  aria-hidden="true"
                >
                  {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {homography && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-base-content/75">
          A câmera já está ajustada ao quadro.
          <button
            onClick={() => {
              savedHomography = null;
              setHomography(null);
            }}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Ajustar de novo
          </button>
        </p>
      )}
    </div>
  );
};

const pillBase =
  'inline-flex items-center gap-2 min-h-[2.75rem] rounded-full text-base font-semibold disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const pillPrimary = `${pillBase} px-6 bg-primary text-primary-content hover:bg-[#0036bd]`;
const pillSecondary = `${pillBase} px-5 bg-[#e3e3e8] hover:bg-[#d8d8de]`;
const groupHeader = 'px-4 text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70';
