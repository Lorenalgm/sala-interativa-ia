import { Alternative } from '../types';

export interface Suggestion {
  id: string;
  text: string;
  reason: string;
}

// Poucas respostas dão percentuais enganosos
const MIN_RESPONSES = 3;
// Faixas de 35% e 70% de Crouch e Mazur (2001); os 40% de confusão são um valor inicial para ajustar
const LOW = 35;
const HIGH = 70;
const CONFUSION = 40;

// Regras de sugestão para uma pergunta. O professor decide se segue: cada uma traz o motivo.
export function suggestForQuestion(
  correctOption: Alternative,
  responses: Record<number, Alternative>
): Suggestion[] {
  const answers = Object.values(responses);
  const total = answers.length;
  if (total < MIN_RESPONSES) return [];

  const counts: Record<Alternative, number> = { A: 0, B: 0, C: 0, D: 0 };
  answers.forEach((a) => (counts[a] += 1));
  const accuracy = Math.round((counts[correctOption] / total) * 100);

  const result: Suggestion[] = [];

  if (accuracy < LOW) {
    result.push({
      id: 'reexplain',
      text: 'Retome a explicação antes de discutir.',
      reason: `Só ${accuracy}% acertaram, abaixo de ${LOW}%. Discutir em grupo com poucos acertos tende a reforçar o erro.`,
    });
  } else if (accuracy <= HIGH) {
    result.push({
      id: 'discuss',
      text: 'Abra a discussão em grupo e repita a pergunta.',
      reason: `${accuracy}% acertaram, entre ${LOW}% e ${HIGH}%: há acertos suficientes para os alunos se ajudarem.`,
    });
  } else {
    result.push({
      id: 'advance',
      text: 'Revele a resposta e avance.',
      reason: `${accuracy}% acertaram, acima de ${HIGH}%. A turma já domina este ponto.`,
    });
  }

  (['A', 'B', 'C', 'D'] as Alternative[]).forEach((opt) => {
    const pct = Math.round((counts[opt] / total) * 100);
    if (opt !== correctOption && pct > CONFUSION) {
      result.push({
        id: `confusion-${opt}`,
        text: `Possível confusão comum: ${pct}% escolheram a alternativa ${opt}.`,
        reason: `Uma alternativa errada com mais de ${CONFUSION}% das respostas costuma indicar uma ideia equivocada compartilhada.`,
      });
    }
  });

  return result;
}
