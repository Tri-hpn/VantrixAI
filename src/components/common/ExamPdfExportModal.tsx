/**
 * ============================================================================
 * FILE: ExamPdfExportModal.tsx — Vantrix AI
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — XUẤT ĐỀ THI & PHIẾU TRẢ LỜI
 * ĐƯỜNG DẪN: /src/components/common/ExamPdfExportModal.tsx
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exam } from '../../types/quiz';
import { MathText } from './MathText';
import { Printer, X } from 'lucide-react';

const BRAND = '#0D5C75';

interface ExamPdfExportModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExamPdfExportModal: React.FC<ExamPdfExportModalProps> = ({
  exam,
  isOpen,
  onClose,
}) => {
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [includeExplanations, setIncludeExplanations] = useState(false);
  const [examCode, setExamCode] = useState('101');

  if (!isOpen || !exam) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Controls (Hidden during browser print) */}
          <div className="p-4 sm:p-5 border-b border-[#E7E5E4] bg-[#FAFAF9] flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: BRAND }}
              >
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#0F172A]">
                  Xem & In Đề Thi Chuẩn Bộ GD&ĐT (A4 / PDF)
                </h3>
                <p className="text-[11px] text-[#78716C]">
                  {exam.title} • {exam.questions.length} câu • {exam.durationMinutes} phút
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-1.5 text-xs text-[#44403C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: BRAND }}
                />
                <span>Kèm bảng đáp án</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-[#44403C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExplanations}
                  onChange={(e) => setIncludeExplanations(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: BRAND }}
                />
                <span>Kèm lời giải</span>
              </label>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                <Printer className="w-4 h-4" />
                <span>In / Lưu PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#78716C] hover:text-[#0F172A] hover:bg-[#F5F5F4] transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document */}
          <div className="p-8 sm:p-12 overflow-y-auto bg-white text-[#0F172A] font-serif leading-relaxed space-y-6 flex-1 print:p-0">
            {/* Official Exam Header */}
            <div className="border-b-2 border-black pb-4">
              <div className="flex justify-between items-start text-xs sm:text-sm">
                <div className="text-center font-bold">
                  <p className="uppercase">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
                  <p className="font-semibold text-xs">TRƯỜNG THPT CHUYÊN</p>
                  <p className="text-[11px] font-normal italic">
                    (Đề thi có {exam.questions.length} câu)
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-bold uppercase text-sm sm:text-base">
                    KỲ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025
                  </p>
                  <p className="font-bold text-xs sm:text-sm">
                    Bài thi: {exam.subjectLabel.toUpperCase()}
                  </p>
                  <p className="text-xs italic">
                    Thời gian làm bài: {exam.durationMinutes} phút (không kể phát đề)
                  </p>
                </div>

                <div className="border-2 border-black px-3 py-1 font-bold text-center">
                  <p className="text-[10px] uppercase">MÃ ĐỀ THI</p>
                  <p className="text-base font-mono">{examCode}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mt-4 pt-2 border-t border-dashed border-gray-400 font-sans">
                <span>Họ và tên thí sinh: ............................................................................</span>
                <span>Số báo danh: ....................................</span>
              </div>
            </div>

            {/* Exam Questions */}
            <div className="space-y-6 font-sans text-xs sm:text-sm">
              {exam.questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <p className="leading-relaxed">
                    <strong className="font-bold text-black">{q.code}: </strong>
                    <MathText text={q.stem} />
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-4">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-start gap-1">
                        <strong className="font-bold">{opt.id}.</strong>
                        <span>
                          <MathText text={opt.text} />
                        </span>
                      </div>
                    ))}
                  </div>

                  {includeExplanations && (
                    <div
                      className="p-3 rounded-lg border text-xs font-sans mt-2"
                      style={{ backgroundColor: '#E6F2F5', borderColor: '#C7E5EA', color: '#042F2E' }}
                    >
                      <p className="font-bold mb-1" style={{ color: BRAND }}>
                        [Lời giải chi tiết - Đáp án: {q.correctOption}]
                      </p>
                      <p className="italic">{q.explanation.summary}</p>
                      {q.explanation.keyTakeaway && (
                        <p className="mt-1 text-[11px] font-semibold text-emerald-800">
                          Kiến thức trọng tâm: {q.explanation.keyTakeaway}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center font-bold text-xs pt-6 border-t-2 border-black">
              <p>---------- HẾT ----------</p>
              <p className="text-[11px] font-normal italic mt-1">
                Thí sinh không được sử dụng tài liệu. Cán bộ coi thi không giải thích gì thêm.
              </p>
            </div>

            {/* Optional Answer Key */}
            {includeAnswerKey && (
              <div className="pt-6 border-t border-dashed border-gray-400 page-break-before">
                <h4 className="font-serif font-bold text-center text-sm mb-3 uppercase">
                  BẢNG ĐÁP ÁN MÃ ĐỀ {examCode}
                </h4>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center text-xs font-mono">
                  {exam.questions.map((q, idx) => (
                    <div key={q.id} className="p-1 border border-black rounded">
                      <div className="text-[10px] text-gray-600">{idx + 1}</div>
                      <div className="font-bold text-sm" style={{ color: BRAND }}>
                        {q.correctOption}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};