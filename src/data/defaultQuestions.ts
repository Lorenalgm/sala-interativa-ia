import { Question } from '../types';

export const defaultQuestions: Question[] = [
  {
    id: 'ia-01',
    category: 'Visão computacional',
    prompt: 'Qual técnica de inteligência artificial é a base principal dos modelos modernos para detecção de objetos em imagens?',
    options: {
      A: 'Redes neurais convolucionais',
      B: 'Regressão linear múltipla',
      C: 'Tabelas de dispersão',
      D: 'Árvores de decisão simples',
    },
    correctOption: 'A',
    explanation: 'As redes neurais convolucionais utilizam filtros espaciais que aprendem padrões visuais como bordas, texturas e formas complexas.',
  },
  {
    id: 'ia-02',
    category: 'Aprendizado de máquina',
    prompt: 'O que caracteriza o aprendizado supervisionado?',
    options: {
      A: 'Treinamento sem qualquer intervenção humana',
      B: 'Uso de dados rotulados com pares de entrada e saída esperada',
      C: 'Agrupamento de dados baseado apenas em distância euclidiana',
      D: 'Execução de ações por tentativa e erro com recompensas',
    },
    correctOption: 'B',
    explanation: 'No aprendizado supervisionado os dados de treinamento contêm as respostas corretas para guiar o ajuste dos pesos do modelo.',
  },
  {
    id: 'ia-03',
    category: 'Marcadores fiduciais',
    prompt: 'Por que sistemas como ArUco utilizam bordas pretas ao redor da matriz binária?',
    options: {
      A: 'Para economizar tinta na impressão',
      B: 'Para facilitar a detecção rápida de quadriláteros na imagem binária',
      C: 'Apenas por razões estéticas',
      D: 'Para aumentar o peso do papel',
    },
    correctOption: 'B',
    explanation: 'A borda preta sólida cria um alto contraste com o fundo branco, permitindo localizar os quatro vértices do marcador com baixo custo computacional.',
  },
  {
    id: 'ia-04',
    category: 'Processamento de imagens',
    prompt: 'Qual operação matemática é aplicada repetidamente sobre uma imagem durante a etapa de convolução?',
    options: {
      A: 'Raiz cúbica de cada canal de cor',
      B: 'Interpolação polinomial de Lagrange',
      C: 'Produto escalar entre o núcleo e a janela deslizante da imagem',
      D: 'Divisão inteira por zero',
    },
    correctOption: 'C',
    explanation: 'A convolução multiplica os valores dos pixels vizinhos pelos pesos do núcleo e soma os resultados para gerar o mapa de características.',
  },
  {
    id: 'ia-05',
    category: 'Redes neurais',
    prompt: 'Qual é o papel da função de ativação em um neurônio artificial?',
    options: {
      A: 'Introduzir não linearidade na rede neural',
      B: 'Aumentar a velocidade do disco rígido',
      C: 'Garantir que todos os pesos fiquem zerados',
      D: 'Converter imagens coloridas para preto e branco',
    },
    correctOption: 'A',
    explanation: 'Sem funções de ativação não lineares, uma rede neural profunda equivaleria apenas a uma única transformação linear.',
  },
  {
    id: 'ia-06',
    category: 'Estimativa de pose',
    prompt: 'Quantos pontos anatômicos principais são rastreados pela biblioteca MediaPipe Pose no corpo humano?',
    options: {
      A: '8 pontos',
      B: '16 pontos',
      C: '33 pontos',
      D: '128 pontos',
    },
    correctOption: 'C',
    explanation: 'O modelo padrão do MediaPipe Pose detecta 33 marcos tridimensionais cobrindo rosto, tronco, braços e pernas.',
  },
];
