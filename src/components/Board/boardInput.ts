import { ClickMode } from '../../services/pointer';

// Na lousa o grupo aponta com a mão (palma = ponteiro) e clica com pinça ou parando 1 s
export interface BoardInputSettings {
  click: ClickMode;
}
