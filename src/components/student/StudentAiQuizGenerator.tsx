/**
 * ============================================================================
 * FILE: StudentAiQuizGenerator.tsx — Vantrix AI
 * PHÂN HỆ: HỌC SINH & GIẢNG VIÊN (STUDENT & TEACHER)
 * ĐƯỜNG DẪN: /src/components/student/StudentAiQuizGenerator.tsx
 * CHỨC NĂNG:
 *  - Sinh tự động câu hỏi trắc nghiệm chuẩn 4 phương án theo chuyên đề
 *  - Chọn cấp độ nhận thức: Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao
 *  - Sinh công thức LaTeX + lời giải chi tiết + mẹo Casio
 *  - Chế độ dán đề thô / OCR text
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exam, SubjectType, DifficultyLevel } from '../../types/quiz';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Wand2,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const BRAND = '#0D5C75';
const BRAND_HOVER = '#084356';

export interface StudentAiQuizGeneratorProps {
  initialTopic?: string;
  onExamCreated: (newExam: Exam) => void;
  onCancel: () => void;
}

interface GenerateQuizResponse {
  success?: boolean;
  error?: string;
  questions?: Exam['questions'];
}

export const StudentAiQuizGenerator: React.FC<StudentAiQuizGeneratorProps> = ({
  initialTopic = '',
  onExamCreated,
  onCancel,
}) => {
  const [subject, setSubject] = useState<SubjectType>('toan');
  const [topic, setTopic] = useState(initialTopic || 'Hàm số và cực trị vận dụng cao');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('van_dung');
  const [count, setCount] = useState<number>(5);
  const [customPrompt, setCustomPrompt] = useState('');
  const [mode, setMode] = useState<'prompt' | 'raw_text'>('prompt');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic: mode === 'raw_text' ? 'Đề trích xuất từ văn bản' : topic,
          difficulty,
          count,
          customPrompt:
            mode === 'raw_text' ? `Trích xuất từ nội dung: ${rawText}` : customPrompt,
        }),
      });

      const data: GenerateQuizResponse = await res.json();
      if (!data.success || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || 'Không nhận được câu hỏi từ AI');
      }

      const newExam: Exam = {
        id: `ai-exam-${Date.now()}`,
        title: `Đề Luyện AI: ${topic.slice(0, 35)}...`,
        subtitle: `Tạo tự động bởi Gemini AI 2.5 • ${data.questions.length} câu`,
        subject,
        subjectLabel:
          subject === 'toan'
            ? 'Toán học'
            : subject === 'ly'
            ? 'Vật lý'
            : subject === 'dgnl'
            ? 'ĐGNL'
            : 'IELTS',
        totalQuestions: data.questions.length,
        durationMinutes: Math.max(10, data.questions.length * 2),
        year: '2025',
        difficultyLabel: difficulty === 'van_dung_cao' ? 'Nâng cao (8+)' : 'Khá khó',
        description: `Bộ đề ôn tập thích ứng theo yêu cầu cá nhân hóa: ${topic}`,
        questions: data.questions,
        scoringScale:
          subject === 'dgnl' ? 'dgnl_1200' : subject === 'ielts' ? 'ielts_9' : 'thpt_10',
        educationLevel: 'thpt',
        educationLevelLabel: 'Cấp 3 (THPT)',
        tag: 'AI Cá Nhân Hóa',
      };

      onExamCreated(newExam);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Lỗi khi tạo đề với AI. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm p-6 sm:p-8"
      >
        {/* Title */}
        <div className="flex items-center gap-3 pb-5 border-b border-[#E7E5E4] mb-6">
          <div
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md"
            style={{ backgroundColor: BRAND }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">
              Tạo Đề Thi Thử Thông Minh Bằng Gemini AI
            </h1>
            <p className="text-xs text-[#78716C]">
              Sinh bộ câu hỏi theo chuẩn ma trận THPT, ĐGNL kèm phương pháp bấm Casio FX-580VN
            </p>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 p-1 bg-[#F5F5F4] rounded-xl mb-6 max-w-sm">
          {(
            [
              { key: 'prompt' as const, icon: Wand2, label: 'Sinh theo chủ đề' },
              { key: 'raw_text' as const, icon: FileText, label: 'Dán đề thô / OCR' },
            ] as const
          ).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === key ? 'bg-white shadow-sm' : 'text-[#78716C]'
              }`}
              style={mode === key ? { color: BRAND } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleGenerate} className="space-y-5">
          {mode === 'prompt' ? (
            <>
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                  1. Chọn Môn Thi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'toan', label: 'Toán học' },
                    { id: 'ly', label: 'Vật lý 12' },
                    { id: 'dgnl', label: 'ĐGNL ĐHQG' },
                    { id: 'ielts', label: 'IELTS Academic' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSubject(s.id as SubjectType)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                        subject === s.id
                          ? 'ring-2 bg-[#E6F2F5] shadow-sm'
                          : 'border-[#E7E5E4] bg-white text-[#57534E] hover:bg-[#FAFAF9]'
                      }`}
                      style={
                        subject === s.id
                          ? {
                              borderColor: BRAND,
                              color: BRAND,
                              // @ts-expect-error - CSS var runtime assignment
                              '--tw-ring-color': BRAND,
                            }
                          : undefined
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                  2. Chuyên đề / Dạng bài cần luyện
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cực trị hàm số chứa dấu giá trị tuyệt đối, Sóng dừng, Vectơ Oxyz..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm bg-white focus:outline-none focus:ring-2 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                    3. Mức độ nhận thức
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm bg-white focus:outline-none focus:ring-2 transition-all"
                  >
                    <option value="nhan_biet">Nhận biết (Mục tiêu 5 - 6)</option>
                    <option value="thong_hieu">Thông hiểu (Mục tiêu 6 - 7)</option>
                    <option value="van_dung">Vận dụng (Mục tiêu 7 - 8)</option>
                    <option value="van_dung_cao">Vận dụng cao (Mục tiêu 9 - 10)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                    4. Số lượng câu hỏi
                  </label>
                  <select
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm bg-white focus:outline-none focus:ring-2 transition-all"
                  >
                    <option value={3}>3 câu (Luyện nhanh 5 phút)</option>
                    <option value={5}>5 câu (Chuẩn micro-test)</option>
                    <option value={10}>10 câu (Mini exam 20 phút)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                  5. Yêu cầu thêm (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tập trung câu bẫy hay mắc phải, bổ sung cách bấm Casio..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-white focus:outline-none focus:ring-2 transition-all"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
                Dán văn bản câu hỏi trắc nghiệm hoặc đề thô
              </label>
              <textarea
                rows={8}
                required
                placeholder="Câu 1: Cho hàm số y = ...\nA. ...\nB. ...\nC. ...\nD. ..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#E7E5E4] text-xs font-mono bg-white focus:outline-none focus:ring-2 transition-all"
              />
              <p className="text-[11px] text-[#78716C] mt-1">
                Gemini AI sẽ tự động chuẩn hóa ký hiệu toán học, phân tích từng phương án và tạo
                lời giải chi tiết.
              </p>
            </div>
          )}

          {/* Loading Stepper */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl border border-[#C7E5EA] bg-[#E6F2F5]/60 space-y-2.5 overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs font-bold" style={{ color: BRAND }}>
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Vantrix AI đang khởi tạo đề thi thông minh...</span>
                  </span>
                  <span className="text-[11px] font-mono">Đang tạo</span>
                </div>
                <div className="w-full bg-[#E7E5E4] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full w-4/5 rounded-full animate-pulse"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${BRAND}, #10B981, ${BRAND})`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#57534E] pt-1">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>1. Ma trận đề Bộ GD&ĐT</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 font-medium animate-pulse"
                    style={{ color: BRAND }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BRAND }} />
                    <span>2. Sinh công thức LaTeX</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-[#A8A29E]">
                    <span className="w-2 h-2 rounded-full bg-[#D6D3D1] shrink-0" />
                    <span>3. Lời giải chi tiết</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-[#E7E5E4] text-[#57534E] hover:bg-[#F5F5F4] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini AI đang sinh đề...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Bắt đầu tạo & Làm bài ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export { StudentAiQuizGenerator as AiQuizGenerator };
export type { StudentAiQuizGeneratorProps as AiQuizGeneratorProps };