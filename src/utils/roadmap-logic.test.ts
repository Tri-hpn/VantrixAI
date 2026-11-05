import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeStudentRoadmap,
  computeSubmissionInsights,
  computeScoreHistory,
  computePriorityReviewTopics,
  getSubjectDisplayName,
  TopicVulnerability,
} from './roadmap-logic';
import { MistakeItem, Question, StudentSubmission } from '../types/quiz';

test('getSubjectDisplayName returns correct Vietnamese subject names', () => {
  assert.equal(getSubjectDisplayName('toan'), 'Toán học');
  assert.equal(getSubjectDisplayName('ly'), 'Vật lý');
  assert.equal(getSubjectDisplayName('hoa'), 'Hóa học');
  assert.equal(getSubjectDisplayName('unknown'), 'Toán học');
});

test('computeSubmissionInsights handles empty submissions', () => {
  const result = computeSubmissionInsights([]);
  assert.equal(result.totalSubmissions, 0);
  assert.equal(result.scoreTrend, 'stable');
  assert.equal(typeof result.averageScore10, 'number');
});

test('computeSubmissionInsights calculates average and improving trend correctly', () => {
  const submissions: StudentSubmission[] = [
    {
      id: 'sub-1',
      classId: 'c-1',
      studentId: 'st-1',
      studentName: 'Học sinh A',
      examId: 'ex-1',
      examTitle: 'Đề thi 1',
      examSubject: 'Toán',
      score: 9.0, // latest
      totalQuestions: 10,
      correctCount: 9,
      submittedAt: Date.now(),
      completedAt: '2025-05-10T10:00:00.000Z',
      timeSpentSeconds: 1200,
      userAnswers: {},
    },
    {
      id: 'sub-2',
      classId: 'c-1',
      studentId: 'st-1',
      studentName: 'Học sinh A',
      examId: 'ex-2',
      examTitle: 'Đề thi 2',
      examSubject: 'Toán',
      score: 7.0, // previous
      totalQuestions: 10,
      correctCount: 7,
      submittedAt: Date.now() - 86400000,
      completedAt: '2025-05-09T10:00:00.000Z',
      timeSpentSeconds: 1500,
      userAnswers: {},
    },
  ];

  const result = computeSubmissionInsights(submissions);
  assert.equal(result.totalSubmissions, 2);
  assert.equal(result.latestScore10, 9.0);
  assert.equal(result.averageScore10, 8.0);
  assert.equal(result.scoreTrend, 'improving');
});

test('analyzeStudentRoadmap works with empty mistakes and generates default roadmap', () => {
  const analysis = analyzeStudentRoadmap([], []);
  assert.equal(analysis.totalTopicsAnalyzed, 0);
  assert.equal(analysis.criticalTopicsCount, 0);
  assert.equal(analysis.unmasteredMistakesCount, 0);
  assert.equal(analysis.milestoneSteps.length, 3);
  assert.equal(analysis.milestoneSteps[0].actionType, 'practice_exam');
});

test('analyzeStudentRoadmap accurately categorizes critical, moderate, and mastered topics', () => {
  const sampleQuestion = (topic: string, code: string): Question => ({
    id: `q-${code}`,
    code,
    subject: 'toan',
    topic,
    difficulty: 'thong_hieu',
    stem: `Câu hỏi mẫu về ${topic}`,
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
    ],
    correctOption: 'A',
    explanation: {
      summary: 'Lời giải chi tiết',
      steps: [{ stepNumber: 1, title: 'Bước 1', detail: 'Giải phương trình' }],
      keyTakeaway: 'Kiến thức trọng tâm',
      casioTip: 'Bấm MODE 7',
      commonTrap: 'Quên điều kiện xác định',
    },
  });

  const mistakes: MistakeItem[] = [
    // Topic 1: Hàm số & Đạo hàm -> 3 unmastered items, repeat failures -> Critical
    {
      id: 'm1',
      examId: 'ex-1',
      examTitle: 'Đề thi Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Hàm số & Đạo hàm', 'HS01'),
      userSelectedAnswer: 'B',
      wrongCount: 3,
      isMastered: false,
      lastWrongAt: '2025-05-10T08:00:00.000Z',
      notes: 'Hay quên đạo hàm hợp',
    },
    {
      id: 'm2',
      examId: 'ex-1',
      examTitle: 'Đề thi Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Hàm số & Đạo hàm', 'HS02'),
      userSelectedAnswer: 'C',
      wrongCount: 2,
      isMastered: false,
      lastWrongAt: '2025-05-09T08:00:00.000Z',
    },
    {
      id: 'm3',
      examId: 'ex-1',
      examTitle: 'Đề thi Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Hàm số & Đạo hàm', 'HS03'),
      userSelectedAnswer: 'D',
      wrongCount: 1,
      isMastered: false,
      lastWrongAt: '2025-05-08T08:00:00.000Z',
    },

    // Topic 2: Số phức -> 1 unmastered item -> Moderate
    {
      id: 'm4',
      examId: 'ex-1',
      examTitle: 'Đề thi Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Số phức', 'SP01'),
      userSelectedAnswer: 'B',
      wrongCount: 1,
      isMastered: false,
      lastWrongAt: '2025-05-07T08:00:00.000Z',
    },

    // Topic 3: Tích phân -> 1 item, all mastered -> Mastered
    {
      id: 'm5',
      examId: 'ex-1',
      examTitle: 'Đề thi Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Tích phân', 'TP01'),
      userSelectedAnswer: 'C',
      wrongCount: 1,
      isMastered: true,
      lastWrongAt: '2025-05-06T08:00:00.000Z',
    },
  ];

  const analysis = analyzeStudentRoadmap(mistakes, []);

  assert.equal(analysis.totalTopicsAnalyzed, 3);
  assert.equal(analysis.criticalTopicsCount, 1);
  assert.equal(analysis.moderateTopicsCount, 1);
  assert.equal(analysis.masteredTopicsCount, 1);
  assert.equal(analysis.unmasteredMistakesCount, 4);

  // Top weak topic should be 'Hàm số & Đạo hàm'
  assert.equal(analysis.weakestTopics[0].topic, 'Hàm số & Đạo hàm');
  assert.equal(analysis.weakestTopics[0].vulnerabilityLevel, 'critical');
  assert.equal(analysis.weakestTopics[0].repeatFailures, 2);
  assert.equal(analysis.weakestTopics[0].suggestedAction.type, 'mistake_review');

  // Milestone steps should address weakest topics
  assert.equal(analysis.milestoneSteps.length, 3);
  assert.equal(analysis.milestoneSteps[0].stepNumber, 1);
  assert.equal(analysis.milestoneSteps[0].actionType, 'mistake_review');
  assert.equal(analysis.milestoneSteps[0].topic, 'Hàm số & Đạo hàm');
  assert.equal(analysis.milestoneSteps[1].actionType, 'ai_practice');

  // scoreHistory should be populated
  assert.ok(Array.isArray(analysis.scoreHistory));
  assert.ok(analysis.scoreHistory.length > 0);
});

test('computeScoreHistory generates chronological progression with cumulative average', () => {
  const submissions: StudentSubmission[] = [
    {
      id: 'sub-1',
      classId: 'c1',
      studentId: 'st1',
      studentName: 'Học sinh',
      examId: 'e1',
      examTitle: 'Đề 1',
      score: 6.0,
      totalQuestions: 10,
      correctCount: 6,
      submittedAt: 1000,
      timeSpentSeconds: 600,
      userAnswers: {},
    },
    {
      id: 'sub-2',
      classId: 'c1',
      studentId: 'st1',
      studentName: 'Học sinh',
      examId: 'e2',
      examTitle: 'Đề 2',
      score: 8.0,
      totalQuestions: 10,
      correctCount: 8,
      submittedAt: 2000,
      timeSpentSeconds: 700,
      userAnswers: {},
    },
    {
      id: 'sub-3',
      classId: 'c1',
      studentId: 'st1',
      studentName: 'Học sinh',
      examId: 'e3',
      examTitle: 'Đề 3',
      score: 10.0,
      totalQuestions: 10,
      correctCount: 10,
      submittedAt: 3000,
      timeSpentSeconds: 800,
      userAnswers: {},
    },
  ];

  const history = computeScoreHistory(submissions);
  assert.equal(history.length, 3);
  assert.equal(history[0].score, 6.0);
  assert.equal(history[0].cumulativeAverage, 6.0);
  assert.equal(history[1].score, 8.0);
  assert.equal(history[1].cumulativeAverage, 7.0); // (6 + 8) / 2
  assert.equal(history[2].score, 10.0);
  assert.equal(history[2].cumulativeAverage, 8.0); // (6 + 8 + 10) / 3
});

test('computePriorityReviewTopics accurately groups and ranks topics by mistake frequency', () => {
  const sampleQuestion = (topic: string, code: string): Question => ({
    id: `q-${code}`,
    code,
    subject: 'toan',
    topic,
    difficulty: 'thong_hieu',
    stem: `Câu hỏi mẫu về ${topic}`,
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
    ],
    correctOption: 'A',
    explanation: {
      summary: 'Giải thích',
      steps: [],
      keyTakeaway: 'Ghi nhớ',
      commonTrap: 'Bẫy số 1',
    },
  });

  const mistakes: MistakeItem[] = [
    // Topic A: "Hình học Oxyz" -> 2 items with wrongCount 3 and 2 = total 5 errors
    {
      id: 'm1',
      examId: 'e1',
      examTitle: 'Đề Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Hình học Oxyz', 'OXYZ1'),
      userSelectedAnswer: 'B',
      wrongCount: 3,
      isMastered: false,
    },
    {
      id: 'm2',
      examId: 'e1',
      examTitle: 'Đề Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Hình học Oxyz', 'OXYZ2'),
      userSelectedAnswer: 'C',
      wrongCount: 2,
      isMastered: false,
    },
    // Topic B: "Xác suất & Tổ hợp" -> 1 item with wrongCount 1 = total 1 error
    {
      id: 'm3',
      examId: 'e1',
      examTitle: 'Đề Toán',
      savedAt: Date.now(),
      question: sampleQuestion('Xác suất & Tổ hợp', 'XS01'),
      userSelectedAnswer: 'D',
      wrongCount: 1,
      isMastered: false,
    },
  ];

  const priorityTopics = computePriorityReviewTopics(mistakes);

  assert.equal(priorityTopics.length, 2);
  // Topic #1 must be Hình học Oxyz because it has 5 errors (vs 1 error)
  assert.equal(priorityTopics[0].rank, 1);
  assert.equal(priorityTopics[0].topic, 'Hình học Oxyz');
  assert.equal(priorityTopics[0].totalMistakes, 5);
  assert.equal(priorityTopics[0].questionCount, 2);
  assert.equal(priorityTopics[0].unmasteredCount, 2);
  assert.equal(priorityTopics[0].repeatMistakeCount, 2);
  // Total errors = 5 + 1 = 6. 5/6 = 83%
  assert.equal(priorityTopics[0].mistakeFrequencyPercentage, 83);
  assert.equal(priorityTopics[0].priorityLevel, 'critical');
  assert.equal(priorityTopics[0].priorityBadge.label, 'Khẩn cấp');

  // Topic #2 must be Xác suất & Tổ hợp
  assert.equal(priorityTopics[1].rank, 2);
  assert.equal(priorityTopics[1].topic, 'Xác suất & Tổ hợp');
  assert.equal(priorityTopics[1].totalMistakes, 1);
  assert.equal(priorityTopics[1].mistakeFrequencyPercentage, 17); // 1/6 = 17%
});

test('computePriorityReviewTopics returns fallback topic for empty mistakes', () => {
  const result = computePriorityReviewTopics([]);
  assert.equal(result.length, 1);
  assert.equal(result[0].rank, 1);
  assert.equal(result[0].totalMistakes, 0);
});

