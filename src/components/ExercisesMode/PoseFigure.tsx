import React from 'react';
import { PoseType } from '../../types';

interface PoseFigureProps {
  type: PoseType;
  className?: string;
}

interface Figure {
  head: [number, number];
  torso: [number, number, number, number];
  limbs: string[];
}

// Bonecos desenhados como espelho: o braço do lado direito da tela é o braço
// direito de quem está imitando de frente para o datashow
const FIGURES: Record<PoseType, Figure> = {
  arms_raised: {
    head: [50, 20],
    torso: [50, 31, 50, 68],
    limbs: [
      '50,37 34,24 25,5',
      '50,37 66,24 75,5',
      '50,68 43,92 41,116',
      '50,68 57,92 59,116',
    ],
  },
  t_pose: {
    head: [50, 20],
    torso: [50, 31, 50, 68],
    limbs: [
      '50,37 29,37 8,37',
      '50,37 71,37 92,37',
      '50,68 43,92 41,116',
      '50,68 57,92 59,116',
    ],
  },
  star_pose: {
    head: [50, 20],
    torso: [50, 31, 50, 68],
    limbs: [
      '50,37 31,24 13,10',
      '50,37 69,24 87,10',
      '50,68 35,92 23,116',
      '50,68 65,92 77,116',
    ],
  },
  right_hand_up: {
    head: [50, 20],
    torso: [50, 31, 50, 68],
    limbs: [
      '50,37 42,54 40,70',
      '50,37 65,24 72,5',
      '50,68 43,92 41,116',
      '50,68 57,92 59,116',
    ],
  },
  squat: {
    head: [50, 42],
    torso: [50, 53, 50, 84],
    limbs: [
      '50,59 30,59 12,59',
      '50,59 70,59 88,59',
      '50,84 33,92 37,116',
      '50,84 67,92 63,116',
    ],
  },
};

export const PoseFigure: React.FC<PoseFigureProps> = ({ type, className = '' }) => {
  const figure = FIGURES[type] ?? FIGURES.arms_raised;
  const [x1, y1, x2, y2] = figure.torso;

  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx={figure.head[0]} cy={figure.head[1]} r={9} fill="currentColor" stroke="none" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {figure.limbs.map((points) => (
        <polyline key={points} points={points} />
      ))}
    </svg>
  );
};
