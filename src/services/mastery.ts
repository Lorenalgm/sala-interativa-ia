import { Alternative, RoundSession, Student } from '../types';

// Bayesian Knowledge Tracing enxuto (Corbett e Anderson, 1994), com os mesmos
// parâmetros para todas as habilidades. São valores iniciais, a ajustar nos testes em sala.
export const BKT = {
  init: 0.3, // chance de já dominar antes da primeira resposta
  learn: 0.2, // chance de aprender a cada resposta
  guess: 0.25, // acertar sem dominar (4 alternativas)
  slip: 0.1, // errar dominando
} as const;

// Menos respostas que isso: o painel mostra "sem dados" em vez de um nível
export const MIN_ANSWERS = 3;

// Abaixo de 60%: reforço. De 60% a 80%: em progresso. Acima de 80%: dominando.
export const LEVEL_CUTS = { reinforce: 0.6, mastered: 0.8 } as const;

export type MasteryLevel = 'reinforce' | 'progress' | 'mastered' | 'nodata';
export type Difficulty = 'high' | 'medium' | 'low' | 'nodata';

export const LEVEL_LABEL: Record<MasteryLevel, string> = {
  reinforce: 'Precisa de reforço',
  progress: 'Em progresso',
  mastered: 'Dominando',
  nodata: 'Sem dados',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  high: 'Dificuldade alta',
  medium: 'Dificuldade média',
  low: 'Dificuldade baixa',
  nodata: 'Sem dados',
};

// Atualiza a chance de domínio depois de uma resposta
export function bktUpdate(p: number, correct: boolean): number {
  const { guess, slip, learn } = BKT;
  const posterior = correct
    ? (p * (1 - slip)) / (p * (1 - slip) + (1 - p) * guess)
    : (p * slip) / (p * slip + (1 - p) * (1 - guess));
  return posterior + (1 - posterior) * learn;
}

export function levelOf(mastery: number, answers: number): MasteryLevel {
  if (answers < MIN_ANSWERS) return 'nodata';
  if (mastery < LEVEL_CUTS.reinforce) return 'reinforce';
  if (mastery <= LEVEL_CUTS.mastered) return 'progress';
  return 'mastered';
}

export interface SkillMastery {
  skill: string;
  answers: number;
  correct: number;
  mastery: number;
  level: MasteryLevel;
  history: number[]; // domínio depois de cada resposta
}

export interface StudentMasteryRow {
  studentId: number;
  skills: Record<string, SkillMastery>;
}

export interface Confusion {
  questionPrompt: string;
  option: Alternative;
  percent: number;
}

export interface SkillSummary {
  skill: string;
  totalAnswers: number;
  accuracy: number; // % de acerto bruto
  averageMastery: number; // média entre os alunos com dados (0 a 1)
  studentsWithData: number;
  counts: Record<MasteryLevel, number>;
  difficulty: Difficulty;
  confusions: Confusion[];
}

export interface MasteryResult {
  skills: SkillSummary[];
  students: StudentMasteryRow[];
}

const CONFUSION = 0.4;

function difficultyOf(reinforce: number, withData: number): Difficulty {
  if (withData === 0) return 'nodata';
  const share = reinforce / withData;
  if (share > 0.5) return 'high';
  if (share >= 0.25) return 'medium';
  return 'low';
}

// Estima o domínio de cada aluno em cada habilidade, na ordem em que as respostas aconteceram
export function computeMastery(rounds: RoundSession[], students: Student[]): MasteryResult {
  const known = new Set(students.map((s) => s.id));
  const rows = new Map<number, StudentMasteryRow>(
    students.map((s) => [s.id, { studentId: s.id, skills: {} }])
  );
  const skillTotals = new Map<string, { answers: number; correct: number }>();
  // Respostas por pergunta (agregadas entre rodadas), para achar a confusão comum
  const byQuestion = new Map<string, { skill: string; prompt: string; counts: Record<Alternative, number>; correctOption: Alternative }>();

  const chronological = [...rounds].sort((a, b) => a.timestamp - b.timestamp);
  for (const round of chronological) {
    for (const q of round.questions) {
      const skill = q.skill || 'Geral';
      const key = `${skill}::${q.questionId}`;
      const stat =
        byQuestion.get(key) ??
        { skill, prompt: q.questionPrompt, counts: { A: 0, B: 0, C: 0, D: 0 }, correctOption: q.correctOption };
      byQuestion.set(key, stat);

      for (const [idStr, answer] of Object.entries(q.responses)) {
        const id = Number(idStr);
        if (!known.has(id)) continue;
        const correct = answer === q.correctOption;
        const row = rows.get(id)!;
        const current =
          row.skills[skill] ??
          { skill, answers: 0, correct: 0, mastery: BKT.init, level: 'nodata' as MasteryLevel, history: [] };
        current.mastery = bktUpdate(current.mastery, correct);
        current.answers += 1;
        if (correct) current.correct += 1;
        current.history.push(current.mastery);
        current.level = levelOf(current.mastery, current.answers);
        row.skills[skill] = current;

        const total = skillTotals.get(skill) ?? { answers: 0, correct: 0 };
        total.answers += 1;
        if (correct) total.correct += 1;
        skillTotals.set(skill, total);
        stat.counts[answer] += 1;
      }
    }
  }

  const skills: SkillSummary[] = [...skillTotals.entries()].map(([skill, total]) => {
    const counts: Record<MasteryLevel, number> = { reinforce: 0, progress: 0, mastered: 0, nodata: 0 };
    let masterySum = 0;
    let withData = 0;
    rows.forEach((row) => {
      const m = row.skills[skill];
      if (!m) return;
      counts[m.level] += 1;
      if (m.level !== 'nodata') {
        masterySum += m.mastery;
        withData += 1;
      }
    });

    const confusions: Confusion[] = [];
    byQuestion.forEach((stat) => {
      if (stat.skill !== skill) return;
      const sum = stat.counts.A + stat.counts.B + stat.counts.C + stat.counts.D;
      if (sum < MIN_ANSWERS) return;
      (['A', 'B', 'C', 'D'] as Alternative[]).forEach((opt) => {
        if (opt !== stat.correctOption && stat.counts[opt] / sum > CONFUSION) {
          confusions.push({
            questionPrompt: stat.prompt,
            option: opt,
            percent: Math.round((stat.counts[opt] / sum) * 100),
          });
        }
      });
    });

    return {
      skill,
      totalAnswers: total.answers,
      accuracy: Math.round((total.correct / total.answers) * 100),
      averageMastery: withData > 0 ? masterySum / withData : 0,
      studentsWithData: withData,
      counts,
      difficulty: difficultyOf(counts.reinforce, withData),
      confusions,
    };
  });

  skills.sort((a, b) => a.skill.localeCompare(b.skill, 'pt-BR'));
  return { skills, students: [...rows.values()] };
}
