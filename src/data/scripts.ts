import { ScriptId } from '../types';

export interface ActiveScript {
  id: ScriptId;
  name: string;
  goal: string;
  format: 'Individual' | 'Em grupo' | 'Em duplas' | 'Mão no quadro';
  minutes: string;
  materials: string[];
  steps: string[];
  status: 'available' | 'soon';
  note?: string; // aviso curto na página do modelo
}

export const scripts: ActiveScript[] = [
  {
    id: 'quick-question',
    name: 'Pergunta rápida',
    goal: 'Ver na hora o que cada aluno entendeu, para aquecer ou fechar a aula.',
    format: 'Individual',
    minutes: '5 a 10 min',
    materials: ['Cartões de resposta', 'Datashow', 'Câmera virada para a turma'],
    steps: [
      'Você escolhe as perguntas e inicia.',
      'Os alunos levantam o cartão e a lista marca quem respondeu.',
      'Você encerra e a tela mostra a resposta certa e quantos escolheram cada letra.',
      'Passe para a próxima pergunta.',
    ],
    status: 'available',
  },
  {
    id: 'group-draw',
    name: 'Grupo com sorteio',
    goal: 'Fazer todo mundo entender a resposta: o grupo discute e o sistema sorteia quem responde.',
    format: 'Em grupo',
    minutes: '10 a 15 min',
    materials: ['Cartões de resposta', 'Datashow', 'Câmera virada para a turma'],
    steps: [
      'No início, você marca os ausentes e monta grupos de 3 ou 4 alunos.',
      'A pergunta é projetada e os grupos discutem, com cronômetro.',
      'O sistema sorteia um aluno de cada grupo e mostra os nomes na tela.',
      'Só os sorteados levantam o cartão. A câmera ignora os outros.',
      'A tela mostra o resultado de cada grupo e o placar da turma, sem ranking.',
    ],
    status: 'available',
  },
  {
    id: 'peer-instruction',
    name: 'Instrução por pares',
    goal: 'Votar, discutir em dupla e votar de novo, comparando os dois votos.',
    format: 'Em duplas',
    minutes: '10 a 15 min',
    materials: ['Cartões de resposta', 'Datashow', 'Câmera virada para a turma'],
    steps: [],
    status: 'soon',
  },
  {
    id: 'interactive-board',
    name: 'Lousa interativa no quadro',
    goal: 'O grupo move a mão sobre a projeção para responder, sem tocar na tela.',
    format: 'Em grupo',
    minutes: '10 a 20 min',
    materials: ['Datashow', 'Câmera ao lado do datashow, virada para o quadro'],
    steps: [
      'Você escolhe as perguntas e monta os grupos.',
      'O datashow mostra 4 marcadores e a câmera se ajusta ao quadro.',
      'Na vez do grupo, um aluno leva a mão até a resposta e junta polegar e indicador para escolher.',
      'Errou? A zona fica vermelha e o grupo tenta de novo; no segundo erro a tela mostra a certa.',
      'A tela mostra os acertos por grupo e por pergunta.',
    ],
    status: 'available',
  },
  {
    id: 'where-is',
    name: 'Onde fica?',
    goal: 'A mão do aluno vira a resposta: ele aponta na reta onde fica a fração, a data ou o pH.',
    format: 'Mão no quadro',
    minutes: '5 a 15 min',
    materials: ['Datashow', 'Câmera ao lado do datashow, virada para o quadro'],
    steps: [
      'Você escolhe a atividade: frações, negativos, linha do tempo, pH ou termômetro.',
      'O datashow mostra 4 marcadores e a câmera se ajusta ao quadro e à mão.',
      'A pergunta aparece e um aluno leva a mão até o ponto da reta.',
      'Ele para a mão e o anel enche. A tela mostra a resposta e o quão perto ele chegou.',
      'No fim, a tela mostra quantas foram na mosca, perto e longe.',
    ],
    note: 'Este modelo não gera resultados no Desempenho.',
    status: 'available',
  },
  {
    id: 'sort-groups',
    name: 'Classificar em grupos',
    goal: 'Os alunos pegam cartões com a pinça e soltam na caixa do grupo certo.',
    format: 'Mão no quadro',
    minutes: '5 a 10 min',
    materials: ['Datashow', 'Câmera ao lado do datashow, virada para o quadro'],
    steps: [
      'Você escolhe a atividade: animais, classes de palavras, energia, primos ou ácido e base.',
      'A câmera se ajusta ao quadro e à mão (só na primeira vez da aula).',
      'O aluno junta polegar e indicador sobre um cartão e o arrasta até uma caixa.',
      'Na caixa certa o cartão entra; na errada a caixa balança e ele volta.',
      'No fim, a tela mostra o que foi de primeira e o que vale conversar.',
    ],
    note: 'Este modelo não gera resultados no Desempenho.',
    status: 'available',
  },
  {
    id: 'color-mix',
    name: 'Misturar cores',
    goal: 'A posição da mão no triângulo das primárias decide a mistura, até chegar à cor pedida.',
    format: 'Mão no quadro',
    minutes: '5 a 10 min',
    materials: ['Datashow', 'Câmera ao lado do datashow, virada para o quadro'],
    steps: [
      'Você escolhe tinta (Arte) ou luz (Ciências).',
      'A câmera se ajusta ao quadro e à mão.',
      'A tela pede uma cor e o aluno passeia com a mão no triângulo.',
      'As barras mostram quanto de cada primária entrou. Na cor certa, ele segura 1 s.',
      'O triângulo se revela inteiro, com todas as misturas possíveis.',
    ],
    note: 'Este modelo não gera resultados no Desempenho.',
    status: 'available',
  },
];

export const getScript = (id: ScriptId): ActiveScript =>
  scripts.find((s) => s.id === id) ?? scripts[0];
