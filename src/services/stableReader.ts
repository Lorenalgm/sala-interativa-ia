import { Alternative } from '../types';

const STABLE_MS = 500;
// Um cartão que some por menos que isso entre quadros ainda conta como o mesmo gesto
const GAP_MS = 300;

interface Candidate {
  option: Alternative;
  since: number;
  lastSeen: number;
}

// Só confirma a resposta de um cartão depois de ~0,5 s com a mesma alternativa
export class StableReader {
  private candidates = new Map<number, Candidate>();

  // Devolve a alternativa quando ela acabou de ficar estável; senão, null
  feed(markerId: number, option: Alternative, now: number): Alternative | null {
    const current = this.candidates.get(markerId);
    if (!current || current.option !== option || now - current.lastSeen > GAP_MS) {
      this.candidates.set(markerId, { option, since: now, lastSeen: now });
      return null;
    }
    current.lastSeen = now;
    return now - current.since >= STABLE_MS ? option : null;
  }

  reset(): void {
    this.candidates.clear();
  }
}
