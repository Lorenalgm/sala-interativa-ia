import { Homography, Point, applyHomography } from '../../services/homography';
import { HandReading } from '../../services/handTracker';

const WRIST = 0;
const MIDDLE_BASE = 9;
const MIN_SIZE = 0.05; // tamanho da mão na tela (punho até a base do dedo médio), fração da altura
const MAX_SIZE = 0.12;
const FALLBACK_SIZE = 0.08;
const SHAPE_SMOOTHING = 0.25; // peso do quadro novo no formato da mão
const PINCH_SMOOTHING = 0.5;
const JUMP = 1.5; // quadro com a mão 1,5x maior ou menor que a anterior é descartado como erro de leitura
const MAX_REJECTED = 5; // depois de tantos descartes seguidos, aceita o novo tamanho

// Formato da sombra da mão: desenhada como a câmera a vê, só com escala (sem girar nem entortar com
// o ajuste da tela), de tamanho limitado, sem saltos e suavizada
export class GhostSmoother {
  private shape: Point[] | null = null;
  private size = 0;
  private pinch = 1;
  private rejected = 0;

  public reset(): void {
    this.shape = null;
    this.size = 0;
    this.rejected = 0;
  }

  // Devolve os 21 pontos como deslocamento (fração da tela) em relação ao centro da palma
  public update(h: Homography, hand: HandReading, width: number, height: number) {
    const palm = applyHomography(h, hand.palm);
    const cam = hand.landmarks.map((l) => ({ x: l.x - hand.palm.x, y: l.y - hand.palm.y }));
    const camSize = Math.hypot(cam[MIDDLE_BASE].x - cam[WRIST].x, cam[MIDDLE_BASE].y - cam[WRIST].y);

    // Pixels de tela por pixel de câmera, pela escala do ajuste (área da tela / área na imagem)
    const det = Math.abs(h[0] * h[4] - h[1] * h[3]) * width * height;
    const natural = Math.sqrt(det) * camSize;
    const target = Math.min(MAX_SIZE * height, Math.max(MIN_SIZE * height, natural || FALLBACK_SIZE * height));

    const glitch =
      this.shape !== null &&
      this.size > 0 &&
      (camSize > this.size * JUMP || camSize < this.size / JUMP) &&
      this.rejected < MAX_REJECTED;

    if (glitch) {
      this.rejected += 1;
    } else if (camSize > 0) {
      this.rejected = 0;
      const k = target / camSize; // px de tela por px de câmera
      const next = cam.map((p) => ({ x: (p.x * k) / width, y: (p.y * k) / height }));
      this.shape = this.shape
        ? this.shape.map((p, i) => ({
            x: p.x + SHAPE_SMOOTHING * (next[i].x - p.x),
            y: p.y + SHAPE_SMOOTHING * (next[i].y - p.y),
          }))
        : next;
      this.size = this.size ? this.size + SHAPE_SMOOTHING * (camSize - this.size) : camSize;
    }
    this.pinch += PINCH_SMOOTHING * (hand.pinch - this.pinch);
    return { palm, shape: this.shape, pinch: this.pinch };
  }
}
