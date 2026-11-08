/**
 * ============================================================================
 * FILE: quiz.ts — Vantrix AI
 * PHÂN HỆ: TYPES — ĐỊNH NGHĨA KIỂU DỮ LIỆU KHẢO THÍ
 * ============================================================================
 */

export type EducationLevel = 'tieuhoc' | 'thcs' | 'thpt' | 'daihoc';

export type SubjectType =
  | 'toan'
  | 'tiengviet'
  | 'khoahoc'
  | 'ly'
  | 'hoa'
  | 'sinh'
  | 'tienganh'
  | 'dgnl'
  | 'ielts'
  | 'triethoc'
  | 'laptrinh'
  | 'kinhte';

export type DifficultyTier = 'Easy' | 'Medium' | 'Hard';

export type DifficultyLevel =
  | 'Easy'
  | 'Medium'
  | 'Hard'
  | 'nhan_biet'
  | 'thong_hieu'
  | 'van_dung'
  | 'van_dung_cao'
  | 'easy'
  | 'medium'
  | 'hard';

export type OptionId = 'A' | 'B' | 'C' | 'D';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface ExplanationStep {
  stepNumber: number;
  title: string;
  detail: string;
}

export interface QuestionExplanation {
  summary: string;
  steps: ExplanationStep[];
  keyTakeaway: string;
  casioTip?: string;
  commonTrap?: string;
}

export interface Question {
  id: string;
  code: string;
  subject: SubjectType;
  educationLevel?: EducationLevel;
  difficulty: DifficultyLevel;
  topic: string;
  stem: string;
  options: { id: OptionId; text: string }[];
  correctOption: OptionId;
  explanation: QuestionExplanation;
}

export interface Exam {
  id: string;
  title: string;
  subtitle: string;
  educationLevel: EducationLevel;
  educationLevelLabel: string;
  subject: SubjectType;
  subjectLabel: string;
  totalQuestions: number;
  durationMinutes: number;
  year: string;
  difficultyLabel: 'Dễ' | 'Trung bình' | 'Khá khó' | 'Nâng cao (8+)';
  averageDifficulty?: DifficultyTier;
  averageDifficultyScore?: number;
  description: string;
  questions: Question[];
  scoringScale: 'thpt_10' | 'dgnl_1200' | 'ielts_9';
  tag: string;
  createdBy?: 'system' | 'user' | 'teacher' | 'ai';
  authorName?: string;
  classId?: string;
  assignedDeadline?: string;
  fileName?: string;
  isPersonalOnly?: boolean;
  shareCode?: string;
  isSharedWithCode?: boolean;
}

export interface ExamSession {
  examId: string;
  userAnswers: Record<string, OptionId>;
  flaggedQuestions: Record<string, boolean>;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  startedAt: number;
  isSubmitted: boolean;
  score?: number;
  correctCount?: number;
  incorrectCount?: number;
  skippedCount?: number;
  completedAt?: number;
  accuracyPercentage?: number;
  timeSpentSeconds?: number;
}

export interface MistakeItem {
  id: string;
  examId: string;
  examTitle: string;
  question: Question;
  selectedOption?: OptionId;
  savedAt: number;
  notes?: string;
  isMastered?: boolean;
  wrongCount?: number;
  lastWrongAt?: string;
  userSelectedAnswer?: string;
}

export interface ClassroomStudent {
  id: string;
  name: string;
  email: string;
  joinedAt: number;
  completedExamsCount: number;
  averageScore: number;
}

export interface StudentSubmission {
  id: string;
  classId: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  submittedAt: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, OptionId>;
  examTitle?: string;
  examSubject?: string;
  completedAt?: string;
}

export interface Classroom {
  id: string;
  code: string;
  name: string;
  educationLevel: EducationLevel;
  educationLevelLabel: string;
  subject: SubjectType;
  grade: string;
  teacherName: string;
  teacherEmail: string;
  description: string;
  createdAt: number;
  students: ClassroomStudent[];
  assignedExamIds: string[];
}