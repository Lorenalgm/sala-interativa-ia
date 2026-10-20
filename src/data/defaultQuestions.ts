import { Question } from '../types';

// Perguntas de exemplo para o ensino fundamental, de várias matérias
export const defaultQuestions: Question[] = [
  {
    id: 'geral-01',
    category: 'Ciências',
    prompt: 'Qual destes animais é um mamífero?',
    options: {
      A: 'Tubarão',
      B: 'Golfinho',
      C: 'Pinguim',
      D: 'Sapo',
    },
    correctOption: 'B',
    explanation: 'O golfinho mora no mar, mas respira ar e mama no leite da mãe quando é filhote, como todo mamífero.',
  },
  {
    id: 'geral-02',
    category: 'Matemática',
    prompt: 'Quanto é 7 vezes 8?',
    options: {
      A: '54',
      B: '48',
      C: '56',
      D: '64',
    },
    correctOption: 'C',
    explanation: '7 × 8 = 56. Uma dica: 5, 6, 7, 8 (56 = 7 × 8).',
  },
  {
    id: 'geral-03',
    category: 'Geografia',
    prompt: 'Qual é a capital do Brasil?',
    options: {
      A: 'Brasília',
      B: 'Rio de Janeiro',
      C: 'São Paulo',
      D: 'Salvador',
    },
    correctOption: 'A',
    explanation: 'Brasília é a capital desde 1960. Antes disso, a capital era o Rio de Janeiro.',
  },
  {
    id: 'geral-04',
    category: 'Português',
    prompt: 'Qual palavra está escrita corretamente?',
    options: {
      A: 'Excessão',
      B: 'Exceção',
      C: 'Esceção',
      D: 'Exseção',
    },
    correctOption: 'B',
    explanation: 'Escreve-se "exceção", com x e ç.',
  },
  {
    id: 'geral-05',
    category: 'Ciências',
    prompt: 'Do que as plantas precisam para fazer o próprio alimento?',
    options: {
      A: 'Só de terra',
      B: 'Só de água',
      C: 'De escuro e frio',
      D: 'De luz, água e ar',
    },
    correctOption: 'D',
    explanation: 'Na fotossíntese, a planta usa a luz do sol, a água e o gás carbônico do ar para produzir o próprio alimento.',
  },
  {
    id: 'geral-06',
    category: 'Matemática',
    prompt: 'Quantos lados tem um hexágono?',
    options: {
      A: '5',
      B: '6',
      C: '7',
      D: '8',
    },
    correctOption: 'B',
    explanation: 'O hexágono tem 6 lados. Os favos de mel das abelhas têm esse formato.',
  },
];
