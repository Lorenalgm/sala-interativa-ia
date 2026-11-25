import React, { useEffect, useMemo, useRef } from 'react';
import { Homography, Point, applyHomography, clamp01 } from '../../services/homography';
import {
  LOST_MS_HAND,
  PINCH_CLOSED,
  PINCH_HOLD_MS,
  PINCH_OPEN,
  PinchGate,
  PointFilter,
} from '../../services/pointer';
import { useBoardCamera } from '../Board/useBoardCamera';
import { GhostSmoother } from '../Board/ghost';
import { HandGhost } from '../Board/HandGhost';

// O que os modelos com a mão recebem a cada quadro, venha da câmera ou do mouse
export interface HandInput {
  pos: Point | null; // centro da palma, suavizado, em fração da tela
  closed: boolean; // pinça fechada (já firme)
  pinchProgress: number; // 0 a 1: os dedos se aproximando
  ghost: Point[] | null; // os 21 pontos da mão, em fração da tela (só com câmera)
}

export interface HandStatus {
  message: string | null; // aviso para o rodapé ("Não estou vendo a mão")
}

type OnInput = (input: HandInput, now: number) => void;

// Câmera de verdade: mão lida pelo MediaPipe e levada para a tela pela calibração
export const CameraHandSource: React.FC<{
  homography: Homography;
  onInput: OnInput;
  onStatus: (s: HandStatus) => void;
  onCameraStatusChange?: (active: boolean) => void;
}> = ({ homography, onInput, onStatus, onCameraStatusChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const filter = useMemo(() => new PointFilter(), []);
  const gate = useMemo(() => new PinchGate(), []);
  const smoother = useMemo(() => new GhostSmoother(), []);
  const st = useRef({ last: 0, lastSeen: 0, pos: null as Point | null, ghost: null as Point[] | null });

  const { error, handError, handsReady } = useBoardCamera(
    videoRef,
    ({ hand }, now) => {
      const s = st.current;
      const dt = s.last ? (now - s.last) / 1000 : 0;
      s.last = now;
      if (hand) {
        s.pos = filter.filter(clamp01(applyHomography(homography, hand.palm)), dt);
        s.lastSeen = now;
        const g = smoother.update(homography, hand, window.innerWidth, window.innerHeight);
        const pos = s.pos;
        s.ghost = g.shape ? g.shape.map((o) => ({ x: pos.x + o.x, y: pos.y + o.y })) : null;
      } else if (s.pos && now - s.lastSeen > LOST_MS_HAND) {
        // Sumiu de vez; por um instante, mantém a última posição
        s.pos = null;
        s.ghost = null;
        filter.reset();
        smoother.reset();
      }
      const ratio = gate.feed(hand ? hand.pinch : null, now);
      onInput(
        {
          pos: s.pos,
          closed: gate.heldFor(now) >= PINCH_HOLD_MS,
          pinchProgress: ratio === null ? 0 : Math.min(1, Math.max(0, (PINCH_OPEN - ratio) / (PINCH_OPEN - PINCH_CLOSED))),
          ghost: s.ghost,
        },
        now
      );
    },
    { markers: false, hands: true },
    onCameraStatusChange
  );

  useEffect(() => {
    onStatus({
      message: error
        ? 'Câmera indisponível. Confira a permissão do navegador.'
        : handError
          ? 'Leitura da mão indisponível.'
          : !handsReady
            ? 'Carregando a leitura da mão…'
            : null,
    });
  }, [error, handError, handsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return <video ref={videoRef} autoPlay playsInline muted className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none" />;
};

// Teste sem câmera: o mouse faz o papel da mão e o botão apertado é a pinça
export const MouseHandSource: React.FC<{ onInput: OnInput }> = ({ onInput }) => {
  const handler = useRef(onInput);
  handler.current = onInput;

  useEffect(() => {
    let pos: Point | null = null;
    let down = false;
    let frame = 0;
    const move = (e: PointerEvent) => {
      pos = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    const press = (e: PointerEvent) => {
      move(e);
      down = true;
    };
    const release = () => {
      down = false;
    };
    const leave = () => {
      pos = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    document.documentElement.addEventListener('pointerleave', leave);
    const step = () => {
      handler.current({ pos, closed: down, pinchProgress: down ? 1 : 0, ghost: null }, performance.now());
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return null;
};

// Escolhe a fonte: com calibração usa a câmera; sem ela, o mouse
export const HandSource: React.FC<{
  homography: Homography | null;
  onInput: OnInput;
  onStatus: (s: HandStatus) => void;
  onCameraStatusChange?: (active: boolean) => void;
}> = ({ homography, ...rest }) =>
  homography ? (
    <CameraHandSource homography={homography} {...rest} />
  ) : (
    <MouseHandSource onInput={rest.onInput} />
  );

// A mão desenhada na projeção: o esqueleto (câmera) ou um círculo no lugar do mouse
export const HandCursor: React.FC<{ input: HandInput; color?: string }> = ({ input, color = '#0040dd' }) => {
  if (!input.pos) return null;
  if (input.ghost) {
    return <HandGhost points={input.ghost} closed={input.closed} progress={input.pinchProgress} />;
  }
  return (
    <span
      aria-hidden="true"
      className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.35vw] border-white shadow-[0_0_0_0.25vw_rgba(0,0,0,0.25)]"
      style={{
        left: `${input.pos.x * 100}%`,
        top: `${input.pos.y * 100}%`,
        width: input.closed ? '2.2vw' : '3vw',
        height: input.closed ? '2.2vw' : '3vw',
        background: input.closed ? '#16a34a' : color,
        opacity: 0.85,
      }}
    />
  );
};

export const EMPTY_INPUT: HandInput = { pos: null, closed: false, pinchProgress: 0, ghost: null };
