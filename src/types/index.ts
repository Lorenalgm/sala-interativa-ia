export type Alternative = 'A' | 'B' | 'C' | 'D';

export type ScriptId = 'quick-question' | 'group-draw' | 'peer-instruction' | 'interactive-board';

export interface Student {
  id: number; // corresponde ao identificador do marcador fiducial do cartão
  name: string;
}

export interface Classroom {
  id: string;
  name: string;
  students: Student[];
}

export interface Question {
  id: string;
  prompt: string;
  category: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: Alternative;
  explanation: string;
}

export interface StudentResponse {
  studentId: number;
  studentName: string;
  selectedOption: Alternative;
  timestamp: number;
}

export interface QuestionSessionRecord {
  id: string;
  questionId: string;
  questionPrompt: string;
  skill: string; // habilidade da pergunta (categoria), usada na estimativa de domínio
  correctOption: Alternative;
  timestamp: number;
  responses: Record<number, Alternative>; // studentId -> resposta
  totalClassStudents: number;
  groupResults?: GroupResult[]; // só no roteiro de grupo com sorteio
}

export interface RoundSession {
  id: string;
  name: string;
  timestamp: number;
  totalClassStudents: number;
  questions: QuestionSessionRecord[];
  overallAccuracy: number;
  totalResponses: number;
  scriptId?: ScriptId; // ausente nos registros antigos: contam como pergunta rápida
}

export interface DetectedMarker {
  id: number;
  corners: { x: number; y: number }[];
  rotation: number; // 0: A em cima, 1: D, 2: C, 3: B (ver ROTATION_TO_ALTERNATIVE)
  option: Alternative;
}

export interface PerformanceStats {
  totalQuestions: number;
  totalResponses: number;
  accuracyRate: number;
  byStudent: Record<number, { total: number; correct: number }>;
}

export interface Group {
  id: string;
  name: string;
  studentIds: number[];
}

export interface GroupFormation {
  classroomId: string;
  absentIds: number[];
  groups: Group[];
  // Por grupo, quem já foi sorteado no ciclo atual do rodízio
  rotation: Record<string, number[]>;
}

export interface GroupResult {
  groupId: string;
  groupName: string;
  studentId: number;
  answer?: Alternative;
  correct: boolean;
}
