import {
  Classroom,
  PerformanceStats,
  Question,
  QuestionSessionRecord,
  RoundSession,
  Student,
} from '../types';
import { defaultStudents } from '../data/defaultStudents';
import { defaultQuestions } from '../data/defaultQuestions';

const STORAGE_KEYS = {
  CLASSROOM: 'classplay_turma_v2',
  QUESTIONS: 'classplay_perguntas_v2',
  HISTORY: 'classplay_historico_v2',
  ROUNDS: 'classplay_rodadas_v2',
};

// Recupera a turma atual configurada ou retorna os alunos pré-carregados
export function loadClassroom(): Classroom {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSROOM);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Falha ao carregar turma local:', err);
  }

  const initialClassroom: Classroom = {
    id: 'turma-ia',
    name: 'Turma de Inteligência Artificial',
    students: defaultStudents,
  };
  saveClassroom(initialClassroom);
  return initialClassroom;
}

// Salva as alterações da turma no armazenamento local
export function saveClassroom(classroom: Classroom): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSROOM, JSON.stringify(classroom));
  } catch (err) {
    console.error('Falha ao salvar turma:', err);
  }
}

// Atualiza a lista de alunos
export function updateStudents(students: Student[]): void {
  const current = loadClassroom();
  current.students = students;
  saveClassroom(current);
}

// Adiciona um novo aluno
export function addStudent(name: string): Student {
  const current = loadClassroom();
  const nextId =
    current.students.length > 0
      ? Math.max(...current.students.map((s) => s.id)) + 1
      : 1;

  const newStudent: Student = { id: nextId, name };
  current.students.push(newStudent);
  saveClassroom(current);
  return newStudent;
}

// Remove um aluno da turma
export function removeStudent(studentId: number): void {
  const current = loadClassroom();
  current.students = current.students.filter((s) => s.id !== studentId);
  saveClassroom(current);
}

// Recupera a lista de perguntas configuradas
export function loadQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Falha ao carregar perguntas:', err);
  }

  saveQuestions(defaultQuestions);
  return defaultQuestions;
}

// Salva a lista de perguntas
export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error('Falha ao salvar perguntas:', err);
  }
}

// Adiciona uma nova pergunta
export function addQuestion(question: Question): void {
  const questions = loadQuestions();
  questions.unshift(question);
  saveQuestions(questions);
}

// Exclui uma pergunta
export function deleteQuestion(questionId: string): void {
  const questions = loadQuestions();
  const filtered = questions.filter((q) => q.id !== questionId);
  saveQuestions(filtered);
}

// Recupera o histórico de rodadas
export function loadRoundHistory(): RoundSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUNDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Falha ao carregar rodadas:', err);
  }
  return [];
}

// Salva uma rodada completa no histórico
export function saveRoundSession(round: RoundSession): void {
  try {
    const history = loadRoundHistory();
    history.unshift(round);
    localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(history));
  } catch (err) {
    console.error('Falha ao salvar rodada:', err);
  }
}

// Limpa o histórico de rodadas
export function clearRoundHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.ROUNDS);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

// Recupera o histórico legado de perguntas respondidas
export function loadQuestionHistory(): QuestionSessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Falha ao carregar histórico:', err);
  }
  return [];
}

// Salva o resultado de uma questão individual
export function saveQuestionSession(record: QuestionSessionRecord): void {
  try {
    const history = loadQuestionHistory();
    history.unshift(record);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Falha ao salvar sessão de pergunta:', err);
  }
}

// Calcula estatísticas agrupadas para rodadas
export function calculateRoundStats(round: RoundSession, students: Student[]): PerformanceStats {
  const byStudent: Record<number, { total: number; correct: number }> = {};
  students.forEach((s) => {
    byStudent[s.id] = { total: 0, correct: 0 };
  });

  let totalResponses = 0;
  let totalCorrect = 0;

  round.questions.forEach((session) => {
    Object.entries(session.responses).forEach(([studentIdStr, answer]) => {
      const studentId = parseInt(studentIdStr, 10);
      if (!byStudent[studentId]) {
        byStudent[studentId] = { total: 0, correct: 0 };
      }
      byStudent[studentId].total += 1;
      totalResponses += 1;

      if (answer === session.correctOption) {
        byStudent[studentId].correct += 1;
        totalCorrect += 1;
      }
    });
  });

  const accuracyRate =
    totalResponses > 0 ? Math.round((totalCorrect / totalResponses) * 100) : 0;

  return {
    totalQuestions: round.questions.length,
    totalResponses,
    accuracyRate,
    byStudent,
  };
}
