import { Group, GroupFormation, Student } from '../types';
import { MasteryResult, StudentMasteryRow, SkillSummary } from './mastery';

export interface Recommendation {
  id: string;
  text: string;
  reason: string;
  studentIds?: number[];
}

const pct = (v: number) => Math.round(v * 100);

// Recomendações para a turma. Toda sugestão sai de uma regra com número visível:
// o professor confere o motivo e decide se segue.
export function classRecommendations(result: MasteryResult): Recommendation[] {
  const out: Recommendation[] = [];

  result.skills.forEach((s) => {
    const { reinforce, mastered } = s.counts;
    const withData = s.studentsWithData;
    if (withData === 0) return;

    if (s.difficulty === 'high') {
      out.push({
        id: `retake-${s.skill}`,
        text: `Vale retomar ${s.skill} com a turma toda.`,
        reason: `${reinforce} de ${withData} alunos ainda erram bastante nesta habilidade.`,
      });
    } else if (reinforce > 0) {
      out.push({
        id: `reinforce-${s.skill}`,
        text: `${reinforce} ${reinforce === 1 ? 'aluno precisa' : 'alunos precisam'} de reforço em ${s.skill}.`,
        reason: `${reinforce === 1 ? 'Está' : 'Estão'} abaixo de 60% de domínio. No geral, a turma vai bem nesta habilidade.`,
        studentIds: studentsAt(result, s.skill, 'reinforce'),
      });
    }

    // As duas confusões mais fortes da habilidade bastam: mais que isso vira ruído
    [...s.confusions].sort((x, y) => y.percent - x.percent).slice(0, 2).forEach((c, i) => {
      out.push({
        id: `confusion-${s.skill}-${i}`,
        text: `Confusão comum em ${s.skill}: ${c.percent}% marcaram a alternativa ${c.option}.`,
        reason: `Pergunta: "${c.questionPrompt}". Quando mais de 40% da turma marca a mesma alternativa errada, costuma ser uma ideia errada que muitos compartilham.`,
      });
    });

    if (s.difficulty === 'low' && withData > 0 && mastered / withData >= 0.8) {
      out.push({
        id: `advance-${s.skill}`,
        text: `${s.skill}: a turma pode avançar.`,
        reason: `${mastered} de ${withData} alunos já dominam.`,
      });
    }
  });

  return out;
}

// Recomendações para um aluno
export function studentRecommendations(row: StudentMasteryRow, skills: SkillSummary[]): Recommendation[] {
  const out: Recommendation[] = [];
  Object.values(row.skills).forEach((m) => {
    const summary = skills.find((s) => s.skill === m.skill);
    if (m.level === 'reinforce') {
      out.push({
        id: `reinforce-${m.skill}`,
        text: `${m.skill} precisa de reforço.`,
        reason: `Acertou ${m.correct} de ${m.answers} respostas. Domínio estimado: ${pct(m.mastery)}%.`,
      });
    } else if (m.level === 'mastered' && summary && summary.counts.reinforce > 0) {
      out.push({
        id: `help-${m.skill}`,
        text: `Domina ${m.skill}: pode ajudar os colegas.`,
        reason: `Domínio estimado: ${pct(m.mastery)}%. ${summary.counts.reinforce} ${summary.counts.reinforce === 1 ? 'colega precisa' : 'colegas precisam'} de reforço.`,
      });
    }
  });
  return out;
}

export function studentsAt(result: MasteryResult, skill: string, level: 'reinforce' | 'progress' | 'mastered'): number[] {
  return result.students.filter((r) => r.skills[skill]?.level === level).map((r) => r.studentId);
}

// Domínio geral do aluno: média entre as habilidades com dados (sem dados fica no meio)
function overallMastery(row: StudentMasteryRow): number {
  const withData = Object.values(row.skills).filter((m) => m.level !== 'nodata');
  if (withData.length === 0) return 0.5;
  return withData.reduce((sum, m) => sum + m.mastery, 0) / withData.length;
}

// Grupos que misturam níveis: ordena por domínio e distribui em "cobra", então cada
// grupo recebe alunos de todas as faixas
export function mixedGroups(result: MasteryResult, students: Student[], size: 3 | 4): Group[] {
  const score = new Map(result.students.map((r) => [r.studentId, overallMastery(r)]));
  const ordered = [...students].sort((a, b) => (score.get(b.id) ?? 0.5) - (score.get(a.id) ?? 0.5));
  const count = Math.max(1, Math.floor(ordered.length / size));
  const groups: Group[] = Array.from({ length: count }, (_, i) => ({
    id: `grupo-${i + 1}`,
    name: `Grupo ${i + 1}`,
    studentIds: [],
  }));
  ordered.forEach((s, i) => {
    const round = Math.floor(i / count);
    const pos = i % count;
    const index = round % 2 === 0 ? pos : count - 1 - pos;
    groups[index].studentIds.push(s.id);
  });
  return groups;
}

export function mixedFormation(
  result: MasteryResult,
  students: Student[],
  size: 3 | 4,
  classroomId: string
): GroupFormation {
  return { classroomId, absentIds: [], groups: mixedGroups(result, students, size), rotation: {} };
}
