/**
 * ============================================================================
 * FILE: StudentMistakeNotebook.tsx — Vantrix AI
 * PHÂN HỆ: HỌC SINH & SINH VIÊN (STUDENT)
 * ĐƯỜNG DẪN: /src/components/student/StudentMistakeNotebook.tsx
 * CHỨC NĂNG:
 *  - Sổ tay tự động ghi lại mọi câu làm sai trong các bài thi thử
 *  - AI giải thích từng bước (step-by-step) + mẹo Casio + bẫy thường gặp
 *  - Hỏi đáp tương tác với trợ lý AI theo từng câu hỏi
 *  - Modal ôn nhanh 3 câu chưa thuộc (Micro-Review 5 phút)
 *  - Dọn dẹp câu đã thành thạo & Bộ lọc trạng thái thành thạo / chưa thuộc
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MistakeItem, OptionId } from '../../types/quiz';
import { MathText } from '../common/MathText';
import {
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Cpu,
  AlertTriangle,
  Search,
  Check,
  Send,
  Loader2,
  Trash2,
  X,
  RotateCcw,
} from 'lucide-react';

const BRAND = '#0D5C75';

/* ============================================================================
 * StudentMistakeNotebook — Sổ tay lỗi sai
 * ============================================================================ */
export interface StudentMistakeNotebookProps {
  mistakes: MistakeItem[];
  onToggleMastered: (id: string) => void;
  onClearMastered: () => void;
}

interface AiChatState {
  query: string;
  answer: string;
  loading: boolean;
}

export const StudentMistakeNotebook: React.FC<StudentMistakeNotebookProps> = ({
  mistakes,
  onToggleMastered,
  onClearMastered,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [aiChats, setAiChats] = useState<Record<string, AiChatState>>({});
  const [inputQueries, setInputQueries] = useState<Record<string, string>>({});

  const toggleSolution = (id: string) =>
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAskAI = async (item: MistakeItem, customQuery?: string) => {
    const query =
      customQuery || inputQueries[item.id] || 'Giải thích thêm phương pháp giải nhanh';
    setAiChats((prev) => ({
      ...prev,
      [item.id]: { query, answer: '', loading: true },
    }));

    const fallbackAnswer = `[Gợi ý ôn tập]: Xem lại công thức trọng tâm: "${
      item.question.explanation?.keyTakeaway ?? 'Kiểm tra kỹ điều kiện biên trước khi chọn đáp án.'
    }"`;

    try {
      const res = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: item.question,
          userSelected: item.selectedOption,
          query,
        }),
      });
      const data: { answer?: string } = await res.json();
      setAiChats((prev) => ({
        ...prev,
        [item.id]: {
          query,
          answer: data.answer || 'Đã phân tích chi tiết câu hỏi.',
          loading: false,
        },
      }));
      setInputQueries((prev) => ({ ...prev, [item.id]: '' }));
    } catch {
      setAiChats((prev) => ({
        ...prev,
        [item.id]: { query, answer: fallbackAnswer, loading: false },
      }));
    }
  };

  const filteredMistakes = mistakes.filter((m) => {
    const matchSubject = selectedSubject === 'all' || m.question.subject === selectedSubject;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unmastered'
        ? !m.isMastered
        : m.isMastered;

    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      m.question.stem.toLowerCase().includes(q) ||
      m.question.topic.toLowerCase().includes(q) ||
      m.examTitle.toLowerCase().includes(q);

    return matchSubject && matchStatus && matchSearch;
  });

  const masteredCount = mistakes.filter((m) => m.isMastered).length;
  const unmasteredCount = mistakes.filter((m) => !m.isMastered).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <BookmarkCheck className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0F172A]">
              Sổ Tay Lỗi Sai Thông Minh
            </h1>
            <p className="text-xs text-[#78716C] font-sans">
              Tự động lưu và phân tích các câu làm sai / bỏ qua kèm lời giải AI & mẹo Casio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-[#E6F2F5] border border-[#C7E5EA] text-xs font-semibold text-[#0D5C75] tabular-nums font-mono">
            {unmasteredCount} câu chưa thuộc
          </div>
          {masteredCount > 0 && (
            <>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 tabular-nums font-mono">
                Đã thành thạo: {masteredCount}
              </div>
              {/* HỒI SINH TÍNH NĂNG: onClearMastered */}
              <button
                type="button"
                onClick={onClearMastered}
                className="px-2.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                title="Xóa toàn bộ các câu đã đánh dấu thành thạo"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Dọn câu đã thuộc</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm p-4 space-y-3 font-sans">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'Tất cả môn' },
              { id: 'toan', label: 'Toán học' },
              { id: 'ly', label: 'Vật lý' },
              { id: 'dgnl', label: 'ĐGNL' },
              { id: 'ielts', label: 'IELTS' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedSubject(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubject === cat.id
                    ? 'text-white shadow-sm'
                    : 'bg-[#F5F5F4] text-[#78716C] hover:text-[#0F172A] hover:bg-[#E7E5E4]'
                }`}
                style={selectedSubject === cat.id ? { backgroundColor: BRAND } : undefined}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo chủ đề, câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-1.5 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAFAF9] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tab */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#F5F5F4] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#78716C]">Trạng thái:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `Tất cả (${mistakes.length})` },
                { id: 'unmastered', label: `⚡ Chưa thuộc (${unmasteredCount})` },
                { id: 'mastered', label: `✅ Đã thành thạo (${masteredCount})` },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    statusFilter === st.id
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#A8A29E] font-mono">
            {filteredMistakes.length} câu hiển thị
          </span>
        </div>
      </div>

      {/* List */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center shadow-sm font-sans">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#0F172A]">
            {mistakes.length === 0 ? 'Chưa có câu sai nào!' : 'Không tìm thấy câu hỏi phù hợp'}
          </h3>
          <p className="text-xs text-[#78716C] max-w-md mx-auto mt-1 font-sans">
            {mistakes.length === 0
              ? 'Khi làm bài thi, bất kỳ câu nào bạn làm sai hoặc bỏ qua sẽ tự động xuất hiện tại đây kèm lời giải chi tiết và kiến thức trọng tâm.'
              : 'Hãy thử thay đổi bộ lọc môn học, trạng thái hoặc từ khóa tìm kiếm.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5 font-sans">
          {filteredMistakes.map((item, idx) => {
            const isExpanded = expandedSolutions[item.id] ?? true;
            const aiChat = aiChats[item.id];
            const explanation = item.question.explanation;
            const steps = explanation?.steps ?? [];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.2), ease: 'easeOut' }}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  item.isMastered ? 'border-emerald-200 bg-emerald-50/10' : 'border-[#E7E5E4]'
                }`}
              >
                <div className="p-5 sm:p-6 pb-3">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#E6F2F5] text-[#0D5C75] font-mono">
                        {item.question.code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F5F4] text-[#57534E]">
                        {item.question.topic}
                      </span>
                      <span className="text-xs text-[#78716C] truncate max-w-[200px] sm:max-w-sm">
                        Đề: {item.examTitle}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => onToggleMastered(item.id)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        item.isMastered
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'border-[#D6D3D1] text-[#78716C] hover:bg-[#F5F5F4]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{item.isMastered ? 'Đã thành thạo' : 'Đánh dấu đã hiểu'}</span>
                    </motion.button>
                  </div>

                  <div className="text-sm sm:text-base text-[#0F172A] leading-relaxed mb-4 font-sans">
                    <MathText text={item.question.stem} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    <div className="p-3 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-red-800">Bạn đã chọn: </span>
                        {item.selectedOption ? (
                          <span className="font-bold text-red-900">
                            ({item.selectedOption}){' '}
                            {
                              item.question.options.find((o) => o.id === item.selectedOption)
                                ?.text
                            }
                          </span>
                        ) : (
                          <span className="text-red-700 italic">Bỏ qua / Chưa làm</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-semibold text-emerald-800">Đáp án chuẩn: </span>
                        <span className="font-bold text-emerald-900">
                          ({item.question.correctOption}){' '}
                          {
                            item.question.options.find(
                              (o) => o.id === item.question.correctOption
                            )?.text
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5">
                  <button
                    type="button"
                    onClick={() => toggleSolution(item.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#E6F2F5] hover:bg-[#D6E9EE] border border-[#C7E5EA] text-[#0D5C75] font-semibold text-xs sm:text-sm transition-colors cursor-pointer mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Lời giải chi tiết từ AI & Phương pháp giải</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-4">
                          {explanation?.summary && (
                            <p className="text-xs sm:text-sm font-medium text-[#0F172A] italic border-l-2 border-[#0D5C75] pl-3 py-0.5">
                              {explanation.summary}
                            </p>
                          )}

                          {steps.length > 0 && (
                            <div className="space-y-2.5">
                              {steps.map((st) => (
                                <div
                                  key={st.stepNumber}
                                  className="bg-white p-3 rounded-lg border border-[#E7E5E4] text-xs sm:text-sm"
                                >
                                  <span className="font-bold text-[#0D5C75] mr-2">
                                    Bước {st.stepNumber} [{st.title}]:
                                  </span>
                                  <span className="text-[#0F172A] leading-relaxed">
                                    <MathText text={st.detail} />
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {explanation?.keyTakeaway && (
                            <div className="p-3 rounded-xl bg-[#E6F2F5] border border-[#C7E5EA] flex items-start gap-2.5">
                              <Lightbulb className="w-4 h-4 text-[#0D5C75] shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C75] block mb-0.5">
                                  Kiến thức trọng tâm
                                </span>
                                <p className="text-xs sm:text-sm text-[#0F172A] font-medium leading-relaxed">
                                  {explanation.keyTakeaway}
                                </p>
                              </div>
                            </div>
                          )}

                          {explanation?.casioTip && (
                            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 flex items-start gap-2.5">
                              <Cpu className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-violet-800 block mb-0.5">
                                  Bấm máy tính Casio FX-580VN X
                                </span>
                                <p className="text-xs sm:text-sm text-violet-900 leading-relaxed font-mono">
                                  {explanation.casioTip}
                                </p>
                              </div>
                            </div>
                          )}

                          {explanation?.commonTrap && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                                  Bẫy thường gặp
                                </span>
                                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                                  {explanation.commonTrap}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* AI Interactive Q&A */}
                          <div className="pt-3 border-t border-[#E7E5E4]">
                            <p className="text-xs font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#0D5C75]" />
                              <span>Hỏi gia sư AI về câu này:</span>
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {[
                                { label: '💡 Cách bấm Casio', q: 'Bấm máy tính Casio như thế nào?' },
                                { label: '⚠️ Vì sao tôi sai?', q: 'Tại sao phương án tôi chọn lại sai?' },
                                { label: '📝 Mẹo nhớ lâu', q: 'Cho tôi bài học ghi nhớ ngắn gọn' },
                              ].map((chip) => (
                                <button
                                  key={chip.q}
                                  type="button"
                                  onClick={() => handleAskAI(item, chip.q)}
                                  className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[#D6D3D1] text-[#57534E] hover:border-[#0D5C75] hover:text-[#0D5C75] transition-colors cursor-pointer"
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Nhập thắc mắc của bạn (vd: Bước 2 lấy từ đâu?...)"
                                value={inputQueries[item.id] || ''}
                                onChange={(e) =>
                                  setInputQueries((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAskAI(item);
                                }}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-[#E7E5E4] text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                              />
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                disabled={aiChat?.loading}
                                onClick={() => handleAskAI(item)}
                                className="px-3.5 py-1.5 rounded-xl text-white hover:opacity-90 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-opacity disabled:opacity-50"
                                style={{ backgroundColor: BRAND }}
                              >
                                {aiChat?.loading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">Hỏi</span>
                              </motion.button>
                            </div>

                            {aiChat && (
                              <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#C7E5EA] text-xs text-[#0F172A] leading-relaxed shadow-sm">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0D5C75] mb-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Trợ lý AI trả lời cho: "{aiChat.query}"</span>
                                </div>
                                {aiChat.loading ? (
                                  <div className="flex items-center gap-2 text-[#78716C] py-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#0D5C75]" />
                                    <span>Gia sư AI đang phân tích bài giải...</span>
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-line text-[#0F172A]">
                                    {aiChat.answer}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Aliases
export { StudentMistakeNotebook as MistakeNotebook };
export type { StudentMistakeNotebookProps as MistakeNotebookProps };

/* ============================================================================
 * StudentQuickMistakeReviewModal — Ôn nhanh 3 câu (Micro-Review 5 phút)
 * ============================================================================ */
export interface StudentQuickMistakeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  unmasteredMistakes: MistakeItem[];
  onMarkAsMastered: (id: string) => void;
}

export const StudentQuickMistakeReviewModal: React.FC<
  StudentQuickMistakeReviewModalProps
> = ({ isOpen, onClose, unmasteredMistakes, onMarkAsMastered }) => {
  const reviewQueue = unmasteredMistakes.slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setSessionResults([]);
      setIsSessionCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen || reviewQueue.length === 0) return null;

  const currentItem = reviewQueue[currentIndex];
  const question = currentItem?.question;
  if (!question) return null;

  const handleSelectOption = (optId: OptionId) => {
    if (isAnswerRevealed) return;
    setSelectedOption(optId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === question.correctOption;
    setIsAnswerRevealed(true);
    if (isCorrect) onMarkAsMastered(currentItem.id);
    setSessionResults((prev) => [...prev, { id: currentItem.id, correct: isCorrect }]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      setIsSessionCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setSessionResults([]);
    setIsSessionCompleted(false);
  };

  const correctAnswersCount = sessionResults.filter((r) => r.correct).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E7E5E4] bg-gradient-to-r from-amber-50/60 via-white to-[#E6F2F5]/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-100">
                <span className="font-bold text-lg">⚡</span>
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#0F172A]">
                  Ôn Nhanh Câu Chưa Thuộc (Micro-Review)
                </h3>
                <p className="text-[11px] text-[#78716C] font-sans">
                  Làm đúng để tự động chuyển sang trạng thái "Đã thành thạo"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isSessionCompleted && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E6F2F5] text-[#0D5C75] tabular-nums font-mono">
                  Câu {currentIndex + 1} / {reviewQueue.length}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#78716C] hover:text-[#0F172A] hover:bg-[#F5F5F4] cursor-pointer"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 font-sans">
            {!isSessionCompleted ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#E6F2F5] text-[#0D5C75] font-mono">
                      {question.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F5F4] text-[#57534E]">
                      {question.topic}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    Chưa thuộc • Cần ôn lại
                  </span>
                </div>

                <div className="text-sm sm:text-base font-medium text-[#0F172A] leading-relaxed">
                  <MathText text={question.stem} />
                </div>

                <div className="space-y-2.5">
                  {question.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrect = opt.id === question.correctOption;

                    let optClass =
                      'w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ';
                    if (isAnswerRevealed) {
                      if (isCorrect)
                        optClass +=
                          'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/20';
                      else if (isSelected)
                        optClass +=
                          'bg-red-50 border-red-300 text-red-950 ring-2 ring-red-400/20';
                      else optClass += 'bg-white border-[#E7E5E4] opacity-60';
                    } else if (isSelected) {
                      optClass +=
                        'bg-[#E6F2F5] border-[#0D5C75] ring-2 ring-[#0D5C75]/20';
                    } else {
                      optClass +=
                        'bg-white border-[#E7E5E4] hover:bg-[#FAFAF9] hover:border-[#D6D3D1]';
                    }

                    return (
                      <motion.button
                        key={opt.id}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        disabled={isAnswerRevealed}
                        onClick={() => handleSelectOption(opt.id)}
                        className={optClass}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 font-mono ${
                            isAnswerRevealed && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isAnswerRevealed && isSelected
                              ? 'bg-red-500 text-white'
                              : isSelected
                              ? 'text-white'
                              : 'bg-[#F5F5F4] text-[#57534E]'
                          }`}
                          style={
                            isSelected && !isAnswerRevealed
                              ? { backgroundColor: BRAND }
                              : undefined
                          }
                        >
                          {opt.id}
                        </span>
                        <span className="flex-1 text-xs sm:text-sm pt-0.5">
                          <MathText text={opt.text} />
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {isAnswerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="p-4 rounded-2xl bg-[#E6F2F5] border border-[#C7E5EA] space-y-2"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {selectedOption === question.correctOption ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">
                            Chính xác! Đã đánh dấu "Đã thành thạo" vào sổ tay.
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">
                            Chưa chính xác! Hãy đọc kỹ ghi nhớ dưới đây:
                          </span>
                        </>
                      )}
                    </div>

                    {question.explanation?.keyTakeaway && (
                      <p className="text-xs text-[#0F172A] leading-relaxed">
                        <strong>Kiến thức trọng tâm:</strong>{' '}
                        {question.explanation.keyTakeaway}
                      </p>
                    )}

                    {question.explanation?.casioTip && (
                      <p className="text-[11px] text-violet-900 font-mono bg-white p-2 rounded-lg border border-violet-100">
                        Bấm Casio: {question.explanation.casioTip}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100 text-2xl">
                  🏆
                </div>

                <h4 className="text-xl font-serif font-extrabold text-[#0F172A]">
                  Hoàn Thành Phiên Ôn Tập 5 Phút!
                </h4>

                <p className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto leading-relaxed font-sans">
                  Bạn đã trả lời đúng{' '}
                  <strong className="font-mono">
                    {correctAnswersCount} / {reviewQueue.length} câu
                  </strong>
                  .
                  {correctAnswersCount > 0 && (
                    <span className="text-emerald-700 block mt-1 font-semibold">
                      🎉 Đã nâng cấp {correctAnswersCount} câu sang trạng thái "Đã thành thạo"!
                    </span>
                  )}
                </p>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="px-4 py-2 rounded-xl border border-[#D6D3D1] hover:bg-[#F5F5F4] text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ôn lại lần nữa</span>
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer"
                    style={{ backgroundColor: BRAND }}
                  >
                    Hoàn tất & Về trang chủ
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {!isSessionCompleted && (
            <div className="p-4 sm:p-5 border-t border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between font-sans">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#78716C] hover:text-[#0F172A] cursor-pointer"
              >
                Tạm dừng
              </button>

              {!isAnswerRevealed ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleCheckAnswer}
                  className="px-5 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: BRAND }}
                >
                  Kiểm tra đáp án
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>
                    {currentIndex < reviewQueue.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                  </span>
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export { StudentQuickMistakeReviewModal as QuickMistakeReviewModal };
export type { StudentQuickMistakeReviewModalProps as QuickMistakeReviewModalProps };