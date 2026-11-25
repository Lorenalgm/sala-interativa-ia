import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Undo2 } from 'lucide-react';
import { ScalePack } from '../../data/handActivities';
import { Homography } from '../../services/homography';
import { EMPTY_INPUT, HandCursor, HandInput, HandSource } from './handInput';
import { Dwell, Footer, HandButton, ProjectionShell, Rect, TopBar, celebrate, formatNumber, inRect } from './projection';

interface WhereIsPlayerProps {
  pack: ScalePack;
  homography: Homography | null; // null: teste com o mouse
  onExit: () => void;
  onCameraStatusChange?: (active: boolean) => void;
}

// Geometria da tela, em frações
const X0 = 0.08; // começo da reta
const X1 = 0.92; // fim da reta
const LINE_Y = 0.6;
const BAND: Rect = { x: 0.02, y: 0.4, w: 0.96, h: 0.42 }; // faixa em que a mão escolhe
const NEXT: Rect = { x: 0.74, y: 0.86, w: 0.23, h: 0.1 };

const STILL_MS = 1500; // mão parada por esse tempo trava o palpite
const STILL_RANGE = 0.012; // quanto a mão pode tremer e ainda contar como parada (fração da largura)
const SETTLE_MS = 600; // depois da contagem, um instante antes de valer
const INTRO_SECONDS = 3;

type Rating = 'bullseye' | 'close' | 'far';

const RATING: Record<Rating, { title: string; bg: string; chip: string; emoji: string }> = {
  bullseye: { title: 'Na mosca!', bg: 'bg-[#1f7a3a] text-white', chip: 'bg-[#e8f5ec] text-[#14532d]', emoji: '🎯' },
  close: { title: 'Pertinho!', bg: 'bg-amber-400 text-zinc-900', chip: 'bg-amber-100 text-amber-950', emoji: '👏' },
  far: { title: 'Ainda longe', bg: 'bg-zinc-800 text-white', chip: 'bg-zinc-200 text-zinc-800', emoji: '🧭' },
};

const rate = (error: number, range: number): Rating => {
  const r = Math.abs(error) / range;
  return r <= 0.035 ? 'bullseye' : r <= 0.09 ? 'close' : 'far';
};

export interface WhereIsResult {
  questionId: string;
  guess: number;
  rating: Rating;
}

type Phase = 'intro' | 'aim' | 'reveal' | 'end';

// "Onde fica?": a turma leva a mão até o ponto da reta e para; a tela mostra onde era e quão perto chegou
export const WhereIsPlayer: React.FC<WhereIsPlayerProps> = ({ pack, homography, onExit, onCameraStatusChange }) => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [count, setCount] = useState(INTRO_SECONDS);
  const [input, setInput] = useState<HandInput>(EMPTY_INPUT);
  const [still, setStill] = useState(0); // 0 a 1: o anel do palpite
  const [guess, setGuess] = useState<number | null>(null);
  const [results, setResults] = useState<WhereIsResult[]>([]);
  const [nextProgress, setNextProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const samples = useRef<{ t: number; x: number }[]>([]);
  const aimSince = useRef(0);
  const locked = useRef(false);
  const nextDwell = useMemo(() => new Dwell(1200), []);

  const q = pack.questions[idx];
  const range = pack.max - pack.min;
  const toX = (v: number) => X0 + ((v - pack.min) / range) * (X1 - X0);
  const toValue = (x: number) => pack.min + Math.min(1, Math.max(0, (x - X0) / (X1 - X0))) * range;

  // Contagem antes de cada pergunta
  useEffect(() => {
    if (phase !== 'intro') return;
    if (count <= 0) {
      setPhase('aim');
      aimSince.current = performance.now();
      samples.current = [];
      locked.current = false;
      return;
    }
    const t = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  const lock = (value: number) => {
    if (locked.current) return; // um quadro a mais antes de a tela trocar não registra de novo
    locked.current = true;
    const rating = rate(value - q.answer, range);
    setGuess(value);
    setStill(0);
    setResults((r) => [...r, { questionId: q.id, guess: value, rating }]);
    setPhase('reveal');
    nextDwell.reset();
    if (rating === 'bullseye') celebrate({ x: toX(q.answer), y: LINE_Y - 0.1 });
  };

  const next = () => {
    if (idx + 1 >= pack.questions.length) {
      setPhase('end');
      return;
    }
    setIdx(idx + 1);
    setGuess(null);
    setCount(INTRO_SECONDS);
    setPhase('intro');
  };

  // Desfaz o último palpite (palpite sem querer): volta a mirar a mesma pergunta
  const redo = () => {
    if (phase !== 'reveal') return;
    setResults((r) => r.slice(0, -1));
    setGuess(null);
    samples.current = [];
    aimSince.current = performance.now();
    locked.current = false;
    setPhase('aim');
  };

  const restart = () => {
    setIdx(0);
    setResults([]);
    setGuess(null);
    setCount(INTRO_SECONDS);
    setPhase('intro');
  };

  const onInput = (inp: HandInput, now: number) => {
    setInput(inp);
    if (phase === 'aim') {
      const p = inp.pos;
      if (!p || !inRect(BAND, p) || now - aimSince.current < SETTLE_MS) {
        samples.current = [];
        setStill(0);
        return;
      }
      if (inp.closed) return lock(toValue(p.x)); // juntar os dedos também trava
      const s = [...samples.current.filter((v) => now - v.t <= STILL_MS + 200), { t: now, x: p.x }];
      samples.current = s;
      // Há quanto tempo a mão está parada: volta no tempo enquanto o tremor cabe na folga
      let lo = p.x;
      let hi = p.x;
      let since = now;
      for (let i = s.length - 1; i >= 0; i--) {
        lo = Math.min(lo, s[i].x);
        hi = Math.max(hi, s[i].x);
        if (hi - lo > STILL_RANGE) break;
        since = s[i].t;
      }
      const progress = Math.min(1, (now - since) / STILL_MS);
      setStill(progress);
      if (progress >= 1) {
        const recent = s.filter((v) => v.t >= since);
        lock(toValue(recent.reduce((a, v) => a + v.x, 0) / recent.length));
      }
    } else if (phase === 'reveal') {
      const d = nextDwell.update(now, inRect(NEXT, inp.pos, 0.01));
      setNextProgress(d.progress);
      if (d.fired) next();
    }
  };

  const onKey = (k: string) => {
    if (k === ' ' || k === 'arrowright' || k === 'enter') {
      if (phase === 'reveal') next();
      else if (phase === 'intro') setCount(0);
    } else if (k === 'z') redo();
    else if (k === 'p' && phase === 'aim') next();
  };

  const rating = guess !== null ? rate(guess - q.answer, range) : null;
  const minorTicks = useMemo(() => {
    if (!pack.minorStep) return [];
    const out: number[] = [];
    for (let v = pack.min; v <= pack.max + 1e-9; v += pack.minorStep) out.push(v);
    return out.filter((v) => !pack.ticks.some((t) => Math.abs(t.value - v) < 1e-9));
  }, [pack]);

  const handX = phase === 'aim' && input.pos && inRect(BAND, input.pos) ? Math.min(X1, Math.max(X0, input.pos.x)) : null;

  if (phase === 'end') {
    return (
      <ProjectionShell onExit={onExit} onKey={(k) => k === 'r' && restart()}>
        <WhereIsSummary pack={pack} results={results} onRestart={restart} onExit={onExit} />
      </ProjectionShell>
    );
  }

  return (
    <ProjectionShell onExit={onExit} onKey={onKey}>
      <HandSource
        homography={homography}
        onInput={onInput}
        onStatus={(s) => setStatus(s.message)}
        onCameraStatusChange={onCameraStatusChange}
      />

      <TopBar title={pack.title} emoji={pack.emoji} right={`Pergunta ${idx + 1} de ${pack.questions.length}`} />

      {/* Pergunta, ou o resultado depois do palpite */}
      {phase === 'reveal' && rating ? (
        <div className={`absolute left-[3%] right-[3%] top-[9%] h-[22%] rounded-[1.6vw] flex items-center gap-[2.5vw] px-[3vw] ${RATING[rating].bg}`}>
          <span className="text-[6vw] leading-none" aria-hidden="true">{RATING[rating].emoji}</span>
          <span className="min-w-0">
            <span className="block font-display font-bold text-[4.4vw] leading-none tracking-tight">{RATING[rating].title}</span>
            <span className="block text-[2.2vw] font-semibold mt-[0.8vw] opacity-90">
              {q.prompt.replace(/\?$/, '')}: {q.answerLabel}
              {guess !== null && ` · diferença de ${formatNumber(Math.abs(guess - q.answer), pack.decimals)}${pack.unit ?? ''}`}
            </span>
          </span>
        </div>
      ) : (
        <h1 className="absolute left-[3%] right-[3%] top-[9%] h-[22%] flex items-center justify-center text-center font-display font-bold text-[4.6vw] leading-[1.05] tracking-tight">
          {q.prompt}
        </h1>
      )}

      {/* Faixa onde a mão escolhe: só aparece enquanto a turma mira */}
      {phase === 'aim' && (
        <div
          aria-hidden="true"
          className={`absolute rounded-[1.6vw] border-[0.25vw] border-dashed transition-colors ${
            handX !== null ? 'bg-primary/[0.06] border-primary/40' : 'bg-zinc-50 border-zinc-300'
          }`}
          style={{ left: `${BAND.x * 100}%`, top: `${BAND.y * 100}%`, width: `${BAND.w * 100}%`, height: `${BAND.h * 100}%` }}
        />
      )}

      {/* Nomes das pontas (ácido e básico, por exemplo) */}
      {pack.leftLabel && (
        <span className="absolute text-[2vw] font-bold text-zinc-600 whitespace-nowrap" style={{ left: `${X0 * 100}%`, top: `${(LINE_Y - 0.15) * 100}%` }}>
          ← {pack.leftLabel}
        </span>
      )}
      {pack.rightLabel && (
        <span className="absolute text-[2vw] font-bold text-zinc-600 -translate-x-full whitespace-nowrap" style={{ left: `${X1 * 100}%`, top: `${(LINE_Y - 0.15) * 100}%` }}>
          {pack.rightLabel} →
        </span>
      )}

      {/* A reta */}
      <div
        aria-hidden="true"
        className="absolute h-[2.4vh] -translate-y-1/2 rounded-full"
        style={{
          left: `${X0 * 100}%`,
          width: `${(X1 - X0) * 100}%`,
          top: `${LINE_Y * 100}%`,
          background: pack.gradient ?? '#27272a',
        }}
      />
      {minorTicks.map((v) => (
        <span
          key={`m${v}`}
          aria-hidden="true"
          className="absolute w-[0.25vw] h-[3.6vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400"
          style={{ left: `${toX(v) * 100}%`, top: `${LINE_Y * 100}%` }}
        />
      ))}
      {pack.ticks.map((t) => (
        <React.Fragment key={t.value}>
          <span
            aria-hidden="true"
            className="absolute w-[0.4vw] h-[6vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900"
            style={{ left: `${toX(t.value) * 100}%`, top: `${LINE_Y * 100}%` }}
          />
          <span
            className="absolute -translate-x-1/2 font-display font-bold text-[2.8vw] leading-none tabular-nums"
            style={{ left: `${toX(t.value) * 100}%`, top: `${(LINE_Y + 0.055) * 100}%` }}
          >
            {t.label}
          </span>
        </React.Fragment>
      ))}

      {/* Distância entre o palpite e a resposta, marcada na própria reta */}
      {phase === 'reveal' && guess !== null && (
        <span
          aria-hidden="true"
          className="absolute h-[2.4vh] -translate-y-1/2 rounded-full bg-amber-400/80 outline outline-[0.3vh] outline-white"
          style={{
            left: `${Math.min(toX(guess), toX(q.answer)) * 100}%`,
            width: `${Math.abs(toX(guess) - toX(q.answer)) * 100}%`,
            top: `${LINE_Y * 100}%`,
          }}
        />
      )}

      {/* O palpite: alfinete que segue a mão e enche o anel quando ela para */}
      {(handX !== null || (phase === 'reveal' && guess !== null)) && (
        <Pin
          x={phase === 'reveal' && guess !== null ? toX(guess) : (handX as number)}
          progress={phase === 'reveal' ? 1 : still}
          label={phase === 'reveal' ? 'Vocês' : null}
          side={guess !== null && guess > q.answer ? 'right' : 'left'}
          color="#0040dd"
        />
      )}

      {/* A resposta certa */}
      {phase === 'reveal' && (
        <Pin x={toX(q.answer)} progress={1} label={q.answerLabel} side={guess !== null && guess > q.answer ? 'left' : 'right'} color="#1f7a3a" tall />
      )}

      {phase === 'aim' && (
        <p className="absolute left-0 right-0 text-center text-[2.1vw] font-semibold text-zinc-600" style={{ top: `${(BAND.y + BAND.h + 0.03) * 100}%` }}>
          {handX === null
            ? 'Coloque a mão dentro da faixa tracejada'
            : 'Pare a mão onde vocês acham que fica, até o anel encher'}
        </p>
      )}

      {phase === 'reveal' && (
        <>
          <p className="absolute left-[3%] w-[68%] text-[2.1vw] leading-snug font-semibold text-zinc-700 rounded-[1.2vw] bg-zinc-100 px-[1.6vw] py-[1vw]" style={{ top: `${NEXT.y * 100}%`, minHeight: `${NEXT.h * 100}%` }}>
            {q.fact}
          </p>
          <HandButton rect={NEXT} progress={nextProgress} onClick={next}>
            {idx + 1 >= pack.questions.length ? 'Ver resultado' : 'Próxima'}
            <ArrowRight className="w-[2.2vw] h-[2.2vw]" aria-hidden="true" />
          </HandButton>
        </>
      )}

      {phase !== 'intro' && <HandCursor input={input} />}

      <Footer
        status={status ?? (homography ? null : 'Teste com o mouse: pare o mouse ou clique para escolher')}
        hints="Espaço: próxima · Z: refazer o palpite · P: pular · Esc: sair"
      />

      {phase === 'intro' && (
        <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center text-center gap-[2.5vw] px-[6%]">
          <p className="text-[2.2vw] font-semibold text-zinc-500">
            Pergunta {idx + 1} de {pack.questions.length}
          </p>
          <p className="font-display font-bold text-[5.4vw] leading-[1.05] tracking-tight">{q.prompt}</p>
          <p aria-live="polite" className="font-display font-bold text-[10vw] leading-none text-primary tabular-nums">
            {count}
          </p>
        </div>
      )}
    </ProjectionShell>
  );
};

const RING_R = 40;
const RING_LEN = 2 * Math.PI * RING_R;

// Alfinete sobre a reta: haste até a reta e cabeça redonda com o anel de progresso
// O rótulo fica ao lado da cabeça, do lado oposto ao do outro alfinete, para os dois nunca se cobrirem
const Pin: React.FC<{ x: number; progress: number; label: string | null; color: string; tall?: boolean; side?: 'left' | 'right' }> = ({
  x,
  progress,
  label,
  color,
  tall,
  side = 'right',
}) => {
  const headY = LINE_Y - (tall ? 0.2 : 0.12);
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute w-[0.5vw] -translate-x-1/2 rounded-full"
        style={{ left: `${x * 100}%`, top: `${headY * 100}%`, height: `${(LINE_Y - headY) * 100}%`, background: color }}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute w-[5.2vw] h-[5.2vw] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0.4vw_0.6vw_rgb(0_0_0/0.25)]"
        style={{ left: `${x * 100}%`, top: `${headY * 100}%` }}
      >
        <circle cx="50" cy="50" r="46" fill="white" />
        <circle cx="50" cy="50" r={RING_R} fill="none" stroke="#e4e4e7" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={RING_R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_LEN}
          strokeDashoffset={RING_LEN * (1 - progress)}
          transform="rotate(-90 50 50)"
        />
        <circle cx="50" cy="50" r={progress >= 1 ? 26 : 16} fill={color} />
      </svg>
      {label && (
        <span
          className={`absolute -translate-y-1/2 whitespace-nowrap rounded-full px-[1.1vw] py-[0.3vw] font-display font-bold text-[2.2vw] text-white ${
            side === 'left' ? '-translate-x-full' : ''
          }`}
          style={{ left: `calc(${x * 100}% ${side === 'left' ? '-' : '+'} 3.2vw)`, top: `${headY * 100}%`, background: color }}
        >
          {label}
        </span>
      )}
    </>
  );
};

// Fim da atividade: quantas na mosca, perto e longe, e cada pergunta
const WhereIsSummary: React.FC<{
  pack: ScalePack;
  results: WhereIsResult[];
  onRestart: () => void;
  onExit: () => void;
}> = ({ pack, results, onRestart, onExit }) => {
  useEffect(() => {
    if (results.filter((r) => r.rating === 'bullseye').length >= Math.ceil(results.length / 2)) celebrate({ x: 0.5, y: 0.3 }, 140);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const count = (r: Rating) => results.filter((x) => x.rating === r).length;
  return (
    <div className="absolute inset-0 px-[5%] py-[4%] flex flex-col gap-[2.5vw]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[1.7vw] font-bold text-zinc-500">
            {pack.emoji} {pack.title}
          </p>
          <h1 className="font-display font-bold text-[4.4vw] leading-none tracking-tight mt-[0.6vw]">Como a turma foi</h1>
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

      <div className="grid grid-cols-3 gap-[1.5vw]">
        {(['bullseye', 'close', 'far'] as Rating[]).map((r) => (
          <div key={r} className={`rounded-[1.4vw] py-[1.6vw] text-center ${RATING[r].chip}`}>
            <p className="font-display font-bold text-[5.5vw] leading-none tabular-nums">{count(r)}</p>
            <p className="text-[1.8vw] font-semibold mt-[0.6vw]">
              {RATING[r].emoji} {RATING[r].title.replace('!', '')}
            </p>
          </div>
        ))}
      </div>

      <ol className="flex-1 min-h-0 overflow-hidden rounded-[1.4vw] border-[0.15vw] border-zinc-200">
        {pack.questions.map((q, i) => {
          const r = results.find((x) => x.questionId === q.id);
          return (
            <li key={q.id} className={`flex items-center gap-[1.4vw] px-[1.6vw] py-[0.9vw] ${i > 0 ? 'border-t-[0.15vw] border-zinc-200' : ''}`}>
              <span className={`rounded-full px-[1vw] py-[0.2vw] text-[1.4vw] font-bold whitespace-nowrap ${r ? RATING[r.rating].chip : 'bg-zinc-100 text-zinc-500'}`}>
                {r ? RATING[r.rating].title.replace('!', '') : 'Pulada'}
              </span>
              <span className="flex-1 min-w-0 text-[1.7vw] font-semibold truncate">{q.prompt}</span>
              <span className="text-[1.6vw] text-zinc-600 tabular-nums whitespace-nowrap">
                {r ? `vocês: ${formatNumber(r.guess, pack.decimals)} · certo: ${q.answerLabel}` : `certo: ${q.answerLabel}`}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
