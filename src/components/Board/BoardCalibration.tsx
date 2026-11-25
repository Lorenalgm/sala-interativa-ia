import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Maximize, Play } from 'lucide-react';
import { ArucoCardDetector, markerSvg } from '../../services/arucoDetector';
import {
  BoardCalibrator,
  CALIBRATION_FRAMES,
  CALIBRATION_IDS,
  CALIBRATION_INSETS,
  CalibrationState,
  DEFAULT_INSET,
  MAX_ERROR,
  calibrationLayout,
  markerCenter,
} from '../../services/boardCalibration';
import { Homography, applyHomography } from '../../services/homography';
import { cropMarker } from '../CardGenerator/cropMarker';
import { BoardFrame, useBoardCamera } from './useBoardCamera';
import { BoardInput } from './boardInput';

interface BoardCalibrationProps {
  input: BoardInput;
  onBack: () => void;
  onDone: (homography: Homography) => void;
  onCameraStatusChange?: (active: boolean) => void;
}

const INSET_KEY = 'board-calibration-inset';

const CORNER_NAMES = ['em cima à esquerda', 'em cima à direita', 'embaixo à direita', 'embaixo à esquerda'];

// Tela branca com os 4 marcadores nos cantos. Quando a câmera lê cada um 10 vezes,
// o app aprende onde está a projeção; depois a tela vira um teste: um ponto segue a paleta.
export const BoardCalibration: React.FC<BoardCalibrationProps> = ({ input, onBack, onDone, onCameraStatusChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [inset, setInset] = useState<number>(() => {
    const saved = Number(localStorage.getItem(INSET_KEY));
    return CALIBRATION_INSETS.some((o) => o.value === saved) ? saved : DEFAULT_INSET;
  });
  useEffect(() => localStorage.setItem(INSET_KEY, String(inset)), [inset]);

  const layout = useMemo(() => calibrationLayout(size.w, size.h, inset), [size, inset]);
  // O painel do meio não pode cobrir os marcadores
  const panelWidth = Math.max(280, size.w - 2 * (layout.pad + layout.size) - 32);
  const calibrator = useMemo(() => new BoardCalibrator(layout, size.w / size.h), [layout, size]);
  const svgs = useMemo(
    () => Object.fromEntries(CALIBRATION_IDS.map((id) => [id, cropMarker(markerSvg(id))])),
    []
  );

  const [state, setState] = useState<CalibrationState>(calibrator.result);
  const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
  const lastPaddleAt = useRef(0);
  useEffect(() => setState(calibrator.result), [calibrator]);

  const { error, handError, handsReady, stats } = useBoardCamera(
    videoRef,
    ({ markers, hand }: BoardFrame, now: number) => {
      const next = calibrator.feed(ArucoCardDetector.calibrationOnly(markers));
      setState((prev) =>
        prev.streak === next.streak &&
        prev.seen.join() === next.seen.join() &&
        prev.error === next.error &&
        prev.homography === next.homography &&
        Math.abs(prev.markerPx - next.markerPx) < 1
          ? prev
          : next
      );
      if (next.homography) {
        // No teste, o ponto segue a paleta ou a palma da mão
        const target =
          input === 'hand'
            ? hand?.palm
            : (() => {
                const paddle = ArucoCardDetector.paddlesOnly(markers)[0];
                return paddle ? markerCenter(paddle.corners) : undefined;
              })();
        if (target) {
          lastPaddleAt.current = now;
          setDot(applyHomography(next.homography, target));
        } else if (now - lastPaddleAt.current > 300) {
          setDot(null);
        }
      }
    },
    { markers: !state.homography || input === 'paddle', hands: input === 'hand' },
    onCameraStatusChange
  );

  const goFullscreen = () => document.documentElement.requestFullscreen?.().catch(() => undefined);

  const done = state.homography !== null;
  const failed = !done && state.error !== null;

  let message = 'Aponte a câmera para o quadro, de modo que os 4 marcadores apareçam.';
  if (error) message = 'Não foi possível abrir a câmera. Confira a permissão do navegador.';
  else if (handError) message = 'Não foi possível carregar a leitura da mão. Volte e use a paleta.';
  else if (done) message = `Calibrado. ${input === 'hand' ? 'Passe a mão aberta pelos 4 cantos para testar o ponto.' : 'Passe uma paleta pelos 4 cantos para testar o ponto.'}`;
  else if (failed) {
    const worst = state.worstId !== null ? CALIBRATION_IDS.indexOf(state.worstId as (typeof CALIBRATION_IDS)[number]) : -1;
    message = `A leitura ficou imprecisa (erro de ${(state.error! * 100).toFixed(1)}%, o máximo é ${(MAX_ERROR * 100).toFixed(1)}%)${worst >= 0 ? `, pior no marcador ${CORNER_NAMES[worst]}` : ''}. Tentando de novo… Se repetir, deixe a câmera de frente para o quadro e veja se esse canto não está com reflexo ou cortado.`;
  }
  else if (state.seen.length > 0 && state.seen.length < 4)
    message = `Faltam ${4 - state.seen.length} marcador(es). Se a borda da projeção está embaçada ou cortada, traga os marcadores para dentro.`;
  else if (state.streak > 0 || state.seen.length === 4) message = 'Lendo… mantenha a câmera parada.';

  return (
    <div className="fixed inset-0 z-50 bg-white text-zinc-900 overflow-hidden">
      {!done && CALIBRATION_IDS.map((id) => {
        const [tl] = layout.corners[id];
        return (
          <div
            key={id}
            aria-label={`Marcador de calibração ${id}`}
            className="absolute bg-white [&>svg]:w-full [&>svg]:h-full"
            style={{
              left: tl.x * size.w,
              top: tl.y * size.h,
              width: layout.size,
              height: layout.size,
            }}
            dangerouslySetInnerHTML={{ __html: svgs[id] }}
          />
        );
      })}

      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div style={{ maxWidth: Math.min(576, panelWidth) }} className="pointer-events-auto w-full bg-white border border-zinc-300 rounded-2xl shadow-lg p-5 space-y-4">
          <h1 className="text-2xl font-extrabold">Calibrar a lousa</h1>

          <div className="aspect-video bg-neutral rounded-xl overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
          </div>

          <p role="status" className={`text-base leading-snug ${failed || error || handError ? 'text-red-800' : ''}`}>
            {message}
          </p>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm" aria-label="Marcadores vistos">
            {CALIBRATION_IDS.map((id, i) => {
              const ok = state.seen.includes(id);
              return (
                <li key={id} className={`flex items-center gap-1.5 ${ok ? 'text-green-700 font-semibold' : 'text-zinc-500'}`}>
                  {ok ? <Check className="w-4 h-4" /> : <span className="w-4 text-center">·</span>}
                  #{id} {CORNER_NAMES[i]}
                </li>
              );
            })}
          </ul>

          {!done && (
            <fieldset className="flex flex-wrap items-center gap-2 text-sm">
              <legend className="sr-only">Distância dos marcadores até a borda</legend>
              <span className="text-zinc-600">Marcadores:</span>
              {CALIBRATION_INSETS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={inset === o.value}
                  onClick={() => setInset(o.value)}
                  className={`btn btn-xs rounded-full ${inset === o.value ? 'btn-primary' : ''}`}
                >
                  {o.label}
                </button>
              ))}
            </fieldset>
          )}

          <p className="text-sm text-zinc-600 tabular-nums">
            {input === 'hand' && !handsReady && !handError && 'Carregando a leitura da mão… '}
            {done ? 'Pronto' : `Leituras de cada canto: ${state.streak} de ${CALIBRATION_FRAMES}`}
            {state.markerPx > 0 && ` · marcador com ${Math.round(state.markerPx)} px na imagem`}
            {stats && ` · ${stats.fps} quadros/s · ${stats.detectMs} ms por leitura`}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onBack} className="btn btn-sm rounded-full">
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
            <button onClick={goFullscreen} className="btn btn-sm">
              <Maximize className="w-4 h-4" />
              Tela cheia
            </button>
            {done && (
              <>
                <button onClick={() => { calibrator.reset(); setState(calibrator.result); setDot(null); }} className="btn btn-sm">
                  Calibrar de novo
                </button>
                <button onClick={() => onDone(state.homography!)} className="btn btn-sm btn-primary ml-auto">
                  <Play className="w-4 h-4" />
                  Começar a rodada
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {dot && (
        <span
          aria-hidden="true"
          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-accent border-4 border-white shadow-md pointer-events-none"
          style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%` }}
        />
      )}
    </div>
  );
};
