import React from 'react';
import { Point } from '../../services/homography';

// Ligações entre os 21 pontos da mão (MediaPipe)
const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
const FINGERTIPS = [4, 8, 12, 16, 20];

interface HandGhostProps {
  points: Point[]; // 21 pontos em fração da tela
  closed: boolean; // pinça fechada
  progress?: number; // 0 a 1: pinça se fechando
}

// A "sombra" da mão na projeção: esqueleto grande, para ver o que a câmera está lendo
export const HandGhost: React.FC<HandGhostProps> = ({ points, closed, progress = 0 }) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const at = (i: number) => ({ x: points[i].x * w, y: points[i].y * h });
  const color = closed ? '#16a34a' : '#0f766e';
  const unit = Math.min(w, h) / 100;
  const thumb = at(4);
  const index = at(8);

  return (
    <svg aria-hidden="true" className="absolute inset-0 pointer-events-none" width={w} height={h}>
      {BONES.map(([a, b]) => {
        const p = at(a);
        const q = at(b);
        return (
          <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="white" strokeWidth={unit * 1.6} strokeLinecap="round" />
        );
      })}
      {BONES.map(([a, b]) => {
        const p = at(a);
        const q = at(b);
        return (
          <line key={`c${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={color} strokeOpacity={0.75} strokeWidth={unit * 0.9} strokeLinecap="round" />
        );
      })}
      {points.map((_, i) => {
        const p = at(i);
        const tip = FINGERTIPS.includes(i);
        return <circle key={i} cx={p.x} cy={p.y} r={unit * (tip ? 1.4 : 0.8)} fill={color} stroke="white" strokeWidth={unit * 0.35} />;
      })}
      {/* A pinça: um anel entre polegar e indicador que fecha e enche de verde */}
      <circle
        cx={(thumb.x + index.x) / 2}
        cy={(thumb.y + index.y) / 2}
        r={unit * (1.5 + 2.5 * (1 - progress))}
        fill={closed ? 'rgba(22,163,74,0.5)' : 'none'}
        stroke={color}
        strokeWidth={unit * 0.6}
      />
    </svg>
  );
};
