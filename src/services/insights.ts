import { Alternative, Question, RoundSession, Student } from '../types';
import { MasteryResult, SkillMastery } from './mastery';

// Leitura do histórico para o professor: poucas sugestões, em ordem de prioridade,
// cada uma com o número que a justifica. Nada aqui é nota do aluno.

const LETTERS: Alternative[] = ['A', 'B', 'C', 'D'];

export interface QuestionStat {
  key: string;
  questionId: string;
  prompt: string;
  skill: string;
  correctOption: Alternative;
  answers: number;
  correct: number;
  accuracy: number; // 0 a 100
  counts: Record<Alternative, number>;
  // Alternativa errada mais marcada, se chamar atenção (ver MISCONCEPTION)
  commonWrong?: { option: Alternative; count: number; share: number; text?: string };
}

export interface StudentStat {
  studentId: number;
  asked: number; // perguntas feitas nas rodadas
  answered: number;
  correct: number;
  accuracy: number | null; // 0 a 100; null sem respostas
  weakSkills: string[];
  strongSkills: string[];
  skills: SkillMastery[];
  recentMisses: { prompt: string; chosen: Alternative; correctOption: Alternative; timestamp: number }[];
}

export interface RoundStat {
  id: string;
  timestamp: number;
  scriptId: RoundSession['scriptId'];
  questions: number;
  responses: number;
  accuracy: number;
}

export type InsightKind = 'retake' | 'reinforce' | 'misconception' | 'attendance' | 'advance';

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string;
  // Uma linha para a lista "Para a próxima aula"; o detalhe completo fica na seção da habilidade
  summary: string;
  // Habilidade a abrir quando o professor toca na sugestão
  skill?: string;
  studentIds?: number[];
  helperIds?: number[]; // quem domina e pode ajudar
}

export interface Trend {
  from: number;
  to: number;
  direction: 'up' | 'down' | 'flat';
}

// Uma alternativa errada é um engano comum quando junta pelo menos 30% das respostas
const MISCONCEPTION = 0.3;
// Com menos respostas que isso, a pergunta não entra nas sugestões
const MIN_QUESTION_ANSWERS = 8;
// Respondeu menos que isso das perguntas feitas: vale conferir presença ou câmera
const LOW_PARTICIPATION = 0.6;

export function questionStats(rounds: RoundSession[], questions: Question[], known: Set<number>): QuestionStat[] {
  const map = new Map<string, QuestionStat>();
  for (const round of rounds) {
    for (const q of round.questions) {
      const skill = q.skill || 'Geral';
      const key = `${skill}::${q.questionId}`;
      const stat =
        map.get(key) ??
        {
          key,
          questionId: q.questionId,
          prompt: q.questionPrompt,
          skill,
          correctOption: q.correctOption,
          answers: 0,
          correct: 0,
          accuracy: 0,
          counts: { A: 0, B: 0, C: 0, D: 0 },
        };
      for (const [idStr, answer] of Object.entries(q.responses)) {
        if (!known.has(Number(idStr))) continue;
        stat.answers += 1;
        stat.counts[answer] += 1;
        if (answer === q.correctOption) stat.correct += 1;
      }
      map.set(key, stat);
    }
  }
  return [...map.values()]
    .filter((s) => s.answers > 0)
    .map((s) => {
      const accuracy = Math.round((s.correct / s.answers) * 100);
      const wrong = LETTERS.filter((l) => l !== s.correctOption).sort((a, b) => s.counts[b] - s.counts[a])[0];
      const share = s.counts[wrong] / s.answers;
      const source = questions.find((q) => q.id === s.questionId);
      return {
        ...s,
        accuracy,
        commonWrong:
          share >= MISCONCEPTION
            ? { option: wrong, count: s.counts[wrong], share: Math.round(share * 100), text: source?.options[wrong] }
            : undefined,
      };
    });
}

export function studentStats(rounds: RoundSession[], students: Student[], mastery: MasteryResult): StudentStat[] {
  const chronological = [...rounds].sort((a, b) => a.timestamp - b.timestamp);
  return students.map((s) => {
    let asked = 0;
    let answered = 0;
    let correct = 0;
    const misses: StudentStat['recentMisses'] = [];
    for (const round of chronological) {
      for (const q of round.questions) {
        asked += 1;
        const answer = q.responses[s.id];
        if (!answer) continue;
        answered += 1;
        if (answer === q.correctOption) correct += 1;
        else misses.push({ prompt: q.questionPrompt, chosen: answer, correctOption: q.correctOption, timestamp: q.timestamp });
      }
    }
    const row = mastery.students.find((r) => r.studentId === s.id);
    const skills = row ? Object.values(row.skills) : [];
    return {
      studentId: s.id,
      asked,
      answered,
      correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null,
      weakSkills: skills.filter((m) => m.level === 'reinforce').map((m) => m.skill),
      strongSkills: skills.filter((m) => m.level === 'mastered').map((m) => m.skill),
      skills: [...skills].sort((a, b) => a.skill.localeCompare(b.skill, 'pt-BR')),
      recentMisses: misses.reverse().slice(0, 3),
    };
  });
}

export function roundStats(rounds: RoundSession[]): RoundStat[] {
  return [...rounds]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      scriptId: r.scriptId ?? 'quick-question',
      questions: r.questions.length,
      responses: r.totalResponses,
      accuracy: r.overallAccuracy,
    }));
}

// Compara a média das rodadas mais recentes com a das anteriores (precisa de 4 rodadas)
export function trendOf(rounds: RoundStat[]): Trend | null {
  if (rounds.length < 4) return null;
  const half = Math.min(3, Math.floor(rounds.length / 2));
  const avg = (xs: RoundStat[]) => Math.round(xs.reduce((a, r) => a + r.accuracy, 0) / xs.length);
  const from = avg(rounds.slice(-half * 2, -half));
  const to = avg(rounds.slice(-half));
  const diff = to - from;
  return { from, to, direction: diff >= 5 ? 'up' : diff <= -5 ? 'down' : 'flat' };
}

// Sugestões para a próxima aula, da mais importante para a menos importante
export function nextClassInsights(
  mastery: MasteryResult,
  qStats: QuestionStat[],
  sStats: StudentStat[]
): Insight[] {
  const out: Insight[] = [];
  const cited = new Set<string>();

  // 1. Habilidades com mais alunos abaixo de 60% de domínio
  const needy = mastery.skills
    .filter((s) => s.studentsWithData > 0 && s.counts.reinforce > 0)
    .sort((a, b) => b.counts.reinforce / b.studentsWithData - a.counts.reinforce / a.studentsWithData);

  needy.slice(0, 2).forEach((s) => {
    const reinforceIds = mastery.students.filter((r) => r.skills[s.skill]?.level === 'reinforce').map((r) => r.studentId);
    const helperIds = mastery.students.filter((r) => r.skills[s.skill]?.level === 'mastered').map((r) => r.studentId);
    const hardest = qStats
      .filter((q) => q.skill === s.skill && q.answers >= MIN_QUESTION_ANSWERS)
      .sort((a, b) => a.accuracy - b.accuracy)[0];
    const share = s.counts.reinforce / s.studentsWithData;
    let detail = `${s.counts.reinforce} de ${s.studentsWithData} alunos estão abaixo de 60% de domínio.`;
    if (hardest) {
      cited.add(hardest.key);
      detail += ` A pergunta mais errada foi "${hardest.prompt}", com ${hardest.accuracy}% de acerto`;
      detail += hardest.commonWrong
        ? `; ${hardest.commonWrong.count} alunos marcaram ${hardest.commonWrong.option}${hardest.commonWrong.text ? ` (${hardest.commonWrong.text})` : ''}.`
        : '.';
    }
    out.push({
      id: `skill-${s.skill}`,
      skill: s.skill,
      summary: `${s.counts.reinforce} de ${s.studentsWithData} alunos abaixo de 60% de domínio${hardest ? ` · mais errada: "${hardest.prompt}"` : ''}`,
      kind: share >= 0.25 ? 'retake' : 'reinforce',
      title:
        share >= 0.25
          ? `Retome ${s.skill} com a turma toda`
          : `Reforce ${s.skill} com ${reinforceIds.length} ${reinforceIds.length === 1 ? 'aluno' : 'alunos'}`,
      detail,
      studentIds: reinforceIds,
      helperIds: helperIds.slice(0, 4),
    });
  });

  // 2. Engano comum que ainda não apareceu acima
  const misconception = qStats
    .filter((q) => q.commonWrong && q.answers >= MIN_QUESTION_ANSWERS && !cited.has(q.key))
    .sort((a, b) => (b.commonWrong!.share - a.commonWrong!.share))[0];
  if (misconception?.commonWrong) {
    const w = misconception.commonWrong;
    out.push({
      id: `misconception-${misconception.key}`,
      kind: 'misconception',
      title: `Engano comum em ${misconception.skill}`,
      skill: misconception.skill,
      summary: `${w.share}% marcaram ${w.option}${w.text ? ` (${w.text})` : ''} em "${misconception.prompt}"`,
      detail: `Em "${misconception.prompt}", ${w.share}% marcaram ${w.option}${w.text ? ` (${w.text})` : ''}. Vale perguntar à turma por que essa alternativa parece certa.`,
    });
  }

  // 3. Quem respondeu pouco: falta ou cartão que a câmera não lê
  const absent = sStats.filter((s) => s.asked >= 5 && s.answered / s.asked < LOW_PARTICIPATION);
  if (absent.length > 0) {
    out.push({
      id: 'attendance',
      kind: 'attendance',
      title: `${absent.length === 1 ? '1 aluno respondeu' : `${absent.length} alunos responderam`} menos de 60% das perguntas`,
      detail: 'Pode ser falta ou cartão que a câmera não está lendo. Vale conferir a presença e testar o cartão.',
      summary: 'Pode ser falta ou cartão que a câmera não está lendo.',
      studentIds: absent.map((s) => s.studentId),
    });
  }

  // 4. Habilidades em que a turma já pode avançar
  const ready = mastery.skills.filter(
    (s) => s.studentsWithData > 0 && s.counts.reinforce === 0 && s.counts.mastered / s.studentsWithData >= 0.8
  );
  if (ready.length > 0) {
    out.push({
      id: 'advance',
      kind: 'advance',
      title: `A turma pode avançar em ${ready.map((s) => s.skill).join(' e ')}`,
      detail: ready.map((s) => `${s.skill}: ${s.counts.mastered} de ${s.studentsWithData} dominam`).join('. ') + '.',
      summary: ready.map((s) => `${s.skill}: ${s.counts.mastered} de ${s.studentsWithData} dominam`).join(' · '),
      skill: ready[0].skill,
    });
  }

  return out;
}

// Planilha com uma linha por resposta: dá para filtrar por aluno, pergunta ou habilidade
export function answersCsv(rounds: RoundSession[], students: Student[], scriptName: (r: RoundSession) => string): string {
  const name = new Map(students.map((s) => [s.id, s.name]));
  // Aspas escapadas e fórmulas neutralizadas: um nome que comece com = + - @ não vira fórmula no Excel (OWASP, CSV Injection)
  const esc = (v: string | number) => {
    const text = String(v);
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = [['Data', 'Modelo', 'Pergunta', 'Habilidade', 'Resposta certa', 'Cartão', 'Aluno', 'Resposta', 'Acertou']];
  for (const r of [...rounds].sort((a, b) => a.timestamp - b.timestamp)) {
    for (const q of r.questions) {
      for (const [idStr, answer] of Object.entries(q.responses)) {
        const id = Number(idStr);
        rows.push([
          new Date(q.timestamp).toLocaleString('pt-BR'),
          scriptName(r),
          q.questionPrompt,
          q.skill || 'Geral',
          q.correctOption,
          String(id).padStart(2, '0'),
          name.get(id) ?? '',
          answer,
          answer === q.correctOption ? 'sim' : 'não',
        ]);
      }
    }
  }
  return rows.map((row) => row.map(esc).join(',')).join('\n');
}
