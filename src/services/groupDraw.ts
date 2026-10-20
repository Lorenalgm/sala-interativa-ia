import { Group, GroupFormation, Student } from '../types';

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Divide os presentes em grupos do tamanho pedido; a sobra entra nos grupos (nunca sobra aluno sozinho)
export function formGroups(students: Student[], absentIds: number[], size: 3 | 4): Group[] {
  const present = shuffle(students.filter((s) => !absentIds.includes(s.id)));
  if (present.length === 0) return [];

  const count = Math.max(1, Math.floor(present.length / size));
  const buckets: number[][] = Array.from({ length: count }, () => []);
  present.forEach((student, i) => buckets[i % count].push(student.id));

  return buckets.map((studentIds, i) => ({
    id: `grupo-${i + 1}`,
    name: `Grupo ${i + 1}`,
    studentIds,
  }));
}

// Presentes do grupo que ainda não foram sorteados no ciclo atual
const eligible = (group: Group, formation: GroupFormation): number[] => {
  const present = group.studentIds.filter((id) => !formation.absentIds.includes(id));
  const done = formation.rotation[group.id] ?? [];
  return present.filter((id) => !done.includes(id));
};

// Sorteia um aluno do grupo e devolve a formação com o rodízio atualizado
export function drawFromGroup(
  formation: GroupFormation,
  groupId: string,
  exclude: number[] = []
): { formation: GroupFormation; studentId: number | null } {
  const group = formation.groups.find((g) => g.id === groupId);
  if (!group) return { formation, studentId: null };

  let pool = eligible(group, formation).filter((id) => !exclude.includes(id));
  let rotation = { ...formation.rotation };

  // Todos já responderam: começa um novo ciclo
  if (pool.length === 0) {
    rotation[group.id] = [];
    pool = group.studentIds.filter(
      (id) => !formation.absentIds.includes(id) && !exclude.includes(id)
    );
  }
  if (pool.length === 0) return { formation, studentId: null };

  const studentId = pool[Math.floor(Math.random() * pool.length)];
  rotation[group.id] = [...(rotation[group.id] ?? []), studentId];
  return { formation: { ...formation, rotation }, studentId };
}

// Um sorteado por grupo
export function drawOnePerGroup(formation: GroupFormation): {
  formation: GroupFormation;
  drawn: Record<string, number>;
} {
  let current = formation;
  const drawn: Record<string, number> = {};
  formation.groups.forEach((group) => {
    const result = drawFromGroup(current, group.id);
    current = result.formation;
    if (result.studentId !== null) drawn[group.id] = result.studentId;
  });
  return { formation: current, drawn };
}

// Move um aluno para outro grupo (arrastar na montagem)
export function moveStudent(groups: Group[], studentId: number, toGroupId: string): Group[] {
  return groups.map((g) => {
    const without = g.studentIds.filter((id) => id !== studentId);
    return g.id === toGroupId ? { ...g, studentIds: [...without, studentId] } : { ...g, studentIds: without };
  });
}
