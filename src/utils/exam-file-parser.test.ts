import { parseExamText, applyAnswerKeyFile, splitExamQuestionsBalanced } from './exam-file-parser';

// Test 1: Format 1 (H - Đ - T1, T2, T3)
const format1Text = `
H: Giá trị của tích phân I = int_0^1 e^(2x) dx là:
Đ: (e^2 - 1) / 2
T1: e^2 - 1
T2: (e^2 + 1) / 2
T3: 2 * (e^2 - 1)

H: Trong không gian Oxyz, mặt phẳng (P): 2x - y + 3z - 4 = 0 có một VTPT là:
Đ: n = (2; -1; 3)
T1: n = (2; 1; 3)
T2: n = (-2; -1; 3)
T3: n = (2; -1; -4)
`;

const res1 = parseExamText(format1Text, { subjectHint: 'toan' });
console.log('Test 1 (H-D-T):', res1.formatDetected, 'Count:', res1.totalParsed);
if (res1.totalParsed !== 2 || res1.formatDetected !== 'format_h_d_t') {
  throw new Error('Test 1 failed!');
}

// Test 2: Format 2 (Questions with Answer table at bottom)
const format2Text = `
Câu 1: Hàm số y = x^3 - 3x có bao nhiêu điểm cực trị?
A. 0
B. 1
C. 2
D. 3

Câu 2: Nghiệm của phương trình 2^x = 8 là:
A. x = 2
B. x = 3
C. x = 4
D. x = 1

BẢNG ĐÁP ÁN:
1. C   2. B
`;

const res2 = parseExamText(format2Text, { subjectHint: 'toan' });
console.log('Test 2 (Table Key):', res2.formatDetected, 'Count:', res2.totalParsed);
console.log('Q1 answer:', res2.questions[0].correctOption, 'Q2 answer:', res2.questions[1].correctOption);
if (res2.questions[0].correctOption !== 'C' || res2.questions[1].correctOption !== 'B') {
  throw new Error('Test 2 failed!');
}

// Test 3: Format 3 (Questions without keys, and then applying Answer Key file)
const format3Text = `
Câu 1: Thủ đô của Việt Nam là gì?
A. Đà Nẵng
B. TP. Hồ Chí Minh
C. Hà Nội
D. Cần Thơ

Câu 2: Diện tích hình vuông cạnh 5 cm là:
A. 25 cm2
B. 20 cm2
C. 10 cm2
D. 15 cm2
`;

const res3 = parseExamText(format3Text);
console.log('Test 3 (No key):', res3.formatDetected, 'hasAnswers:', res3.hasAnswers);

// Apply key file (Letter format)
const keyFileText = `
1. C
2. A
`;
const withKey = applyAnswerKeyFile(res3.questions, keyFileText);
console.log('After key file Q1:', withKey[0].correctOption, 'Q2:', withKey[1].correctOption);
if (withKey[0].correctOption !== 'C' || withKey[1].correctOption !== 'A') {
  throw new Error('Test 3 with key failed!');
}

// Test 4: Balanced splitting
// Create 9 questions with different difficulties
const mockQuestions = Array.from({ length: 9 }, (_, i) => ({
  id: `q-${i + 1}`,
  code: `Câu ${i + 1}`,
  subject: 'toan' as const,
  difficulty: (i % 3 === 0 ? 'nhan_biet' : i % 3 === 1 ? 'thong_hieu' : 'van_dung') as any,
  topic: 'Đại số',
  stem: `Nội dung câu hỏi ${i + 1}`,
  options: [
    { id: 'A' as const, text: 'Opt A' },
    { id: 'B' as const, text: 'Opt B' },
    { id: 'C' as const, text: 'Opt C' },
    { id: 'D' as const, text: 'Opt D' },
  ],
  correctOption: 'A' as const,
  explanation: { summary: 'ok', steps: [], keyTakeaway: 'ok' },
}));

const splitSets = splitExamQuestionsBalanced(mockQuestions, 3, 'Đề Thi Thử');
console.log('Test 4 (Splitting): Sets count:', splitSets.length);
splitSets.forEach((s) => {
  console.log(s.setTitle, 'Questions count:', s.totalQuestions, 'Stats:', s.stats);
  if (s.totalQuestions !== 3) throw new Error('Expected 3 questions per set');
});

// Check disjointness
const allIds = splitSets.flatMap((s) => s.questions.map((q) => q.stem));
const uniqueIds = new Set(allIds);
if (allIds.length !== uniqueIds.size) {
  throw new Error('Duplicate questions detected across sets!');
}

console.log('All tests passed successfully!');

