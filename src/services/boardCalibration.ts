import { DetectedMarker } from '../types';
import { CALIBRATION_MARKERS } from './markerRanges';
import { Homography, Point, applyHomography, computeHomography } from './homography';

export const CALIBRATION_FRAMES = 10; // quadros seguidos com os 4 marcadores
export const MAX_ERROR = 0.015; // erro de reprojeção aceito, como fração da largura da tela

// Os 4 marcadores nos cantos da tela, na ordem dos ids: 900 em cima à esquerda, 901 em cima
// à direita, 902 embaixo à direita, 903 embaixo à esquerda.
export const CALIBRATION_IDS = [
  CALIBRATION_MARKERS.min,
  CALIBRATION_MARKERS.min + 1,
  CALIBRATION_MARKERS.min + 2,
  CALIBRATION_MARKERS.max,
] as const;

export interface CalibrationLayout {
  size: number; // lado do marcador, em px de tela
  pad: number; // distância do marcador até a borda da tela, em px
  // canto de cada marcador (cima-esq, cima-dir, baixo-dir, baixo-esq) como fração da tela, por id
  corners: Record<number, Point[]>;
}

export function calibrationLayout(width: number, height: number): CalibrationLayout {
  const base = Math.min(width, height);
  const size = Math.round(base * 0.18);
  const pad = Math.round(base * 0.04);
  const square = (left: number, top: number): Point[] =>
    [
      { x: left, y: top },
      { x: left + size, y: top },
      { x: left + size, y: top + size },
      { x: left, y: top + size },
    ].map((p) => ({ x: p.x / width, y: p.y / height }));
  return {
    size,
    pad,
    corners: {
      [CALIBRATION_IDS[0]]: square(pad, pad),
      [CALIBRATION_IDS[1]]: square(width - pad - size, pad),
      [CALIBRATION_IDS[2]]: square(width - pad - size, height - pad - size),
      [CALIBRATION_IDS[3]]: square(pad, height - pad - size),
    },
  };
}

export interface CalibrationState {
  seen: number[]; // ids de calibração vistos neste quadro
  streak: number; // quadros seguidos com os 4
  markerPx: number; // lado médio do marcador na imagem da câmera (0 se nenhum visto)
  error: number | null; // erro de reprojeção da última tentativa, como fração da largura
  homography: Homography | null; // preenchida quando a calibração termina
}

export const markerCenter = (corners: Point[]): Point => ({
  x: corners.reduce((s, c) => s + c.x, 0) / corners.length,
  y: corners.reduce((s, c) => s + c.y, 0) / corners.length,
});

const sideLength = (corners: Point[]): number =>
  corners.reduce((s, c, i) => {
    const n = corners[(i + 1) % corners.length];
    return s + Math.hypot(n.x - c.x, n.y - c.y);
  }, 0) / corners.length;

// Junta os marcadores 900 a 903 ao longo dos quadros; com 10 seguidos calcula a homografia
// camera -> tela (em frações da tela) e confere o erro.
export class BoardCalibrator {
  private streak = 0;
  private sums: Record<number, Point[]> = {};
  private state: CalibrationState = { seen: [], streak: 0, markerPx: 0, error: null, homography: null };

  constructor(private layout: CalibrationLayout, private aspect: number) {}

  public get result(): CalibrationState {
    return this.state;
  }

  public reset(): void {
    this.streak = 0;
    this.sums = {};
    this.state = { seen: [], streak: 0, markerPx: 0, error: null, homography: null };
  }

  public feed(markers: DetectedMarker[]): CalibrationState {
    if (this.state.homography) return this.state;
    const found = markers.filter((m) => (CALIBRATION_IDS as readonly number[]).includes(m.id));
    const seen = found.map((m) => m.id);
    const markerPx = found.length ? found.reduce((s, m) => s + sideLength(m.corners), 0) / found.length : 0;

    if (found.length < CALIBRATION_IDS.length) {
      this.streak = 0;
      this.sums = {};
      this.state = { ...this.state, seen, streak: 0, markerPx };
      return this.state;
    }

    this.streak += 1;
    found.forEach((m) => {
      const acc = this.sums[m.id] ?? m.corners.map(() => ({ x: 0, y: 0 }));
      this.sums[m.id] = acc.map((p, i) => ({ x: p.x + m.corners[i].x, y: p.y + m.corners[i].y }));
    });

    if (this.streak < CALIBRATION_FRAMES) {
      this.state = { ...this.state, seen, streak: this.streak, markerPx };
      return this.state;
    }

    // Média dos 10 quadros: 16 pares de cantos (4 por marcador) para os mínimos quadrados
    const src: Point[] = [];
    const dst: Point[] = [];
    CALIBRATION_IDS.forEach((id) => {
      this.sums[id].forEach((p, i) => {
        src.push({ x: p.x / this.streak, y: p.y / this.streak });
        dst.push(this.layout.corners[id][i]);
      });
    });
    const h = computeHomography(src, dst);
    let error = Infinity;
    if (h) {
      error = Math.max(
        ...src.map((p, i) => {
          const q = applyHomography(h, p);
          return Math.hypot(q.x - dst[i].x, (q.y - dst[i].y) / this.aspect);
        })
      );
    }
    this.streak = 0;
    this.sums = {};
    this.state =
      h && error <= MAX_ERROR
        ? { seen, streak: CALIBRATION_FRAMES, markerPx, error, homography: h }
        : { seen, streak: 0, markerPx, error: Number.isFinite(error) ? error : null, homography: null };
    return this.state;
  }
}
