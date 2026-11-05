/**
 * ============================================================================
 * FILE: quiz-logic.ts — Vantrix AI
 * PHÂN HỆ: UTILITIES — KHẢO THÍ & TÍNH ĐIỂM
 * ============================================================================
 */

import type { OptionId, Question, Exam } from '../types/quiz';

export function calculateExamScore(totalQuestions: number, correctCount: number, scale: 'thpt_10' | 'dgnl_1200' | 'ielts_9'): number {
  if (totalQuestions <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, correctCount / totalQuestions));

  switch (scale) {
    case 'thpt_10': return Math.round(ratio * 10 * 100) / 100;
    case 'dgnl_1200': return Math.round(ratio * 1200);
    case 'ielts_9': {
      if (ratio >= 0.95) return 9.0;
      if (ratio >= 0.88) return 8.5;
      if (ratio >= 0.80) return 8.0;
      if (ratio >= 0.73) return 7.5;
      if (ratio >= 0.65) return 7.0;
      if (ratio >= 0.58) return 6.5;
      if (ratio >= 0.50) return 6.0;
      if (ratio >= 0.40) return 5.5;
      if (ratio >= 0.30) return 5.0;
      return Math.round(ratio * 9 * 10) / 10;
    }
  }
}

export function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${mm}:${ss}`;
}

export function isUrgentTimer(secondsRemaining: number): boolean {
  return secondsRemaining > 0 && secondsRemaining < 300;
}

export type QuestionButtonState = 'unanswered' | 'answered' | 'flagged';

export function getQuestionStatus(questionId: string, userAnswers: Record<string, OptionId>, flaggedQuestions: Record<string, boolean>): QuestionButtonState {
  if (flaggedQuestions[questionId]) return 'flagged';
  if (userAnswers[questionId] !== undefined) return 'answered';
  return 'unanswered';
}

export interface ExamResultsSummary {
  total: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercentage: number;
  score: number;
}

export function computeExamSummary(questions: Question[], userAnswers: Record<string, OptionId>, scale: 'thpt_10' | 'dgnl_1200' | 'ielts_9'): ExamResultsSummary {
  const total = questions.length;
  let correctCount = 0, incorrectCount = 0, skippedCount = 0;

  for (const q of questions) {
    const ans = userAnswers[q.id];
    if (ans === undefined) skippedCount++;
    else if (ans === q.correctOption) correctCount++;
    else incorrectCount++;
  }

  const accuracyPercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const score = calculateExamScore(total, correctCount, scale);

  return { total, correctCount, incorrectCount, skippedCount, accuracyPercentage, score };
}

export function filterMistakeQuestions(questions: Question[], userAnswers: Record<string, OptionId>): { question: Question; selectedOption?: OptionId; isSkipped: boolean }[] {
  const mistakes: { question: Question; selectedOption?: OptionId; isSkipped: boolean }[] = [];
  for (const q of questions) {
    const selected = userAnswers[q.id];
    if (selected === undefined) mistakes.push({ question: q, selectedOption: undefined, isSkipped: true });
    else if (selected !== q.correctOption) mistakes.push({ question: q, selectedOption: selected, isSkipped: false });
  }
  return mistakes;
}

export function formatScoreDisplay(score: number, scale: 'thpt_10' | 'dgnl_1200' | 'ielts_9'): string {
  switch (scale) {
    case 'thpt_10': return `${score.toFixed(2)} / 10.0`;
    case 'dgnl_1200': return `${score} / 1200`;
    case 'ielts_9': return `Band ${score.toFixed(1)} / 9.0`;
  }
}

export function getUnmasteredMistakes<T extends { isMastered?: boolean }>(mistakes: T[]): T[] {
  return mistakes.filter((m) => !m.isMastered);
}

export function calculateReviewUrgency(unmasteredCount: number): 'low' | 'medium' | 'high' {
  if (unmasteredCount >= 5) return 'high';
  if (unmasteredCount >= 1) return 'medium';
  return 'low';
}

export function getTopReviewTopics(mistakes: { question?: { topic?: string }; isMastered?: boolean }[]): { topic: string; count: number }[] {
  const unmastered = mistakes.filter((m) => m && !m.isMastered && m.question);
  const topicCounts: Record<string, number> = {};
  for (const m of unmastered) {
    if (!m.question) continue;
    const topic = m.question.topic || 'Tổng hợp';
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  return Object.entries(topicCounts).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count);
}

export interface DifficultyBreakdown {
  easyCount: number; mediumCount: number; hardCount: number; total: number;
  easyPct: number; mediumPct: number; hardPct: number;
  dominantLevel: 'easy' | 'medium' | 'hard' | 'balanced';
}

export function computeDifficultyBreakdown(questions: Question[] = [], fallbackDifficultyLabel?: string, fallbackTotal = 10): DifficultyBreakdown {
  let easyCount = 0, mediumCount = 0, hardCount = 0;

  if (questions.length > 0) {
    for (const q of questions) {
      const d = q.difficulty;
      if (d === 'nhan_biet' || d === 'Easy' || d === 'easy') easyCount++;
      else if (d === 'thong_hieu' || d === 'Medium' || d === 'medium') mediumCount++;
      else if (d === 'van_dung' || d === 'van_dung_cao' || d === 'Hard' || d === 'hard') hardCount++;
      else mediumCount++;
    }
  } else {
    const total = fallbackTotal || 10;
    if (fallbackDifficultyLabel === 'Dễ') {
      easyCount = Math.round(total * 0.6); mediumCount = Math.round(total * 0.3); hardCount = total - easyCount - mediumCount;
    } else if (fallbackDifficultyLabel === 'Nâng cao (8+)') {
      easyCount = Math.round(total * 0.15); mediumCount = Math.round(total * 0.35); hardCount = total - easyCount - mediumCount;
    } else if (fallbackDifficultyLabel === 'Khá khó') {
      easyCount = Math.round(total * 0.25); mediumCount = Math.round(total * 0.45); hardCount = total - easyCount - mediumCount;
    } else {
      easyCount = Math.round(total * 0.4); mediumCount = Math.round(total * 0.4); hardCount = total - easyCount - mediumCount;
    }
  }

  const total = Math.max(1, easyCount + mediumCount + hardCount);
  const easyPct = Math.round((easyCount / total) * 100);
  const mediumPct = Math.round((mediumCount / total) * 100);
  const hardPct = Math.max(0, 100 - easyPct - mediumPct);

  let dominantLevel: 'easy' | 'medium' | 'hard' | 'balanced' = 'balanced';
  if (easyPct >= 50) dominantLevel = 'easy';
  else if (hardPct >= 35) dominantLevel = 'hard';
  else if (mediumPct >= 45) dominantLevel = 'medium';

  return { easyCount, mediumCount, hardCount, total, easyPct, mediumPct, hardPct, dominantLevel };
}

export type ExamDifficultyFilter = 'all' | 'easy' | 'medium' | 'hard' | 'balanced';

export function matchExamDifficultyFilter(breakdown: DifficultyBreakdown, difficultyLabel: string | undefined, filter: ExamDifficultyFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'easy') return breakdown.easyPct >= 35 || difficultyLabel === 'Dễ' || breakdown.dominantLevel === 'easy';
  if (filter === 'medium') return breakdown.mediumPct >= 35 || difficultyLabel === 'Trung bình' || breakdown.dominantLevel === 'medium';
  if (filter === 'hard') return breakdown.hardPct >= 25 || difficultyLabel === 'Khá khó' || difficultyLabel === 'Nâng cao (8+)' || breakdown.dominantLevel === 'hard';
  if (filter === 'balanced') return breakdown.dominantLevel === 'balanced';
  return true;
}

export type AverageDifficultyTier = 'Easy' | 'Medium' | 'Hard';

export interface AverageDifficultyInfo {
  tier: AverageDifficultyTier; score: number; labelVi: string; labelEn: string; displayLabel: string; badgeColorClass: string; dotColorClass: string;
}

export function calculateAverageDifficulty(questions: Question[] = [], fallbackDifficultyLabel?: string): AverageDifficultyInfo {
  if (questions.length > 0) {
    let sum = 0;
    for (const q of questions) {
      const d = q.difficulty;
      if (d === 'Easy' || d === 'easy' || d === 'nhan_biet') sum += 1;
      else if (d === 'Hard' || d === 'hard' || d === 'van_dung' || d === 'van_dung_cao') sum += 3;
      else sum += 2;
    }
    const avg = sum / questions.length;
    if (avg < 1.6) return { tier: 'Easy', score: Math.round(avg * 10) / 10, labelVi: 'Dễ', labelEn: 'Easy', displayLabel: 'Dễ (Easy)', badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100/60', dotColorClass: 'bg-emerald-500' };
    if (avg > 2.3) return { tier: 'Hard', score: Math.round(avg * 10) / 10, labelVi: 'Khó', labelEn: 'Hard', displayLabel: 'Khó (Hard)', badgeColorClass: 'bg-rose-50 text-rose-700 border-rose-200/90 hover:bg-rose-100/60', dotColorClass: 'bg-rose-500' };
    return { tier: 'Medium', score: Math.round(avg * 10) / 10, labelVi: 'Trung bình', labelEn: 'Medium', displayLabel: 'TB (Medium)', badgeColorClass: 'bg-amber-50 text-amber-700 border-amber-200/90 hover:bg-amber-100/60', dotColorClass: 'bg-amber-500' };
  }

  if (fallbackDifficultyLabel === 'Dễ') return { tier: 'Easy', score: 1.0, labelVi: 'Dễ', labelEn: 'Easy', displayLabel: 'Dễ (Easy)', badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90', dotColorClass: 'bg-emerald-500' };
  if (fallbackDifficultyLabel === 'Khá khó' || fallbackDifficultyLabel === 'Nâng cao (8+)') return { tier: 'Hard', score: 2.8, labelVi: 'Khó', labelEn: 'Hard', displayLabel: 'Khó (Hard)', badgeColorClass: 'bg-rose-50 text-rose-700 border-rose-200/90', dotColorClass: 'bg-rose-500' };
  return { tier: 'Medium', score: 2.0, labelVi: 'Trung bình', labelEn: 'Medium', displayLabel: 'Medium', badgeColorClass: 'bg-amber-50 text-amber-700 border-amber-200/90', dotColorClass: 'bg-amber-500' };
}

export function computeExamAverageDifficulty(exam: Exam): AverageDifficultyInfo {
  const result = calculateAverageDifficulty(exam.questions, exam.difficultyLabel);
  if (exam.averageDifficulty && (!exam.questions || exam.questions.length === 0)) {
    const tier = exam.averageDifficulty;
    if (tier === 'Easy') return { tier: 'Easy', score: exam.averageDifficultyScore ?? 1.0, labelVi: 'Dễ', labelEn: 'Easy', displayLabel: 'Easy', badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100/60', dotColorClass: 'bg-emerald-500' };
    if (tier === 'Hard') return { tier: 'Hard', score: exam.averageDifficultyScore ?? 3.0, labelVi: 'Khó', labelEn: 'Hard', displayLabel: 'Hard', badgeColorClass: 'bg-rose-50 text-rose-700 border-rose-200/90 hover:bg-rose-100/60', dotColorClass: 'bg-rose-500' };
    return { tier: 'Medium', score: exam.averageDifficultyScore ?? 2.0, labelVi: 'Trung bình', labelEn: 'Medium', displayLabel: 'Medium', badgeColorClass: 'bg-amber-50 text-amber-700 border-amber-200/90 hover:bg-amber-100/60', dotColorClass: 'bg-amber-500' };
  }
  return result;
}