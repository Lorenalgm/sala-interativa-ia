import aruco from 'js-aruco2/src/aruco.js';
import 'js-aruco2/src/dictionaries/aruco_4x4_1000.js';
import { Alternative, DetectedMarker } from '../types';
import { isStudentMarker } from './markerRanges';

export const DICTIONARY_NAME = 'ARUCO_4X4_1000';

// Rotação do cartão (sentido horário, visto pela câmera) para a letra voltada para cima:
// 0: A em cima, 1: D em cima (cartão girado 90°), 2: C em cima (180°), 3: B em cima (270°)
export const ROTATION_TO_ALTERNATIVE: Record<number, Alternative> = {
  0: 'A',
  1: 'D',
  2: 'C',
  3: 'B',
};

// A biblioteca devolve os cantos começando pelo canto superior esquerdo do marcador
// (já corrigida a rotação). O ângulo da aresta superior diz qual lado do cartão está em cima.
export function rotationFromCorners(corners: { x: number; y: number }[]): number {
  const [c0, c1, c2, c3] = corners;
  const dx = c1.x - c0.x + (c2.x - c3.x);
  const dy = c1.y - c0.y + (c2.y - c3.y);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // eixo y da imagem aponta para baixo
  return ((Math.round(angle / 90) % 4) + 4) % 4;
}

export interface DetectorStats {
  fps: number;
  detectMs: number;
  width: number;
  height: number;
}

// Leitor de cartões ArUco 4x4 (js-aruco2): limiar adaptativo, contornos e perspectiva
export class ArucoCardDetector {
  private detector = new aruco.AR.Detector({ dictionaryName: DICTIONARY_NAME });
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private lastFrameAt = 0;
  public stats: DetectorStats = { fps: 0, detectMs: 0, width: 0, height: 0 };

  // maxWidth: lê na resolução máxima da câmera (1920 px com a StreamCam)
  constructor(private maxWidth = 1920) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public detect(video: HTMLVideoElement): DetectedMarker[] {
    if (!video.videoWidth || !video.videoHeight || !this.ctx) return [];

    const scale = Math.min(1, this.maxWidth / video.videoWidth);
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    const start = performance.now();
    this.ctx.drawImage(video, 0, 0, width, height);
    const image = this.ctx.getImageData(0, 0, width, height);
    const found = this.detector.detect(image);

    const markers: DetectedMarker[] = [];
    const seen = new Set<number>();
    for (const m of found) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      const rotation = rotationFromCorners(m.corners);
      markers.push({
        id: m.id,
        // Devolve as coordenadas na resolução original do vídeo
        corners: m.corners.map((c) => ({ x: c.x / scale, y: c.y / scale })),
        rotation,
        option: ROTATION_TO_ALTERNATIVE[rotation],
      });
    }

    const now = performance.now();
    const frameMs = this.lastFrameAt ? now - this.lastFrameAt : 0;
    this.lastFrameAt = now;
    // Média móvel para o número não ficar pulando na tela de teste
    this.stats = {
      fps: frameMs > 0 ? Math.round((this.stats.fps * 0.8 + (1000 / frameMs) * 0.2) * 10) / 10 : this.stats.fps,
      detectMs: Math.round(now - start),
      width,
      height,
    };
    return markers;
  }

  // Marcadores que não são de aluno (quadro, calibração) ficam de fora das respostas
  public static studentsOnly(markers: DetectedMarker[]): DetectedMarker[] {
    return markers.filter((m) => isStudentMarker(m.id));
  }
}

// SVG de um marcador, para imprimir nos cartões
export function markerSvg(id: number): string {
  return new aruco.AR.Dictionary(DICTIONARY_NAME).generateSVG(id);
}
