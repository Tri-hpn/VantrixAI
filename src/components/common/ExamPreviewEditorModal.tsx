/**
 * ============================================================================
 * FILE: ExamPreviewEditorModal.tsx — Vantrix AI
 * PHÂN HỆ: COMMON / TEACHER / ADMIN — CHẾ ĐỘ XEM TRƯỚC & CHỈNH SỬA ĐỀ THI (RBAC)
 * ĐƯỜNG DẪN: /src/components/common/ExamPreviewEditorModal.tsx
 * CHỨC NĂNG:
 *  - Phân quyền (RBAC): Chỉ dành cho TEACHER và ADMIN. Chặn STUDENT tuyệt đối.
 *  - 2 Chế độ linh hoạt:
 *      1. Xem trước (Preview Mode): Hiển thị đầy đủ câu hỏi, đáp án đúng nổi bật,
 *         lời giải chi tiết từng bước & công thức toán học.
 *      2. Chỉnh sửa (Editor Mode): Cho phép sửa tiêu đề, thời gian, câu hỏi,
 *         các phương án A-B-C-D, chọn lại đáp án đúng, thêm/xóa câu hỏi.
 *  - Tích hợp nút Xóa đề thi (kèm hộp thoại xác nhận) và nút Làm thử (Test Runner).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exam, Question, OptionId, UserRole, SubjectType, EducationLevel } from '../../types/quiz';
import { MathText } from './MathText';
import {
  X,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  Clock,
  BookOpen,
  AlertTriangle,
  Play,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Check,
} from 'lucide-react';

export interface ExamPreviewEditorModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSaveExam: (updatedExam: Exam) => void;
  onDeleteExam: (examId: string) => void;
  onStartExamTestRunner: (exam: Exam) => void;
}

export const ExamPreviewEditorModal: React.FC<ExamPreviewEditorModalProps> = ({
  exam,
  isOpen,
  onClose,
  currentRole,
  onSaveExam,
  onDeleteExam,
  onStartExamTestRunner,
}) => {
  const [activeMode, setActiveMode] = useState<'preview' | 'editor'>('preview');
  const [editedExam, setEditedExam] = useState<Exam | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Khởi tạo state khi mở exam
  useEffect(() => {
    if (exam) {
      setEditedExam(JSON.parse(JSON.stringify(exam)));
      setActiveMode('preview');
      setIsConfirmDeleteOpen(false);
      setSaveSuccessNotice(false);
    }
  }, [exam]);

  if (!isOpen || !exam || !editedExam) return null;

  // RBAC GUARD: Học sinh không được phép truy cập modal này
  if (currentRole === 'student') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#151F32] rounded-3xl p-6 max-w-md w-full border border-rose-200 dark:border-rose-900 shadow-2xl text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
            Từ Chối Quyền Truy Cập (403)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Học sinh chỉ có quyền làm bài thi trực tiếp. Chức năng Xem trước & Chỉnh sửa đề thi
            chỉ dành riêng cho <strong>Giáo viên</strong> hoặc <strong>Quản trị viên</strong>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer shadow-md"
          >
            Đã hiểu và quay lại
          </button>
        </motion.div>
      </div>
    );
  }

  // Xử lý chỉnh sửa câu hỏi
  const handleStemChange = (qIndex: number, newStem: string) => {
    setEditedExam((prev) => {
      if (!prev) return prev;
      const nextQuestions = [...prev.questions];
      nextQuestions[qIndex] = { ...nextQuestions[qIndex], stem: newStem };
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleOptionChange = (qIndex: number, optId: OptionId, newText: string) => {
    setEditedExam((prev) => {
      if (!prev) return prev;
      const nextQuestions = [...prev.questions];
      const targetQ = { ...nextQuestions[qIndex] };
      targetQ.options = targetQ.options.map((opt) =>
        opt.id === optId ? { ...opt, text: newText } : opt
      );
      nextQuestions[qIndex] = targetQ;
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleCorrectOptionChange = (qIndex: number, newCorrect: OptionId) => {
    setEditedExam((prev) => {
      if (!prev) return prev;
      const nextQuestions = [...prev.questions];
      nextQuestions[qIndex] = { ...nextQuestions[qIndex], correctOption: newCorrect };
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleExplanationChange = (qIndex: number, newExplanation: string) => {
    setEditedExam((prev) => {
      if (!prev) return prev;
      const nextQuestions = [...prev.questions];
      const targetQ = { ...nextQuestions[qIndex] };
      targetQ.explanation = {
        ...targetQ.explanation,
        summary: newExplanation,
        steps: [
          {
            stepNumber: 1,
            title: 'Lời giải chi tiết',
            detail: newExplanation,
          },
        ],
      };
      nextQuestions[qIndex] = targetQ;
      return { ...prev, questions: nextQuestions };
    });
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (editedExam.questions.length <= 1) {
      alert('Đề thi phải có ít nhất 1 câu hỏi.');
      return;
    }
    setEditedExam((prev) => {
      if (!prev) return prev;
      const nextQuestions = prev.questions.filter((_, idx) => idx !== qIndex);
      return {
        ...prev,
        questions: nextQuestions,
        totalQuestions: nextQuestions.length,
      };
    });
  };

  const handleAddBlankQuestion = () => {
    setEditedExam((prev) => {
      if (!prev) return prev;
      const newIndex = prev.questions.length + 1;
      const newQuestion: Question = {
        id: `q-custom-${Date.now()}-${newIndex}`,
        code: `Câu ${newIndex}`,
        stem: 'Nhập nội dung câu hỏi mới tại đây...',
        subject: prev.subject,
        difficulty: 'thong_hieu',
        topic: 'Chủ đề khảo thí',
        options: [
          { id: 'A', text: 'Phương án A' },
          { id: 'B', text: 'Phương án B' },
          { id: 'C', text: 'Phương án C' },
          { id: 'D', text: 'Phương án D' },
        ],
        correctOption: 'A',
        explanation: {
          summary: 'Lời giải chi tiết cho câu hỏi mới.',
          steps: [{ stepNumber: 1, title: 'Bước 1', detail: 'Giải thích chi tiết phương án A đúng.' }],
          keyTakeaway: 'Ghi nhớ công thức và tính chất tương ứng.',
          casioTip: 'Sử dụng Casio nếu cần thiết.',
        },
      };

      const nextQuestions = [...prev.questions, newQuestion];
      return {
        ...prev,
        questions: nextQuestions,
        totalQuestions: nextQuestions.length,
      };
    });
  };

  const handleSaveAllChanges = () => {
    if (!editedExam) return;
    const finalExam: Exam = {
      ...editedExam,
      totalQuestions: editedExam.questions.length,
    };
    onSaveExam(finalExam);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleConfirmDelete = () => {
    onDeleteExam(exam.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs font-sans overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="bg-white dark:bg-[#151F32] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
              currentRole === 'admin' ? 'bg-purple-600 shadow-purple-500/20' : 'bg-amber-600 shadow-amber-500/20'
            }`}>
              {currentRole === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentRole === 'admin' ? 'Quyền Quản trị viên' : 'Quyền Giáo viên'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {editedExam.questions.length} câu hỏi
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Thời gian: {editedExam.durationMinutes} phút
                </span>
              </div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
                {editedExam.title}
              </h2>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveMode('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('editor')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'editor'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            </div>

            {/* Test runner button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartExamTestRunner(editedExam);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Làm thử trong phòng thi học sinh"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Làm thử</span>
            </button>

            {/* Delete button (RBAC: Teacher & Admin only) */}
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
              title="Xóa đề thi này"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice bar when saved */}
        <AnimatePresence>
          {saveSuccessNotice && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 flex items-center gap-2 justify-center shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Đã lưu thành công các thay đổi của đề thi vào hệ thống!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* General info editor when in editor mode */}
          {activeMode === 'editor' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Thông tin chung của đề thi</span>
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300">
                  (Cập nhật tiêu đề, mô tả và thời gian thi)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Tên đề thi
                  </label>
                  <input
                    type="text"
                    value={editedExam.title}
                    onChange={(e) => setEditedExam((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={editedExam.durationMinutes}
                    onChange={(e) =>
                      setEditedExam((prev) =>
                        prev ? { ...prev, durationMinutes: parseInt(e.target.value, 10) || 50 } : prev
                      )
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* List of questions */}
          <div className="space-y-4">
            {editedExam.questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono">
                      Câu {qIdx + 1}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Độ khó: {q.difficulty === 'nhan_biet' ? 'Nhận biết' : q.difficulty === 'thong_hieu' ? 'Thông hiểu' : 'Vận dụng'}
                    </span>
                  </div>

                  {activeMode === 'editor' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Xóa câu</span>
                    </button>
                  )}
                </div>

                {/* Question Stem */}
                {activeMode === 'preview' ? (
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    <MathText text={q.stem} />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Nội dung câu hỏi:
                    </label>
                    <textarea
                      rows={2}
                      value={q.stem}
                      onChange={(e) => handleStemChange(qIdx, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs leading-relaxed focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt) => {
                    const isCorrect = q.correctOption === opt.id;

                    if (activeMode === 'preview') {
                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                            isCorrect
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 font-medium shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <div className="flex-1 pt-0.5 leading-relaxed">
                            <MathText text={opt.text} />
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 border border-emerald-300 shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    }

                    // Editor mode option
                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleCorrectOptionChange(qIdx, opt.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-colors ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 hover:bg-slate-300'
                          }`}
                          title={isCorrect ? 'Đáp án đúng hiện tại' : 'Bấm để đặt làm đáp án đúng'}
                        >
                          {opt.id}
                        </button>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(qIdx, opt.id, e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200"
                          placeholder={`Phương án ${opt.id}...`}
                        />
                        <button
                          type="button"
                          onClick={() => handleCorrectOptionChange(qIdx, opt.id)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {isCorrect ? '✓ Đúng' : 'Chọn đúng'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {activeMode === 'preview' ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Lời giải & Hướng dẫn chi tiết:</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                        <MathText text={q.explanation?.summary || 'Không có lời giải chi tiết cho câu này.'} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Lời giải chi tiết (Hướng dẫn học sinh):
                      </label>
                      <textarea
                        rows={2}
                        value={q.explanation?.summary || ''}
                        onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                        placeholder="Nhập lời giải hoặc công thức suy luận..."
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add question button in editor mode */}
          {activeMode === 'editor' && (
            <button
              type="button"
              onClick={handleAddBlankQuestion}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-slate-400 hover:text-amber-600 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm câu hỏi mới vào đề thi</span>
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/40 shrink-0">
          <div className="text-xs text-slate-500">
            Tổng cộng: <strong className="text-slate-800 dark:text-slate-200">{editedExam.questions.length}</strong> câu hỏi
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {activeMode === 'editor' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSaveAllChanges}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Sub-modal */}
        <AnimatePresence>
          {isConfirmDeleteOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                    Xác nhận xóa đề thi?
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bạn có chắc chắn muốn xóa &quot;{editedExam.title}&quot; khỏi hệ thống? Thao tác này không thể hoàn tác.
                  </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Xóa ngay
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
