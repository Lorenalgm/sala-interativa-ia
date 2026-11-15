import { Alternative, Question, QuestionSessionRecord, RoundSession, ScriptId, Student } from '../types';

// Rodadas de exemplo para conhecer o Desempenho antes de usar com a turma.
// Usam as perguntas e os alunos cadastrados; ficam marcadas com demo: true e saem com um toque.

const LETTERS: Alternative[] = ['A', 'B', 'C', 'D'];

// Gerador determinístico: o mesmo exemplo toda vez
const random = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

export function buildDemoRounds(questions: Question[], students: Student[]): RoundSession[] {
  if (questions.length === 0 || students.length === 0) return [];
  const rnd = random(7);

  // A primeira habilidade (em ordem alfabética) é a mais difícil para a turma
  const skills = [...new Set(questions.map((q) => q.category || 'Geral'))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const hardSkill = skills.find((s) => s.toLowerCase().includes('mat')) ?? skills[0];
  const difficulty = (skill: string) => (skill === hardSkill ? 0.25 : skills.indexOf(skill) % 2 === 0 ? -0.15 : 0.05);

  // Alguns alunos com dificuldade, dois que dominam tudo e um que falta bastante
  const ability = new Map<number, number>();
  students.forEach((s, i) => ability.set(s.id, 0.78 + (rnd() - 0.5) * 0.25 + (i === 2 ? -0.43 : i === 6 ? -0.38 : i === 11 ? -0.33 : 0) + (i === 4 || i === 17 ? 0.15 : 0)));
  const absentee = students[Math.min(14, students.length - 1)]?.id;

  const plan: [number, ScriptId, number][] = [
    [21, 'quick-question', 4],
    [17, 'quick-question', 4],
    [14, 'group-draw', 3],
    [9, 'quick-question', 5],
    [5, 'interactive-board', 3],
    [2, 'quick-question', 5],
  ];

  const now = Date.now();
  let cursor = 0;
  return plan
    .map(([daysAgo, scriptId, size], ri) => {
      const ts = now - daysAgo * 86400000;
      const picked = Array.from({ length: Math.min(size, questions.length) }, () => questions[cursor++ % questions.length]);
      const records: QuestionSessionRecord[] = picked.map((q, qi) => {
        const skill = q.category || 'Geral';
        const wrongs = LETTERS.filter((l) => l !== q.correctOption);
        // Cada pergunta tem uma alternativa errada que atrai a turma, como costuma acontecer em sala
        const trap = wrongs[q.id.length % 3];
        const responses: Record<number, Alternative> = {};
        students.forEach((s) => {
          if (s.id === absentee && rnd() < 0.6) return;
          if (rnd() < 0.05) return;
          const early = ri < 2 && skill === hardSkill ? 0.1 : 0;
          const p = Math.max(0.05, Math.min(0.97, (ability.get(s.id) ?? 0.7) - difficulty(skill) - early));
          responses[s.id] = rnd() < p ? q.correctOption : rnd() < 0.7 ? trap : wrongs[Math.floor(rnd() * 3)];
        });
        return {
          id: `exemplo-${ri}-${qi}`,
          questionId: q.id,
          questionPrompt: q.prompt,
          skill,
          correctOption: q.correctOption,
          timestamp: ts + qi * 60000,
          responses,
          totalClassStudents: students.length,
        };
      });
      const total = records.reduce((a, r) => a + Object.keys(r.responses).length, 0);
      const right = records.reduce((a, r) => a + Object.values(r.responses).filter((v) => v === r.correctOption).length, 0);
      return {
        id: `exemplo-${ri}`,
        name: `Rodada de exemplo ${ri + 1}`,
        timestamp: ts,
        totalClassStudents: students.length,
        questions: records,
        overallAccuracy: total ? Math.round((right / total) * 100) : 0,
        totalResponses: total,
        scriptId,
        demo: true,
      };
    })
    .reverse();
}
