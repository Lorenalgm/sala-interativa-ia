import { Alternative, DetectedMarker } from '../types';

// Matriz de bits 4x4 para marcadores dos alunos (IDs 1 a 24).
// Cada marcador é assimétrico sob rotações de 90°, 180° e 270°,
// garantindo identificação única do aluno e da alternativa selecionada.
export const MARKER_PATTERNS_4X4: Record<number, number[][]> = {
  1: [
    [1, 0, 0, 0],
    [1, 1, 0, 1],
    [0, 1, 0, 0],
    [1, 0, 1, 1],
  ],
  2: [
    [0, 1, 0, 0],
    [1, 0, 1, 1],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
  ],
  3: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 1, 0],
  ],
  4: [
    [0, 0, 1, 0],
    [1, 1, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 0, 0],
  ],
  5: [
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 0, 0],
    [0, 0, 0, 1],
  ],
  6: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 1, 1],
    [1, 0, 0, 0],
  ],
  7: [
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 1],
  ],
  8: [
    [0, 0, 1, 1],
    [1, 1, 0, 0],
    [0, 1, 0, 1],
    [1, 0, 0, 1],
  ],
  9: [
    [1, 1, 0, 1],
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [0, 1, 1, 1],
  ],
  10: [
    [0, 1, 0, 1],
    [1, 0, 0, 0],
    [0, 1, 1, 1],
    [1, 1, 0, 0],
  ],
  11: [
    [1, 0, 1, 1],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [1, 1, 0, 1],
  ],
  12: [
    [0, 0, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 1, 0],
    [0, 1, 0, 0],
  ],
  13: [
    [1, 1, 1, 0],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
    [1, 0, 0, 0],
  ],
  14: [
    [0, 1, 1, 1],
    [1, 0, 1, 0],
    [0, 0, 0, 1],
    [1, 1, 0, 0],
  ],
  15: [
    [1, 0, 0, 1],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 1],
  ],
  16: [
    [0, 1, 0, 0],
    [0, 0, 1, 1],
    [1, 1, 0, 1],
    [1, 0, 1, 0],
  ],
  17: [
    [1, 1, 0, 0],
    [1, 0, 1, 1],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
  ],
  18: [
    [0, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 1, 0],
    [1, 0, 0, 1],
  ],
  19: [
    [1, 0, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 1, 1, 1],
  ],
  20: [
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 0, 0],
  ],
};

// Mapeamento de rotação para alternativa conforme o lado voltado para cima:
// Rotação 0: lado superior voltado para cima = A
// Rotação 1: lado esquerdo voltado para cima (giro de 90° horário do cartão) = D
// Rotação 2: lado inferior voltado para cima (giro de 180° do cartão) = C
// Rotação 3: lado direito voltado para cima (giro de 270° horário do cartão) = B
export const ROTATION_TO_ALTERNATIVE: Record<number, Alternative> = {
  0: 'A',
  1: 'D',
  2: 'C',
  3: 'B',
};

// Função para rotacionar matriz 4x4 em 90 graus no sentido horário
function rotateMatrix(mat: number[][]): number[][] {
  const n = mat.length;
  const res: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[c][n - 1 - r] = mat[r][c];
    }
  }
  return res;
}

// Compara duas matrizes 4x4 e retorna a quantidade de bits divergentes (distância de Hamming)
function matrixDistance(m1: number[][], m2: number[][]): number {
  let dist = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (m1[r][c] !== m2[r][c]) dist++;
    }
  }
  return dist;
}

export interface MarkerMatch {
  id: number;
  rotation: number;
  option: Alternative;
  confidence: number;
}

// Identifica um padrão 4x4 extraído contra o dicionário de marcadores
export function matchMarkerPattern(extracted: number[][]): MarkerMatch | null {
  let bestId = -1;
  let bestRot = -1;
  let minDistance = 999;

  for (const [idStr, basePattern] of Object.entries(MARKER_PATTERNS_4X4)) {
    const id = parseInt(idStr, 10);
    let currentPattern = basePattern;

    for (let rot = 0; rot < 4; rot++) {
      const dist = matrixDistance(extracted, currentPattern);
      if (dist < minDistance) {
        minDistance = dist;
        bestId = id;
        bestRot = rot;
      }
      currentPattern = rotateMatrix(currentPattern);
    }
  }

  // Tolerância máxima de 1 bit para ruído de imagem
  if (minDistance <= 1 && bestId !== -1) {
    return {
      id: bestId,
      rotation: bestRot,
      option: ROTATION_TO_ALTERNATIVE[bestRot],
      confidence: 1 - minDistance / 16,
    };
  }

  return null;
}

// Algoritmo de visão computacional em tempo real para detecção de marcadores em canvas
export class ArucoCardDetector {
  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D | null;

  constructor() {
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d', { willReadFrequently: true });
  }

  public detect(video: HTMLVideoElement): DetectedMarker[] {
    if (!video.videoWidth || !video.videoHeight || !this.tempCtx) {
      return [];
    }

    const width = 640;
    const height = Math.round((video.videoHeight / video.videoWidth) * 640);

    if (this.tempCanvas.width !== width || this.tempCanvas.height !== height) {
      this.tempCanvas.width = width;
      this.tempCanvas.height = height;
    }

    // Desenha o quadro atual da câmera
    this.tempCtx.drawImage(video, 0, 0, width, height);
    const imageData = this.tempCtx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Converte para escala de cinza e calcula limiar médio
    const gray = new Uint8Array(width * height);
    let sumLum = 0;
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      // Y = 0.299R + 0.587G + 0.114B
      const lum = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
      gray[j] = lum;
      sumLum += lum;
    }
    const avgLum = sumLum / (width * height);
    const threshold = Math.max(60, Math.min(190, avgLum * 0.9));

    // Binarização
    const binary = new Uint8Array(width * height);
    for (let i = 0; i < gray.length; i++) {
      binary[i] = gray[i] < threshold ? 0 : 255;
    }

    // Localização de regiões candidatas a marcadores quadrangulares
    const candidates = this.findQuadrilateralCandidates(binary, width, height);
    const detected: DetectedMarker[] = [];
    const seenIds = new Set<number>();

    for (const quad of candidates) {
      const pattern = this.sampleMarkerBits(gray, width, quad);
      if (!pattern) continue;

      const match = matchMarkerPattern(pattern);
      if (match && !seenIds.has(match.id)) {
        seenIds.add(match.id);
        detected.push({
          id: match.id,
          corners: quad,
          rotation: match.rotation,
          option: match.option,
        });
      }
    }

    return detected;
  }

  // Amostra a grade 6x6 (borda preta de 1 bit + dados 4x4)
  private sampleMarkerBits(
    gray: Uint8Array,
    width: number,
    quad: { x: number; y: number }[]
  ): number[][] | null {
    const [c0, c1, c2, c3] = quad;

    // Verifica integridade da borda preta externa
    const borderSamples = 6;
    let blackBorderCount = 0;
    let totalBorderSamples = 0;

    // Mapeamento bilinear do quadrilátero para coordenada canônica
    const samplePoint = (u: number, v: number): number => {
      const topX = c0.x + (c1.x - c0.x) * u;
      const topY = c0.y + (c1.y - c0.y) * u;
      const botX = c3.x + (c2.x - c3.x) * u;
      const botY = c3.y + (c2.y - c3.y) * u;
      const x = Math.round(topX + (botX - topX) * v);
      const y = Math.round(topY + (botY - topY) * v);
      if (x < 0 || x >= width || y < 0) return 255;
      return gray[y * width + x] || 255;
    };

    // Testa a borda externa
    for (let i = 0; i < borderSamples; i++) {
      const t = (i + 0.5) / borderSamples;
      if (samplePoint(t, 0.08) < 110) blackBorderCount++;
      if (samplePoint(t, 0.92) < 110) blackBorderCount++;
      if (samplePoint(0.08, t) < 110) blackBorderCount++;
      if (samplePoint(0.92, t) < 110) blackBorderCount++;
      totalBorderSamples += 4;
    }

    // Se a borda não for predominantemente preta, não é um cartão ArUco
    if (blackBorderCount / totalBorderSamples < 0.65) {
      return null;
    }

    // Amostra a matriz interna 4x4
    const matrix: number[][] = [];
    const cellStep = 1 / 6;

    for (let r = 0; r < 4; r++) {
      const row: number[] = [];
      const v = (r + 1.5) * cellStep;
      for (let c = 0; c < 4; c++) {
        const u = (c + 1.5) * cellStep;
        const lum = samplePoint(u, v);
        row.push(lum > 128 ? 1 : 0);
      }
      matrix.push(row);
    }

    return matrix;
  }

  // Busca regiões fechadas com dimensões e proporções condizentes com cartões
  private findQuadrilateralCandidates(
    binary: Uint8Array,
    width: number,
    height: number
  ): { x: number; y: number }[][] {
    const candidates: { x: number; y: number }[][] = [];
    const step = 8;
    const minCardSize = 40;
    const maxCardSize = Math.min(width, height) * 0.8;

    // Varredura por blocos de borda preta
    for (let y = minCardSize; y < height - minCardSize; y += step * 2) {
      for (let x = minCardSize; x < width - minCardSize; x += step * 2) {
        const idx = y * width + x;
        if (binary[idx] === 0) {
          // Mede a extensão horizontal e vertical da região escura
          let left = x;
          while (left > 0 && binary[y * width + left] === 0 && x - left < maxCardSize) left--;
          let right = x;
          while (right < width - 1 && binary[y * width + right] === 0 && right - x < maxCardSize) right++;
          let top = y;
          while (top > 0 && binary[top * width + x] === 0 && y - top < maxCardSize) top--;
          let bottom = y;
          while (bottom < height - 1 && binary[bottom * width + x] === 0 && bottom - y < maxCardSize) bottom++;

          const spanW = right - left;
          const spanH = bottom - top;

          if (
            spanW >= minCardSize &&
            spanH >= minCardSize &&
            spanW <= maxCardSize &&
            spanH <= maxCardSize &&
            Math.abs(spanW - spanH) / Math.max(spanW, spanH) < 0.4
          ) {
            candidates.push([
              { x: left, y: top },
              { x: right, y: top },
              { x: right, y: bottom },
              { x: left, y: bottom },
            ]);
            x += spanW;
          }
        }
      }
    }

    return candidates.slice(0, 15);
  }
}
