/**
 * ============================================================================
 * FILE: TeacherExamAssignment.tsx — Vantrix AI
 * PHÂN HỆ: GIẢNG VIÊN & GIÁO VIÊN (TEACHER)
 * ĐƯỜNG DẪN: /src/components/teacher/TeacherExamAssignment.tsx
 * CHỨC NĂNG:
 *  - Giao đề thi cho lớp với thiết lập hạn nộp tùy chỉnh & thông báo tự động
 *  - Hủy giao đề thi / Thu hồi đề linh hoạt khỏi lớp
 *  - Tìm kiếm & Lọc đề thi khả dụng theo môn học / chuyên đề
 *  - Xuất PDF khổ A4 chuẩn Bộ GD&ĐT
 *  - Hoán vị câu hỏi chống gian lận
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
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
  Search,
  X,
  Trash2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TEACHER = {
  main: '#B45309',
  hover: '#92400E',
  tint: '#FEF3C7',
  border: '#FDE68A',
  deep: '#78350F',
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
  onAssignExam?: (classId: string, examId: string) => void;
  onUnassignExam?: (classId: string, examId: string) => void;
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
  onUnassignExam,
}) => {
  const { notifyTeacherAssignment } = useNotifications();
  const [assignedFeedback, setAssignedFeedback] = useState<string | null>(null);

  // Search & filter states
  const [assignedSearch, setAssignedSearch] = useState('');
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Custom deadline modal
  const [pendingAssignExam, setPendingAssignExam] = useState<Exam | null>(null);
  const [customDeadline, setCustomDeadline] = useState('23:59 Chủ Nhật tuần này');

  // Confirm unassign modal
  const [pendingUnassignExam, setPendingUnassignExam] = useState<Exam | null>(null);

  const selectedClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  // Assigned exams
  const assignedExams = useMemo(() => {
    const list = exams.filter((e) => selectedClass?.assignedExamIds?.includes(e.id));
    if (!assignedSearch.trim()) return list;
    const q = assignedSearch.toLowerCase().trim();
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
    );
  }, [exams, selectedClass?.assignedExamIds, assignedSearch]);

  // Available bank exams
  const rawAvailableExams = useMemo(() => {
    return exams.filter((e) => !selectedClass?.assignedExamIds?.includes(e.id));
  }, [exams, selectedClass?.assignedExamIds]);

  // Available subjects for filtering
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    rawAvailableExams.forEach((e) => {
      if (e.subject) subjects.add(e.subject);
      else if (e.tag) subjects.add(e.tag);
    });
    return Array.from(subjects);
  }, [rawAvailableExams]);

  const filteredAvailableExams = useMemo(() => {
    return rawAvailableExams.filter((e) => {
      const matchSearch =
        !availableSearch.trim() ||
        e.title.toLowerCase().includes(availableSearch.toLowerCase().trim()) ||
        e.description.toLowerCase().includes(availableSearch.toLowerCase().trim()) ||
        e.id.toLowerCase().includes(availableSearch.toLowerCase().trim());
      const matchSubject =
        selectedSubjectFilter === 'all' ||
        e.subject === selectedSubjectFilter ||
        e.tag === selectedSubjectFilter;
      return matchSearch && matchSubject;
    });
  }, [rawAvailableExams, availableSearch, selectedSubjectFilter]);

  // Assign exam handler
  const handleConfirmAssign = (exam: Exam, deadline: string) => {
    if (!selectedClass) return;

    if (onAssignExam) {
      onAssignExam(selectedClass.id, exam.id);
    } else if (!selectedClass.assignedExamIds.includes(exam.id)) {
      selectedClass.assignedExamIds.unshift(exam.id);
    }

    notifyTeacherAssignment({
      teacherName: 'Thầy Nguyễn Văn Trí',
      examTitle: exam.title,
      examId: exam.id,
      className: selectedClass.name,
      deadline: deadline || '23:59 Chủ Nhật tuần này',
    });

    setAssignedFeedback(
      `Đã giao thành công "${exam.title}" cho lớp ${selectedClass.name} (Hạn nộp: ${deadline})!`
    );
    setPendingAssignExam(null);
    setTimeout(() => setAssignedFeedback(null), 4000);
  };

  // Unassign exam handler
  const handleConfirmUnassign = (exam: Exam) => {
    if (!selectedClass) return;

    if (onUnassignExam) {
      onUnassignExam(selectedClass.id, exam.id);
    } else {
      selectedClass.assignedExamIds = selectedClass.assignedExamIds.filter((id) => id !== exam.id);
    }

    setAssignedFeedback(
      `Đã thu hồi bài thi "${exam.title}" khỏi lớp ${selectedClass.name}.`
    );
    setPendingUnassignExam(null);
    setTimeout(() => setAssignedFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E5E4] shadow-sm">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#0F172A] flex items-center gap-2">
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
            whileHover={{ scale: 1.02 }}
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

      {/* Assigned exams section */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#0F172A]">
              Đề Thi Đang Mở Cho Lớp ({assignedExams.length} Đề)
            </h3>
            <p className="text-xs text-[#78716C] font-normal mt-0.5">
              Học sinh có thể truy cập làm bài ngay trên cổng học sinh
            </p>
          </div>

          {/* Assigned exam search filter */}
          {selectedClass?.assignedExamIds?.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                placeholder="Tìm trong đề đã giao..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 transition-all"
                style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
              />
              {assignedSearch && (
                <button
                  type="button"
                  onClick={() => setAssignedSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#57534E]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {assignedExams.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#E7E5E4] rounded-2xl bg-[#FAFAF9]">
            <BookOpen className="w-10 h-10 mx-auto text-[#D6D3D1] mb-2" />
            <p className="text-sm font-serif font-bold text-[#0F172A]">
              {assignedSearch
                ? `Không tìm thấy đề đã giao phù hợp với "${assignedSearch}"`
                : 'Chưa có đề thi nào được giao cho lớp này'}
            </p>
            <p className="text-xs text-[#A8A29E] mt-1 font-sans">
              {assignedSearch
                ? 'Thử xóa từ khóa tìm kiếm hoặc chọn đề khác.'
                : 'Chọn đề từ danh sách bên dưới hoặc đẩy file Word/PDF lên.'}
            </p>
            {assignedSearch && (
              <button
                type="button"
                onClick={() => setAssignedSearch('')}
                className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
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
                  <h4 className="font-serif font-bold text-sm text-[#0F172A] line-clamp-1">
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

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onExportExamPdf(exam)}
                    className="p-2 rounded-xl bg-white border border-[#E7E5E4] text-[#57534E] hover:text-[#78350F] hover:bg-[#FEF3C7]/60 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                    title="In đề khổ A4 chuẩn Bộ GD&ĐT"
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

                  <button
                    type="button"
                    onClick={() => setPendingUnassignExam(exam)}
                    className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                    title="Thu hồi đề thi khỏi lớp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Thu hồi</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Available bank exams section */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-[#0F172A]">
              Chọn Thêm Đề Từ Ngân Hàng ({filteredAvailableExams.length} khả dụng)
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Giao ngay cho lớp kèm thiết lập thời hạn nộp bài
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              type="text"
              value={availableSearch}
              onChange={(e) => setAvailableSearch(e.target.value)}
              placeholder="Tìm theo tên đề, môn học..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 transition-all"
              style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
            />
            {availableSearch && (
              <button
                type="button"
                onClick={() => setAvailableSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#57534E]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Quick subject filter chips */}
        {availableSubjects.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#78716C] mr-1">Bộ lọc môn:</span>
            <button
              type="button"
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedSubjectFilter === 'all'
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tất cả
            </button>
            {availableSubjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubjectFilter(sub)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedSubjectFilter === sub
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {filteredAvailableExams.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-[#E7E5E4] rounded-2xl bg-[#FAFAF9]">
            <HelpCircle className="w-8 h-8 mx-auto text-[#D6D3D1] mb-1.5" />
            <p className="text-xs font-bold text-[#0F172A]">
              Không có đề thi nào phù hợp với bộ lọc hiện tại
            </p>
            <p className="text-[11px] text-[#A8A29E] mt-0.5">
              Thử xóa tìm kiếm hoặc tải lên đề mới từ file Word/PDF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAvailableExams.map((exam) => (
              <motion.div
                key={exam.id}
                whileHover={{ y: -1 }}
                className="p-4 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#FDE68A] hover:shadow-xs transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {exam.subject && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {exam.subject}
                      </span>
                    )}
                    <span className="text-[10px] text-[#A8A29E] font-mono">
                      {exam.durationMinutes} phút • {exam.questions.length} câu
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-xs text-[#0F172A] line-clamp-1">
                    {exam.title}
                  </h4>
                  <p className="text-[11px] text-[#78716C] line-clamp-1 mt-0.5">
                    {exam.description || 'Đề khảo thí chuẩn cấu trúc Bộ GD&ĐT'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartExam(exam)}
                    className="p-1.5 rounded-lg border border-[#E7E5E4] text-[#78716C] hover:text-[#0F172A] hover:bg-[#FAFAF9] transition-colors"
                    title="Xem trước đề thi"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setPendingAssignExam(exam)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 border"
                    style={{
                      backgroundColor: TEACHER.tint,
                      color: TEACHER.main,
                      borderColor: TEACHER.border,
                    }}
                  >
                    <Send className="w-3 h-3" />
                    <span>Giao đề</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Thiết lập thời hạn nộp bài khi giao đề */}
      <AnimatePresence>
        {pendingAssignExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900">
                      Giao Đề Cho Lớp {selectedClass?.name}
                    </h3>
                    <p className="text-[11px] text-stone-500">Thiết lập thời hạn làm bài</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingAssignExam(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200">
                <p className="text-xs font-serif font-bold text-stone-900">
                  {pendingAssignExam.title}
                </p>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Thời gian: {pendingAssignExam.durationMinutes} phút • {pendingAssignExam.questions.length} câu hỏi
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Thời hạn nộp bài:
                </label>
                <input
                  type="text"
                  value={customDeadline}
                  onChange={(e) => setCustomDeadline(e.target.value)}
                  placeholder="Ví dụ: 23:59 Chủ Nhật tuần này"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {['23:59 Hôm nay', '23:59 Chủ Nhật tuần này', 'Sau 7 ngày', 'Không giới hạn'].map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCustomDeadline(preset)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setPendingAssignExam(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmAssign(pendingAssignExam, customDeadline)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all"
                  style={{ backgroundColor: TEACHER.main }}
                >
                  Xác nhận giao đề
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Xác nhận thu hồi / hủy giao đề */}
      <AnimatePresence>
        {pendingUnassignExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900">
                    Thu Hồi Đề Thi
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Hủy giao đề cho lớp {selectedClass?.name}
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Bạn có chắc chắn muốn thu hồi bài thi{' '}
                <strong className="text-stone-900 font-serif">"{pendingUnassignExam.title}"</strong>{' '}
                khỏi lớp? Học sinh sẽ không thể tiếp tục làm đề này.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingUnassignExam(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmUnassign(pendingUnassignExam)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
                >
                  Xác nhận thu hồi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};