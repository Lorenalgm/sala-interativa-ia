import { Alternative } from '../types';

// Tempo mínimo com a mesma letra antes de contar a resposta
const STABLE_MS = 250;
// E pelo menos duas leituras iguais: um quadro só pode ser um cartão passando ou girando
const MIN_READS = 2;
// Um cartão que some por menos que isso entre leituras ainda conta como o mesmo gesto.
// A leitura em 1920 px pode levar 150-250 ms por quadro, e um quadro tremido falha:
// a tolerância precisa cobrir duas ou três leituras, senão a contagem zera o tempo todo.
const GAP_MS = 800;

interface Candidate {
  option: Alternative;
  since: number;
  lastSeen: number;
  reads: number;
  confirmed: boolean;
}

// Confirma a resposta de um cartão quando a mesma letra aparece em leituras seguidas
// por ~0,25 s. Devolve a letra uma vez só, no momento da confirmação.
export class StableReader {
  private candidates = new Map<number, Candidate>();

  // Devolve a alternativa quando ela acabou de ficar estável; senão, null
  feed(markerId: number, option: Alternative, now: number): Alternative | null {
    const current = this.candidates.get(markerId);
    if (!current || current.option !== option || now - current.lastSeen > GAP_MS) {
      this.candidates.set(markerId, { option, since: now, lastSeen: now, reads: 1, confirmed: false });
      return null;
    }
    current.lastSeen = now;
    current.reads += 1;
    if (!current.confirmed && current.reads >= MIN_READS && now - current.since >= STABLE_MS) {
      current.confirmed = true;
      return option;
    }
    return null;
  }

  reset(): void {
    this.candidates.clear();
  }
}
