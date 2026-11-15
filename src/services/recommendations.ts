import { Group, GroupFormation, Student } from '../types';
import { MasteryResult, StudentMasteryRow } from './mastery';

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
