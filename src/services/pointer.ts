import { Point } from './homography';

export const DWELL_MS = 1000; // tempo parado sobre a zona até registrar
export const LOST_MS = 300; // falha de leitura tolerada: mantém a última posição
export const LOST_MS_HAND = 500; // a mão some mais vezes que a paleta (dedos fechando, luz)
export const ZONE_MARGIN = 0.03; // folga ao redor da zona, como fração da tela
export const SMOOTHING = 0.5; // peso do quadro novo na média móvel
export const PINCH_CLOSED = 0.4; // polegar e indicador juntos: clique
export const PINCH_OPEN = 0.75; // abriu a pinça: libera o próximo clique
export const PINCH_HOLD_MS = 100; // pinça fechada por esse tempo antes de valer
export const HAND_SETTLE_MS = 250; // mão recém-vista não clica: evita leitura falsa ao entrar na imagem

// Filtro One Euro: firme quando a mão está parada e sem atraso quando ela se move rápido
export const EURO_MIN_CUTOFF = 1.2; // Hz, suavização com a mão parada
export const EURO_BETA = 8; // quanto a suavização cai com a velocidade (frações da tela por segundo)

const alpha = (cutoff: number, dt: number) => 1 / (1 + 1 / (2 * Math.PI * cutoff * dt));

class AxisFilter {
  private x: number | null = null;
  private dx = 0;
  public reset() {
    this.x = null;
    this.dx = 0;
  }
  public filter(value: number, dt: number): number {
    if (this.x === null) {
      this.x = value;
      return value;
    }
    if (dt < 0.001) return this.x;
    const rawSpeed = (value - this.x) / dt;
    this.dx += alpha(1, dt) * (rawSpeed - this.dx);
    const cutoff = EURO_MIN_CUTOFF + EURO_BETA * Math.abs(this.dx);
    this.x += alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }
}

// Filtro One Euro para um ponto (x, y)
export class PointFilter {
  private fx = new AxisFilter();
  private fy = new AxisFilter();
  public reset() {
    this.fx.reset();
    this.fy.reset();
  }
  public filter(p: Point, dt: number): Point {
    return { x: this.fx.filter(p.x, dt), y: this.fy.filter(p.y, dt) };
  }
}

export type ClickMode = 'dwell' | 'pinch';

export interface Zone {
  id: string;
  x: number; // frações da tela (0 a 1)
  y: number;
  w: number;
  h: number;
}

export interface PointerState {
  pos: Point | null; // posição suavizada, em fração da tela
  zoneId: string | null; // zona sob o ponteiro
  progress: number; // 0 a 1: o anel
  fired: string | null; // zona registrada neste quadro
}

const inside = (z: Zone, p: Point, margin: number) =>
  p.x >= z.x - margin && p.x <= z.x + z.w + margin && p.y >= z.y - margin && p.y <= z.y + z.h + margin;

// Distância do ponto até o retângulo da zona (0 se estiver dentro)
const distanceTo = (z: Zone, p: Point) =>
  Math.hypot(Math.max(z.x - p.x, 0, p.x - (z.x + z.w)), Math.max(z.y - p.y, 0, p.y - (z.y + z.h)));

// Suaviza a posição da paleta e transforma "ficar parado sobre uma zona" em clique
export class DwellPointer {
  private pos: Point | null = null;
  private lastSeen = 0;
  private zoneId: string | null = null;
  private since = 0;
  private latched = false; // já registrou nesta zona: precisa sair dela para registrar de novo

  private fx = new AxisFilter();
  private fy = new AxisFilter();
  private lastUpdate = 0;
  private handSince = 0;
  private closedSince: number | null = null;
  private needsOpen = false; // depois de um clique ou de um reinício, a pinça precisa abrir antes de valer de novo

  // adaptive: filtro One Euro em vez da média móvel (usado com a mão)
  // snap: distância máxima (fração da tela) em que a zona mais próxima conta como apontada
  constructor(private mode: ClickMode = 'dwell', private adaptive = false, private snap = 0) {}

  public reset(): void {
    this.pos = null;
    this.zoneId = null;
    this.latched = false;
    this.fx.reset();
    this.fy.reset();
    this.closedSince = null;
    this.needsOpen = this.mode === 'pinch';
  }

  // pinch: razão polegar-indicador / tamanho da mão, usada só no modo 'pinch'
  public update(now: number, point: Point | null, zones: Zone[], pinch: number | null = null): PointerState {
    const dt = this.lastUpdate ? (now - this.lastUpdate) / 1000 : 0;
    this.lastUpdate = now;
    if (!this.pos && point) this.handSince = now;
    if (point && this.adaptive) {
      this.pos = { x: this.fx.filter(point.x, dt), y: this.fy.filter(point.y, dt) };
      this.lastSeen = now;
    } else if (point) {
      this.pos = this.pos
        ? {
            x: this.pos.x * (1 - SMOOTHING) + point.x * SMOOTHING,
            y: this.pos.y * (1 - SMOOTHING) + point.y * SMOOTHING,
          }
        : point;
      this.lastSeen = now;
    } else if (this.pos && now - this.lastSeen > (this.adaptive ? LOST_MS_HAND : LOST_MS)) {
      this.pos = null;
      this.fx.reset();
      this.fy.reset();
    }

    if (!this.pos) {
      this.zoneId = null;
      this.latched = false;
      return { pos: null, zoneId: null, progress: 0, fired: null };
    }

    // Dentro da zona atual vale a folga; para entrar numa zona nova, só o retângulo
    const current = this.zoneId ? zones.find((z) => z.id === this.zoneId) : undefined;
    let hit: Zone | undefined;
    if (this.snap > 0) {
      // Zonas grandes: vale a mais próxima, e a atual só troca se a outra estiver bem mais perto
      const pos = this.pos;
      const ranked = zones.map((z) => ({ z, d: distanceTo(z, pos) })).sort((a, b) => a.d - b.d);
      const best = ranked[0];
      const cur = current ? ranked.find((r) => r.z.id === current.id) : undefined;
      if (cur && cur.d <= best.d + 0.04 && cur.d <= this.snap) hit = cur.z;
      else if (best && best.d <= this.snap) hit = best.z;
    } else {
      hit =
        current && inside(current, this.pos, ZONE_MARGIN)
          ? current
          : zones.find((z) => inside(z, this.pos as Point, 0));
    }

    if (this.mode === 'pinch') {
      // O anel mostra a pinça fechando; o clique vale quando ela fecha sobre uma zona
      const ratio = pinch ?? 1;
      if (ratio >= PINCH_OPEN) {
        this.latched = false;
        this.needsOpen = false;
      }
      if (ratio <= PINCH_CLOSED) this.closedSince = this.closedSince ?? now;
      else this.closedSince = null;
      this.zoneId = hit ? hit.id : null;
      if (!hit) return { pos: this.pos, zoneId: null, progress: 0, fired: null };
      const progress = Math.min(1, Math.max(0, (PINCH_OPEN - ratio) / (PINCH_OPEN - PINCH_CLOSED)));
      const held = this.closedSince !== null && now - this.closedSince >= PINCH_HOLD_MS;
      if (held && !this.latched && !this.needsOpen && now - this.handSince >= HAND_SETTLE_MS) {
        this.latched = true;
        return { pos: this.pos, zoneId: hit.id, progress: 1, fired: hit.id };
      }
      return { pos: this.pos, zoneId: hit.id, progress, fired: null };
    }

    if (!hit) {
      this.zoneId = null;
      this.latched = false;
      return { pos: this.pos, zoneId: null, progress: 0, fired: null };
    }
    if (hit.id !== this.zoneId) {
      this.zoneId = hit.id;
      this.since = now;
      this.latched = false;
    }
    if (this.latched) return { pos: this.pos, zoneId: hit.id, progress: 1, fired: null };

    const progress = Math.min(1, (now - this.since) / DWELL_MS);
    if (progress >= 1) {
      this.latched = true;
      return { pos: this.pos, zoneId: hit.id, progress: 1, fired: hit.id };
    }
    return { pos: this.pos, zoneId: hit.id, progress, fired: null };
  }
}
