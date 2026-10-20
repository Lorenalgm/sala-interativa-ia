import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Point } from './homography';

export interface HandReading {
  palm: Point; // centro da palma (base dos 4 dedos), em px do vídeo
  landmarks: Point[]; // os 21 pontos da mão, em px do vídeo
  pinch: number; // distância 3D polegar-indicador / tamanho da mão: ~0,2 juntos, ~1 ou mais abertos
}

// Índices dos pontos da mão no MediaPipe
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
// Base dos 4 dedos: sem o punho, que puxava o ponto para baixo e se mexe quando a mão gira
const PALM_POINTS = [5, 9, 13, 17];
const MIDDLE_BASE = 9;

const base = '/mediapipe/';

// Lê uma mão por vez no navegador. A mão toda vira o ponteiro (centro da palma) e o clique é a pinça.
export class HandTracker {
  private lastTime = -1;
  private last: HandReading | null = null;

  private constructor(private landmarker: HandLandmarker) {}

  public static async create(): Promise<HandTracker> {
    const fileset = await FilesetResolver.forVisionTasks(`${base}wasm`);
    const options = (delegate: 'GPU' | 'CPU') => ({
      baseOptions: { modelAssetPath: `${base}hand_landmarker.task`, delegate },
      runningMode: 'VIDEO' as const,
      numHands: 1,
      // Mais tolerante que o padrão (0,5): não perde a mão por pouco quando ela passa sobre áreas escuras
      minHandDetectionConfidence: 0.4,
      minHandPresenceConfidence: 0.4,
      minTrackingConfidence: 0.4,
    });
    try {
      return new HandTracker(await HandLandmarker.createFromOptions(fileset, options('GPU')));
    } catch {
      return new HandTracker(await HandLandmarker.createFromOptions(fileset, options('CPU')));
    }
  }

  public detect(video: HTMLVideoElement, now: number): HandReading | null {
    // Só processa quadros novos do vídeo
    if (video.currentTime === this.lastTime) return this.last;
    this.lastTime = video.currentTime;

    const result = this.landmarker.detectForVideo(video, now);
    const lm = result.landmarks[0];
    if (!lm) {
      this.last = null;
      return null;
    }
    const w = video.videoWidth;
    const h = video.videoHeight;
    const px = (i: number): Point => ({ x: lm[i].x * w, y: lm[i].y * h });
    const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

    const palm = PALM_POINTS.map(px);
    // A pinça é medida em 3D (coordenadas do mundo): com a mão de lado, polegar e indicador
    // parecem juntos na imagem sem estarem, e isso gerava cliques sem querer
    const wl = result.worldLandmarks[0];
    const d3 = (a: number, b: number) =>
      Math.hypot(wl[a].x - wl[b].x, wl[a].y - wl[b].y, wl[a].z - wl[b].z);
    const size3 = wl ? d3(WRIST, MIDDLE_BASE) : 0;
    const pinch =
      wl && size3 > 0
        ? d3(THUMB_TIP, INDEX_TIP) / size3
        : dist(px(THUMB_TIP), px(INDEX_TIP)) / (dist(px(WRIST), px(MIDDLE_BASE)) || 1);
    this.last = {
      landmarks: lm.map((_, i) => px(i)),
      palm: {
        x: palm.reduce((s, p) => s + p.x, 0) / palm.length,
        y: palm.reduce((s, p) => s + p.y, 0) / palm.length,
      },
      pinch,
    };
    return this.last;
  }

  public close(): void {
    this.landmarker.close();
  }
}
