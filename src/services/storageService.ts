import { Classroom, GroupFormation, Question, RoundSession, Student } from '../types';
import { STUDENT_MARKERS } from './markerRanges';
import { defaultStudents } from '../data/defaultStudents';
import { defaultQuestions } from '../data/defaultQuestions';

// Tudo fica no navegador deste computador. Esta é a única camada que conhece o armazenamento:
// trocar localStorage por IndexedDB depois mexe só aqui.

// IDs das perguntas de exemplo da primeira versão
const LEGACY_DEFAULT_IDS = ['ia-01', 'ia-02', 'ia-03', 'ia-04', 'ia-05', 'ia-06'];

const KEYS = {
  CLASSROOMS: 'classplay_turmas_v3',
  ACTIVE: 'classplay_turma_ativa_v3',
  QUESTIONS: 'classplay_perguntas_v2',
  ROUNDS: 'classplay_rodadas_v2',
  FORMATIONS: 'classplay_grupos_v2',
  // Versões anteriores, lidas só na migração
  LEGACY_CLASSROOM: 'classplay_turma_v2',
  LEGACY_FORMATION: 'classplay_grupos_v1',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (err) {
    console.error(`Falha ao ler ${key}:`, err);
    return fallback;
  }
}

// Devolve false se o navegador recusar (cota cheia, modo privado): quem chama pode avisar o professor
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Falha ao salvar ${key}:`, err);
    return false;
  }
}

const newId = (prefix: string) =>
  `${prefix}-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(36)}`;

// ---------- Turmas ----------

// Migração da versão com uma turma só: a turma antiga vira a primeira, e as rodadas e o grupo salvos vão junto
function migrateLegacy(): Classroom[] {
  const legacy = read<Classroom | null>(KEYS.LEGACY_CLASSROOM, null);
  // O nome padrão da primeira versão não foi escolhido pelo professor: vira "Minha turma"
  const first: Classroom = legacy
    ? { ...legacy, name: legacy.name === 'Turma de Inteligência Artificial' ? 'Minha turma' : legacy.name }
    : { id: newId('turma'), name: 'Minha turma', students: defaultStudents };
  write(KEYS.CLASSROOMS, [first]);
  write(KEYS.ACTIVE, first.id);

  const rounds = read<RoundSession[]>(KEYS.ROUNDS, []);
  if (rounds.some((r) => !r.classroomId)) {
    write(KEYS.ROUNDS, rounds.map((r) => (r.classroomId ? r : { ...r, classroomId: first.id })));
  }
  const formation = read<GroupFormation | null>(KEYS.LEGACY_FORMATION, null);
  if (formation) write(KEYS.FORMATIONS, { [first.id]: { ...formation, classroomId: first.id } });
  return [first];
}

export function loadClassrooms(): Classroom[] {
  const list = read<Classroom[] | null>(KEYS.CLASSROOMS, null);
  return list && list.length > 0 ? list : migrateLegacy();
}

export function getActiveClassroomId(): string {
  const list = loadClassrooms();
  const active = read<string | null>(KEYS.ACTIVE, null);
  return list.some((c) => c.id === active) ? (active as string) : list[0].id;
}

export function setActiveClassroom(id: string): void {
  write(KEYS.ACTIVE, id);
}

// Turma ativa: a que aparece na barra e em todas as telas
export function loadClassroom(): Classroom {
  const list = loadClassrooms();
  const id = getActiveClassroomId();
  return list.find((c) => c.id === id) ?? list[0];
}

export function saveClassroom(classroom: Classroom): boolean {
  const list = loadClassrooms();
  const exists = list.some((c) => c.id === classroom.id);
  return write(KEYS.CLASSROOMS, exists ? list.map((c) => (c.id === classroom.id ? classroom : c)) : [...list, classroom]);
}

export function createClassroom(name: string): Classroom {
  const classroom: Classroom = { id: newId('turma'), name: name.trim() || 'Nova turma', students: [] };
  saveClassroom(classroom);
  setActiveClassroom(classroom.id);
  return classroom;
}

export function renameClassroom(id: string, name: string): void {
  const c = loadClassrooms().find((x) => x.id === id);
  if (c && name.trim()) saveClassroom({ ...c, name: name.trim() });
}

// Apaga a turma, as rodadas dela e o grupo salvo. Precisa sobrar pelo menos uma turma
export function deleteClassroom(id: string): void {
  const list = loadClassrooms();
  if (list.length <= 1) return;
  write(KEYS.CLASSROOMS, list.filter((c) => c.id !== id));
  write(KEYS.ROUNDS, read<RoundSession[]>(KEYS.ROUNDS, []).filter((r) => r.classroomId !== id));
  const formations = read<Record<string, GroupFormation>>(KEYS.FORMATIONS, {});
  delete formations[id];
  write(KEYS.FORMATIONS, formations);
  if (getActiveClassroomId() === id) setActiveClassroom(list.find((c) => c.id !== id)!.id);
}

// ---------- Alunos (sempre da turma ativa) ----------

export function updateStudents(students: Student[]): void {
  saveClassroom({ ...loadClassroom(), students });
}

// O aluno recebe o menor número de cartão livre na faixa de 1 a 199
export function addStudent(name: string): Student {
  const current = loadClassroom();
  const used = new Set(current.students.map((s) => s.id));
  let nextId = STUDENT_MARKERS.min;
  while (used.has(nextId) && nextId <= STUDENT_MARKERS.max) nextId++;
  if (nextId > STUDENT_MARKERS.max) {
    throw new Error(`A turma já tem ${STUDENT_MARKERS.max} alunos, o limite de cartões.`);
  }
  const student: Student = { id: nextId, name };
  if (!saveClassroom({ ...current, students: [...current.students, student] })) {
    throw new Error('O navegador não deixou salvar. Confira se há espaço livre e se não está numa janela anônima.');
  }
  return student;
}

export function removeStudent(studentId: number): void {
  const current = loadClassroom();
  saveClassroom({ ...current, students: current.students.filter((s) => s.id !== studentId) });
}

// ---------- Perguntas (compartilhadas entre as turmas) ----------

export function loadQuestions(): Question[] {
  const stored = read<Question[] | null>(KEYS.QUESTIONS, null);
  if (!stored) {
    saveQuestions(defaultQuestions);
    return defaultQuestions;
  }
  // Troca as antigas perguntas de exemplo sobre IA pelas novas, mantendo as criadas pelo professor
  if (stored.some((q) => LEGACY_DEFAULT_IDS.includes(q.id))) {
    const migrated = [...stored.filter((q) => !LEGACY_DEFAULT_IDS.includes(q.id)), ...defaultQuestions];
    saveQuestions(migrated);
    return migrated;
  }
  return stored;
}

export function saveQuestions(questions: Question[]): void {
  write(KEYS.QUESTIONS, questions);
}

export function addQuestion(question: Question): void {
  saveQuestions([question, ...loadQuestions()]);
}

// Troca a pergunta pela versão editada, na mesma posição
export function updateQuestion(question: Question): void {
  saveQuestions(loadQuestions().map((q) => (q.id === question.id ? question : q)));
}

export function deleteQuestion(questionId: string): void {
  saveQuestions(loadQuestions().filter((q) => q.id !== questionId));
}

// ---------- Rodadas (por turma) ----------

const allRounds = () => read<RoundSession[]>(KEYS.ROUNDS, []);

// Rodadas da turma ativa (ou da turma indicada), da mais recente para a mais antiga
export function loadRoundHistory(classroomId = getActiveClassroomId()): RoundSession[] {
  loadClassrooms(); // garante a migração antes de filtrar
  return allRounds().filter((r) => r.classroomId === classroomId);
}

export function saveRoundSession(round: RoundSession): boolean {
  return write(KEYS.ROUNDS, [{ ...round, classroomId: round.classroomId ?? getActiveClassroomId() }, ...allRounds()]);
}

// Rodadas de exemplo da turma ativa: entram no lugar das anteriores de exemplo
export function addDemoRounds(rounds: RoundSession[]): void {
  const id = getActiveClassroomId();
  const others = allRounds().filter((r) => !(r.demo && r.classroomId === id));
  write(
    KEYS.ROUNDS,
    [...rounds.map((r) => ({ ...r, classroomId: id })), ...others].sort((a, b) => b.timestamp - a.timestamp)
  );
}

// Tira só as rodadas de exemplo da turma ativa; as reais ficam
export function removeDemoRounds(): void {
  const id = getActiveClassroomId();
  write(KEYS.ROUNDS, allRounds().filter((r) => !(r.demo && r.classroomId === id)));
}

// Apaga o histórico só da turma ativa
export function clearRoundHistory(): void {
  const id = getActiveClassroomId();
  write(KEYS.ROUNDS, allRounds().filter((r) => r.classroomId !== id));
}

// ---------- Grupos (última formação de cada turma) ----------

export function loadFormation(): GroupFormation | null {
  loadClassrooms();
  const id = getActiveClassroomId();
  return read<Record<string, GroupFormation>>(KEYS.FORMATIONS, {})[id] ?? null;
}

export function saveFormation(formation: GroupFormation): void {
  const formations = read<Record<string, GroupFormation>>(KEYS.FORMATIONS, {});
  write(KEYS.FORMATIONS, { ...formations, [formation.classroomId]: formation });
}
