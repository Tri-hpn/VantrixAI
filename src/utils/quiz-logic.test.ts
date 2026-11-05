import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExamScore,
  formatTimer,
  isUrgentTimer,
  getQuestionStatus,
  computeExamSummary,
  filterMistakeQuestions,
  formatScoreDisplay,
  getUnmasteredMistakes,
  calculateReviewUrgency,
  getTopReviewTopics,
  computeDifficultyBreakdown,
  matchExamDifficultyFilter,
  calculateAverageDifficulty,
  computeExamAverageDifficulty,
} from './quiz-logic';
import { Question, Exam } from '../types/quiz';

test('calculateExamScore: computes 10-point scale correctly', () => {
  assert.equal(calculateExamScore(50, 40, 'thpt_10'), 8.0);
  assert.equal(calculateExamScore(50, 50, 'thpt_10'), 10.0);
  assert.equal(calculateExamScore(50, 0, 'thpt_10'), 0.0);
  assert.equal(calculateExamScore(40, 37, 'thpt_10'), 9.25);
});

test('calculateExamScore: computes 1200-point scale correctly', () => {
  assert.equal(calculateExamScore(100, 75, 'dgnl_1200'), 900);
  assert.equal(calculateExamScore(120, 120, 'dgnl_1200'), 1200);
});

test('calculateExamScore: computes IELTS band correctly', () => {
  assert.equal(calculateExamScore(40, 39, 'ielts_9'), 9.0);
  assert.equal(calculateExamScore(40, 30, 'ielts_9'), 7.5);
  assert.equal(calculateExamScore(40, 20, 'ielts_9'), 6.0);
});

test('formatTimer: converts seconds to MM:SS string with tabular formatting', () => {
  assert.equal(formatTimer(0), '00:00');
  assert.equal(formatTimer(45), '00:45');
  assert.equal(formatTimer(2718), '45:18');
  assert.equal(formatTimer(300), '05:00');
  assert.equal(formatTimer(5), '00:05');
});

test('isUrgentTimer: triggers urgent state when time is under 5 minutes (300s)', () => {
  assert.equal(isUrgentTimer(300), false);
  assert.equal(isUrgentTimer(301), false);
  assert.equal(isUrgentTimer(299), true);
  assert.equal(isUrgentTimer(60), true);
  assert.equal(isUrgentTimer(0), false);
});

test('getQuestionStatus: flags question priority over answered state', () => {
  const answers = { q1: 'A' as const, q2: 'B' as const };
  const flags = { q2: true, q3: true };

  assert.equal(getQuestionStatus('q1', answers, flags), 'answered');
  assert.equal(getQuestionStatus('q2', answers, flags), 'flagged');
  assert.equal(getQuestionStatus('q3', answers, flags), 'flagged');
  assert.equal(getQuestionStatus('q4', answers, flags), 'unanswered');
});

const sampleQuestions: Question[] = [
  {
    id: 'q1',
    code: 'Câu 1',
    subject: 'toan',
    difficulty: 'nhan_biet',
    topic: 'Hàm số',
    stem: 'Tập xác định của hàm số y = 1/x là:',
    options: [
      { id: 'A', text: 'R \\ {0}' },
      { id: 'B', text: 'R' },
      { id: 'C', text: '(0; +∞)' },
      { id: 'D', text: '[0; +∞)' },
    ],
    correctOption: 'A',
    explanation: {
      summary: 'Mẫu số phải khác 0.',
      steps: [{ stepNumber: 1, title: 'Điều kiện', detail: 'x khác 0' }],
      keyTakeaway: 'Tập xác định của phân thức là các giá trị làm mẫu khác 0',
    },
  },
  {
    id: 'q2',
    code: 'Câu 2',
    subject: 'toan',
    difficulty: 'thong_hieu',
    topic: 'Tích phân',
    stem: 'Nguyên hàm của f(x) = 2x là:',
    options: [
      { id: 'A', text: 'x^2 + C' },
      { id: 'B', text: '2x^2 + C' },
      { id: 'C', text: 'x + C' },
      { id: 'D', text: '2 + C' },
    ],
    correctOption: 'A',
    explanation: {
      summary: 'Áp dụng công thức nguyên hàm cơ bản.',
      steps: [{ stepNumber: 1, title: 'Tính', detail: 'int 2x dx = x^2 + C' }],
      keyTakeaway: 'int x^n dx = x^(n+1)/(n+1) + C',
    },
  },
  {
    id: 'q3',
    code: 'Câu 3',
    subject: 'toan',
    difficulty: 'van_dung',
    topic: 'Mũ & Logarit',
    stem: 'Nghiệm của 2^x = 8 là:',
    options: [
      { id: 'A', text: 'x = 3' },
      { id: 'B', text: 'x = 4' },
      { id: 'C', text: 'x = 2' },
      { id: 'D', text: 'x = 8' },
    ],
    correctOption: 'A',
    explanation: {
      summary: '8 = 2^3',
      steps: [{ stepNumber: 1, title: 'Biến đổi', detail: '2^x = 2^3 => x = 3' }],
      keyTakeaway: 'a^x = a^b <=> x = b (a > 0, a != 1)',
    },
  },
];

test('computeExamSummary: computes summary accurately', () => {
  const userAnswers = {
    q1: 'A' as const, // correct
    q2: 'B' as const, // incorrect
    // q3 skipped
  };

  const summary = computeExamSummary(sampleQuestions, userAnswers, 'thpt_10');
  assert.equal(summary.total, 3);
  assert.equal(summary.correctCount, 1);
  assert.equal(summary.incorrectCount, 1);
  assert.equal(summary.skippedCount, 1);
  assert.equal(summary.accuracyPercentage, 33);
  assert.equal(summary.score, 3.33);
});

test('filterMistakeQuestions: isolates wrong and skipped questions', () => {
  const userAnswers = {
    q1: 'A' as const, // correct
    q2: 'C' as const, // incorrect
    // q3 skipped
  };

  const mistakes = filterMistakeQuestions(sampleQuestions, userAnswers);
  assert.equal(mistakes.length, 2);
  assert.equal(mistakes[0].question.id, 'q2');
  assert.equal(mistakes[0].selectedOption, 'C');
  assert.equal(mistakes[0].isSkipped, false);

  assert.equal(mistakes[1].question.id, 'q3');
  assert.equal(mistakes[1].selectedOption, undefined);
  assert.equal(mistakes[1].isSkipped, true);
});

test('formatScoreDisplay formats appropriately across scales', () => {
  assert.equal(formatScoreDisplay(8.6, 'thpt_10'), '8.60 / 10.0');
  assert.equal(formatScoreDisplay(950, 'dgnl_1200'), '950 / 1200');
  assert.equal(formatScoreDisplay(7.5, 'ielts_9'), 'Band 7.5 / 9.0');
});

test('getUnmasteredMistakes: filters out mastered questions', () => {
  const testMistakes = [
    { id: '1', isMastered: false, question: { topic: 'Hàm số' } },
    { id: '2', isMastered: true, question: { topic: 'Tích phân' } },
    { id: '3', isMastered: false, question: { topic: 'Hàm số' } },
  ];

  const unmastered = getUnmasteredMistakes(testMistakes);
  assert.equal(unmastered.length, 2);
  assert.equal(unmastered[0].id, '1');
  assert.equal(unmastered[1].id, '3');
});

test('calculateReviewUrgency: assigns correct urgency tiers', () => {
  assert.equal(calculateReviewUrgency(0), 'low');
  assert.equal(calculateReviewUrgency(2), 'medium');
  assert.equal(calculateReviewUrgency(5), 'high');
  assert.equal(calculateReviewUrgency(12), 'high');
});

test('getTopReviewTopics: counts and sorts unmastered topics by frequency', () => {
  const testMistakes = [
    { question: { topic: 'Hàm số' }, isMastered: false },
    { question: { topic: 'Tích phân' }, isMastered: false },
    { question: { topic: 'Hàm số' }, isMastered: false },
    { question: { topic: 'Tích phân' }, isMastered: true }, // mastered, excluded
    { question: { topic: 'Hàm số' }, isMastered: false },
    { question: { topic: 'Oxyz' }, isMastered: false },
  ];

  const topics = getTopReviewTopics(testMistakes);
  assert.equal(topics.length, 3);
  assert.equal(topics[0].topic, 'Hàm số');
  assert.equal(topics[0].count, 3);
  assert.equal(topics[1].topic, 'Tích phân');
  assert.equal(topics[1].count, 1);
  assert.equal(topics[2].topic, 'Oxyz');
  assert.equal(topics[2].count, 1);
});

test('computeDifficultyBreakdown: correctly tallies question difficulties', () => {
  const dummyQuestions = [
    { difficulty: 'nhan_biet' },
    { difficulty: 'nhan_biet' },
    { difficulty: 'thong_hieu' },
    { difficulty: 'van_dung' },
    { difficulty: 'van_dung_cao' },
  ] as Question[];

  const breakdown = computeDifficultyBreakdown(dummyQuestions);
  assert.equal(breakdown.total, 5);
  assert.equal(breakdown.easyCount, 2);
  assert.equal(breakdown.mediumCount, 1);
  assert.equal(breakdown.hardCount, 2);
  assert.equal(breakdown.easyPct, 40);
  assert.equal(breakdown.mediumPct, 20);
  assert.equal(breakdown.hardPct, 40);
});

test('matchExamDifficultyFilter: accurately filters exams by difficulty prevalence', () => {
  const dummyQuestions = [
    { difficulty: 'nhan_biet' },
    { difficulty: 'nhan_biet' },
    { difficulty: 'nhan_biet' },
    { difficulty: 'thong_hieu' },
  ] as Question[];

  const easyBreakdown = computeDifficultyBreakdown(dummyQuestions);
  assert.equal(matchExamDifficultyFilter(easyBreakdown, 'Dễ', 'easy'), true);
  assert.equal(matchExamDifficultyFilter(easyBreakdown, 'Dễ', 'hard'), false);
  assert.equal(matchExamDifficultyFilter(easyBreakdown, 'Dễ', 'all'), true);
});

test('calculateAverageDifficulty: returns correct average tier for questions', () => {
  const easyQuestions = [
    { difficulty: 'Easy' },
    { difficulty: 'nhan_biet' },
    { difficulty: 'Medium' },
  ] as Question[];
  const easyResult = calculateAverageDifficulty(easyQuestions);
  assert.equal(easyResult.tier, 'Easy');

  const hardQuestions = [
    { difficulty: 'Hard' },
    { difficulty: 'van_dung' },
    { difficulty: 'van_dung_cao' },
  ] as Question[];
  const hardResult = calculateAverageDifficulty(hardQuestions);
  assert.equal(hardResult.tier, 'Hard');

  const balancedQuestions = [
    { difficulty: 'Easy' },
    { difficulty: 'Medium' },
    { difficulty: 'Hard' },
  ] as Question[];
  const balancedResult = calculateAverageDifficulty(balancedQuestions);
  assert.equal(balancedResult.tier, 'Medium');
});

test('computeExamAverageDifficulty: calculates mean difficulty level and score for an Exam', () => {
  const dummyExam: Exam = {
    id: 'test-exam-1',
    title: 'Test Exam',
    subtitle: 'Testing mean difficulty',
    educationLevel: 'thpt',
    educationLevelLabel: 'Cấp 3',
    subject: 'toan',
    subjectLabel: 'Toán',
    totalQuestions: 4,
    durationMinutes: 45,
    year: '2025',
    difficultyLabel: 'Trung bình',
    description: 'Testing',
    scoringScale: 'thpt_10',
    tag: 'Test',
    questions: [
      { difficulty: 'Easy' } as Question,
      { difficulty: 'Easy' } as Question,
      { difficulty: 'nhan_biet' } as Question,
      { difficulty: 'Medium' } as Question,
    ],
  };

  const info = computeExamAverageDifficulty(dummyExam);
  assert.equal(info.tier, 'Easy');
  // (1 + 1 + 1 + 2) / 4 = 1.25 -> rounded to 1.3
  assert.equal(info.score, 1.3);
});




