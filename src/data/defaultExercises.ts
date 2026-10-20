import { Exercise } from '../types';

export const defaultExercises: Exercise[] = [
  {
    id: 'pose-01',
    type: 'arms_raised',
    title: 'Braços erguidos',
    description: 'Levante ambos os braços acima da linha da cabeça em sinal de vitória.',
    targetDurationSeconds: 3,
    difficulty: 'fácil',
    instructions: [
      'Fique em pé de frente para a câmera.',
      'Erga os dois braços totalmente para cima.',
      'Mantenha os pulsos acima dos ombros e da cabeça por 3 segundos.',
    ],
  },
  {
    id: 'pose-02',
    type: 't_pose',
    title: 'Postura em T',
    description: 'Abra os braços na horizontal alinhados com a altura dos ombros.',
    targetDurationSeconds: 3,
    difficulty: 'fácil',
    instructions: [
      'Mantenha a postura ereta olhando para a frente.',
      'Estenda os braços lateralmente formando uma linha reta.',
      'Sustente a posição nivelada por 3 segundos.',
    ],
  },
  {
    id: 'pose-03',
    type: 'star_pose',
    title: 'Posição de estrela',
    description: 'Afaste as pernas e erga os braços em diagonal aberta.',
    targetDurationSeconds: 4,
    difficulty: 'médio',
    instructions: [
      'Afaste os pés além da largura dos ombros.',
      'Abra os braços em diagonal para o alto.',
      'Mantenha o corpo estável e segure a posição.',
    ],
  },
  {
    id: 'pose-04',
    type: 'right_hand_up',
    title: 'Braço direito erguido',
    description: 'Levante apenas a mão direita para responder ou pedir a palavra.',
    targetDurationSeconds: 3,
    difficulty: 'fácil',
    instructions: [
      'Deixe o braço esquerdo abaixado junto ao corpo.',
      'Erga a mão direita acima do ombro.',
      'Mantenha a posição firme até a confirmação.',
    ],
  },
  {
    id: 'pose-05',
    type: 'squat',
    title: 'Agachamento livre',
    description: 'Flexione os joelhos mantendo o tronco firme e os quadris baixos.',
    targetDurationSeconds: 3,
    difficulty: 'médio',
    instructions: [
      'Posicione os pés na largura dos ombros.',
      'Dobre os joelhos como se fosse sentar em um banco.',
      'Segure a flexão até completar o tempo indicado.',
    ],
  },
];
