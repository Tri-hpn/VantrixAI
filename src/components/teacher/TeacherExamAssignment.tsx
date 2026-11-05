/**
 * ============================================================================
 * FILE: TeacherExamAssignment.tsx — Vantrix AI
 * PHÂN HỆ: GIẢNG VIÊN & GIÁO VIÊN (TEACHER)
 * ĐƯỜNG DẪN: /src/components/teacher/TeacherExamAssignment.tsx
 * CHỨC NĂNG:
 *  - Giao đề thi cho lớp với thông báo tự động
 *  - Xuất PDF khổ A4 chuẩn Bộ GD&ĐT
 *  - Hoán vị câu hỏi chống gian lận
 * GHI CHÚ: Prop `onAssignExam` (optional) cho phép parent update immutable.
 *          Nếu không cung cấp, fallback mutate trực tiếp (backward compat).
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exam, Classroom, UserRole } from '../../types/quiz';
import {
  BookOpen,
  FileUp,
  Printer,
  Shuffle,
  Clock,
  CheckCircle2,
  Send,
  Eye,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TEACHER = {
  main: '#B45309',
  hover: '#92400E',
  tint: '#FEF3C7',
  border: '#FDE68A',
} as const;

export interface TeacherExamAssignmentProps {
  classrooms: Classroom[];
  selectedClassId: string;
  exams: Exam[];
  onStartExam: (exam: Exam) => void;
  onOpenUploadForClass: (classId: string) => void;
  onExportExamPdf: (exam: Exam) => void;
  onShuffleExam: (exam: Exam) => void;
  currentRole: UserRole;
  /**
   * Optional — nếu parent cung cấp, component sẽ dùng callback này để update
   * immutable thay vì mutate trực tiếp `classrooms[i].assignedExamIds`.
   */
  onAssignExam?: (classId: string, examId: string) => void;
}

export const TeacherExamAssignment: React.FC<TeacherExamAssignmentProps> = ({
  classrooms,
  selectedClassId,
  exams,
  onStartExam,
  onOpenUploadForClass,
  onExportExamPdf,
  onShuffleExam,
  currentRole,
  onAssignExam,
}) => {
  const { notifyTeacherAssignment } = useNotifications();
  const [assignedFeedback, setAssignedFeedback] = useState<string | null>(null);

  const selectedClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const assignedExams = exams.filter((e) => selectedClass?.assignedExamIds?.includes(e.id));
  const availableExams = exams.filter((e) => !selectedClass?.assignedExamIds?.includes(e.id));

  const handleAssignExamToClass = (exam: Exam) => {
    if (!selectedClass) return;

    // Ưu tiên callback từ parent (immutable update)
    if (onAssignExam) {
      onAssignExam(selectedClass.id, exam.id);
    } else if (!selectedClass.assignedExamIds.includes(exam.id)) {
      // Fallback: mutation trực tiếp (backward compat)
      selectedClass.assignedExamIds.unshift(exam.id);
    }

    notifyTeacherAssignment({
      teacherName: 'Thầy Nguyễn Văn Trí',
      examTitle: exam.title,
      examId: exam.id,
      className: selectedClass.name,
      deadline: '23:59 Chủ Nhật tuần này',
    });

    setAssignedFeedback(
      `Đã giao thành công bài thi "${exam.title}" cho lớp ${selectedClass.name}!`
    );
    setTimeout(() => setAssignedFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E5E4] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: TEACHER.main }} />
            <span>Ngân Hàng Đề Thi & Bài Tập Giao Cho Lớp</span>
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Lớp đang chọn:{' '}
            <strong style={{ color: TEACHER.main }}>
              {selectedClass?.name || 'Tất cả lớp'}
            </strong>{' '}
            • Quản lý các đề thi đã giao và giao thêm bài tập mới.
          </p>
        </div>

        {currentRole === 'teacher' && selectedClass && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onOpenUploadForClass(selectedClass.id)}
            className="px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: TEACHER.main }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEACHER.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEACHER.main)}
          >
            <FileUp className="w-4 h-4" />
            <span>Đẩy File Word/PDF Giao Ngay</span>
          </motion.button>
        )}
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {assignedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{assignedFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assigned exams list */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-sm text-[#0F172A]">
            Đề Thi Đang Mở Cho Lớp ({assignedExams.length} Đề)
          </h3>
          <span className="text-xs text-[#78716C] font-normal">
            Học sinh có thể truy cập làm bài ngay
          </span>
        </div>

        {assignedExams.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#E7E5E4] rounded-2xl bg-[#FAFAF9]">
            <BookOpen className="w-10 h-10 mx-auto text-[#D6D3D1] mb-2" />
            <p className="text-sm font-bold text-[#0F172A]">
              Chưa có đề thi nào được giao cho lớp này
            </p>
            <p className="text-xs text-[#A8A29E] mt-1">
              Chọn đề từ danh sách bên dưới hoặc đẩy file Word/PDF lên.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedExams.map((exam) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{
                        backgroundColor: TEACHER.tint,
                        color: TEACHER.main,
                        borderColor: TEACHER.border,
                      }}
                    >
                      Đang mở
                    </span>
                    <span className="text-[11px] text-[#A8A29E] font-mono truncate">
                      ID: {exam.id}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0F172A] line-clamp-1">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-[#78716C] line-clamp-1 mt-0.5">
                    {exam.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#57534E] mt-2 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                      {exam.durationMinutes} phút
                    </span>
                    <span>•</span>
                    <span className="font-semibold">{exam.questions.length} câu hỏi</span>
                    <span>•</span>
                    <span className="font-bold" style={{ color: TEACHER.main }}>
                      Thang điểm 10
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onExportExamPdf(exam)}
                    className="p-2 rounded-xl bg-white border border-[#E7E5E4] text-[#57534E] hover:text-[#78350F] hover:bg-[#FEF3C7]/60 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                    title="In đề khổ A4"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">In A4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onShuffleExam(exam)}
                    className="p-2 rounded-xl bg-white border border-[#E7E5E4] text-[#57534E] hover:text-[#78350F] hover:bg-[#FEF3C7]/60 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                    title="Hoán vị câu hỏi chống gian lận"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hoán vị</span>
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => onStartExam(exam)}
                    className="px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: TEACHER.main }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Làm thử</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Assign more from bank */}
      {availableExams.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm">
          <h3 className="font-bold text-sm text-[#0F172A] mb-3">
            Chọn Thêm Đề Từ Ngân Hàng ({availableExams.length} khả dụng)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableExams.map((exam) => (
              <motion.div
                key={exam.id}
                whileHover={{ y: -1 }}
                className="p-4 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#FDE68A] transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#0F172A] line-clamp-1">
                    {exam.title}
                  </h4>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    {exam.durationMinutes} phút • {exam.questions.length} câu
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleAssignExamToClass(exam)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 border"
                  style={{
                    backgroundColor: TEACHER.tint,
                    color: TEACHER.main,
                    borderColor: TEACHER.border,
                  }}
                >
                  <Send className="w-3 h-3" />
                  <span>Giao ngay</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};