/**
 * ============================================================================
 * FILE: StudentClassrooms.tsx — Vantrix AI
 * PHÂN HỆ: HỌC SINH & SINH VIÊN (STUDENT)
 * ĐƯỜNG DẪN: /src/components/student/StudentClassrooms.tsx
 * CHỨC NĂNG:
 *  - Xem lớp học đã tham gia (GV phụ trách, sĩ số, mã mời)
 *  - Nhập mã mời để tham gia lớp mới với xác thực tức thì
 *  - Danh sách bài tập / đề khảo thí GV giao kèm trạng thái Đã nộp / Chưa nộp
 *  - Bắt đầu làm bài 1-click & kiểm tra điểm số bài thi đã làm trong lớp
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Classroom, Exam, StudentSubmission } from '../../types/quiz';
import {
  Users,
  School,
  Plus,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Award,
  RotateCcw,
  Search,
  Copy,
  Check,
} from 'lucide-react';

const BRAND = '#0D5C75';
const BRAND_HOVER = '#084356';

export interface StudentClassroomsProps {
  classrooms: Classroom[];
  exams: Exam[];
  submissions: StudentSubmission[];
  onJoinClassroom: (code: string) => { success: boolean; message: string };
  onStartExam: (exam: Exam, classId?: string) => void;
  currentUserEmail?: string;
  currentUserName?: string;
}

export const StudentClassrooms: React.FC<StudentClassroomsProps> = ({
  classrooms,
  exams,
  submissions = [],
  onJoinClassroom,
  onStartExam,
  currentUserEmail = 'vantritran518@gmail.com',
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [joinStatus, setJoinStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const joinedClasses = classrooms.filter((c) =>
    c.students.some((s) => s.email.toLowerCase() === currentUserEmail.toLowerCase())
  );

  const activeClass = classrooms.find((c) => c.id === selectedClassId) || joinedClasses[0] || classrooms[0];

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = onJoinClassroom(joinCode.trim());
    setJoinStatus(res);
    if (res.success) {
      setJoinCode('');
      // Tự động chuyển tới lớp vừa tham gia
      const matched = classrooms.find((c) => c.code.toUpperCase() === joinCode.trim().toUpperCase());
      if (matched) setSelectedClassId(matched.id);
    }
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const rawAssignedExams = exams.filter(
    (e) => activeClass?.assignedExamIds.includes(e.id) || e.classId === activeClass?.id
  );

  const assignedExams = rawAssignedExams.filter((e) => {
    const q = examSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return e.title.toLowerCase().includes(q) || e.subjectLabel.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 shadow-lg border border-teal-900/40"
        style={{
          backgroundImage: `linear-gradient(135deg, #042F2E 0%, #0F172A 55%, ${BRAND} 100%)`,
        }}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-bold text-teal-200 font-sans">
            <School className="w-3.5 h-3.5" />
            <span>Không Gian Lớp Học Trực Tuyến Của Học Sinh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight leading-tight">
            Lớp Học Của Tôi & Bài Tập Thầy Cô Giao
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-sans">
            Tham gia lớp học của giáo viên bằng mã lớp, theo dõi lịch thi thử, nộp bài đúng hạn
            và xem kết quả điểm số thi đua cùng các bạn trong lớp.
          </p>
        </div>
      </motion.div>

      {/* Join + Class list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Join card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className="lg:col-span-1 bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#F5F5F4]">
            <Plus className="w-5 h-5" style={{ color: BRAND }} />
            <h3 className="font-serif font-bold text-sm text-[#0F172A]">Tham Gia Lớp Học Mới</h3>
          </div>
          <p className="text-xs text-[#78716C] font-sans">
            Nhập mã mời do thầy cô cung cấp (ví dụ:{' '}
            <code
              className="px-1.5 py-0.5 rounded font-mono font-bold bg-[#E6F2F5] text-[#0D5C75]"
            >
              TOAN12
            </code>{' '}
            hoặc{' '}
            <code
              className="px-1.5 py-0.5 rounded font-mono font-bold bg-[#E6F2F5] text-[#0D5C75]"
            >
              DGNL25
            </code>
            ):
          </p>
          <form onSubmit={handleJoinSubmit} className="space-y-3 font-sans">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="NHẬP MÃ LỚP..."
              className="w-full text-center tracking-widest uppercase font-mono text-base font-bold p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
              maxLength={12}
            />
            <AnimatePresence>
              {joinStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
                    joinStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {joinStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{joinStatus.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
            >
              <Users className="w-4 h-4" />
              <span>Gia Nhập Lớp Học Ngay</span>
            </motion.button>
          </form>
        </motion.div>

        {/* Class selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
          className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-4 font-sans"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F5F5F4]">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5" style={{ color: BRAND }} />
              <h3 className="font-serif font-bold text-sm text-[#0F172A]">
                Các Lớp Học Đang Tham Gia ({joinedClasses.length})
              </h3>
            </div>
            <span className="text-xs text-[#A8A29E] font-sans">Chọn lớp để xem bài tập</span>
          </div>

          {joinedClasses.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <School className="w-10 h-10 mx-auto text-[#D6D3D1]" />
              <p className="text-xs text-[#A8A29E]">
                Bạn chưa tham gia lớp học nào. Hãy nhập mã mời ở bên trái để vào lớp ngay!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {joinedClasses.map((cls) => {
                const isSelected = cls.id === (activeClass?.id || '');
                return (
                  <motion.div
                    key={cls.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E6F2F5] shadow-sm'
                        : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1] hover:bg-[#FAFAF9]'
                    }`}
                    style={
                      isSelected
                        ? { borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded font-mono"
                            style={{ backgroundColor: '#E6F2F5', color: BRAND }}
                          >
                            Mã: {cls.code}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(cls.code);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
                            title="Sao chép mã lớp"
                          >
                            {copiedCode === cls.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#0F172A] line-clamp-1">
                          {cls.name}
                        </h4>
                        <p className="text-xs text-[#78716C]">GV: {cls.teacherName}</p>
                      </div>
                      <span className="text-xs font-bold text-[#57534E] bg-white px-2 py-1 rounded-lg border border-[#E7E5E4] shrink-0 font-mono">
                        {cls.students.length} bạn
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Assigned exams */}
      {activeClass && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
          className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-5 font-sans"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5F5F4]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#0F172A]">
                  Bài Tập & Đề Khảo Thí: {activeClass.name}
                </h3>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5 font-sans">
                Giáo viên phụ trách: <strong>{activeClass.teacherName}</strong> • Mã lớp:{' '}
                <strong className="font-mono text-[#0D5C75]">{activeClass.code}</strong>
              </p>
            </div>

            {/* Filter Search within Class Exams */}
            <div className="flex items-center gap-3">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={examSearchQuery}
                  onChange={(e) => setExamSearchQuery(e.target.value)}
                  placeholder="Lọc bài tập theo tên..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] font-sans"
                />
              </div>
              <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F5F5F4] text-[#57534E] shrink-0 font-mono">
                {assignedExams.length} đề thi
              </div>
            </div>
          </div>

          {assignedExams.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-[#D6D3D1]" />
              <p className="text-xs text-[#A8A29E]">
                {examSearchQuery ? 'Không tìm thấy bài tập phù hợp với từ khóa.' : 'Hiện tại thầy cô chưa giao bài tập mới cho lớp này.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
              {assignedExams.map((exam) => {
                // HỒI SINH TÍNH NĂNG: Tra cứu bài nộp của học sinh trong lớp này
                const submission = submissions.find(
                  (s) => s.examId === exam.id && (s.classId === activeClass.id || !s.classId)
                );
                const isSubmitted = !!submission;

                return (
                  <motion.div
                    key={exam.id}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] hover:bg-white transition-all flex flex-col justify-between space-y-4 hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded font-sans"
                          style={{ backgroundColor: '#E6F2F5', color: BRAND }}
                        >
                          {exam.subjectLabel}
                        </span>

                        {isSubmitted ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã nộp: {submission.score?.toFixed(1) ?? '10.0'}/10</span>
                          </span>
                        ) : (
                          <span className="text-xs text-[#78716C] flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                            <span>{exam.durationMinutes} phút</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#0F172A] leading-snug line-clamp-2">
                        {exam.title}
                      </h4>
                      <p className="text-xs text-[#78716C] line-clamp-2 font-sans">{exam.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E7E5E4]/60">
                      <span className="text-[11px] text-[#78716C] font-mono">
                        {exam.totalQuestions} câu hỏi trắc nghiệm
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => onStartExam(exam, activeClass.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
                          isSubmitted ? 'bg-slate-800 hover:bg-slate-900' : ''
                        }`}
                        style={!isSubmitted ? { backgroundColor: BRAND } : undefined}
                      >
                        {isSubmitted ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Làm Lại Đề Này</span>
                          </>
                        ) : (
                          <>
                            <span>Vào Làm Bài Ngay</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};