export type Alternative = 'A' | 'B' | 'C' | 'D';

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
  correctOption: Alternative;
  timestamp: number;
  responses: Record<number, Alternative>; // studentId -> resposta
  totalClassStudents: number;
}

export interface RoundSession {
  id: string;
  name: string;
  timestamp: number;
  totalClassStudents: number;
  questions: QuestionSessionRecord[];
  overallAccuracy: number;
  totalResponses: number;
}

export type PoseType = 
  | 'arms_raised'
  | 't_pose'
  | 'squat'
  | 'star_pose'
  | 'right_hand_up';

export interface Exercise {
  id: string;
  type: PoseType;
  title: string;
  description: string;
  targetDurationSeconds: number;
  difficulty: 'fácil' | 'médio' | 'avançado';
  instructions: string[];
}

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseFeedbackResult {
  isMatch: boolean;
  score: number; // 0 a 100
  feedback: string;
  activeAngles?: Record<string, number>;
}

export interface DetectedMarker {
  id: number;
  corners: { x: number; y: number }[];
  rotation: number; // 0: A, 1: B, 2: C, 3: D
  option: Alternative;
}

export interface PerformanceStats {
  totalQuestions: number;
  totalResponses: number;
  accuracyRate: number;
  byStudent: Record<number, { total: number; correct: number }>;
}
