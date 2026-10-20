import { ScriptId } from '../types';

export interface ActiveScript {
  id: ScriptId;
  name: string;
  goal: string;
  format: 'Individual' | 'Em grupo' | 'Em duplas';
  minutes: string;
  materials: string[];
  steps: string[];
  status: 'available' | 'soon';
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
    goal: 'O grupo move uma paleta de papel sobre a projeção para responder, sem tocar na tela.',
    format: 'Em grupo',
    minutes: '10 a 20 min',
    materials: ['Datashow', 'Câmera ao lado do datashow, virada para o quadro', 'Paleta de papel (uma por grupo)'],
    steps: [
      'Você escolhe as perguntas e monta os grupos, com uma paleta para cada um.',
      'O datashow mostra 4 marcadores e a câmera se ajusta ao quadro.',
      'Na vez do grupo, ele leva a paleta até a resposta e espera o anel encher.',
      'Errou? A zona fica vermelha e o grupo tenta de novo; no segundo erro a tela mostra a certa.',
      'A tela mostra os acertos por grupo e por pergunta.',
    ],
    status: 'available',
  },
];

export const getScript = (id: ScriptId): ActiveScript =>
  scripts.find((s) => s.id === id) ?? scripts[0];
