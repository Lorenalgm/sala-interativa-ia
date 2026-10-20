import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alternative, Group, Question } from '../../types';
import { ArucoCardDetector } from '../../services/arucoDetector';
import { markerCenter } from '../../services/boardCalibration';
import { Homography, Point, applyHomography, clamp01 } from '../../services/homography';
import { HandReading } from '../../services/handTracker';
import { PADDLE_MARKERS } from '../../services/markerRanges';
import { DwellPointer, PINCH_CLOSED, PINCH_OPEN, PointerState, Zone } from '../../services/pointer';
import { BoardFrame, useBoardCamera } from './useBoardCamera';
import { BoardInputSettings } from './boardInput';
import { HandGhost } from './HandGhost';
import { GhostSmoother } from './ghost';

export interface BoardTurnResult {
  questionId: string;
  prompt: string;
  groupId: string;
  groupName: string;
  correctOption: Alternative;
  chosen: Alternative[]; // as escolhas na ordem, até 2
  correct: boolean;
  firstTry: boolean;
}

interface BoardPlayerProps {
  settings: BoardInputSettings;
  questions: Question[];
  groups: Group[];
  homography: Homography;
  onFinish: (results: BoardTurnResult[]) => void;
  onExit: () => void;
  onCameraStatusChange?: (active: boolean) => void;
}

const LETTERS: Alternative[] = ['A', 'B', 'C', 'D'];

// 2x2 abaixo da pergunta, em frações da tela. O espaço entre as zonas é maior que a folga do ponteiro.
const ZONES: Zone[] = LETTERS.map((letter, i) => ({
  id: letter,
  x: i % 2 === 0 ? 0.04 : 0.52,
  y: i < 2 ? 0.36 : 0.68,
  w: 0.44,
  h: 0.28,
}));

const RING_R = 26;
const RING_LEN = 2 * Math.PI * RING_R;

interface Game {
  idx: number;
  turn: number; // quantas vezes a vez passou; o grupo é turn % grupos
  attempts: number;
  chosen: Alternative[];
  results: BoardTurnResult[];
}

type Feedback =
  | { zone: Alternative; kind: 'right' | 'wrong' | 'reveal'; wrong?: Alternative; firstTry?: boolean }
  | null;

const INTRO_SECONDS = 3;
const RIGHT_MS = 2500;
const WRONG_MS = 2000;
const REVEAL_MS = 5000;

export const BoardPlayer: React.FC<BoardPlayerProps> = ({
  settings,
  questions,
  groups,
  homography,
  onFinish,
  onExit,
  onCameraStatusChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHand = settings.input === 'hand';
  const pointer = useMemo(() => new DwellPointer(isHand ? settings.click : 'dwell', isHand, isHand ? 0.15 : 0), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [game, setGame] = useState<Game>({ idx: 0, turn: 0, attempts: 0, chosen: [], results: [] });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [intro, setIntro] = useState<number | null>(INTRO_SECONDS); // contagem antes de cada pergunta
  const [view, setView] = useState<PointerState>({ pos: null, zoneId: null, progress: 0, fired: null });
  const ghostSmoother = useMemo(() => new GhostSmoother(), []);
  const [ghost, setGhost] = useState<{ points: Point[]; pinch: number } | null>(null);
  const undoStack = useRef<Game[]>([]);
  const timer = useRef<number | null>(null);
  const handRef = useRef<HandReading | null>(null);

  const question = questions[game.idx];
  const groupIndex = game.turn % groups.length;
  const group = groups[groupIndex];
  const paddleId = PADDLE_MARKERS.min + groupIndex;

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  // A contagem regressiva antes de cada pergunta diz quem vai responder
  useEffect(() => {
    if (intro === null) return;
    const t = window.setTimeout(() => setIntro(intro > 1 ? intro - 1 : null), 1000);
    return () => window.clearTimeout(t);
  }, [intro]);

  const later = (ms: number, fn: () => void) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  const finishTurn = (result: BoardTurnResult) => {
    const results = [...game.results, result];
    pointer.reset();
    setFeedback(null);
    if (game.idx + 1 >= questions.length) {
      onFinish(results);
      return;
    }
    setGame({ idx: game.idx + 1, turn: game.turn + 1, attempts: 0, chosen: [], results });
    setIntro(INTRO_SECONDS);
  };

  const choose = (option: Alternative) => {
    if (feedback || intro !== null || !question) return;
    undoStack.current.push(game);
    const chosen = [...game.chosen, option];
    const base = {
      questionId: question.id,
      prompt: question.prompt,
      groupId: group.id,
      groupName: group.name,
      correctOption: question.correctOption,
      chosen,
    };
    if (option === question.correctOption) {
      setFeedback({ zone: option, kind: 'right', firstTry: game.attempts === 0 });
      later(RIGHT_MS, () => finishTurn({ ...base, correct: true, firstTry: game.attempts === 0 }));
    } else if (game.attempts >= 1) {
      // Segundo erro: mostra a certa e segue
      setFeedback({ zone: question.correctOption, kind: 'reveal', wrong: option });
      later(REVEAL_MS, () => finishTurn({ ...base, correct: false, firstTry: false }));
    } else {
      setFeedback({ zone: option, kind: 'wrong' });
      later(WRONG_MS, () => {
        pointer.reset();
        setFeedback(null);
        setGame({ ...game, attempts: 1, chosen });
      });
    }
  };

  const skipTurn = () => {
    if (feedback) return;
    undoStack.current.push(game);
    pointer.reset();
    setGame({ ...game, turn: game.turn + 1, attempts: 0, chosen: [] });
    setIntro(INTRO_SECONDS);
  };

  const undo = () => {
    if (feedback) return;
    const previous = undoStack.current.pop();
    if (!previous) return;
    pointer.reset();
    setGame(previous);
    setIntro(INTRO_SECONDS);
  };

  const { error, handError, handsReady, stats } = useBoardCamera(
    videoRef,
    ({ markers, hand }: BoardFrame, now) => {
      if (feedback || intro !== null) return;
      let point = null;
      let pinch: number | null = null;
      if (isHand) {
        if (hand) {
          point = clamp01(applyHomography(homography, hand.palm));
          pinch = hand.pinch;
        }
        handRef.current = hand;
      } else {
        const paddle = ArucoCardDetector.paddlesOnly(markers).find((m) => m.id === paddleId);
        point = paddle ? applyHomography(homography, markerCenter(paddle.corners)) : null;
      }
      const next = pointer.update(now, point, ZONES, pinch);
      setView(next);
      // Sombra da mão: o esqueleto inteiro, ancorado no ponteiro já suavizado
      if (isHand && hand && next.pos) {
        const g = ghostSmoother.update(homography, hand, window.innerWidth, window.innerHeight);
        const pos = next.pos;
        setGhost(
          g.shape && { pinch: g.pinch, points: g.shape.map((o) => ({ x: pos.x + o.x, y: pos.y + o.y })) }
        );
      } else if (isHand) {
        setGhost(null);
      }
      if (next.fired) choose(next.fired as Alternative);
    },
    { markers: !isHand, hands: isHand },
    onCameraStatusChange
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'p') skipTurn();
      else if (k === 'z') undo();
      else if (k === 'escape' && confirm('Sair da rodada? O resultado não será guardado.')) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const zoneClass = (letter: Alternative) => {
    if (feedback?.kind === 'reveal' && feedback.wrong === letter) return 'bg-red-500 text-white border-red-700';
    if (feedback?.zone === letter) {
      return feedback.kind === 'wrong' ? 'bg-red-500 text-white border-red-700' : 'bg-green-500 text-white border-green-700';
    }
    return view.zoneId === letter
      ? 'bg-primary/10 border-primary text-zinc-900'
      : 'bg-base-200 border-zinc-300 text-zinc-900';
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-zinc-900 overflow-hidden select-none">
      <video ref={videoRef} autoPlay playsInline muted className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none" />

      <div className="absolute left-[4%] right-[4%] top-[2%] flex items-center justify-between gap-4">
        <span className="text-[2.2vw] font-extrabold">
          Vez do {group.name}{!isHand && ` · Paleta ${groupIndex + 1}`}
        </span>
        <span className="flex items-center gap-[1.5vw]">
          <span className="text-[1.6vw] text-zinc-500 font-semibold">
            Pergunta {game.idx + 1} de {questions.length}
          </span>
          <span
            className={`inline-flex items-center gap-[0.6vw] rounded-full px-[1.4vw] py-[0.4vw] text-[1.9vw] font-extrabold ${
              game.attempts === 0 ? 'bg-zinc-900 text-white' : 'bg-amber-400 text-zinc-900'
            }`}
          >
            {game.attempts === 0 ? '1ª tentativa' : '2ª tentativa · última'}
          </span>
        </span>
      </div>

      {feedback ? (
        <p
          className={`absolute left-[4%] right-[4%] top-[8%] h-[24%] flex items-center justify-center text-center rounded-2xl px-[2vw] font-display font-extrabold text-[3.4vw] leading-tight text-white ${
            feedback.kind === 'right'
              ? feedback.firstTry
                ? 'bg-green-600'
                : 'bg-amber-500 text-zinc-900'
              : 'bg-red-600'
          }`}
        >
          {feedback.kind === 'right' && (feedback.firstTry ? 'Acertou de primeira!' : 'Acertou na 2ª tentativa')}
          {feedback.kind === 'wrong' && 'Errou. Tente de novo: é a última tentativa.'}
          {feedback.kind === 'reveal' &&
            `Não foi dessa vez. A resposta certa é ${feedback.zone}: ${question?.options[feedback.zone]}`}
        </p>
      ) : (
        <p className="absolute left-[4%] right-[4%] top-[8%] h-[24%] flex items-center font-display font-extrabold text-[3.4vw] leading-tight">
          {question?.prompt}
        </p>
      )}

      {ZONES.map((zone, i) => {
        const letter = LETTERS[i];
        return (
          <div
            key={zone.id}
            className={`absolute rounded-2xl border-4 flex items-center gap-[2vw] px-[2vw] transition-colors ${zoneClass(letter)}`}
            style={{ left: `${zone.x * 100}%`, top: `${zone.y * 100}%`, width: `${zone.w * 100}%`, height: `${zone.h * 100}%` }}
          >
            <span className="font-display font-extrabold text-[5vw] leading-none">{letter}</span>
            <span className="text-[2.6vw] font-semibold leading-tight">{question?.options[letter]}</span>
          </div>
        );
      })}

      {isHand && ghost && !feedback && intro === null && (
        <HandGhost
          points={ghost.points}
          closed={ghost.pinch <= PINCH_CLOSED}
          progress={Math.min(1, Math.max(0, (PINCH_OPEN - ghost.pinch) / (PINCH_OPEN - PINCH_CLOSED)))}
        />
      )}

      {view.pos && !feedback && intro === null && !isHand && (
        <svg
          aria-hidden="true"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          className="absolute pointer-events-none -ml-8 -mt-8"
          style={{ left: `${view.pos.x * 100}%`, top: `${view.pos.y * 100}%` }}
        >
          <circle cx="32" cy="32" r={RING_R} fill="rgba(255,255,255,0.7)" stroke="#d4d4d8" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={RING_R}
            fill="none"
            stroke="#0f766e"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_LEN}
            strokeDashoffset={RING_LEN * (1 - view.progress)}
            transform="rotate(-90 32 32)"
          />
          <circle cx="32" cy="32" r="6" fill="#0f766e" />
        </svg>
      )}

      <div className="absolute left-[4%] right-[4%] bottom-[0.6%] flex justify-between text-[1.1vw] text-zinc-500">
        <span>
          {error
            ? 'Câmera indisponível. Confira a permissão do navegador.'
            : handError
              ? 'Leitura da mão indisponível.'
              : isHand && !handsReady
                ? 'Carregando a leitura da mão…'
                : !view.pos && (isHand ? 'Não estou vendo a mão.' : `A paleta ${groupIndex + 1} não está sendo vista.`)}
        </span>
        <span>
          {isHand && settings.click === 'pinch' ? `Junte polegar e indicador para clicar${ghost ? ` (pinça ${ghost.pinch.toFixed(2)})` : ''} · ` : ''}P pula a vez · Z desfaz · Esc sai{stats ? ` · ${stats.fps} quadros/s` : ''}
        </span>
      </div>

      {intro !== null && (
        <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center text-center gap-[2vw]">
          <p className="text-[2.2vw] font-semibold text-zinc-500">
            Pergunta {game.idx + 1} de {questions.length}
          </p>
          <p className="font-display font-extrabold text-[7vw] leading-none">{group.name}</p>
          <p className="text-[3vw] font-bold">
            {isHand ? 'vai responder' : `vai responder com a Paleta ${groupIndex + 1}`}
          </p>
          <p aria-live="polite" className="font-display font-extrabold text-[14vw] leading-none text-primary tabular-nums">
            {intro}
          </p>
        </div>
      )}
    </div>
  );
};
