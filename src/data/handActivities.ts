// Conteúdo pronto dos modelos com a mão no quadro: cada pacote é uma atividade que o professor escolhe.

export interface PackInfo {
  id: string;
  subject: string; // disciplina, mostrada como etiqueta
  title: string;
  description: string;
  emoji: string;
}

// ---------- Onde fica? ----------

export interface ScaleTick {
  value: number;
  label: string;
}

export interface ScaleQuestion {
  id: string;
  prompt: string;
  answer: number;
  answerLabel: string; // como a resposta aparece na revelação ("3/4", "1822", "≈ 3")
  fact: string; // frase curta lida depois da revelação
}

export interface ScalePack extends PackInfo {
  min: number;
  max: number;
  ticks: ScaleTick[]; // marcas com número
  minorStep?: number; // tracinhos sem número entre as marcas
  decimals: number; // casas na diferença mostrada
  unit?: string; // " °C", " anos"
  gradient?: string; // cor da faixa (ex.: pH)
  leftLabel?: string;
  rightLabel?: string;
  questions: ScaleQuestion[];
}

export const SCALE_PACKS: ScalePack[] = [
  {
    id: 'fracoes',
    subject: 'Matemática',
    title: 'Frações na reta',
    description: 'Onde ficam 3/4, 1/3 e 0,9 entre o 0 e o 1?',
    emoji: '🍕',
    min: 0,
    max: 1,
    ticks: [
      { value: 0, label: '0' },
      { value: 0.5, label: '1/2' },
      { value: 1, label: '1' },
    ],
    decimals: 2,
    questions: [
      { id: 'f1', prompt: 'Onde fica 3/4?', answer: 0.75, answerLabel: '3/4', fact: '3/4 fica no meio do caminho entre 1/2 e 1.' },
      { id: 'f2', prompt: 'Onde fica 1/3?', answer: 1 / 3, answerLabel: '1/3', fact: 'Divida a reta em 3 partes iguais: 1/3 é o fim da primeira.' },
      { id: 'f3', prompt: 'Onde fica 0,9?', answer: 0.9, answerLabel: '0,9', fact: '0,9 é o mesmo que 9/10: falta só um décimo para chegar ao 1.' },
      { id: 'f4', prompt: 'Onde fica 2/5?', answer: 0.4, answerLabel: '2/5', fact: '2/5 é igual a 0,4: um pouco antes da metade.' },
      { id: 'f5', prompt: 'Onde fica 1/8?', answer: 0.125, answerLabel: '1/8', fact: '1/8 é a metade de 1/4, bem pertinho do zero.' },
    ],
  },
  {
    id: 'negativos',
    subject: 'Matemática',
    title: 'Números negativos',
    description: 'A reta do −10 ao 10, com decimais.',
    emoji: '🌡️',
    min: -10,
    max: 10,
    ticks: [-10, -5, 0, 5, 10].map((v) => ({ value: v, label: v < 0 ? `−${-v}` : String(v) })),
    minorStep: 1,
    decimals: 1,
    questions: [
      { id: 'n1', prompt: 'Onde fica −6?', answer: -6, answerLabel: '−6', fact: 'Quanto mais à esquerda, menor o número: −6 é menor que −5.' },
      { id: 'n2', prompt: 'Onde fica 3,5?', answer: 3.5, answerLabel: '3,5', fact: '3,5 fica no meio entre o 3 e o 4.' },
      { id: 'n3', prompt: 'Onde fica −1,5?', answer: -1.5, answerLabel: '−1,5', fact: '−1,5 está entre −2 e −1, bem perto do zero.' },
      { id: 'n4', prompt: 'Onde fica o oposto de 8?', answer: -8, answerLabel: '−8', fact: 'Oposto é o número à mesma distância do zero, do outro lado.' },
    ],
  },
  {
    id: 'brasil',
    subject: 'História',
    title: 'Linha do tempo do Brasil',
    description: 'Do século 16 até hoje: quando cada fato aconteceu?',
    emoji: '📜',
    min: 1500,
    max: 2025,
    ticks: [1500, 1600, 1700, 1800, 1900, 2000].map((v) => ({ value: v, label: String(v) })),
    minorStep: 50,
    decimals: 0,
    unit: ' anos',
    questions: [
      { id: 'h1', prompt: 'Quando a família real portuguesa chegou ao Brasil?', answer: 1808, answerLabel: '1808', fact: 'Fugindo das tropas de Napoleão, a corte se instalou no Rio de Janeiro.' },
      { id: 'h2', prompt: 'Quando foi a Independência do Brasil?', answer: 1822, answerLabel: '1822', fact: 'Dom Pedro proclamou a Independência em 7 de setembro de 1822.' },
      { id: 'h3', prompt: 'Quando foi assinada a Lei Áurea, que aboliu a escravidão?', answer: 1888, answerLabel: '1888', fact: 'O Brasil foi o último país das Américas a abolir a escravidão.' },
      { id: 'h4', prompt: 'Quando Brasília foi inaugurada?', answer: 1960, answerLabel: '1960', fact: 'A capital saiu do Rio de Janeiro e foi para o centro do país.' },
      { id: 'h5', prompt: 'Quando foi promulgada a Constituição atual?', answer: 1988, answerLabel: '1988', fact: 'Ficou conhecida como Constituição Cidadã, depois da ditadura militar.' },
    ],
  },
  {
    id: 'ph',
    subject: 'Química',
    title: 'Escala de pH',
    description: 'Do ácido ao básico: onde fica o limão, o sabão, o sangue?',
    emoji: '🧪',
    min: 0,
    max: 14,
    ticks: [0, 2, 4, 6, 7, 8, 10, 12, 14].map((v) => ({ value: v, label: String(v) })),
    minorStep: 1,
    decimals: 1,
    gradient: 'linear-gradient(90deg, #e11d48 0%, #f97316 20%, #facc15 38%, #22c55e 50%, #14b8a6 62%, #3b82f6 80%, #7c3aed 100%)',
    leftLabel: 'Ácido',
    rightLabel: 'Básico',
    questions: [
      { id: 'p1', prompt: 'Onde fica a água pura?', answer: 7, answerLabel: '7', fact: 'pH 7 é neutro: nem ácido, nem básico.' },
      { id: 'p2', prompt: 'Onde fica o suco de limão?', answer: 2, answerLabel: '≈ 2', fact: 'O limão é bem ácido: por isso arde num machucado.' },
      { id: 'p3', prompt: 'Onde fica o sangue humano?', answer: 7.4, answerLabel: '≈ 7,4', fact: 'O sangue é levemente básico, e o corpo o mantém entre 7,35 e 7,45.' },
      { id: 'p4', prompt: 'Onde fica a água sanitária?', answer: 12.5, answerLabel: '≈ 12,5', fact: 'Produtos de limpeza fortes costumam ser bem básicos.' },
      { id: 'p5', prompt: 'Onde fica o vinagre?', answer: 3, answerLabel: '≈ 3', fact: 'O vinagre tem ácido acético, e o pH fica perto de 3.' },
    ],
  },
  {
    id: 'temperatura',
    subject: 'Ciências',
    title: 'Termômetro',
    description: 'Do freezer à água fervendo, em graus Celsius.',
    emoji: '🔥',
    min: -20,
    max: 120,
    ticks: [-20, 0, 20, 40, 60, 80, 100, 120].map((v) => ({ value: v, label: v < 0 ? `−${-v}` : String(v) })),
    minorStep: 10,
    decimals: 0,
    unit: ' °C',
    gradient: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 20%, #a3e635 40%, #facc15 60%, #f97316 80%, #dc2626 100%)',
    questions: [
      { id: 't1', prompt: 'Em que temperatura a água congela?', answer: 0, answerLabel: '0 °C', fact: 'Abaixo de 0 °C a água vira gelo.' },
      { id: 't2', prompt: 'Qual é a temperatura do corpo humano?', answer: 36.5, answerLabel: '≈ 36,5 °C', fact: 'Acima de 37,8 °C já é considerado febre.' },
      { id: 't3', prompt: 'Em que temperatura a água ferve, ao nível do mar?', answer: 100, answerLabel: '100 °C', fact: 'No alto de uma montanha a água ferve antes, com menos de 100 °C.' },
      { id: 't4', prompt: 'Qual é a temperatura de um freezer?', answer: -18, answerLabel: '≈ −18 °C', fact: 'Bem abaixo de zero, os alimentos duram meses.' },
    ],
  },
];

// ---------- Classificar em grupos ----------

export interface SortCategory {
  id: string;
  name: string;
  color: string; // cor da caixa
  tint: string; // fundo claro da caixa
}

export interface SortItem {
  id: string;
  text: string;
  emoji?: string;
  category: string;
}

export interface SortPack extends PackInfo {
  prompt: string;
  categories: SortCategory[];
  items: SortItem[];
}

const C = {
  green: { color: '#1f7a3a', tint: '#e8f5ec' },
  orange: { color: '#b25000', tint: '#fff1e0' },
  purple: { color: '#7a3d9a', tint: '#f4eafa' },
  blue: { color: '#0040dd', tint: '#e6edff' },
  red: { color: '#c0002a', tint: '#ffe8ec' },
};

export const SORT_PACKS: SortPack[] = [
  {
    id: 'animais',
    subject: 'Ciências',
    title: 'Mamífero, ave ou réptil?',
    description: 'Cuidado com a baleia e o pinguim.',
    emoji: '🐋',
    prompt: 'Leve cada animal para o grupo certo',
    categories: [
      { id: 'mamifero', name: 'Mamífero', ...C.orange },
      { id: 'ave', name: 'Ave', ...C.blue },
      { id: 'reptil', name: 'Réptil', ...C.green },
    ],
    items: [
      { id: 'baleia', text: 'Baleia', emoji: '🐋', category: 'mamifero' },
      { id: 'morcego', text: 'Morcego', emoji: '🦇', category: 'mamifero' },
      { id: 'pinguim', text: 'Pinguim', emoji: '🐧', category: 'ave' },
      { id: 'jacare', text: 'Jacaré', emoji: '🐊', category: 'reptil' },
      { id: 'golfinho', text: 'Golfinho', emoji: '🐬', category: 'mamifero' },
      { id: 'tartaruga', text: 'Tartaruga', emoji: '🐢', category: 'reptil' },
      { id: 'avestruz', text: 'Avestruz', emoji: '🪶', category: 'ave' },
      { id: 'cobra', text: 'Cobra', emoji: '🐍', category: 'reptil' },
    ],
  },
  {
    id: 'classes',
    subject: 'Português',
    title: 'Classes de palavras',
    description: 'Substantivo, verbo ou adjetivo?',
    emoji: '✏️',
    prompt: 'Cada palavra vai para a sua classe',
    categories: [
      { id: 'substantivo', name: 'Substantivo', ...C.blue },
      { id: 'verbo', name: 'Verbo', ...C.red },
      { id: 'adjetivo', name: 'Adjetivo', ...C.purple },
    ],
    items: [
      { id: 'escola', text: 'escola', category: 'substantivo' },
      { id: 'correr', text: 'correr', category: 'verbo' },
      { id: 'feliz', text: 'feliz', category: 'adjetivo' },
      { id: 'livro', text: 'livro', category: 'substantivo' },
      { id: 'cantar', text: 'cantar', category: 'verbo' },
      { id: 'alto', text: 'alto', category: 'adjetivo' },
      { id: 'amizade', text: 'amizade', category: 'substantivo' },
      { id: 'pular', text: 'pular', category: 'verbo' },
    ],
  },
  {
    id: 'energia',
    subject: 'Geografia',
    title: 'Fontes de energia',
    description: 'Renovável ou não renovável?',
    emoji: '⚡',
    prompt: 'Essa fonte de energia acaba ou se renova?',
    categories: [
      { id: 'renovavel', name: 'Renovável', ...C.green },
      { id: 'nao', name: 'Não renovável', ...C.orange },
    ],
    items: [
      { id: 'solar', text: 'Solar', emoji: '☀️', category: 'renovavel' },
      { id: 'petroleo', text: 'Petróleo', emoji: '🛢️', category: 'nao' },
      { id: 'eolica', text: 'Eólica', emoji: '🌬️', category: 'renovavel' },
      { id: 'carvao', text: 'Carvão mineral', emoji: '⛏️', category: 'nao' },
      { id: 'hidreletrica', text: 'Hidrelétrica', emoji: '💧', category: 'renovavel' },
      { id: 'gas', text: 'Gás natural', emoji: '🔥', category: 'nao' },
      { id: 'biomassa', text: 'Biomassa', emoji: '🌾', category: 'renovavel' },
      { id: 'nuclear', text: 'Nuclear (urânio)', emoji: '⚛️', category: 'nao' },
    ],
  },
  {
    id: 'primos',
    subject: 'Matemática',
    title: 'Primo ou composto?',
    description: 'Números de 2 a 29.',
    emoji: '🔢',
    prompt: 'Primo só se divide por 1 e por ele mesmo',
    categories: [
      { id: 'primo', name: 'Primo', ...C.purple },
      { id: 'composto', name: 'Composto', ...C.blue },
    ],
    items: [2, 9, 11, 15, 17, 21, 23, 27].map((n) => ({
      id: `n${n}`,
      text: String(n),
      category: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29].includes(n) ? 'primo' : 'composto',
    })),
  },
  {
    id: 'acido-base',
    subject: 'Química',
    title: 'Ácido ou base?',
    description: 'Coisas da cozinha e da limpeza.',
    emoji: '🍋',
    prompt: 'Esse produto é ácido ou básico?',
    categories: [
      { id: 'acido', name: 'Ácido', ...C.red },
      { id: 'base', name: 'Base', ...C.blue },
    ],
    items: [
      { id: 'limao', text: 'Limão', emoji: '🍋', category: 'acido' },
      { id: 'sabao', text: 'Sabão', emoji: '🧼', category: 'base' },
      { id: 'vinagre', text: 'Vinagre', emoji: '🫙', category: 'acido' },
      { id: 'sanitaria', text: 'Água sanitária', emoji: '🧴', category: 'base' },
      { id: 'refri', text: 'Refrigerante', emoji: '🥤', category: 'acido' },
      { id: 'magnesia', text: 'Leite de magnésia', emoji: '🥛', category: 'base' },
    ],
  },
];

// ---------- Misturar cores ----------

export type MixMode = 'paint' | 'light';

export interface MixPrimary {
  name: string;
  css: string;
}

export interface MixChallenge {
  id: string;
  name: string;
  weights: [number, number, number]; // quanto de cada primária (soma 1)
  fact: string;
}

export interface MixPack extends PackInfo {
  mode: MixMode;
  primaries: [MixPrimary, MixPrimary, MixPrimary];
  challenges: MixChallenge[];
}

const third = 1 / 3;

export const MIX_PACKS: MixPack[] = [
  {
    id: 'tinta',
    subject: 'Arte',
    title: 'Mistura de tintas',
    description: 'Vermelho, amarelo e azul: as primárias da pintura.',
    emoji: '🎨',
    mode: 'paint',
    primaries: [
      { name: 'Vermelho', css: '#ff0000' },
      { name: 'Amarelo', css: '#ffff00' },
      { name: 'Azul', css: '#295f99' },
    ],
    challenges: [
      { id: 'laranja', name: 'Laranja', weights: [0.5, 0.5, 0], fact: 'Laranja é secundária: vermelho e amarelo em partes iguais.' },
      { id: 'verde', name: 'Verde', weights: [0, 0.5, 0.5], fact: 'Verde é secundária: amarelo e azul em partes iguais.' },
      { id: 'roxo', name: 'Roxo', weights: [0.5, 0, 0.5], fact: 'Roxo é secundária: vermelho e azul em partes iguais.' },
      { id: 'vermelho-alaranjado', name: 'Vermelho-alaranjado', weights: [0.75, 0.25, 0], fact: 'Cor terciária: mais vermelho do que amarelo.' },
      { id: 'marrom', name: 'Marrom', weights: [third, third, third], fact: 'As três primárias juntas escurecem a tinta e dão marrom.' },
    ],
  },
  {
    id: 'luz',
    subject: 'Ciências',
    title: 'Mistura de luzes',
    description: 'Vermelho, verde e azul: as cores das telas.',
    emoji: '💡',
    mode: 'light',
    primaries: [
      { name: 'Vermelho', css: '#ff0000' },
      { name: 'Verde', css: '#00ff00' },
      { name: 'Azul', css: '#0000ff' },
    ],
    challenges: [
      { id: 'amarelo', name: 'Amarelo', weights: [0.5, 0.5, 0], fact: 'Na tela não existe luz amarela: é vermelho e verde juntos.' },
      { id: 'ciano', name: 'Ciano', weights: [0, 0.5, 0.5], fact: 'Verde e azul juntos dão ciano, a cor da tinta azul da impressora.' },
      { id: 'magenta', name: 'Magenta', weights: [0.5, 0, 0.5], fact: 'Vermelho e azul juntos dão magenta, que não aparece no arco-íris.' },
      { id: 'branco', name: 'Branco', weights: [third, third, third], fact: 'As três luzes juntas dão branco. Com tinta, daria escuro!' },
      { id: 'laranja-luz', name: 'Laranja', weights: [2 / 3, 1 / 3, 0], fact: 'Laranja na tela: bastante vermelho e um pouco de verde.' },
    ],
  },
];
