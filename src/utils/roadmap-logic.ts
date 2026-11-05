/**
 * ============================================================================
 * FILE: roadmap-logic.ts — Vantrix AI
 * PHÂN HỆ: UTILITIES — ADAPTIVE LEARNING ENGINE
 * ĐƯỜNG DẪN: /src/utils/roadmap-logic.ts
 * CHỨC NĂNG: Phân tích lỗ hổng kiến thức và tạo lộ trình thích ứng
 * ============================================================================
 */

import type { MistakeItem, Exam, StudentSubmission } from '../types/quiz';

export type VulnerabilityLevel = 'critical' | 'moderate' | 'mastered';

export interface TopicSampleQuestion {
  id: string;
  code: string;
  stem: string;
  difficulty: string;
  wrongCount: number;
  casioTip?: string;
  commonTrap?: string;
}

export interface TopicVulnerability {
  topic: string;
  subject: string;
  subjectLabel: string;
  totalMistakes: number;
  unmasteredMistakes: number;
  masteredMistakes: number;
  repeatFailures: number;
  errorRatePercentage: number;
  vulnerabilityLevel: VulnerabilityLevel;
  urgencyScore: number;
  sampleQuestions: TopicSampleQuestion[];
  suggestedAction: {
    type: 'mistake_review' | 'ai_practice' | 'practice_exam';
    title: string;
    description: string;
    actionLabel: string;
  };
}

export interface RoadmapMilestoneStep {
  stepNumber: number;
  title: string;
  topic: string;
  subjectLabel: string;
  description: string;
  estimatedMinutes: number;
  status: 'urgent' | 'in_progress' | 'ready';
  actionType: 'mistake_review' | 'ai_practice' | 'practice_exam';
}

export interface SubmissionInsights {
  totalSubmissions: number;
  averageScore10: number;
  latestScore10: number;
  scoreTrend: 'improving' | 'stable' | 'declining';
}

export interface ScoreHistoryPoint {
  index: number;
  displayName: string;
  shortDate: string;
  score: number;
  cumulativeAverage: number;
  totalQuestions: number;
  correctCount: number;
  examTitle: string;
}

export interface PriorityReviewTopic {
  rank: number;
  topic: string;
  subject: string;
  subjectLabel: string;
  totalMistakes: number;
  questionCount: number;
  unmasteredCount: number;
  repeatMistakeCount: number;
  mistakeFrequencyPercentage: number;
  priorityLevel: 'critical' | 'high' | 'medium';
  priorityBadge: {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
  estimatedMinutes: number;
  topTraps: string[];
  suggestedAction: {
    actionType: 'mistake_review' | 'ai_practice' | 'practice_exam';
    title: string;
    actionLabel: string;
  };
}

export interface RoadmapAnalysis {
  overallMasteryPercentage: number;
  totalTopicsAnalyzed: number;
  criticalTopicsCount: number;
  moderateTopicsCount: number;
  masteredTopicsCount: number;
  unmasteredMistakesCount: number;
  topics: TopicVulnerability[];
  weakestTopics: TopicVulnerability[];
  milestoneSteps: RoadmapMilestoneStep[];
  submissionInsights: SubmissionInsights;
  scoreHistory: ScoreHistoryPoint[];
  priorityReviewTopics: PriorityReviewTopic[];
}

export function getSubjectDisplayName(subjectKey: string): string {
  const map: Record<string, string> = {
    toan: 'Toán học',
    tiengviet: 'Tiếng Việt',
    khoahoc: 'Khoa học Tự nhiên',
    ly: 'Vật lý',
    hoa: 'Hóa học',
    sinh: 'Sinh học',
    tienganh: 'Tiếng Anh',
    dgnl: 'ĐGNL ĐHQG',
    ielts: 'IELTS Academic',
    triethoc: 'Triết học Mác-Lênin',
    laptrinh: 'Lập trình',
    kinhte: 'Kinh tế Chính trị',
  };
  return map[subjectKey] || 'Toán học';
}

export function computeSubmissionInsights(submissions: StudentSubmission[] = []): SubmissionInsights {
  if (submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore10: 8.5,
      latestScore10: 8.5,
      scoreTrend: 'stable',
    };
  }

  const validScores = submissions
    .map((s) => s.score)
    .filter((score): score is number => typeof score === 'number' && !isNaN(score));

  if (validScores.length === 0) {
    return {
      totalSubmissions: submissions.length,
      averageScore10: 8.0,
      latestScore10: 8.0,
      scoreTrend: 'stable',
    };
  }

  const avg = validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length;
  const latest = validScores[0];

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (validScores.length >= 2) {
    const diff = latest - validScores[1];
    if (diff > 0.3) trend = 'improving';
    else if (diff < -0.3) trend = 'declining';
  }

  return {
    totalSubmissions: submissions.length,
    averageScore10: Math.round(avg * 10) / 10,
    latestScore10: Math.round(latest * 10) / 10,
    scoreTrend: trend,
  };
}

export function computeScoreHistory(submissions: StudentSubmission[] = []): ScoreHistoryPoint[] {
  if (submissions.length === 0) {
    return [
      { index: 1, displayName: 'Khảo sát', shortDate: 'Đợt 1', score: 7.0, cumulativeAverage: 7.0, totalQuestions: 20, correctCount: 14, examTitle: 'Khảo sát năng lực đầu vào' },
      { index: 2, displayName: 'Đề 1', shortDate: 'Đợt 2', score: 7.8, cumulativeAverage: 7.4, totalQuestions: 20, correctCount: 15, examTitle: 'Luyện đề củng cố kiến thức' },
      { index: 3, displayName: 'Đề 2', shortDate: 'Đợt 3', score: 8.5, cumulativeAverage: 7.8, totalQuestions: 20, correctCount: 17, examTitle: 'Rèn phản xạ Casio & Bẫy' },
      { index: 4, displayName: 'Gần nhất', shortDate: 'Hôm nay', score: 9.0, cumulativeAverage: 8.1, totalQuestions: 20, correctCount: 18, examTitle: 'Thi thử chuẩn ma trận 2025' },
    ];
  }

  const sorted = [...submissions].sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0));

  let runningSum = 0;
  return sorted.map((sub, idx) => {
    const score = typeof sub.score === 'number' && !isNaN(sub.score) ? sub.score : 8.0;
    runningSum += score;
    const cumulativeAverage = Math.round((runningSum / (idx + 1)) * 10) / 10;

    let dateStr = `Lần ${idx + 1}`;
    if (sub.submittedAt) {
      const d = new Date(sub.submittedAt);
      dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    return {
      index: idx + 1,
      displayName: `Bài ${idx + 1}`,
      shortDate: dateStr,
      score: Math.round(score * 10) / 10,
      cumulativeAverage,
      totalQuestions: sub.totalQuestions || 20,
      correctCount: sub.correctCount || Math.round((score / 10) * (sub.totalQuestions || 20)),
      examTitle: sub.examTitle || `Đề kiểm tra ${idx + 1}`,
    };
  });
}

export function computePriorityReviewTopics(mistakes: MistakeItem[] = []): PriorityReviewTopic[] {
  if (mistakes.length === 0) {
    return [
      {
        rank: 1,
        topic: 'Toán học - Khảo sát ban đầu',
        subject: 'toan',
        subjectLabel: 'Toán học',
        totalMistakes: 0,
        questionCount: 0,
        unmasteredCount: 0,
        repeatMistakeCount: 0,
        mistakeFrequencyPercentage: 0,
        priorityLevel: 'medium',
        priorityBadge: { label: 'Khởi đầu', bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', textClass: 'text-indigo-700', borderClass: 'border-indigo-200' },
        estimatedMinutes: 15,
        topTraps: ['Làm thử đề thi để phát hiện bẫy trắc nghiệm'],
        suggestedAction: { actionType: 'practice_exam', title: 'Khảo sát năng lực với đề thi mẫu', actionLabel: 'Làm đề kiểm tra' },
      },
    ];
  }

  const topicMap: Record<string, { topic: string; subject: string; mistakes: MistakeItem[]; totalErrors: number }> = {};
  let totalErrorsAllTopics = 0;

  for (const m of mistakes) {
    const topic = m.question?.topic || 'Tổng hợp';
    const subject = m.question?.subject || 'toan';
    const errorWeight = Math.max(1, m.wrongCount || 1);
    totalErrorsAllTopics += errorWeight;

    if (!topicMap[topic]) {
      topicMap[topic] = { topic, subject, mistakes: [], totalErrors: 0 };
    }
    topicMap[topic].mistakes.push(m);
    topicMap[topic].totalErrors += errorWeight;
  }

  const result: PriorityReviewTopic[] = Object.values(topicMap).map((entry) => {
    const questionCount = entry.mistakes.length;
    const unmasteredCount = entry.mistakes.filter((m) => !m.isMastered).length;
    const repeatMistakeCount = entry.mistakes.filter((m) => (m.wrongCount || 1) >= 2).length;
    const totalMistakes = entry.totalErrors;
    const mistakeFrequencyPercentage = totalErrorsAllTopics > 0 ? Math.round((totalMistakes / totalErrorsAllTopics) * 100) : 0;

    let priorityLevel: 'critical' | 'high' | 'medium' = 'medium';
    if (unmasteredCount >= 3 || repeatMistakeCount >= 2 || mistakeFrequencyPercentage >= 40) priorityLevel = 'critical';
    else if (unmasteredCount >= 1 || mistakeFrequencyPercentage >= 20) priorityLevel = 'high';

    let priorityBadge: PriorityReviewTopic['priorityBadge'];
    if (priorityLevel === 'critical') priorityBadge = { label: 'Khẩn cấp', bgClass: 'bg-rose-50 text-rose-700 border-rose-200', textClass: 'text-rose-700', borderClass: 'border-rose-200' };
    else if (priorityLevel === 'high') priorityBadge = { label: 'Ưu tiên cao', bgClass: 'bg-amber-50 text-amber-700 border-amber-200', textClass: 'text-amber-700', borderClass: 'border-amber-200' };
    else priorityBadge = { label: 'Cần củng cố', bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', textClass: 'text-indigo-700', borderClass: 'border-indigo-200' };

    const traps: string[] = [];
    for (const m of entry.mistakes) {
      const trap = m.question?.explanation?.commonTrap;
      if (trap && !traps.includes(trap)) traps.push(trap);
    }

    const estimatedMinutes = Math.min(45, Math.max(10, unmasteredCount * 5 + repeatMistakeCount * 3));

    const suggestedAction = unmasteredCount > 0 
      ? { actionType: 'mistake_review' as const, title: `Ôn dứt điểm ${unmasteredCount} câu sai trong Sổ tay`, actionLabel: 'Ôn ngay câu sai' }
      : { actionType: 'ai_practice' as const, title: `Luyện phản xạ 5 câu AI chuyên sâu`, actionLabel: 'Soạn đề AI củng cố' };

    return {
      rank: 0, topic: entry.topic, subject: entry.subject, subjectLabel: getSubjectDisplayName(entry.subject),
      totalMistakes, questionCount, unmasteredCount, repeatMistakeCount, mistakeFrequencyPercentage,
      priorityLevel, priorityBadge, estimatedMinutes, topTraps: traps.slice(0, 2), suggestedAction,
    };
  });

  result.sort((a, b) => {
    const priorityWeight = { critical: 3, high: 2, medium: 1 };
    const pDiff = priorityWeight[b.priorityLevel] - priorityWeight[a.priorityLevel];
    if (pDiff !== 0) return pDiff;
    if (b.totalMistakes !== a.totalMistakes) return b.totalMistakes - a.totalMistakes;
    return b.unmasteredCount - a.unmasteredCount;
  });

  result.forEach((item, index) => { item.rank = index + 1; });
  return result;
}

export function analyzeStudentRoadmap(
  mistakes: MistakeItem[] = [],
  submissions: StudentSubmission[] = [],
  availableExams: Exam[] = []
): RoadmapAnalysis {
  const submissionInsights = computeSubmissionInsights(submissions);
  const scoreHistory = computeScoreHistory(submissions);

  const topicMap: Record<string, { topic: string; subject: string; mistakes: MistakeItem[] }> = {};
  for (const m of mistakes) {
    const topic = m.question?.topic || 'Tổng hợp';
    const subject = m.question?.subject || 'toan';
    if (!topicMap[topic]) topicMap[topic] = { topic, subject, mistakes: [] };
    topicMap[topic].mistakes.push(m);
  }

  const topicEntries = Object.values(topicMap);
  const topics: TopicVulnerability[] = topicEntries.map((entry) => {
    const totalMistakes = entry.mistakes.length;
    const unmasteredMistakes = entry.mistakes.filter((m) => !m.isMastered).length;
    const masteredMistakes = totalMistakes - unmasteredMistakes;
    const repeatFailures = entry.mistakes.filter((m) => (m.wrongCount || 1) >= 2).length;
    const urgencyScore = unmasteredMistakes * 3 + repeatFailures * 2 + totalMistakes;

    let vulnerabilityLevel: VulnerabilityLevel = 'moderate';
    if (unmasteredMistakes >= 3 || repeatFailures >= 2) vulnerabilityLevel = 'critical';
    else if (unmasteredMistakes === 0 && masteredMistakes > 0) vulnerabilityLevel = 'mastered';

    const errorRatePercentage = Math.round((unmasteredMistakes / Math.max(1, totalMistakes)) * 100);

    const sampleQuestions: TopicSampleQuestion[] = entry.mistakes.slice(0, 3).map((m) => ({
      id: m.question?.id || m.id,
      code: m.question?.code || 'Câu hỏi',
      stem: m.question?.stem || '',
      difficulty: m.question?.difficulty || 'thong_hieu',
      wrongCount: m.wrongCount || 1,
      casioTip: m.question?.explanation?.casioTip,
      commonTrap: m.question?.explanation?.commonTrap,
    }));

    let suggestedAction: TopicVulnerability['suggestedAction'];
    if (vulnerabilityLevel === 'critical') {
      suggestedAction = { type: 'mistake_review', title: `Vá lỗ hổng: ${entry.topic}`, description: `Bạn có ${unmasteredMistakes} câu hỏi chưa thuộc và ${repeatFailures} câu sai lặp lại. Cần ôn lại ngay để tránh mất điểm đáng tiếc.`, actionLabel: 'Ôn ngay câu sai' };
    } else if (vulnerabilityLevel === 'moderate') {
      suggestedAction = { type: 'ai_practice', title: `Luyện tập củng cố: ${entry.topic}`, description: `Chủ đề này có ${unmasteredMistakes} câu cần rèn luyện phản xạ thêm. Hãy tạo đề AI 5 câu để thuần thục hoàn toàn.`, actionLabel: 'Soạn đề AI củng cố' };
    } else {
      suggestedAction = { type: 'practice_exam', title: `Duy trì phong độ: ${entry.topic}`, description: `Bạn đã làm chủ tốt chủ đề này. Thử sức với bài thi tổng hợp nâng cao để giữ vững phong độ.`, actionLabel: 'Làm đề kiểm tra' };
    }

    return {
      topic: entry.topic, subject: entry.subject, subjectLabel: getSubjectDisplayName(entry.subject),
      totalMistakes, unmasteredMistakes, masteredMistakes, repeatFailures, errorRatePercentage,
      vulnerabilityLevel, urgencyScore, sampleQuestions, suggestedAction,
    };
  });

  topics.sort((a, b) => b.urgencyScore - a.urgencyScore);
  const weakestTopics = topics.filter((t) => t.vulnerabilityLevel !== 'mastered').slice(0, 4);

  const criticalTopicsCount = topics.filter((t) => t.vulnerabilityLevel === 'critical').length;
  const moderateTopicsCount = topics.filter((t) => t.vulnerabilityLevel === 'moderate').length;
  const masteredTopicsCount = topics.filter((t) => t.vulnerabilityLevel === 'mastered').length;
  const unmasteredMistakesCount = mistakes.filter((m) => !m.isMastered).length;

  let overallMasteryPercentage = 85;
  if (mistakes.length > 0) {
    overallMasteryPercentage = Math.round(((mistakes.length - unmasteredMistakesCount) / mistakes.length) * 100);
  } else if (submissions.length > 0) {
    overallMasteryPercentage = Math.min(95, Math.round(submissionInsights.averageScore10 * 10));
  }

  const milestoneSteps: RoadmapMilestoneStep[] = [];
  if (weakestTopics.length > 0) {
    const topWeak = weakestTopics[0];
    milestoneSteps.push(
      { stepNumber: 1, title: `Chữa dứt điểm câu sai chuyên đề "${topWeak.topic}"`, topic: topWeak.topic, subjectLabel: topWeak.subjectLabel, description: `Học sinh đang có ${topWeak.unmasteredMistakes} câu hỏi chưa thuộc và ${topWeak.repeatFailures} lần mắc bẫy. Ưu tiên ôn tập theo phương pháp lặp lại ngắt quãng.`, estimatedMinutes: 10, status: 'urgent', actionType: 'mistake_review' },
      { stepNumber: 2, title: `Thử sức 5 câu AI chuyên sâu: "${(weakestTopics[1] || topWeak).topic}"`, topic: (weakestTopics[1] || topWeak).topic, subjectLabel: (weakestTopics[1] || topWeak).subjectLabel, description: `Luyện phản xạ với các biến thể câu hỏi tương tự để nắm chắc phương pháp giải nhanh và mẹo Casio.`, estimatedMinutes: 15, status: 'in_progress', actionType: 'ai_practice' },
      { stepNumber: 3, title: `Kiểm tra tổng hợp đề chuẩn quốc gia 2025`, topic: topWeak.topic, subjectLabel: topWeak.subjectLabel, description: `Làm một bài thi hoàn chỉnh có tính giờ để kiểm tra khả năng phân bổ thời gian và chống mất điểm ở câu dễ.`, estimatedMinutes: 30, status: 'ready', actionType: 'practice_exam' }
    );
  } else {
    milestoneSteps.push(
      { stepNumber: 1, title: 'Khảo sát năng lực với Đề Thi Chuẩn Cấu Trúc 2025', topic: 'Toán học tổng hợp', subjectLabel: 'Toán học', description: 'Hoàn thành bài thi đầu tiên để hệ thống tự động ghi nhận các chủ đề bạn làm tốt và các chủ đề cần bồi dưỡng.', estimatedMinutes: 30, status: 'urgent', actionType: 'practice_exam' },
      { stepNumber: 2, title: 'Xây dựng Sổ tay lỗi sai cá nhân hóa', topic: 'Nhận diện bẫy đề thi', subjectLabel: 'Đa môn', description: 'Mỗi khi làm sai một câu, hệ thống sẽ tự động phân tích bước giải Casio và lý do chọn nhầm.', estimatedMinutes: 10, status: 'in_progress', actionType: 'mistake_review' },
      { stepNumber: 3, title: 'Soạn đề AI theo điểm số mục tiêu 8.5+', topic: 'Vận dụng cao', subjectLabel: 'Toán học', description: 'Luyện tập các câu hỏi phân loại nâng cao để bứt phá band điểm.', estimatedMinutes: 20, status: 'ready', actionType: 'ai_practice' }
    );
  }

  return {
    overallMasteryPercentage, totalTopicsAnalyzed: topics.length,
    criticalTopicsCount, moderateTopicsCount, masteredTopicsCount, unmasteredMistakesCount,
    topics, weakestTopics, milestoneSteps, submissionInsights, scoreHistory,
    priorityReviewTopics: computePriorityReviewTopics(mistakes),
  };
}