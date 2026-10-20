import { ClickMode } from '../../services/pointer';

// Como o grupo aponta na lousa: paleta de papel ou a mão (palma = ponteiro)
export type BoardInput = 'paddle' | 'hand';

export interface BoardInputSettings {
  input: BoardInput;
  click: ClickMode; // só vale com a mão: pinça ou parar 1 s
}
