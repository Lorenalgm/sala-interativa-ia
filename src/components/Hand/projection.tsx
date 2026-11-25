import React, { useEffect, useRef } from 'react';
import { Point } from '../../services/homography';

// Peças comuns da tela projetada dos modelos com a mão

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const inRect = (r: Rect, p: Point | null, margin = 0) =>
  !!p && p.x >= r.x - margin && p.x <= r.x + r.w + margin && p.y >= r.y - margin && p.y <= r.y + r.h + margin;

export const rectStyle = (r: Rect): React.CSSProperties => ({
  left: `${r.x * 100}%`,
  top: `${r.y * 100}%`,
  width: `${r.w * 100}%`,
  height: `${r.h * 100}%`,
});

// Parar a mão sobre um botão por um tempo vale como clique
export class Dwell {
  private since: number | null = null;
  private fired = false;
  constructor(private ms = 1000) {}
  public reset() {
    this.since = null;
    this.fired = false;
  }
  // Devolve o progresso (0 a 1) e se disparou neste quadro
  public update(now: number, inside: boolean): { progress: number; fired: boolean } {
    if (!inside) {
      this.reset();
      return { progress: 0, fired: false };
    }
    this.since = this.since ?? now;
    const progress = Math.min(1, (now - this.since) / this.ms);
    if (progress >= 1 && !this.fired) {
      this.fired = true;
      return { progress, fired: true };
    }
    return { progress, fired: false };
  }
}

export const celebrate = (origin: Point = { x: 0.5, y: 0.5 }, particleCount = 90) =>
  import('canvas-confetti').then(({ default: confetti }) =>
    confetti({ particleCount, spread: 75, startVelocity: 38, origin, disableForReducedMotion: true })
  );

// Número no jeito brasileiro, com o sinal de menos tipográfico
export const formatNumber = (v: number, decimals: number) =>
  v.toLocaleString('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: 0 }).replace('-', '−');

// Tela cheia branca com atalhos do professor
export const ProjectionShell: React.FC<{
  onExit: () => void;
  onKey?: (key: string) => void;
  children: React.ReactNode;
}> = ({ onExit, onKey, children }) => {
  const keyRef = useRef(onKey);
  keyRef.current = onKey;
  const exitRef = useRef(onExit);
  exitRef.current = onExit;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirm('Sair da atividade?')) exitRef.current();
        return;
      }
      keyRef.current?.(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return <div className="fixed inset-0 z-50 bg-white text-zinc-900 overflow-hidden select-none">{children}</div>;
};

// Linha de cima: nome da atividade e progresso
export const TopBar: React.FC<{ title: string; emoji: string; right?: React.ReactNode }> = ({ title, emoji, right }) => (
  <div className="absolute left-[3%] right-[3%] top-[2.2%] flex items-center justify-between gap-4">
    <span className="inline-flex items-center gap-[0.8vw] text-[1.7vw] font-bold text-zinc-600">
      <span aria-hidden="true">{emoji}</span>
      {title}
    </span>
    {right && <span className="text-[1.7vw] font-semibold text-zinc-500 tabular-nums">{right}</span>}
  </div>
);

// Rodapé discreto: aviso da câmera à esquerda, atalhos à direita
export const Footer: React.FC<{ status: string | null; hints: string }> = ({ status, hints }) => (
  <div className="absolute left-[3%] right-[3%] bottom-[0.8%] flex justify-between gap-6 text-[1.05vw] text-zinc-500">
    <span className={status ? 'font-semibold text-amber-700' : ''}>{status}</span>
    <span>{hints}</span>
  </div>
);

// Botão que a mão aperta parando em cima (o professor também pode clicar)
export const HandButton: React.FC<{
  rect: Rect;
  progress: number;
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'primary' | 'neutral';
}> = ({ rect, progress, onClick, children, tone = 'primary' }) => (
  <button
    type="button"
    onClick={onClick}
    style={rectStyle(rect)}
    className={`absolute overflow-hidden rounded-[1.2vw] font-display font-bold text-[2.2vw] flex items-center justify-center gap-[0.8vw] ${
      tone === 'primary' ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-900'
    }`}
  >
    {/* Enche da esquerda para a direita enquanto a mão fica parada */}
    <span
      aria-hidden="true"
      className={`absolute inset-y-0 left-0 ${tone === 'primary' ? 'bg-white/30' : 'bg-black/10'}`}
      style={{ width: `${progress * 100}%` }}
    />
    <span className="relative inline-flex items-center gap-[0.8vw]">{children}</span>
  </button>
);
