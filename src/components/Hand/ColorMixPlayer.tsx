import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Undo2 } from 'lucide-react';
import { MixMode, MixPack } from '../../data/handActivities';
import { Homography, Point } from '../../services/homography';
import { EMPTY_INPUT, HandCursor, HandInput, HandSource } from './handInput';
import { Dwell, Footer, HandButton, ProjectionShell, Rect, TopBar, celebrate } from './projection';

interface ColorMixPlayerProps {
  pack: MixPack;
  homography: Homography | null;
  onExit: () => void;
  onCameraStatusChange?: (active: boolean) => void;
}

type W = [number, number, number];

// Cantos do triângulo em fração da tela: topo, embaixo à esquerda, embaixo à direita
const CORNERS: Point[] = [
  { x: 0.32, y: 0.17 },
  { x: 0.07, y: 0.8 },
  { x: 0.57, y: 0.8 },
];
const MATCH = 0.09; // distância entre as proporções que já conta como a cor certa
const HOLD_MS = 1000;
const NEXT: Rect = { x: 0.64, y: 0.84, w: 0.33, h: 0.11 };

// Proporção de cada primária a partir da posição (coordenadas baricêntricas, presas ao triângulo)
function weightsAt(p: Point, aspect: number): W {
  const [a, b, c] = CORNERS.map((q) => ({ x: q.x * aspect, y: q.y }));
  const px = p.x * aspect;
  const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  let wa = ((b.y - c.y) * (px - c.x) + (c.x - b.x) * (p.y - c.y)) / det;
  let wb = ((c.y - a.y) * (px - c.x) + (a.x - c.x) * (p.y - c.y)) / det;
  let wc = 1 - wa - wb;
  wa = Math.max(0, wa);
  wb = Math.max(0, wb);
  wc = Math.max(0, wc);
  const s = wa + wb + wc || 1;
  return [wa / s, wb / s, wc / s];
}

const pointAt = (w: W): Point => ({
  x: CORNERS[0].x * w[0] + CORNERS[1].x * w[1] + CORNERS[2].x * w[2],
  y: CORNERS[0].y * w[0] + CORNERS[1].y * w[1] + CORNERS[2].y * w[2],
});

// Tinta: cubo RYB de Gosset e Chen (2004), interpolado; as primárias ficam vivas e as três juntas escurecem
const RYB: Record<string, [number, number, number]> = {
  '000': [1, 1, 1],
  '100': [1, 0, 0],
  '010': [1, 1, 0],
  '001': [0.163, 0.373, 0.6],
  '110': [1, 0.5, 0],
  '101': [0.5, 0, 0.5],
  '011': [0, 0.66, 0.2],
  '111': [0.2, 0.094, 0],
};

function rybToRgb(r: number, y: number, b: number): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  for (const key of Object.keys(RYB)) {
    const [kr, ky, kb] = key.split('').map(Number);
    const f = (kr ? r : 1 - r) * (ky ? y : 1 - y) * (kb ? b : 1 - b);
    for (let i = 0; i < 3; i++) out[i] += f * RYB[key][i];
  }
  return out;
}

function mixRgb(w: W, mode: MixMode): [number, number, number] {
  const m = Math.max(...w) || 1;
  const n = w.map((v) => v / m) as W;
  return mode === 'light' ? n : rybToRgb(n[0], n[1], n[2]);
}

const css = (rgb: [number, number, number]) =>
  `rgb(${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255)).join(' ')})`;

const dist = (a: W, b: W) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

type Phase = 'mix' | 'found' | 'end';

// "Misturar cores": a mão anda no triângulo das primárias até chegar à cor pedida
export const ColorMixPlayer: React.FC<ColorMixPlayerProps> = ({ pack, homography, onExit, onCameraStatusChange }) => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('mix');
  const [input, setInput] = useState<HandInput>(EMPTY_INPUT);
  const [weights, setWeights] = useState<W | null>(null);
  const [hold, setHold] = useState(0);
  const [nextProgress, setNextProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const closeSince = useRef<number | null>(null);
  const nextDwell = useMemo(() => new Dwell(1200), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ch = pack.challenges[idx];
  const target = ch.weights;
  const aspect = size.w / size.h;

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // O triângulo com todas as misturas, pintado uma vez; aparece quando a cor é descoberta
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 320;
    const H = Math.round((W * (CORNERS[1].y - CORNERS[0].y) * size.h) / ((CORNERS[2].x - CORNERS[1].x) * size.w));
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(W, H);
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const p = {
          x: CORNERS[1].x + (i / (W - 1)) * (CORNERS[2].x - CORNERS[1].x),
          y: CORNERS[0].y + (j / (H - 1)) * (CORNERS[1].y - CORNERS[0].y),
        };
        const rgb = mixRgb(weightsAt(p, size.w / size.h), pack.mode);
        const k = (j * W + i) * 4;
        img.data[k] = rgb[0] * 255;
        img.data[k + 1] = rgb[1] * 255;
        img.data[k + 2] = rgb[2] * 255;
        img.data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [pack.mode, size]);

  const next = () => {
    if (idx + 1 >= pack.challenges.length) {
      setPhase('end');
      return;
    }
    setIdx(idx + 1);
    setPhase('mix');
    setHold(0);
    closeSince.current = null;
  };

  const restart = () => {
    setIdx(0);
    setPhase('mix');
    setHold(0);
    closeSince.current = null;
  };

  const onInput = (inp: HandInput, now: number) => {
    setInput(inp);
    if (phase === 'found') {
      const d = nextDwell.update(now, !!inp.pos && inp.pos.x >= NEXT.x && inp.pos.y >= NEXT.y - 0.02);
      setNextProgress(d.progress);
      if (d.fired) next();
      return;
    }
    if (phase !== 'mix') return;
    // A mão conta dentro do triângulo e um pouco fora dele (fica presa à borda)
    if (!inp.pos || inp.pos.x > CORNERS[2].x + 0.05) {
      setWeights(null);
      setHold(0);
      closeSince.current = null;
      return;
    }
    const w = weightsAt(inp.pos, aspect);
    setWeights(w);
    if (dist(w, target) <= MATCH) {
      closeSince.current = closeSince.current ?? now;
      const h = Math.min(1, (now - closeSince.current) / HOLD_MS);
      setHold(h);
      if (h >= 1) {
        setPhase('found');
        nextDwell.reset();
        const p = pointAt(target);
        celebrate({ x: p.x, y: p.y }, 110);
      }
    } else {
      closeSince.current = null;
      setHold(0);
    }
  };

  const shown: W | null = phase === 'found' ? target : weights;
  const mixed = shown ? css(mixRgb(shown, pack.mode)) : null;
  const targetCss = css(mixRgb(target, pack.mode));
  const similarity = weights ? Math.max(0, Math.round((1 - dist(weights, target) / 0.6) * 100)) : 0;
  const pts = CORNERS.map((c) => `${c.x * size.w},${c.y * size.h}`).join(' ');
  const cursor = shown ? pointAt(shown) : null;

  if (phase === 'end') {
    return (
      <ProjectionShell onExit={onExit} onKey={(k) => k === 'r' && restart()}>
        <MixSummary pack={pack} onRestart={restart} onExit={onExit} />
      </ProjectionShell>
    );
  }

  return (
    <ProjectionShell
      onExit={onExit}
      onKey={(k) => {
        if ((k === ' ' || k === 'arrowright' || k === 'enter') && phase === 'found') next();
        else if (k === 'p') next();
      }}
    >
      <HandSource homography={homography} onInput={onInput} onStatus={(s) => setStatus(s.message)} onCameraStatusChange={onCameraStatusChange} />

      <TopBar title={pack.title} emoji={pack.emoji} right={`Cor ${idx + 1} de ${pack.challenges.length}`} />

      {/* O triângulo: cinza enquanto procuram, colorido quando acham */}
      <svg aria-hidden="true" className="absolute inset-0 pointer-events-none" width={size.w} height={size.h}>
        <defs>
          <clipPath id="tri">
            <polygon points={pts} />
          </clipPath>
        </defs>
        <polygon points={pts} fill="#f4f4f5" stroke="#d4d4d8" strokeWidth={size.h * 0.006} strokeLinejoin="round" />
        <foreignObject
          x={CORNERS[1].x * size.w}
          y={CORNERS[0].y * size.h}
          width={(CORNERS[2].x - CORNERS[1].x) * size.w}
          height={(CORNERS[1].y - CORNERS[0].y) * size.h}
          clipPath="url(#tri)"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full transition-opacity duration-700"
            style={{ opacity: phase === 'found' ? 1 : 0 }}
          />
        </foreignObject>
      </svg>

      {/* As três primárias nos cantos */}
      {pack.primaries.map((p, i) => {
        const c = CORNERS[i];
        const top = i === 0;
        return (
          <React.Fragment key={p.name}>
            <span
              aria-hidden="true"
              className="absolute w-[6vw] h-[6vw] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.4vw] border-white shadow-[0_0.5vw_1vw_-0.3vw_rgb(0_0_0/0.4)]"
              style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, background: p.css }}
            />
            <span
              className="absolute -translate-x-1/2 font-display font-bold text-[2vw] whitespace-nowrap"
              style={{ left: `${c.x * 100}%`, top: top ? `calc(${c.y * 100}% - 6.4vw)` : `calc(${c.y * 100}% + 3.4vw)` }}
            >
              {p.name}
            </span>
          </React.Fragment>
        );
      })}

      {/* A mistura no lugar da mão */}
      {cursor && mixed && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute w-[7vw] h-[7vw] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0.5vw_0.8vw_rgb(0_0_0/0.35)]"
          style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
        >
          <circle cx="50" cy="50" r="44" fill={mixed} stroke="white" strokeWidth="8" />
          {hold > 0 && (
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#16a34a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - hold)}
              transform="rotate(-90 50 50)"
            />
          )}
        </svg>
      )}

      {/* Painel: a cor pedida, a mistura e as proporções */}
      <div className="absolute left-[64%] right-[3%] top-[9%] flex flex-col gap-[1.4vw]">
        {phase === 'found' ? (
          <div className="rounded-[1.4vw] bg-[#1f7a3a] text-white px-[1.8vw] py-[1.4vw] pop-in">
            <p className="font-display font-bold text-[3.4vw] leading-none">Vocês fizeram {ch.name.toLowerCase()}! 🎉</p>
            <p className="text-[1.8vw] font-semibold leading-snug mt-[0.8vw] opacity-95">{ch.fact}</p>
          </div>
        ) : (
          <div>
            <p className="text-[1.8vw] font-bold text-zinc-500">Façam a cor</p>
            <p className="font-display font-bold text-[4.6vw] leading-none tracking-tight">{ch.name}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-[1.2vw]">
          <Swatch label="Pedida" color={targetCss} />
          <Swatch label="Mistura de vocês" color={mixed} />
        </div>

        <div className="space-y-[0.7vw]">
          {pack.primaries.map((p, i) => {
            const v = shown ? Math.round(shown[i] * 100) : 0;
            return (
              <div key={p.name} className="flex items-center gap-[1vw]">
                <span className="w-[9vw] text-[1.6vw] font-semibold">{p.name}</span>
                <span className="flex-1 h-[1.6vw] rounded-full bg-zinc-100 overflow-hidden border-[0.12vw] border-zinc-200">
                  <span className="block h-full rounded-full transition-[width] duration-150" style={{ width: `${v}%`, background: p.css }} />
                </span>
                <span className="w-[4.5vw] text-right text-[1.6vw] font-bold tabular-nums">{v}%</span>
              </div>
            );
          })}
        </div>

        {phase === 'mix' && (
          <p className="text-[1.8vw] font-semibold text-zinc-700">
            {weights
              ? similarity >= 85
                ? 'Quase! Segurem a mão aí.'
                : similarity >= 60
                  ? `Esquentando: ${similarity}% parecida`
                  : `Frio: ${similarity}% parecida`
              : 'Coloquem a mão dentro do triângulo'}
          </p>
        )}
      </div>

      {phase === 'found' && (
        <HandButton rect={NEXT} progress={nextProgress} onClick={next}>
          {idx + 1 >= pack.challenges.length ? 'Ver as cores' : 'Próxima cor'}
          <ArrowRight className="w-[2.2vw] h-[2.2vw]" aria-hidden="true" />
        </HandButton>
      )}

      <HandCursor input={input} color="#3f3f46" />

      <Footer
        status={status ?? (homography ? null : 'Teste com o mouse: passeie dentro do triângulo')}
        hints="Espaço: próxima · P: pular · Esc: sair"
      />
    </ProjectionShell>
  );
};

const Swatch: React.FC<{ label: string; color: string | null }> = ({ label, color }) => (
  <div className="rounded-[1.4vw] border-[0.15vw] border-zinc-200 overflow-hidden">
    <div
      className="h-[11vw] transition-colors duration-150"
      style={{ background: color ?? 'repeating-linear-gradient(45deg, #f4f4f5 0 1vw, #e4e4e7 1vw 2vw)' }}
    />
    <p className="px-[1vw] py-[0.6vw] text-[1.5vw] font-semibold text-zinc-600">{label}</p>
  </div>
);

const MixSummary: React.FC<{ pack: MixPack; onRestart: () => void; onExit: () => void }> = ({ pack, onRestart, onExit }) => {
  useEffect(() => {
    celebrate({ x: 0.5, y: 0.3 }, 140);
  }, []);
  return (
    <div className="absolute inset-0 px-[5%] py-[4%] flex flex-col gap-[3vw]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[1.7vw] font-bold text-zinc-500">
            {pack.emoji} {pack.title}
          </p>
          <h1 className="font-display font-bold text-[4.4vw] leading-none tracking-tight mt-[0.6vw]">As cores que a turma fez</h1>
        </div>
        <div className="flex gap-[1vw]">
          <button onClick={onExit} className="inline-flex items-center gap-[0.6vw] rounded-full bg-zinc-200 px-[1.8vw] py-[0.9vw] text-[1.5vw] font-semibold">
            <Undo2 className="w-[1.5vw] h-[1.5vw]" aria-hidden="true" />
            Outra atividade
          </button>
          <button onClick={onRestart} className="inline-flex items-center gap-[0.6vw] rounded-full bg-primary text-white px-[1.8vw] py-[0.9vw] text-[1.5vw] font-semibold">
            <RotateCcw className="w-[1.5vw] h-[1.5vw]" aria-hidden="true" />
            Jogar de novo
          </button>
        </div>
      </div>
      <ul className="grid grid-cols-5 gap-[1.5vw]">
        {pack.challenges.map((c) => (
          <li key={c.id} className="rounded-[1.4vw] border-[0.15vw] border-zinc-200 overflow-hidden">
            <div className="h-[12vw]" style={{ background: css(mixRgb(c.weights, pack.mode)) }} />
            <div className="px-[1vw] py-[0.8vw]">
              <p className="font-display font-bold text-[2vw] leading-tight">{c.name}</p>
              <p className="text-[1.3vw] text-zinc-600 mt-[0.3vw]">
                {pack.primaries
                  .map((p, i) => (c.weights[i] > 0 ? `${Math.round(c.weights[i] * 100)}% ${p.name.toLowerCase()}` : null))
                  .filter(Boolean)
                  .join(' + ')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
