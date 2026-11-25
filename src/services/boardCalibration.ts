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

// Distância dos marcadores até a borda, como fração do menor lado da tela. Perto da borda o
// projetor costuma desfocar, entortar ou cortar a imagem; a homografia vale para a tela inteira
// mesmo com os marcadores mais para dentro.
export const CALIBRATION_INSETS = [
  { value: 0.04, label: 'Na borda' },
  { value: 0.1, label: 'Um pouco para dentro' },
  { value: 0.16, label: 'Bem para dentro' },
] as const;
export const DEFAULT_INSET = CALIBRATION_INSETS[1].value;

export function calibrationLayout(width: number, height: number, inset: number = DEFAULT_INSET): CalibrationLayout {
  const base = Math.min(width, height);
  const size = Math.round(base * 0.18);
  const pad = Math.round(base * inset);
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
  seen: number[]; // ids de calibração vistos há pouco (não pisca quando um quadro falha)
  streak: number; // leituras boas do canto com menos leituras, até CALIBRATION_FRAMES
  markerPx: number; // lado médio do marcador na imagem da câmera (0 se nenhum visto)
  error: number | null; // erro de reprojeção da última tentativa, como fração da largura
  worstId: number | null; // marcador com o maior erro na última tentativa que falhou
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

const median = (values: number[]): number => {
  const v = [...values].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

const SEEN_FOR = 15; // um marcador conta como visto por até 15 quadros depois da última leitura
const MIN_SIZE = 0.6; // marcador menor que 60% da mediana é cópia (ex.: a prévia da câmera projetada)
const MAX_JUMP = 0.5; // leitura com o centro a mais de meio lado da média do canto é descartada
const RESTART_AFTER = 8; // tantas leituras descartadas seguidas: a câmera mexeu, recomeça o canto

interface Track {
  sum: Point[]; // soma dos cantos das leituras aceitas
  count: number;
  lastFrame: number;
  rejected: number; // leituras descartadas seguidas
}

const emptyState = (): CalibrationState => ({
  seen: [],
  streak: 0,
  markerPx: 0,
  error: null,
  worstId: null,
  homography: null,
});

// Junta as leituras dos marcadores 900 a 903, cada um no seu ritmo: um canto que falha num quadro
// não zera os outros. Com 10 leituras boas de cada, calcula a homografia câmera -> tela
// (em frações da tela) e confere o erro.
export class BoardCalibrator {
  private frame = 0;
  private tracks: Record<number, Track> = {};
  private state: CalibrationState = emptyState();

  constructor(private layout: CalibrationLayout, private aspect: number) {}

  public get result(): CalibrationState {
    return this.state;
  }

  public reset(): void {
    this.frame = 0;
    this.tracks = {};
    this.state = emptyState();
  }

  public feed(markers: DetectedMarker[]): CalibrationState {
    if (this.state.homography) return this.state;
    this.frame += 1;

    let found = markers.filter((m) => (CALIBRATION_IDS as readonly number[]).includes(m.id));
    // A prévia da câmera aparece na projeção com os marcadores em miniatura: descarta os pequenos
    if (found.length > 1) {
      const typical = median(found.map((m) => sideLength(m.corners)));
      found = found.filter((m) => sideLength(m.corners) >= typical * MIN_SIZE);
    }
    const markerPx = found.length ? found.reduce((s, m) => s + sideLength(m.corners), 0) / found.length : 0;

    found.forEach((m) => {
      const t = this.tracks[m.id];
      if (!t || t.count === 0) {
        this.tracks[m.id] = { sum: m.corners.map((c) => ({ ...c })), count: 1, lastFrame: this.frame, rejected: 0 };
        return;
      }
      const mean = markerCenter(t.sum.map((p) => ({ x: p.x / t.count, y: p.y / t.count })));
      const here = markerCenter(m.corners);
      const side = sideLength(m.corners);
      t.lastFrame = this.frame;
      if (Math.hypot(here.x - mean.x, here.y - mean.y) > side * MAX_JUMP) {
        t.rejected += 1;
        if (t.rejected >= RESTART_AFTER) {
          this.tracks[m.id] = { sum: m.corners.map((c) => ({ ...c })), count: 1, lastFrame: this.frame, rejected: 0 };
        }
        return;
      }
      t.rejected = 0;
      if (t.count < CALIBRATION_FRAMES) {
        t.sum = t.sum.map((p, i) => ({ x: p.x + m.corners[i].x, y: p.y + m.corners[i].y }));
        t.count += 1;
      }
    });

    const seen = CALIBRATION_IDS.filter((id) => {
      const t = this.tracks[id];
      return t && this.frame - t.lastFrame <= SEEN_FOR;
    });
    const counts = CALIBRATION_IDS.map((id) => (seen.includes(id) ? this.tracks[id].count : 0));
    const streak = Math.min(...counts);

    if (streak < CALIBRATION_FRAMES) {
      this.state = { ...this.state, seen, streak, markerPx };
      return this.state;
    }

    // Média das leituras de cada canto: 16 pares de cantos (4 por marcador) para os mínimos quadrados
    const src: Point[] = [];
    const dst: Point[] = [];
    const owner: number[] = [];
    CALIBRATION_IDS.forEach((id) => {
      const t = this.tracks[id];
      t.sum.forEach((p, i) => {
        src.push({ x: p.x / t.count, y: p.y / t.count });
        dst.push(this.layout.corners[id][i]);
        owner.push(id);
      });
    });
    const h = computeHomography(src, dst);
    let error = Infinity;
    let worstId: number | null = null;
    if (h) {
      error = 0;
      src.forEach((p, i) => {
        const q = applyHomography(h, p);
        const e = Math.hypot(q.x - dst[i].x, (q.y - dst[i].y) / this.aspect);
        if (e > error) {
          error = e;
          worstId = owner[i];
        }
      });
    }
    this.tracks = {};
    this.state =
      h && error <= MAX_ERROR
        ? { seen, streak: CALIBRATION_FRAMES, markerPx, error, worstId: null, homography: h }
        : { seen, streak: 0, markerPx, error: Number.isFinite(error) ? error : null, worstId, homography: null };
    return this.state;
  }
}
