/**
 * ============================================================================
 * FILE: exam-file-parser.ts — Vantrix AI
 * PHÂN HỆ: UTILITIES — BỘ BÓC TÁCH ĐA ĐỊNH DẠNG & PHÂN BỔ ĐỀ CÂN BẰNG
 * ĐƯỜNG DẪN: /src/utils/exam-file-parser.ts
 * CHỨC NĂNG:
 *  - Hỗ trợ 3 định dạng đề thi: [H]-[Đ]-[T], A-B-C-D + Bảng Key, A-B-C-D + File Key rời
 *  - Thuật toán chia bộ đề cân bằng độ khó (Stratified Balanced Partitioning)
 *  - Ép kiểu an toàn, loại bỏ hoàn toàn `any`.
 * ============================================================================
 */

import type { Question, OptionId, DifficultyLevel, SubjectType } from '../types/quiz';

export interface ParseResult {
  questions: Question[];
  formatDetected: 'format_h_d_t' | 'format_table_key' | 'format_no_key' | 'format_standard';
  formatLabel: string;
  totalParsed: number;
  hasAnswers: boolean;
}

export interface ExamSplitResult {
  setIndex: number;
  setTitle: string;
  questions: Question[];
  totalQuestions: number;
  stats: {
    nhan_biet: number;
    thong_hieu: number;
    van_dung: number;
    van_dung_cao: number;
  };
}

/* Internal Types */
interface RawQuestionState {
  num: number;
  code: string;
  stem: string;
  options: { id: OptionId; text: string }[];
  inlineAns?: OptionId;
  foundAnswer: boolean;
}

/**
 * Phân tích văn bản đề thi theo 3 định dạng
 */
export function parseExamText(
  rawText: string,
  options?: { subjectHint?: SubjectType }
): ParseResult {
  const content = (rawText || '').trim();
  if (!content) {
    return {
      questions: [],
      formatDetected: 'format_standard',
      formatLabel: 'Văn bản trống',
      totalParsed: 0,
      hasAnswers: false,
    };
  }

  // 1. Kiểm tra Dạng 1: H - Đ - T1, T2, T3
  if (isFormatHDT(content)) {
    const questions = parseFormatHDT(content, options?.subjectHint);
    return {
      questions,
      formatDetected: 'format_h_d_t',
      formatLabel: 'Định dạng khóa H (Câu hỏi) - Đ (Đúng) - T (Nhiễu/Sai)',
      totalParsed: questions.length,
      hasAnswers: true,
    };
  }

  // 2. Kiểm tra Bảng đáp án ở cuối file
  const { tableKeyMap, textWithoutKey } = extractAnswerKeyTable(content);
  const { questions, foundAnyAnswer } = parseStandardQuestions(
    textWithoutKey,
    tableKeyMap,
    options?.subjectHint
  );

  const hasTableKey = Object.keys(tableKeyMap).length > 0;
  const hasAnswers = foundAnyAnswer || hasTableKey;

  if (hasTableKey) {
    return {
      questions,
      formatDetected: 'format_table_key',
      formatLabel: 'Định dạng câu hỏi A-B-C-D kèm Bảng đáp án ở cuối',
      totalParsed: questions.length,
      hasAnswers: true,
    };
  }

  // 3. Không có đáp án (Dạng 3)
  if (!hasAnswers) {
    return {
      questions,
      formatDetected: 'format_no_key',
      formatLabel: 'Định dạng câu hỏi A-B-C-D (Chưa có đáp án - Cần file Key hoặc AI)',
      totalParsed: questions.length,
      hasAnswers: false,
    };
  }

  return {
    questions,
    formatDetected: 'format_standard',
    formatLabel: 'Định dạng trắc nghiệm tiêu chuẩn',
    totalParsed: questions.length,
    hasAnswers: true,
  };
}

function isFormatHDT(text: string): boolean {
  const hdtRegex = /(?:^|\n)\s*(?:\[H\]|H\s*[:\.\-]|Câu\s*H[:\.\-])/i;
  const dRegex = /(?:^|\n)\s*(?:\[Đ\]|Đ\s*[:\.\-]|\[D\]|Đúng\s*[:\.\-])/i;
  return hdtRegex.test(text) && dRegex.test(text);
}

function parseFormatHDT(text: string, subjectHint?: SubjectType): Question[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const questions: Question[] = [];

  let currentStem = '';
  let currentCorrect = '';
  let currentDistractors: string[] = [];

  const flushQuestion = () => {
    if (!currentStem) return;

    const qIdx = questions.length + 1;
    const allOptionsRaw = [
      { text: currentCorrect || 'Phương án đúng', isCorrect: true },
      ...currentDistractors.map((dist) => ({ text: dist, isCorrect: false })),
    ];

    while (allOptionsRaw.length < 4) {
      allOptionsRaw.push({ text: `Phương án nhiễu ${allOptionsRaw.length + 1}`, isCorrect: false });
    }

    const optionIds: OptionId[] = ['A', 'B', 'C', 'D'];
    let correctId: OptionId = 'A';
    const mappedOptions = allOptionsRaw.slice(0, 4).map((opt, idx) => {
      const id = optionIds[idx];
      if (opt.isCorrect) correctId = id;
      return { id, text: opt.text };
    });

    const diff = inferDifficulty(currentStem);

    questions.push({
      id: `q-hdt-${Date.now()}-${qIdx}`,
      code: `Câu ${qIdx}`,
      subject: subjectHint || 'toan',
      difficulty: diff,
      topic: 'Ngân hàng câu hỏi trắc nghiệm',
      stem: currentStem,
      options: mappedOptions,
      correctOption: correctId,
      explanation: {
        summary: `Đáp án đúng là (${correctId}): ${currentCorrect}`,
        steps: [
          {
            stepNumber: 1,
            title: 'Khẳng định chính xác',
            detail: `Khóa [Đ] định danh phương án đúng: "${currentCorrect}". Các phương án [T1, T2, T3] là đáp án nhiễu.`,
          },
        ],
        keyTakeaway: 'Nắm vững khái niệm và phân biệt rõ dữ kiện đúng so với các phương án gây nhiễu.',
        casioTip: 'Kiểm tra lại điều kiện biên và thử từng giá trị để loại trừ đáp án nhiễu.',
      },
    });

    currentStem = '';
    currentCorrect = '';
    currentDistractors = [];
  };

  const hPattern = /^(?:\[H\]|H\s*[:\.\-]|Câu\s*H[:\.\-])\s*(.*)$/i;
  const dPattern = /^(?:\[Đ\]|Đ\s*[:\.\-]|\[D\]|Đúng\s*[:\.\-])\s*(.*)$/i;
  const tPattern = /^(?:\[T\d*\]|T\d*\s*[:\.\-]|Sai\s*[:\.\-])\s*(.*)$/i;

  for (const line of lines) {
    const hMatch = line.match(hPattern);
    if (hMatch) {
      flushQuestion();
      currentStem = hMatch[1].trim();
      continue;
    }
    const dMatch = line.match(dPattern);
    if (dMatch) {
      currentCorrect = dMatch[1].trim();
      continue;
    }
    const tMatch = line.match(tPattern);
    if (tMatch) {
      currentDistractors.push(tMatch[1].trim());
      continue;
    }

    if (currentCorrect && currentDistractors.length === 0) {
      currentCorrect += ' ' + line;
    } else if (currentDistractors.length > 0) {
      currentDistractors[currentDistractors.length - 1] += ' ' + line;
    } else if (currentStem) {
      currentStem += ' ' + line;
    }
  }

  flushQuestion();
  return questions;
}

function extractAnswerKeyTable(content: string): {
  tableKeyMap: Record<number, OptionId>;
  textWithoutKey: string;
} {
  const tableKeyMap: Record<number, OptionId> = {};
  const answerSectionRegex = /(?:BẢNG\s*ĐÁP\s*ÁN|ĐÁP\s*ÁN\s*CÁC\s*CÂU|ĐÁP\s*ÁN\s*CHI\s*TIẾT|ANSWER\s*KEY|ĐÁP\s*ÁN\s*[:\n])([\s\S]*)$/i;
  const match = content.match(answerSectionRegex);

  let textWithoutKey = content;
  let keyString = '';

  if (match) {
    keyString = match[1];
    textWithoutKey = content.slice(0, match.index).trim();
  } else {
    const tailLines = content.split(/\r?\n/).slice(-15);
    const candidateTail = tailLines.join('\n');
    const matchesCount = (candidateTail.match(/\b\d+\s*[\.\:\-\/]\s*[A-D]\b/gi) || []).length;
    if (matchesCount >= 3) keyString = candidateTail;
  }

  if (keyString) {
    const pairRegex = /(?:Câu\s*)?(\d+)\s*[\.\:\-\/\s]\s*([A-D])\b/gi;
    let m;
    while ((m = pairRegex.exec(keyString)) !== null) {
      tableKeyMap[parseInt(m[1], 10)] = m[2].toUpperCase() as OptionId;
    }
  }

  return { tableKeyMap, textWithoutKey };
}

function parseStandardQuestions(
  text: string,
  tableKeyMap: Record<number, OptionId>,
  subjectHint?: SubjectType
): { questions: Question[]; foundAnyAnswer: boolean } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const questions: Question[] = [];
  let foundAnyAnswer = false;

  const qHeaderRegex = /^(?:Câu|Question|Bài)\s*(\d+)[:\.\-\s](.*)$/i;
  const optRegex = /^([A-D])[\.\:\)]\s*(.*)$/i;
  const inlineAnsRegex = /^(?:Đáp\s*án\s*(?:đúng)?|Answer)[:\.\-\s]*([A-D])/i;

  let currentQ: RawQuestionState | null = null;

  const flush = () => {
    if (!currentQ || currentQ.options.length < 2) return;
    const qNum = currentQ.num || questions.length + 1;

    let correctOpt: OptionId = 'A';
    if (currentQ.inlineAns) {
      correctOpt = currentQ.inlineAns;
      foundAnyAnswer = true;
    } else if (tableKeyMap[qNum]) {
      correctOpt = tableKeyMap[qNum];
      foundAnyAnswer = true;
    }

    questions.push({
      id: `q-std-${Date.now()}-${qNum}`,
      code: currentQ.code || `Câu ${qNum}`,
      subject: subjectHint || 'toan',
      difficulty: inferDifficulty(currentQ.stem),
      topic: 'Khảo thí định kỳ',
      stem: currentQ.stem,
      options: currentQ.options,
      correctOption: correctOpt,
      explanation: {
        summary: `Đáp án chính xác: (${correctOpt})`,
        steps: [
          {
            stepNumber: 1,
            title: 'Lời giải chi tiết',
            detail: `Khảo sát đề bài "${currentQ.stem.slice(0, 100)}...", phương án (${correctOpt}) là đáp án phù hợp nhất.`,
          },
        ],
        keyTakeaway: 'Đọc kỹ câu hỏi và các phương án trước khi chọn.',
        casioTip: 'Có thể dùng Casio FX-580VN X để kiểm tra lại kết quả.',
      },
    });
    currentQ = null;
  };

  for (const line of lines) {
    const qMatch = line.match(qHeaderRegex);
    if (qMatch) {
      flush();
      currentQ = {
        num: parseInt(qMatch[1], 10),
        code: `Câu ${qMatch[1]}`,
        stem: qMatch[2].trim(),
        options: [],
        foundAnswer: false,
      };
      continue;
    }
    if (!currentQ) continue;

    const ansMatch = line.match(inlineAnsRegex);
    if (ansMatch) {
      currentQ.inlineAns = ansMatch[1].toUpperCase() as OptionId;
      continue;
    }

    const optMatch = line.match(optRegex);
    if (optMatch) {
      currentQ.options.push({ id: optMatch[1].toUpperCase() as OptionId, text: optMatch[2].trim() });
      continue;
    }

    if (currentQ.options.length === 0) {
      currentQ.stem += ' ' + line;
    } else {
      currentQ.options[currentQ.options.length - 1].text += ' ' + line;
    }
  }

  flush();
  return { questions, foundAnyAnswer };
}

/**
 * Ghép file đáp án rời (Dạng 3A) vào danh sách câu hỏi
 */
export function applyAnswerKeyFile(questions: Question[], keyText: string): Question[] {
  const content = (keyText || '').trim();
  if (!content || questions.length === 0) return questions;

  const letterKeyMap: Record<number, OptionId> = {};
  const contentKeyMap: Record<number, string> = {};

  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const letterRegex = /(?:Câu\s*)?(\d+)\s*[\.\:\-\/\s]\s*([A-D])\b/i;
  const contentRegex = /(?:Câu\s*)?(\d+)\s*[\:\+\.\-]\s*(.+)$/i;

  for (const line of lines) {
    const m = line.match(letterRegex);
    if (m) {
      letterKeyMap[parseInt(m[1], 10)] = m[2].toUpperCase() as OptionId;
    } else {
      const cMatch = line.match(contentRegex);
      if (cMatch) contentKeyMap[parseInt(cMatch[1], 10)] = cMatch[2].trim().toLowerCase();
    }
  }

  return questions.map((q, idx) => {
    const qNum = idx + 1;
    if (letterKeyMap[qNum]) {
      return {
        ...q,
        correctOption: letterKeyMap[qNum],
        explanation: { ...q.explanation, summary: `Khớp thành công từ tệp đáp án rời: (${letterKeyMap[qNum]})` },
      };
    }

    if (contentKeyMap[qNum]) {
      const expectedText = contentKeyMap[qNum];
      const matchedOpt = q.options.find(
        (o) => o.text.toLowerCase().includes(expectedText) || expectedText.includes(o.text.toLowerCase())
      );
      if (matchedOpt) {
        return {
          ...q,
          correctOption: matchedOpt.id,
          explanation: { ...q.explanation, summary: `Khớp theo nội dung: "${matchedOpt.text}" (${matchedOpt.id})` },
        };
      }
    }
    return q;
  });
}

/**
 * Thuật toán chia bộ câu hỏi cân bằng độ khó
 */
export function splitExamQuestionsBalanced(
  questions: Question[],
  numSets: number = 3,
  baseTitle: string = 'Bộ Đề Khảo Thí'
): ExamSplitResult[] {
  if (questions.length === 0) return [];
  const totalSets = Math.max(1, Math.min(numSets, questions.length));

  const groups: Record<'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao', Question[]> = {
    nhan_biet: [], thong_hieu: [], van_dung: [], van_dung_cao: [],
  };

  questions.forEach((q) => {
    let diff: keyof typeof groups = 'thong_hieu';
    if (q.difficulty === 'nhan_biet' || q.difficulty === 'Easy' || q.difficulty === 'easy') diff = 'nhan_biet';
    else if (q.difficulty === 'thong_hieu' || q.difficulty === 'Medium' || q.difficulty === 'medium') diff = 'thong_hieu';
    else if (q.difficulty === 'van_dung' || q.difficulty === 'Hard' || q.difficulty === 'hard') diff = 'van_dung';
    else if (q.difficulty === 'van_dung_cao') diff = 'van_dung_cao';
    groups[diff].push(q);
  });

  const sets: Question[][] = Array.from({ length: totalSets }, () => []);

  (['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'] as const).forEach((diff) => {
    groups[diff].forEach((q, idx) => {
      sets[idx % totalSets].push(q);
    });
  });

  return sets.map((rawSet, setIdx) => {
    const sortedQuestions = [...rawSet].sort((a, b) => {
      const getWeight = (d: DifficultyLevel) => {
        if (d === 'nhan_biet' || d === 'Easy' || d === 'easy') return 1;
        if (d === 'thong_hieu' || d === 'Medium' || d === 'medium') return 2;
        if (d === 'van_dung' || d === 'Hard' || d === 'hard') return 3;
        return 4;
      };
      return getWeight(a.difficulty) - getWeight(b.difficulty);
    });

    const renumbered = sortedQuestions.map((q, qIndex) => ({
      ...q,
      id: `${q.id}-set${setIdx + 1}-q${qIndex + 1}`,
      code: `Câu ${qIndex + 1}`,
    }));

    return {
      setIndex: setIdx + 1,
      setTitle: `[Bộ ${setIdx + 1}/${totalSets}] ${baseTitle}`,
      questions: renumbered,
      totalQuestions: renumbered.length,
      stats: {
        nhan_biet: renumbered.filter((q) => q.difficulty === 'nhan_biet' || q.difficulty === 'Easy' || q.difficulty === 'easy').length,
        thong_hieu: renumbered.filter((q) => q.difficulty === 'thong_hieu' || q.difficulty === 'Medium' || q.difficulty === 'medium').length,
        van_dung: renumbered.filter((q) => q.difficulty === 'van_dung' || q.difficulty === 'Hard' || q.difficulty === 'hard').length,
        van_dung_cao: renumbered.filter((q) => q.difficulty === 'van_dung_cao').length,
      },
    };
  });
}

function inferDifficulty(stem: string): DifficultyLevel {
  const text = (stem || '').toLowerCase();
  if (
    text.includes('giá trị lớn nhất') || text.includes('giá trị nhỏ nhất') ||
    text.includes('có bao nhiêu giá trị nguyên') || text.includes('tham số m') ||
    text.includes('cực trị') || text.includes('tích phân từng phần') ||
    text.includes('khoảng cách giữa hai đường thẳng') || text.includes('bất đẳng thức')
  ) {
    return 'van_dung';
  }
  if (
    text.includes('vận dụng cao') || text.includes('tối ưu') ||
    text.includes('hình đa diện phức tạp') || text.includes('xác suất có điều kiện')
  ) {
    return 'van_dung_cao';
  }
  if (
    text.includes('tập xác định') || text.includes('đạo hàm của') ||
    text.includes('nghiệm của phương trình') || text.includes('nguyên hàm của') ||
    text.includes('vectơ pháp tuyến') || text.includes('tọa độ điểm')
  ) {
    return 'nhan_biet';
  }
  return 'thong_hieu';
}