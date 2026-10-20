import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { Homography, Point, applyHomography, computeAffine } from '../../services/homography';
import { PINCH_CLOSED, PINCH_HOLD_MS, PINCH_OPEN, PointFilter } from '../../services/pointer';
import { BoardFrame, useBoardCamera } from './useBoardCamera';
import { HandGhost } from './HandGhost';
import { GhostSmoother } from './ghost';

interface HandCalibrationProps {
  baseHomography: Homography; // calibração pelos marcadores, usada para mostrar o ponto enquanto isso
  onBack: () => void;
  onDone: (homography: Homography) => void;
  onCameraStatusChange?: (active: boolean) => void;
}

// A mão fica na frente do quadro, então a câmera a vê deslocada. Aqui o professor encosta a palma
// em 5 alvos e junta os dedos; o app ajusta a conversão para a altura em que a mão fica de verdade.
const TARGETS: Point[] = [
  { x: 0.5, y: 0.5 },
  { x: 0.12, y: 0.15 },
  { x: 0.88, y: 0.15 },
  { x: 0.88, y: 0.85 },
  { x: 0.12, y: 0.85 },
];
const SAMPLES = 10; // quadros recentes guardados
const SKIP_LAST = 3; // os últimos quadros, em que a pinça pode ter mexido a mão, não entram
const STILL = 0.35; // a palma pode variar até essa fração do tamanho da mão nos quadros usados
const MAX_ERROR = 0.06; // erro aceito, como fração da largura da tela

interface Sample {
  palm: Point;
  size: number; // punho até a base do dedo médio, em px da imagem
}

const median = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];

// Erro máximo (fração da largura) de um ajuste afim sobre os pontos dados
function fitError(src: Point[], dst: Point[], aspect: number) {
  const h = computeAffine(src, dst);
  if (!h) return null;
  const error = Math.max(
    ...src.map((p, i) => {
      const q = applyHomography(h, p);
      return Math.hypot(q.x - dst[i].x, (q.y - dst[i].y) / aspect);
    })
  );
  return { h, error };
}

export const HandCalibration: React.FC<HandCalibrationProps> = ({
  baseHomography,
  onBack,
  onDone,
  onCameraStatusChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recent = useRef<Sample[]>([]);
  const latched = useRef(true); // exige abrir a pinça antes do primeiro alvo
  const closedSince = useRef<number | null>(null);
  const [captured, setCaptured] = useState<(Point | null)[]>(TARGETS.map(() => null));
  const [notice, setNotice] = useState<string | null>(null);
  const ghostSmoother = useMemo(() => new GhostSmoother(), []);
  const palmFilter = useMemo(() => new PointFilter(), []);
  const lastFrameAt = useRef(0);
  const [ghost, setGhost] = useState<{ points: Point[]; pinch: number } | null>(null);

  const step = captured.findIndex((c) => c === null);
  const complete = step === -1;

  const fit = useMemo(() => {
    if (!complete) return null;
    const aspect = window.innerWidth / window.innerHeight;
    return fitError(captured as Point[], TARGETS, aspect);
  }, [captured, complete]);

  // Se o ajuste ficou ruim, descobre qual alvo estragou (o que, sem ele, deixa os outros 4 mais certos)
  useEffect(() => {
    if (!fit || fit.error <= MAX_ERROR) return;
    const aspect = window.innerWidth / window.innerHeight;
    const pts = captured as Point[];
    let worst = -1;
    let best = Infinity;
    pts.forEach((_, i) => {
      const rest = pts.filter((__, j) => j !== i);
      const f = fitError(rest, TARGETS.filter((__, j) => j !== i), aspect);
      if (f && f.error < best) {
        best = f.error;
        worst = i;
      }
    });
    if (worst >= 0 && best <= MAX_ERROR) {
      setCaptured((prev) => prev.map((c, i) => (i === worst ? null : c)));
      setNotice(`O alvo ${worst + 1} não ficou bom. Refaça só ele.`);
    } else {
      setNotice('Os pontos não bateram. Refaça, com a mão sempre na mesma altura e bem à vista da câmera.');
    }
  }, [fit]); // eslint-disable-line react-hooks/exhaustive-deps

  const { error, handError, handsReady } = useBoardCamera(
    videoRef,
    ({ hand }: BoardFrame, now: number) => {
      if (!hand) {
        recent.current = [];
        closedSince.current = null;
        ghostSmoother.reset();
        palmFilter.reset();
        setGhost(null);
        return;
      }
      const size = Math.hypot(
        hand.landmarks[9].x - hand.landmarks[0].x,
        hand.landmarks[9].y - hand.landmarks[0].y
      );
      recent.current = [...recent.current.slice(-(SAMPLES - 1)), { palm: hand.palm, size }];
      // Depois de calibrado, a sombra já usa o ajuste novo; antes, a calibração dos marcadores
      const g = ghostSmoother.update(
        fit && fit.error <= MAX_ERROR ? fit.h : baseHomography,
        hand,
        window.innerWidth,
        window.innerHeight
      );
      // A palma também passa pelo filtro do ponteiro, senão a sombra treme mais que na rodada
      const dt = lastFrameAt.current ? (now - lastFrameAt.current) / 1000 : 0;
      lastFrameAt.current = now;
      const palm = palmFilter.filter(g.palm, dt);
      setGhost(
        g.shape && {
          pinch: g.pinch,
          points: g.shape.map((o) => ({ x: palm.x + o.x, y: palm.y + o.y })),
        }
      );

      if (hand.pinch >= PINCH_OPEN) latched.current = false;
      if (hand.pinch <= PINCH_CLOSED) closedSince.current = closedSince.current ?? now;
      else closedSince.current = null;
      const held = closedSince.current !== null && now - closedSince.current >= PINCH_HOLD_MS;
      if (complete || latched.current || !held) return;

      latched.current = true;
      const used = recent.current.slice(0, Math.max(0, recent.current.length - SKIP_LAST));
      if (used.length < 3) return;
      const mx = median(used.map((u) => u.palm.x));
      const my = median(used.map((u) => u.palm.y));
      const sz = median(used.map((u) => u.size));
      const wobble = Math.max(...used.map((u) => Math.hypot(u.palm.x - mx, u.palm.y - my)));
      if (wobble > STILL * sz) {
        setNotice('A mão estava se mexendo. Segure parada no alvo e junte os dedos.');
        return;
      }
      setNotice(null);
      setCaptured((prev) => prev.map((c, i) => (i === prev.findIndex((x) => x === null) ? { x: mx, y: my } : c)));
    },
    { markers: false, hands: true },
    onCameraStatusChange
  );

  const good = fit !== null && fit.error <= MAX_ERROR;
  let message =
    notice ??
    `Alvo ${step + 1} de ${TARGETS.length}: encoste a palma da mão no alvo, na altura em que você vai usar, e junte polegar e indicador. A sombra na tela é o que a câmera enxerga da sua mão.`;
  if (error) message = 'Não foi possível abrir a câmera. Confira a permissão do navegador.';
  else if (handError) message = 'Não foi possível carregar a leitura da mão.';
  else if (!handsReady) message = 'Carregando a leitura da mão…';
  else if (good)
    message = `Pronto (erro de ${(fit.error * 100).toFixed(0)}% da largura). Mova a mão pelos cantos para testar a sombra.`;
  else if (notice) message = notice;

  return (
    <div className="fixed inset-0 z-50 bg-white text-zinc-900 overflow-hidden select-none">
      <video ref={videoRef} autoPlay playsInline muted className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none" />

      {TARGETS.map((t, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute -ml-9 -mt-9 w-[4.5rem] h-[4.5rem] rounded-full border-4 flex items-center justify-center font-bold text-xl ${
            captured[i] !== null
              ? 'border-green-600 text-green-700 bg-green-50'
              : i === step
                ? 'border-primary text-primary bg-primary/10 animate-pulse'
                : 'border-zinc-300 text-zinc-400'
          }`}
          style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}
        >
          {i + 1}
        </span>
      ))}

      <div className="absolute left-1/2 top-[30%] -translate-x-1/2 w-full max-w-xl bg-white border border-zinc-300 rounded-2xl shadow-lg p-5 space-y-3">
        <h1 className="text-2xl font-extrabold">Ajustar para a mão</h1>
        <p role="status" className="text-base leading-snug">
          {message}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onBack} className="btn btn-sm rounded-full">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          {captured.some((c) => c !== null) && (
            <button
              onClick={() => {
                setCaptured(TARGETS.map(() => null));
                setNotice(null);
                latched.current = true;
              }}
              className="btn btn-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer
            </button>
          )}
          <button onClick={() => onDone(baseHomography)} className="btn btn-sm">
            Pular
          </button>
          {good && (
            <button onClick={() => onDone(fit.h)} className="btn btn-sm btn-primary ml-auto">
              <Play className="w-4 h-4" />
              Começar a rodada
            </button>
          )}
        </div>
      </div>

      {ghost && (
        <HandGhost
          points={ghost.points}
          closed={ghost.pinch <= PINCH_CLOSED}
          progress={Math.min(1, Math.max(0, (PINCH_OPEN - ghost.pinch) / (PINCH_OPEN - PINCH_CLOSED)))}
        />
      )}
    </div>
  );
};
