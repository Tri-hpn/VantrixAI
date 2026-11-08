/**
 * ============================================================================
 * FILE: StudentExamLibrary & Khảo Thí Phòng Thi — Vantrix AI
 * PHÂN HỆ: HỌC SINH & SINH VIÊN (STUDENT)
 * ĐƯỜNG DẪN: /src/components/student/StudentExamLibrary.tsx
 * CHỨC NĂNG:
 *  1. StudentExamLibrary — Thư viện đề 4 cấp học + role-aware hero banner
 *  2. StudentExamRunner — Phòng thi trực tuyến, Native Focus Mode, phím tắt (A-D, 1-4, Arrows, F)
 *  3. StudentResultView — Báo cáo điểm, phổ điểm chuẩn hóa & phân tích lỗ hổng kiến thức
 *  4. StudentQuestionMatrix / StudentSubmitModal — Ma trận câu & hộp nộp bài
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  Exam,
  UserRole,
  MistakeItem,
  OptionId,
  Question,
} from '../../types/quiz';
import {
  formatTimer,
  isUrgentTimer,
  computeExamSummary,
  formatScoreDisplay,
  getQuestionStatus,
  computeDifficultyBreakdown,
  matchExamDifficultyFilter,
  computeExamAverageDifficulty,
  ExamDifficultyFilter,
  DifficultyBreakdown,
  AverageDifficultyInfo,
} from '../../utils/quiz-logic';
import { MathText } from '../common/MathText';
import { StudentDailyReviewWidget } from './StudentStatsView';
import {
  BookOpen,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Printer,
  Shuffle,
  Users,
  Layers,
  School,
  Flag,
  AlertTriangle,
  X,
  Maximize2,
  Minimize2,
  LayoutGrid,
  BarChart,
  RotateCcw,
  PieChart,
  Compass,
  ShieldCheck,
  Check,
  HelpCircle,
  Zap,
} from 'lucide-react';

const BRAND = '#0D5C75';
const BRAND_HOVER = '#084356';

/* ============================================================================
 * 0. ExamDifficultyPieChart — Donut phân bổ độ khó
 * ============================================================================ */
export interface ExamDifficultyPieChartProps {
  breakdown: DifficultyBreakdown;
  avgDifficulty?: AverageDifficultyInfo;
  size?: number;
}

export const ExamDifficultyPieChart: React.FC<ExamDifficultyPieChartProps> = ({
  breakdown,
  avgDifficulty,
  size = 52,
}) => {
  const { easyPct, mediumPct, hardPct, easyCount, mediumCount, hardCount, total } = breakdown;
  const r = 15.9155;
  const cx = 18;
  const cy = 18;
  const offsetEasy = 25;
  const offsetMedium = (25 - easyPct + 100) % 100;
  const offsetHard = (25 - easyPct - mediumPct + 200) % 100;

  const dominantLabel =
    breakdown.dominantLevel === 'easy'
      ? '🟢 Nhiều câu Dễ'
      : breakdown.dominantLevel === 'hard'
      ? '🔴 Phân hóa Cao'
      : breakdown.dominantLevel === 'balanced'
      ? '⚖️ Cân bằng'
      : '🟡 Mức Tiêu chuẩn';

  return (
    <div className="bg-[#FAFAF9] rounded-xl p-3 border border-[#E7E5E4] flex flex-col gap-2.5 font-sans">
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#57534E]">
        <span className="flex items-center gap-1.5 text-[#0F172A]">
          <PieChart className="w-3.5 h-3.5 text-[#0D5C75]" />
          <span>Biểu đồ độ khó ({total} câu)</span>
        </span>
        {avgDifficulty ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-[#E7E5E4] text-[#57534E] shadow-sm">
            {avgDifficulty.tier === 'Easy' && '🟢 ĐTB: Easy'}
            {avgDifficulty.tier === 'Medium' && '🟡 ĐTB: Medium'}
            {avgDifficulty.tier === 'Hard' && '🔴 ĐTB: Hard'}{' '}
            ({avgDifficulty.score.toFixed(1)}/3)
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-[#E7E5E4] text-[#57534E] shadow-sm">
            {dominantLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: size, height: size }}
          title={`Dễ ${easyPct}% (${easyCount}) • TB ${mediumPct}% (${mediumCount}) • Khó ${hardPct}% (${hardCount})`}
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="#E7E5E4" strokeWidth="4.5" />
            {easyPct > 0 && (
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="transparent"
                stroke="#10B981"
                strokeWidth="4.5"
                strokeDasharray={`${easyPct} ${100 - easyPct}`}
                strokeDashoffset={offsetEasy}
              />
            )}
            {mediumPct > 0 && (
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="4.5"
                strokeDasharray={`${mediumPct} ${100 - mediumPct}`}
                strokeDashoffset={offsetMedium}
              />
            )}
            {hardPct > 0 && (
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="transparent"
                stroke="#EF4444"
                strokeWidth="4.5"
                strokeDasharray={`${hardPct} ${100 - hardPct}`}
                strokeDashoffset={offsetHard}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-extrabold text-[#0F172A] leading-none">
              {breakdown.dominantLevel === 'hard'
                ? `${hardPct}%`
                : breakdown.dominantLevel === 'easy'
                ? `${easyPct}%`
                : `${mediumPct}%`}
            </span>
            <span className="text-[7.5px] font-semibold text-[#A8A29E] uppercase tracking-tighter mt-0.5">
              {breakdown.dominantLevel === 'hard'
                ? 'Khó'
                : breakdown.dominantLevel === 'easy'
                ? 'Dễ'
                : 'TB'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 flex-1">
          <div className="bg-emerald-50 border border-emerald-200/70 rounded-lg py-1 px-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Dễ</span>
            </div>
            <div className="text-xs font-bold text-emerald-950 mt-0.5">
              {easyCount}{' '}
              <span className="text-[9px] font-normal text-emerald-700">({easyPct}%)</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200/70 rounded-lg py-1 px-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>TB</span>
            </div>
            <div className="text-xs font-bold text-amber-950 mt-0.5">
              {mediumCount}{' '}
              <span className="text-[9px] font-normal text-amber-700">({mediumPct}%)</span>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-200/70 rounded-lg py-1 px-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-rose-800">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Khó</span>
            </div>
            <div className="text-xs font-bold text-rose-950 mt-0.5">
              {hardCount}{' '}
              <span className="text-[9px] font-normal text-rose-700">({hardPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[#E7E5E4] overflow-hidden flex">
        <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 h-full" />
        <div style={{ width: `${mediumPct}%` }} className="bg-amber-500 h-full" />
        <div style={{ width: `${hardPct}%` }} className="bg-rose-500 h-full" />
      </div>
    </div>
  );
};

/* ============================================================================
 * 0.1 AverageDifficultyPill
 * ============================================================================ */
export interface AverageDifficultyPillProps {
  info: AverageDifficultyInfo;
}

export const AverageDifficultyPill: React.FC<AverageDifficultyPillProps> = ({ info }) => (
  <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shadow-sm font-sans ${info.badgeColorClass}`}
    title={`Độ khó trung bình: ${info.tier} (${info.labelVi}) • ${info.score.toFixed(1)}/3.0`}
  >
    {info.tier === 'Easy' && <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />}
    {info.tier === 'Medium' && <BarChart className="w-3 h-3 text-amber-600 shrink-0" />}
    {info.tier === 'Hard' && <Flame className="w-3 h-3 text-rose-600 fill-rose-500/30 shrink-0" />}
    <span>{info.tier}</span>
    <span className="text-[9px] font-normal opacity-85">({info.score.toFixed(1)})</span>
  </span>
);

/* ============================================================================
 * 1. StudentExamLibrary — Thư viện đề
 * ============================================================================ */
export interface StudentExamLibraryProps {
  exams: Exam[];
  onStartExam: (exam: Exam) => void;
  onOpenGenerator: () => void;
  onOpenMistakes: () => void;
  /** @deprecated — Nút upload đã được tích hợp trong Lộ trình cá nhân */
  onOpenUpload?: () => void;
  onOpenClasses: () => void;
  onExportExamPdf: (exam: Exam) => void;
  onShuffleExam: (exam: Exam) => void;
  mistakeCount: number;
  currentRole: UserRole;
  mistakes?: MistakeItem[];
  onStartQuickReview?: () => void;
  onOpenRoadmap?: () => void;
  onOpenAdmin?: () => void;
  onOpenStats?: () => void;
}

export const StudentExamLibrary: React.FC<StudentExamLibraryProps> = ({
  exams,
  onStartExam,
  onOpenGenerator,
  onOpenMistakes,
  onOpenClasses,
  onExportExamPdf,
  onShuffleExam,
  mistakeCount,
  currentRole,
  mistakes = [],
  onStartQuickReview,
  onOpenRoadmap,
  onOpenAdmin,
  onOpenStats,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Auto-dismiss action toast after 2.5s
  useEffect(() => {
    if (!actionNotice) return;
    const t = setTimeout(() => setActionNotice(null), 2500);
    return () => clearTimeout(t);
  }, [actionNotice]);

  const handlePdfClick = (exam: Exam) => {
    onExportExamPdf(exam);
    setActionNotice(`Đang kết xuất bản in A4 cho đề: "${exam.title}"`);
  };

  const handleShuffleClick = (exam: Exam) => {
    onShuffleExam(exam);
    setActionNotice(`Đã xáo trộn ngẫu nhiên thứ tự câu hỏi và đáp án cho "${exam.title}"`);
  };

  const educationLevels = [
    { id: 'all', label: 'Tất cả cấp học', icon: '📚' },
    { id: 'tieuhoc', label: 'Cấp 1 — Tiểu học (Lớp 1–5)', icon: '🎒' },
    { id: 'thcs', label: 'Cấp 2 — THCS (Lớp 6–9)', icon: '📘' },
    { id: 'thpt', label: 'Cấp 3 — THPT (Lớp 10–12)', icon: '🎓' },
    { id: 'daihoc', label: 'Đại học & Chứng chỉ (ĐHQG, IELTS)', icon: '🏛️' },
    { id: 'custom', label: 'Đề tự tải lên', icon: '📂' },
  ];

  const subjects = [
    { id: 'all', label: 'Tất cả môn' },
    { id: 'toan', label: 'Toán học' },
    { id: 'ly', label: 'Vật lý' },
    { id: 'dgnl', label: 'ĐGNL ĐHQG' },
    { id: 'ielts', label: 'IELTS Academic' },
    { id: 'tiengviet', label: 'Tiếng Việt' },
    { id: 'laptrinh', label: 'Lập trình' },
  ];

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
      const matchLevel =
        selectedLevel === 'all'
          ? true
          : selectedLevel === 'custom'
          ? exam.tag === 'Đề Tải Lên' || exam.tag === 'Đề Tự Tải Lên'
          : exam.educationLevel === selectedLevel;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        exam.title.toLowerCase().includes(q) ||
        exam.subtitle.toLowerCase().includes(q) ||
        exam.subjectLabel.toLowerCase().includes(q);

      const breakdown = computeDifficultyBreakdown(
        exam.questions,
        exam.difficultyLabel,
        exam.totalQuestions
      );
      const matchDifficulty = matchExamDifficultyFilter(
        breakdown,
        exam.difficultyLabel,
        selectedDifficulty
      );

      return matchSubject && matchLevel && matchSearch && matchDifficulty;
    });
  }, [exams, selectedSubject, selectedLevel, searchQuery, selectedDifficulty]);

  const hasActiveFilters =
    selectedSubject !== 'all' ||
    selectedLevel !== 'all' ||
    selectedDifficulty !== 'all' ||
    searchQuery.trim().length > 0;

  const resetAllFilters = () => {
    setSelectedSubject('all');
    setSelectedLevel('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-medium">{actionNotice}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher Hero */}
      {currentRole === 'teacher' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-[#0F172A] to-[#78350F] text-white p-6 sm:p-10 shadow-lg border border-amber-500/20"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-300 font-sans">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Teacher Workspace • Vantrix AI</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight leading-tight">
              Tổ Chức Kỳ Thi & Quản Lý Lớp Học Thông Minh
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
              Soạn đề bằng AI Gemini 2.5, phân bổ ma trận độ khó chuẩn hóa và giao bài tập theo lớp có
              bấm giờ thực chiến.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenGenerator}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Soạn đề AI tự động</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenClasses}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-200" />
                <span>Quản lý Lớp & Giao đề</span>
              </motion.button>
              {onOpenStats && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onOpenStats}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BarChart className="w-4 h-4 text-amber-300" />
                  <span>Phổ điểm & Thống kê</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Admin Hero */}
      {currentRole === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-purple-950 to-[#0F172A] text-white p-6 sm:p-10 shadow-lg border border-purple-500/20"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/25 border border-purple-400/40 text-xs font-bold text-purple-300 font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator Console • Vantrix AI</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight leading-tight">
              Quản Trị Toàn Diện Hệ Thống Khảo Thí
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed font-sans">
              Giám sát tài khoản giáo viên, học sinh, kiểm duyệt ngân hàng đề thi đa cấp học và
              cấu hình công nghệ AI.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onOpenAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onOpenAdmin}
                  className="px-4 py-2.5 rounded-xl bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Quản trị Người dùng & Cấu hình</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenGenerator}
                className="px-4 py-2.5 rounded-xl bg-purple-900/70 hover:bg-purple-800 border border-purple-400/40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Soạn đề chuẩn AI</span>
              </motion.button>
              {onOpenStats && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onOpenStats}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BarChart className="w-4 h-4 text-amber-300" />
                  <span>Báo cáo khảo thí toàn trường</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Student Hero */}
      {currentRole === 'student' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042F2E] via-[#0F172A] to-[#0D5C75] text-white p-6 sm:p-10 shadow-lg border border-teal-500/20"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-bold text-teal-200 font-sans">
              <School className="w-3.5 h-3.5 text-teal-300" />
              <span>Không Gian Luyện Thi Vantrix AI • Học Tập Thích Ứng</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight leading-tight">
              Chinh Phục Kỳ Thi Với Trợ Lý Khảo Thí AI Đa Cấp Học
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-sans">
              Luyện đề chuẩn ma trận Bộ GD&ĐT từ Cấp 1 → Đại học. Tự động chẩn đoán bẫy câu hỏi,
              ghi nhận sổ tay lỗi sai và theo dõi lộ trình bứt phá điểm số cá nhân hóa.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onOpenRoadmap && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onOpenRoadmap}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Compass className="w-4 h-4 text-amber-200" />
                  <span>Lộ trình cá nhân & Tải đề</span>
                </motion.button>
              )}
              {filteredExams[0] && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => onStartExam(filteredExams[0])}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#0F172A] hover:bg-teal-50 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#0D5C75]" />
                  <span>Làm thử đề thi ngay</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenClasses}
                className="px-4 py-2.5 rounded-xl bg-teal-900/60 hover:bg-teal-900 border border-teal-500/40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-teal-300" />
                <span>Tham gia lớp học</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenMistakes}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4 text-amber-300" />
                <span>Sổ tay lỗi sai ({mistakeCount})</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Daily Review Widget */}
      {currentRole === 'student' && mistakes.length > 0 && onStartQuickReview && (
        <StudentDailyReviewWidget
          mistakes={mistakes}
          onStartQuickReview={onStartQuickReview}
          onOpenMistakeNotebook={onOpenMistakes}
        />
      )}

      {/* Education Level Selector */}
      <div className="space-y-3 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F172A]">
          <Layers className="w-4 h-4 text-[#0D5C75]" />
          <span>Chọn Phân Hệ Cấp Học:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {educationLevels.map((lvl) => (
            <motion.button
              key={lvl.id}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setSelectedLevel(lvl.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedLevel === lvl.id
                  ? 'text-white shadow-md'
                  : 'bg-white text-[#57534E] border border-[#E7E5E4] hover:bg-[#FAFAF9]'
              }`}
              style={
                selectedLevel === lvl.id
                  ? { backgroundColor: BRAND }
                  : undefined
              }
            >
              <span>{lvl.icon}</span>
              <span>{lvl.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar: Search, Subjects & Difficulty */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-3 font-sans">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {subjects.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSubject(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSubject === s.id
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#57534E] hover:bg-[#F5F5F4]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Box with Real Quick Clear Button */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm đề thi, chuyên đề, năm thi..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Difficulty Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-[#F5F5F4]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#57534E] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#0D5C75]" />
              <span>Độ khó:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Tất cả mức độ' },
                { id: 'easy', label: '🟢 Nhiều câu Dễ (≥ 35%)' },
                { id: 'medium', label: '🟡 Trung bình (≥ 35%)' },
                { id: 'hard', label: '🔴 Nâng cao (≥ 25%)' },
                { id: 'balanced', label: '⚖️ Cân bằng 3 mức' },
              ].map((df) => (
                <button
                  key={df.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(df.id as ExamDifficultyFilter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedDifficulty === df.id
                      ? 'text-white font-bold shadow-md'
                      : 'bg-[#FAFAF9] text-[#57534E] hover:bg-[#F5F5F4] border border-[#E7E5E4]'
                  }`}
                  style={
                    selectedDifficulty === df.id
                      ? { backgroundColor: BRAND }
                      : undefined
                  }
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#78716C] font-medium flex items-center gap-1.5">
            <span>Tìm thấy</span>
            <span className="font-bold text-[#0D5C75]">{filteredExams.length}</span>
            <span>bộ đề phù hợp</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[11px] text-[#A8A29E] hover:text-[#0D5C75] font-semibold underline ml-1 cursor-pointer transition-colors"
              >
                Đặt lại tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exam Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center space-y-3 font-sans">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-serif font-bold text-[#0F172A]">
            Không tìm thấy bộ đề phù hợp
          </h3>
          <p className="text-xs text-[#78716C] max-w-md mx-auto">
            Thử đổi từ khóa tìm kiếm, lọc độ khó khác, hoặc nhấn đặt lại để hiển thị đầy đủ ngân hàng đề thi.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95 shadow-md cursor-pointer inline-flex items-center gap-1.5"
            style={{ backgroundColor: BRAND }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xem tất cả bộ đề</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {filteredExams.map((exam, index) => {
            const breakdown = computeDifficultyBreakdown(
              exam.questions,
              exam.difficultyLabel,
              exam.totalQuestions
            );
            const avgDifficulty = computeExamAverageDifficulty(exam);

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: Math.min(index * 0.04, 0.24),
                  ease: 'easeOut',
                }}
                whileHover={{ y: -3 }}
                className="group bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-sm hover:shadow-lg hover:border-[#0D5C75]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6F2F5] text-[#0D5C75] border border-[#C7E5EA]">
                        {exam.subjectLabel}
                      </span>
                      <AverageDifficultyPill info={avgDifficulty} />
                    </div>
                    <span className="text-xs text-[#A8A29E] font-medium shrink-0 font-mono">
                      {exam.year || '2025'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#0F172A] leading-snug line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-[#78716C] mt-1 line-clamp-2">{exam.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#78716C] font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                      {exam.durationMinutes} phút
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#A8A29E]" />
                      {exam.totalQuestions} câu hỏi
                    </span>
                  </div>

                  <ExamDifficultyPieChart breakdown={breakdown} avgDifficulty={avgDifficulty} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F4] gap-2">
                  {currentRole === 'student' && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => onStartExam(exam)}
                      className="flex-1 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: BRAND }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_HOVER)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
                    >
                      <span>Vào phòng thi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}

                  {currentRole === 'teacher' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onStartExam(exam)}
                        className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Xem trước & làm thử"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-100" />
                        <span>Xem trước / Làm thử</span>
                      </button>
                      <button
                        type="button"
                        onClick={onOpenClasses}
                        className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        title="Giao đề cho lớp"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>Giao lớp</span>
                      </button>
                    </>
                  )}

                  {currentRole === 'admin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onStartExam(exam)}
                        className="flex-1 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
                        <span>Kiểm duyệt & Làm thử</span>
                      </button>
                      {onOpenAdmin && (
                        <button
                          type="button"
                          onClick={onOpenAdmin}
                          className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs transition-all flex items-center justify-center cursor-pointer shrink-0"
                          title="Cổng Quản Trị"
                        >
                          <span>Quản trị</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePdfClick(exam)}
                    className="p-2 rounded-xl border border-[#E7E5E4] hover:bg-[#FAFAF9] text-[#57534E] transition-colors cursor-pointer shrink-0"
                    title="In đề A4"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShuffleClick(exam)}
                    className="p-2 rounded-xl border border-[#E7E5E4] hover:bg-[#FAFAF9] text-[#57534E] transition-colors cursor-pointer shrink-0"
                    title="Xáo trộn câu"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export { StudentExamLibrary as ExamLibrary };

/* ============================================================================
 * 2. StudentQuestionMatrix
 * ============================================================================ */
export interface StudentQuestionMatrixProps {
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, OptionId>;
  flaggedQuestions: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  onSubmitClick: () => void;
}

export const StudentQuestionMatrix: React.FC<StudentQuestionMatrixProps> = ({
  questions,
  currentIndex,
  userAnswers,
  flaggedQuestions,
  onSelectQuestion,
  onSubmitClick,
}) => {
  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  return (
    <aside className="w-full lg:w-[280px] shrink-0 font-sans">
      <div className="sticky top-20 bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F4]">
          <h3 className="font-serif font-bold text-sm text-[#0F172A]">Ma trận câu hỏi</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E6F2F5] text-[#0D5C75] border border-[#C7E5EA] tabular-nums font-mono">
            {answeredCount} / {questions.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-3.5 text-[11px] text-[#78716C]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: BRAND }} />
            <span>Đã làm ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-500" />
            <span>Đánh dấu ({flaggedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#F5F5F4] border border-[#E7E5E4]" />
            <span>Chưa làm ({unansweredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border-2" style={{ borderColor: BRAND }} />
            <span>Đang chọn</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1 py-1">
          {questions.map((q, index) => {
            const status = getQuestionStatus(q.id, userAnswers, flaggedQuestions);
            const isActive = currentIndex === index;

            let classes =
              'w-9 h-9 rounded-lg font-semibold text-xs flex items-center justify-center transition-all cursor-pointer relative active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ';
            if (isActive) classes += 'ring-2 ring-offset-2 z-10 font-bold ';
            if (status === 'flagged')
              classes += 'bg-amber-50 border-2 border-amber-500 text-amber-900 hover:bg-amber-100 ';
            else if (status === 'answered')
              classes += 'text-white hover:opacity-90 shadow-sm ';
            else classes += 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4] ';

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectQuestion(index)}
                className={classes}
                style={
                  status === 'answered'
                    ? { backgroundColor: BRAND }
                    : isActive
                    ? { ['--tw-ring-color' as string]: BRAND }
                    : undefined
                }
                aria-label={`Chuyển tới câu ${index + 1}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="tabular-nums font-mono">{index + 1}</span>
                {status === 'flagged' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSubmitClick}
          className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Nộp bài ngay</span>
        </button>
      </div>
    </aside>
  );
};
export { StudentQuestionMatrix as QuestionMatrix };

/* ============================================================================
 * 3. StudentSubmitModal
 * ============================================================================ */
export interface StudentSubmitModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  timeRemainingSeconds: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const StudentSubmitModal: React.FC<StudentSubmitModalProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  flaggedCount,
  timeRemainingSeconds,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const hasUnanswered = unansweredCount > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-[500px] bg-white rounded-3xl p-6 border border-[#E7E5E4] shadow-2xl space-y-5"
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                hasUnanswered ? 'bg-amber-100 text-amber-700' : 'bg-[#E6F2F5] text-[#0D5C75]'
              }`}
            >
              {hasUnanswered ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#0F172A]">
                {hasUnanswered ? 'Bạn vẫn còn câu chưa làm!' : 'Xác nhận nộp bài?'}
              </h3>
              <p className="text-xs text-[#78716C] mt-1 font-sans">
                {hasUnanswered
                  ? `Còn ${unansweredCount} câu chưa hoàn thành. Các câu chưa làm sẽ tính là 0 điểm.`
                  : 'Bạn đã trả lời đầy đủ. Hệ thống sẽ chấm và cập nhật lỗi sai vào sổ tay.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-center text-xs">
            <div>
              <span className="text-[#A8A29E] block text-[10px] uppercase font-bold">ĐÃ LÀM</span>
              <span className="font-bold text-[#0F172A] font-mono">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            <div>
              <span className="text-[#A8A29E] block text-[10px] uppercase font-bold">CẮM CỜ</span>
              <span className="font-bold text-amber-600 font-mono">{flaggedCount}</span>
            </div>
            <div>
              <span className="text-[#A8A29E] block text-[10px] uppercase font-bold">CÒN LẠI</span>
              <span className="font-bold font-mono" style={{ color: BRAND }}>
                {formatTimer(timeRemainingSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#57534E] hover:bg-[#F5F5F4] active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              Làm tiếp
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer min-h-[44px]"
              style={{ backgroundColor: BRAND }}
            >
              Đồng ý nộp bài
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export { StudentSubmitModal as SubmitModal };

/* ============================================================================
 * 4. StudentExamRunner
 * ============================================================================ */
export interface StudentExamRunnerProps {
  exam: Exam;
  currentIndex: number;
  userAnswers: Record<string, OptionId>;
  flaggedQuestions: Record<string, boolean>;
  timeRemainingSeconds: number;
  onSelectOption: (questionId: string, optionId: OptionId) => void;
  onToggleFlag: (questionId: string) => void;
  onNavigateQuestion: (index: number) => void;
  onSubmitExam: () => void;
  onExit: () => void;
}

export const StudentExamRunner: React.FC<StudentExamRunnerProps> = ({
  exam,
  currentIndex,
  userAnswers,
  flaggedQuestions,
  timeRemainingSeconds,
  onSelectOption,
  onToggleFlag,
  onNavigateQuestion,
  onSubmitExam,
  onExit,
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMatrixDrawerOpen, setIsMatrixDrawerOpen] = useState(false);

  const question = exam.questions[currentIndex];
  const isFlagged = question ? !!flaggedQuestions[question.id] : false;
  const selectedOption = question ? userAnswers[question.id] : undefined;
  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const urgent = isUrgentTimer(timeRemainingSeconds);

  // Toggle true Native Fullscreen API with fallback
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFocusMode(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFocusMode(false);
    }
  };

  // Keyboard shortcut listener: supports A, B, C, D AND 1, 2, 3, 4, Arrow keys, F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag && ['INPUT', 'TEXTAREA'].includes(tag)) return;

      const key = e.key.toUpperCase();
      const numToOpt: Record<string, OptionId> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };

      if (['A', 'B', 'C', 'D'].includes(key) && question) {
        onSelectOption(question.id, key as OptionId);
      } else if (['1', '2', '3', '4'].includes(e.key) && question) {
        onSelectOption(question.id, numToOpt[e.key]);
      } else if (e.key === 'ArrowRight' && currentIndex < exam.questions.length - 1) {
        onNavigateQuestion(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigateQuestion(currentIndex - 1);
      } else if (key === 'F' && question) {
        onToggleFlag(question.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, question, exam.questions.length, onSelectOption, onToggleFlag, onNavigateQuestion]);

  const handleExitRequest = () => {
    if (answeredCount > 0) {
      setIsExitConfirmOpen(true);
    } else {
      onExit();
    }
  };

  if (!question) return null;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 font-sans ${
        isFocusMode ? 'bg-[#0B0F19] text-white' : 'bg-[#FAFAF9] text-[#0F172A]'
      }`}
    >
      {/* Top bar */}
      <div
        className={`sticky top-0 z-30 px-4 sm:px-6 py-3 border-b flex items-center justify-between backdrop-blur-md ${
          isFocusMode
            ? 'bg-[#0F172A]/90 border-slate-800'
            : 'bg-white/95 border-[#E7E5E4] shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitRequest}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 cursor-pointer transition-colors"
          >
            Thoát
          </button>
          <div className="hidden sm:block">
            <h2 className="text-xs sm:text-sm font-serif font-bold truncate max-w-md">{exam.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
              urgent
                ? 'bg-rose-500 text-white animate-pulse'
                : isFocusMode
                ? 'bg-slate-800 text-teal-300'
                : 'bg-[#E6F2F5] text-[#0D5C75]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`p-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              isFocusMode
                ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                : 'border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#57534E]'
            }`}
            title={isFocusMode ? 'Thoát toàn màn hình' : 'Toàn màn hình / Tập trung'}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
          >
            Nộp bài
          </button>
        </div>
      </div>

      {/* Main Examination Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        <div className="flex-1 space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isFocusMode
                ? 'bg-[#131B2E] border-slate-800'
                : 'bg-white border-[#E7E5E4] shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#F5F5F4]/10">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-xl text-white text-xs font-bold font-mono"
                  style={{ backgroundColor: BRAND }}
                >
                  {question.code}
                </span>
                <span className="text-xs text-[#A8A29E] font-medium">{question.topic}</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleFlag(question.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                  isFlagged
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : isFocusMode
                    ? 'text-slate-400 border-slate-700 hover:text-slate-200'
                    : 'text-[#78716C] border-[#E7E5E4] hover:text-[#0F172A]'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isFlagged ? 'Đã cắm cờ' : 'Cắm cờ (F)'}</span>
              </button>
            </div>

            {/* Question Stem */}
            <div className="text-base sm:text-lg font-medium leading-relaxed font-sans">
              <MathText text={question.stem} />
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => onSelectOption(question.id, opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer min-h-[52px] select-none font-sans ${
                      isSelected
                        ? 'bg-[#E6F2F5] border-[#0D5C75] text-[#042F2E] font-semibold ring-2 ring-[#0D5C75]/20 shadow-sm'
                        : isFocusMode
                        ? 'bg-[#1E293B] border-slate-700 text-slate-200 hover:border-slate-500'
                        : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-transform font-mono ${
                          isSelected
                            ? 'text-white scale-105 shadow-sm'
                            : 'bg-[#F5F5F4] text-[#57534E]'
                        }`}
                        style={isSelected ? { backgroundColor: BRAND } : undefined}
                      >
                        {opt.id}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm pt-0.5 leading-relaxed">
                        <MathText text={opt.text} />
                      </span>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] text-[#A8A29E] font-mono px-1.5 py-0.5 rounded border border-[#E7E5E4] bg-[#FAFAF9] shrink-0">
                      Phím {opt.id} / {opt.id === 'A' ? '1' : opt.id === 'B' ? '2' : opt.id === 'C' ? '3' : '4'}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="hidden lg:flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => onNavigateQuestion(currentIndex - 1)}
              className="px-4 py-2.5 rounded-xl border border-[#E7E5E4] text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all hover:bg-[#F5F5F4]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước (←)</span>
            </button>
            <button
              type="button"
              disabled={currentIndex === exam.questions.length - 1}
              onClick={() => onNavigateQuestion(currentIndex + 1)}
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
              style={{ backgroundColor: BRAND }}
            >
              <span>Câu sau (→)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Matrix Sidebar */}
        {!isFocusMode && (
          <StudentQuestionMatrix
            questions={exam.questions}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            flaggedQuestions={flaggedQuestions}
            onSelectQuestion={onNavigateQuestion}
            onSubmitClick={() => setIsSubmitModalOpen(true)}
          />
        )}
      </div>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E5E4] px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-lg safe-bottom-padding font-sans">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => onNavigateQuestion(currentIndex - 1)}
          className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[#E7E5E4] bg-white text-[#57534E] text-xs font-bold disabled:opacity-30 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsMatrixDrawerOpen(true)}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#F5F5F4] hover:bg-[#E7E5E4] active:scale-95 text-[#0F172A] text-xs font-bold flex items-center gap-2 cursor-pointer border border-[#E7E5E4]"
        >
          <LayoutGrid className="w-4 h-4" style={{ color: BRAND }} />
          <span>
            Câu {currentIndex + 1}/{exam.questions.length}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E6F2F5] text-[#0D5C75] font-black font-mono">
            {answeredCount} xong
          </span>
        </button>
        {currentIndex === exam.questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Nộp</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigateQuestion(currentIndex + 1)}
            className="min-h-[44px] px-3.5 rounded-xl text-white text-xs font-bold active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
            style={{ backgroundColor: BRAND }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Matrix Drawer */}
      {isMatrixDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm font-sans">
          <div className="bg-white rounded-t-3xl max-h-[80vh] flex flex-col p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F4]">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" style={{ color: BRAND }} />
                <h3 className="font-serif font-bold text-sm text-[#0F172A]">Ma trận câu hỏi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMatrixDrawerOpen(false)}
                className="p-1 rounded-full text-[#A8A29E] hover:text-[#57534E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <StudentQuestionMatrix
                questions={exam.questions}
                currentIndex={currentIndex}
                userAnswers={userAnswers}
                flaggedQuestions={flaggedQuestions}
                onSelectQuestion={(idx) => {
                  onNavigateQuestion(idx);
                  setIsMatrixDrawerOpen(false);
                }}
                onSubmitClick={() => {
                  setIsMatrixDrawerOpen(false);
                  setIsSubmitModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {isExitConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 border border-[#E7E5E4] shadow-2xl max-w-sm w-full space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0F172A]">
                Bạn có chắc muốn thoát?
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Bạn đã làm <strong>{answeredCount}</strong> câu hỏi. Tiến độ làm bài hiện tại sẽ không được lưu vào bảng điểm nếu bạn thoát bây giờ.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExitConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Ở lại làm tiếp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExitConfirmOpen(false);
                    onExit();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Xác nhận thoát
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <StudentSubmitModal
        isOpen={isSubmitModalOpen}
        totalQuestions={exam.questions.length}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        timeRemainingSeconds={timeRemainingSeconds}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={() => {
          setIsSubmitModalOpen(false);
          onSubmitExam();
        }}
      />
    </div>
  );
};
export { StudentExamRunner as ExamRunner };

/* ============================================================================
 * 5. StudentResultView
 * ============================================================================ */
export interface StudentResultViewProps {
  exam: Exam;
  userAnswers: Record<string, OptionId>;
  timeSpentSeconds: number;
  onReviewMistakes: () => void;
  onRetakeExam: () => void;
  onGenerateAIQuiz: (topic: string) => void;
  onBackToLibrary: () => void;
}

export const StudentResultView: React.FC<StudentResultViewProps> = ({
  exam,
  userAnswers,
  timeSpentSeconds,
  onReviewMistakes,
  onRetakeExam,
  onGenerateAIQuiz,
  onBackToLibrary,
}) => {
  const summary = computeExamSummary(exam.questions, userAnswers, exam.scoringScale);

  // Compute knowledge gaps by analyzing incorrect questions by topic
  const knowledgeGaps = useMemo(() => {
    const topicMap: Record<string, { total: number; wrong: number; sampleStem: string }> = {};
    exam.questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      const isWrong = userAns !== q.correctOption;
      if (!topicMap[q.topic]) {
        topicMap[q.topic] = { total: 0, wrong: 0, sampleStem: q.stem };
      }
      topicMap[q.topic].total += 1;
      if (isWrong) {
        topicMap[q.topic].wrong += 1;
      }
    });

    return Object.entries(topicMap)
      .filter(([_, stats]) => stats.wrong > 0)
      .map(([topic, stats]) => ({
        topic,
        wrongCount: stats.wrong,
        totalCount: stats.total,
        accuracy: Math.round(((stats.total - stats.wrong) / stats.total) * 100),
      }))
      .sort((a, b) => b.wrongCount - a.wrongCount);
  }, [exam.questions, userAnswers]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Score Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-sans">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>Đã hoàn thành bài khảo thí thử</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0F172A]">{exam.title}</h1>
          <p className="text-xs text-[#78716C] font-sans">
            Thời gian hoàn thành: <strong className="font-mono text-[#0F172A]">{formatTimer(timeSpentSeconds)}</strong> • Môn thi: <strong>{exam.subjectLabel}</strong>
          </p>
        </div>

        <div
          className="text-white p-6 rounded-3xl shadow-lg border border-teal-500/20 text-center min-w-[220px]"
          style={{ backgroundImage: `linear-gradient(135deg, ${BRAND}, #042F2E)` }}
        >
          <span className="text-xs uppercase font-bold text-teal-200 tracking-wider">Điểm tổng kết</span>
          <div className="text-4xl sm:text-5xl font-serif font-black my-1">
            {formatScoreDisplay(summary.score, exam.scoringScale)}
          </div>
          <span className="text-[11px] text-teal-100 font-medium">
            Đúng {summary.correctCount} / {summary.total} câu ({Math.round((summary.correctCount / summary.total) * 100)}%)
          </span>
        </div>
      </motion.div>

      {/* Diagnostic & Knowledge Gaps Section */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-bold text-lg text-[#0F172A]">
              Chẩn Đoán Lỗ Hổng Kiến Thức & Gợi Ý AI
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {knowledgeGaps.length > 0 ? `${knowledgeGaps.length} chủ đề cần lưu ý` : 'Nắm vững toàn bộ!'}
          </span>
        </div>

        {knowledgeGaps.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-serif font-bold text-sm">Xuất sắc! Bạn không sai câu nào.</p>
            <p className="text-xs text-emerald-800">
              Bạn đã làm chủ hoàn toàn các chuyên đề trong bài kiểm tra này. Hãy thử sức với các bộ đề nâng cao hơn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {knowledgeGaps.map((gap) => (
              <div
                key={gap.topic}
                className="p-4 rounded-2xl border border-slate-200 bg-[#FAFAF9] flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-xs font-serif font-bold text-slate-900 block">
                    {gap.topic}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Sai {gap.wrongCount}/{gap.totalCount} câu • Tỷ lệ đúng {gap.accuracy}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onGenerateAIQuiz(gap.topic)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                  title="Tạo bài ôn tập AI cho chủ đề này"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Luyện tập AI</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 justify-center pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onReviewMistakes}
          className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Vào Sổ Tay Xem Lỗi Sai</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onRetakeExam}
          className="px-6 py-3 rounded-2xl border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#44403C] font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Làm lại đề</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onBackToLibrary}
          className="px-6 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          style={{ backgroundColor: BRAND }}
        >
          Trở về thư viện đề
        </motion.button>
      </div>
    </div>
  );
};
export { StudentResultView as ResultView };

/* ============================================================================
 * 6. StudentPortal — Wrapper tiện dụng
 * ============================================================================ */
export interface StudentPortalProps {
  exams: Exam[];
  onStartExam: (exam: Exam) => void;
  onOpenGenerator: () => void;
  onOpenMistakes: () => void;
  onOpenClasses: () => void;
  onExportExamPdf: (exam: Exam) => void;
  onShuffleExam: (exam: Exam) => void;
  mistakes: MistakeItem[];
  onStartQuickReview?: () => void;
  onOpenRoadmap?: () => void;
  onOpenAdmin?: () => void;
  onOpenStats?: () => void;
  currentRole: UserRole;
}

export const StudentPortal: React.FC<StudentPortalProps> = (props) => (
  <StudentExamLibrary
    exams={props.exams}
    onStartExam={props.onStartExam}
    onOpenGenerator={props.onOpenGenerator}
    onOpenMistakes={props.onOpenMistakes}
    onOpenClasses={props.onOpenClasses}
    onExportExamPdf={props.onExportExamPdf}
    onShuffleExam={props.onShuffleExam}
    mistakeCount={props.mistakes.filter((m) => !m.isMastered).length}
    currentRole={props.currentRole}
    mistakes={props.mistakes}
    onStartQuickReview={props.onStartQuickReview}
    onOpenRoadmap={props.onOpenRoadmap}
    onOpenAdmin={props.onOpenAdmin}
    onOpenStats={props.onOpenStats}
  />
);