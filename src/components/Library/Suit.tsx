import React from 'react';
import { ScriptId } from '../../types';

export type SuitShape = 'circle' | 'square' | 'triangle' | 'diamond';

// Cada roteiro tem um naipe fixo, como nas cartas de baralho
const suitByScript: Record<ScriptId, SuitShape> = {
  'quick-question': 'circle',
  'group-draw': 'square',
  'peer-instruction': 'triangle',
  'interactive-board': 'diamond',
};

export const suitFor = (id: ScriptId): SuitShape => suitByScript[id];

interface SuitProps {
  shape: SuitShape;
  className?: string;
}

export const Suit: React.FC<SuitProps> = ({ shape, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    {shape === 'circle' && <circle cx="12" cy="12" r="10" />}
    {shape === 'square' && <rect x="3" y="3" width="18" height="18" rx="2.5" />}
    {shape === 'triangle' && <path d="M12 2.5 22 21H2z" />}
    {shape === 'diamond' && <path d="M12 1 23 12 12 23 1 12z" />}
  </svg>
);
