export interface Point {
  x: number;
  y: number;
}

// Matriz 3x3 em ordem de linhas: [h0 h1 h2, h3 h4 h5, h6 h7 1]
export type Homography = number[];

// Resolve A·x = b por eliminação gaussiana com pivô parcial. Devolve null se a matriz for singular.
function solve(a: number[][], b: number[]): number[] | null {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    }
    if (Math.abs(m[pivot][col]) < 1e-12) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    for (let r = col + 1; r < n; r++) {
      const f = m[r][col] / m[col][col];
      for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = m[r][n];
    for (let c = r + 1; c < n; c++) sum -= m[r][c] * x[c];
    x[r] = sum / m[r][r];
  }
  return x;
}

// Homografia que leva os pontos de origem (imagem da câmera) aos de destino (tela).
// Com 4 pares o sistema é exato; com mais pares usa mínimos quadrados (equações normais).
export function computeHomography(src: Point[], dst: Point[]): Homography | null {
  if (src.length < 4 || src.length !== dst.length) return null;
  const rows: number[][] = [];
  const rhs: number[] = [];
  src.forEach((s, i) => {
    const { x, y } = s;
    const { x: u, y: v } = dst[i];
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    rhs.push(u);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    rhs.push(v);
  });
  const ata = Array.from({ length: 8 }, () => new Array<number>(8).fill(0));
  const atb = new Array<number>(8).fill(0);
  rows.forEach((row, k) => {
    for (let i = 0; i < 8; i++) {
      atb[i] += row[i] * rhs[k];
      for (let j = 0; j < 8; j++) ata[i][j] += row[i] * row[j];
    }
  });
  const h = solve(ata, atb);
  return h ? [...h, 1] : null;
}

export function applyHomography(h: Homography, p: Point): Point {
  const w = h[6] * p.x + h[7] * p.y + h[8];
  return {
    x: (h[0] * p.x + h[1] * p.y + h[2]) / w,
    y: (h[3] * p.x + h[4] * p.y + h[5]) / w,
  };
}

// Ajuste afim (escala, rotação, inclinação e deslocamento) por mínimos quadrados. Com poucos pontos
// medidos com a mão é mais estável que a homografia, que pode disparar para fora dos pontos usados.
export function computeAffine(src: Point[], dst: Point[]): Homography | null {
  if (src.length < 3 || src.length !== dst.length) return null;
  const ata = Array.from({ length: 3 }, () => new Array<number>(3).fill(0));
  const atu = [0, 0, 0];
  const atv = [0, 0, 0];
  src.forEach((s, i) => {
    const row = [s.x, s.y, 1];
    for (let a = 0; a < 3; a++) {
      atu[a] += row[a] * dst[i].x;
      atv[a] += row[a] * dst[i].y;
      for (let b = 0; b < 3; b++) ata[a][b] += row[a] * row[b];
    }
  });
  const u = solve(ata, atu);
  const v = solve(ata, atv);
  return u && v ? [u[0], u[1], u[2], v[0], v[1], v[2], 0, 0, 1] : null;
}

export const clamp01 = (p: Point): Point => ({
  x: Math.min(1, Math.max(0, p.x)),
  y: Math.min(1, Math.max(0, p.y)),
});
