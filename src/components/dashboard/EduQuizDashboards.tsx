/**
 * ============================================================================
 * FILE: EduQuizDashboards (Bộ 3 Dashboard theo vai trò — Vantrix AI)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: CORE HUBS (DASHBOARDS)
 * ĐƯỜNG DẪN: /src/components/dashboard/EduQuizDashboards.tsx
 * CHỨC NĂNG CHÍNH:
 *  - StudentDashboard: điểm TB, bài đã làm, chuỗi ngày học, join class, AI generator
 *  - TeacherDashboard: KPI giảng dạy, kéo-thả tải đề, danh sách lớp phụ trách
 *  - AdminDashboard: CRM người dùng, dung lượng, khóa/mở khóa, tìm kiếm & lọc
 *  - Palette: Deep Teal (HS) / Amber (GV) / Purple (Admin)
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Trophy,
  BookOpen,
  Sparkles,
  Upload,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  ShieldAlert,
  Database,
  UserCheck,
  School,
  Lock,
  Unlock,
  Copy,
  TrendingUp,
} from 'lucide-react';
import type { UserRole } from '../../types/quiz';

/* =========================================================================
 * Design tokens — palette Deep Teal / Amber / Purple / Emerald / Rose
 * ========================================================================= */
type Tone = 'teal' | 'amber' | 'purple' | 'emerald' | 'rose' | 'slate';

const TONE: Record<
  Tone,
  { icon: string; bg: string; text: string; border: string }
> = {
  teal: {
    icon: 'text-[#0D5C75]',
    bg: 'bg-[#E6F2F5]',
    text: 'text-[#0D5C75]',
    border: 'border-[#C7E5EA]',
  },
  amber: {
    icon: 'text-[#B45309]',
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#78350F]',
    border: 'border-[#FDE68A]',
  },
  purple: {
    icon: 'text-[#6D28D9]',
    bg: 'bg-[#F3E8FF]',
    text: 'text-[#4C1D95]',
    border: 'border-[#DDD6FE]',
  },
  emerald: {
    icon: 'text-[#059669]',
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#065F46]',
    border: 'border-[#A7F3D0]',
  },
  rose: {
    icon: 'text-[#E11D48]',
    bg: 'bg-[#FFE4E6]',
    text: 'text-[#9F1239]',
    border: 'border-[#FECDD3]',
  },
  slate: {
    icon: 'text-[#57534E]',
    bg: 'bg-[#F5F5F4]',
    text: 'text-[#44403C]',
    border: 'border-[#E7E5E4]',
  },
};

/* =========================================================================
 * Shared sub-components
 * ========================================================================= */

interface StatCardProps {
  label: string;
  value: string;
  meta?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, meta, icon: Icon, tone, delay = 0 }) => {
  const t = TONE[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-[#78716C] font-semibold">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${t.icon}`} />
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">{value}</div>
      {meta && <div className={`text-[11px] font-semibold mt-0.5 ${t.icon}`}>{meta}</div>}
    </motion.div>
  );
};

const SectionHeading: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-[#78716C] mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const EmptyState: React.FC<{ icon: React.ComponentType<{ className?: string }>; title: string; hint?: string }> = ({
  icon: Icon,
  title,
  hint,
}) => (
  <div className="text-center py-10">
    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F4] mx-auto flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-[#A8A29E]" />
    </div>
    <p className="text-sm font-bold text-[#0F172A]">{title}</p>
    {hint && <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">{hint}</p>}
  </div>
);

/* ============================================================================
 * 1. STUDENT DASHBOARD (HỌC SINH / SINH VIÊN) — Deep Teal brand
 * ============================================================================
 */

interface AssignedExam {
  id: string;
  title: string;
  teacher: string;
  timeLimit: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  score?: string;
  questionCount: number;
}

interface StudentDashboardProps {
  studentName?: string;
  onJoinClass?: (code: string) => { success: boolean; message: string };
  onOpenGenerator?: () => void;
  onStartExam?: (examId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentName = 'Nguyễn Văn Trí',
  onJoinClass,
  onOpenGenerator,
  onStartExam,
}) => {
  const [classCode, setClassCode] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const stats: StatCardProps[] = [
    {
      label: 'Điểm Trung Bình',
      value: '8.6',
      meta: '+0.4 so với kỳ trước',
      icon: Trophy,
      tone: 'amber',
    },
    {
      label: 'Bài Thi Đã Làm',
      value: '24',
      meta: '4 tuần gần đây',
      icon: BookOpen,
      tone: 'teal',
    },
    {
      label: 'Chuỗi Ngày Học',
      value: '7 ngày',
      meta: 'Kỷ lục mới 🔥',
      icon: TrendingUp,
      tone: 'emerald',
    },
  ];

  const assignedExams: AssignedExam[] = [
    {
      id: '1',
      title: 'Khảo Sát Giữa Kỳ: Giải Tích & Hàm Số Nâng Cao',
      teacher: 'Thầy Nguyễn Văn Trí',
      timeLimit: '45 phút',
      status: 'pending',
      dueDate: 'Hôm nay, 22:00',
      questionCount: 25,
    },
    {
      id: '2',
      title: 'Kiểm Tra 15 Phút: Sóng Cơ & Dao Động Điều Hòa',
      teacher: 'Cô Trần Mai Linh',
      timeLimit: '15 phút',
      status: 'pending',
      dueDate: 'Ngày mai, 18:00',
      questionCount: 10,
    },
    {
      id: '3',
      title: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Đề Số 04',
      teacher: 'Hệ Thống Vantrix AI',
      timeLimit: '50 phút',
      status: 'completed',
      score: '9.2 / 10',
      questionCount: 50,
    },
  ];

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    const code = classCode.trim().toUpperCase();
    if (!code) return;

    if (onJoinClass) {
      const result = onJoinClass(code);
      setJoinStatus({ ok: result.success, msg: result.message });
    } else {
      setJoinStatus({ ok: true, msg: `Đã gửi yêu cầu vào lớp với mã "${code}".` });
    }
    setClassCode('');
    setTimeout(() => setJoinStatus(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E5E4] shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F2F5] text-[#0D5C75] text-xs font-bold border border-[#C7E5EA] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vantrix Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Xin chào, {studentName} 👋
            </h1>
            <p className="text-sm text-[#78716C] mt-1">
              Hôm nay bạn có 2 bài thi được giao và 1 lộ trình ôn tập AI đang chờ hoàn thành.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 w-full md:w-auto">
            {stats.map((s, i) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                meta={s.meta}
                icon={s.icon}
                tone={s.tone}
                delay={0.05 * i}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Join Class + AI Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-1 bg-gradient-to-br from-[#0D5C75] to-[#042F2E] text-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-[#0D5C75]/20 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-4">
              <School className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Tham Gia Lớp Học Mới</h2>
            <p className="text-xs text-teal-100/90 mt-1 leading-relaxed">
              Nhập mã định danh lớp 6 ký tự do giáo viên cung cấp để nhận bài thi và tài liệu tự động.
            </p>
          </div>

          <form onSubmit={handleJoinClass} className="mt-6 space-y-3">
            <input
              type="text"
              maxLength={8}
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="VD: TOAN12A1"
              className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white placeholder-teal-200/80 text-sm font-mono tracking-wider border border-white/20 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/40 transition-all"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-white text-[#0D5C75] font-bold text-xs hover:bg-teal-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Xác nhận tham gia lớp</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <AnimatePresence>
              {joinStatus && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`text-xs text-center font-medium ${
                    joinStatus.ok ? 'text-emerald-200' : 'text-rose-200'
                  }`}
                >
                  {joinStatus.msg}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Self-Practice Engine</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              Tự Luyện Đề Bằng Trí Tuệ Nhân Tạo
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-xl">
              Tải lên tài liệu giáo trình, ảnh chụp đề PDF/Word hoặc dán nội dung văn bản. Vantrix AI
              tự động phân tích ma trận kiến thức và sinh đề thi trắc nghiệm riêng cho bạn trong vài giây.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenGenerator}
                className="px-5 py-2.5 rounded-2xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-sm shadow-[#0D5C75]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Tải tài liệu lên tự tạo đề</span>
              </motion.button>
              <button
                type="button"
                onClick={onOpenGenerator}
                className="px-4 py-2.5 rounded-2xl border border-[#E7E5E4] hover:bg-[#FAFAF9] text-[#44403C] font-semibold text-xs transition-colors cursor-pointer"
              >
                Nhập chủ đề tự do
              </button>
            </div>
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center shrink-0 border border-[#E7E5E4]">
            <Brain className="w-12 h-12 text-[#0D5C75]" />
          </div>
        </motion.div>
      </div>

      {/* Assigned Exams */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        className="space-y-4"
      >
        <SectionHeading
          title="Bài Thi & Bài Tập Được Giao"
          subtitle="Các bài thi trực tuyến đang mở và kết quả đã lưu trữ"
          action={
            <button
              type="button"
              className="text-xs font-bold text-[#0D5C75] hover:underline cursor-pointer shrink-0"
            >
              Xem tất cả
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedExams.map((exam) => (
            <motion.div
              key={exam.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-5 border border-[#E7E5E4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-[#A8A29E] truncate">{exam.teacher}</span>
                  {exam.status === 'pending' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-[#78350F] text-[11px] font-bold border border-[#FDE68A] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>Chờ thi</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã nộp</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-2">
                  {exam.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[#78716C] font-medium">
                  <span>⏱ {exam.timeLimit}</span>
                  <span>•</span>
                  <span>📝 {exam.questionCount} câu</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F5F5F4] flex items-center justify-between gap-2">
                {exam.status === 'pending' ? (
                  <>
                    <span className="text-[11px] text-[#A8A29E] font-medium truncate">
                      Hạn: {exam.dueDate}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => onStartExam?.(exam.id)}
                      className="px-4 py-2 rounded-xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-sm shadow-[#0D5C75]/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>Vào phòng thi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </>
                ) : (
                  <>
                    <div className="text-xs">
                      <span className="text-[#A8A29E]">Kết quả: </span>
                      <span className="font-extrabold text-[#0D5C75]">{exam.score}</span>
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-xl border border-[#E7E5E4] hover:bg-[#FAFAF9] text-[#44403C] font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Xem đáp án
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================================
 * 2. TEACHER DASHBOARD (GIÁO VIÊN / GIẢNG VIÊN) — Amber brand
 * ============================================================================
 */

interface TeacherClass {
  id: string;
  name: string;
  code: string;
  students: number;
  activeExams: number;
}

interface TeacherDashboardProps {
  onOpenAIGenerator?: () => void;
  onOpenUpload?: () => void;
  onCreateClass?: () => void;
  onOpenClass?: (classId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenAIGenerator,
  onOpenUpload,
  onCreateClass,
  onOpenClass,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const kpis: StatCardProps[] = [
    {
      label: 'Đề Thi Đã Soạn',
      value: '18 bộ đề',
      meta: '+3 tuần này',
      icon: BookOpen,
      tone: 'amber',
    },
    {
      label: 'Học Sinh Quản Lý',
      value: '142 học sinh',
      meta: '4 lớp trực thuộc',
      icon: Users,
      tone: 'emerald',
    },
    {
      label: 'Bài Đã Chấm',
      value: '1,280 bài',
      meta: '98.5% tự động AI',
      icon: CheckCircle2,
      tone: 'teal',
    },
  ];

  const classes: TeacherClass[] = [
    { id: '1', name: 'Toán 12A1 - Chuyên Đề Đại Số & Giải Tích', code: 'TOAN12A1', students: 38, activeExams: 2 },
    { id: '2', name: 'Luyện Thi THPT QG 2025 - Nhóm Nâng Cao', code: 'THPT2025', students: 45, activeExams: 3 },
    { id: '3', name: 'Toán Ôn Vào Lớp 10 Chuyên Hà Nội', code: 'VAO10CHUYEN', students: 32, activeExams: 1 },
    { id: '4', name: 'Toán Cơ Bản & Ứng Dụng Thực Tế', code: 'TOANCOBAN', students: 27, activeExams: 0 },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      const name = e.dataTransfer.files[0].name;
      setUploadedFiles((prev) => [name, ...prev]);
      onOpenUpload?.();
    }
  };

  const handleCopyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard?.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard không khả dụng */
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#78350F] text-xs font-bold border border-amber-200 mb-2">
            <School className="w-3.5 h-3.5 text-amber-600" />
            <span>Vantrix Teacher Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Bảng Quản Lý Khảo Thí Của Giáo Viên
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Soạn đề thi thông minh, giao bài tập tự động và theo dõi phổ điểm học sinh thời gian thực.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onOpenAIGenerator}
          className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Soạn đề AI nhanh</span>
        </motion.button>
      </motion.div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            meta={kpi.meta}
            icon={kpi.icon}
            tone={kpi.tone}
            delay={idx * 0.08}
          />
        ))}
      </div>

      {/* Drag & Drop Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-amber-500 bg-amber-50/60 scale-[1.005]'
            : 'border-[#E7E5E4] bg-white hover:border-amber-400 hover:bg-[#FAFAF9]'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-100">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Kéo & Thả file đề thi vào đây để AI bóc tách
            </h3>
            <p className="text-xs text-[#78716C] mt-1">
              Hỗ trợ <strong>.PDF, .DOCX, .DOC, .TXT</strong>. Hệ thống tự động nhận diện câu hỏi, 4 phương
              án trắc nghiệm và đáp án đúng.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0F172A] hover:bg-[#1F2937] text-white font-bold text-xs cursor-pointer shadow-sm transition-all">
            <FileText className="w-4 h-4" />
            <span>Chọn tệp từ máy tính</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFiles((prev) => [file.name, ...prev]);
                  onOpenUpload?.();
                }
              }}
            />
          </label>

          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 border-t border-[#F5F5F4] text-left space-y-1"
              >
                <span className="text-[11px] font-bold text-[#A8A29E] uppercase">
                  Tệp vừa tải lên:
                </span>
                {uploadedFiles.map((f, i) => (
                  <div
                    key={`${f}-${i}`}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{f} (sẵn sàng tạo đề)</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Classes */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        className="space-y-4"
      >
        <SectionHeading
          title="Danh Sách Lớp Học Phụ Trách"
          subtitle="Mã tham gia và số lượng học viên từng lớp"
          action={
            <button
              type="button"
              onClick={onCreateClass}
              className="px-3.5 py-1.5 rounded-xl border border-[#E7E5E4] text-xs font-bold text-[#44403C] hover:bg-[#F5F5F4] transition-colors cursor-pointer shrink-0"
            >
              + Tạo lớp học mới
            </button>
          }
        />

        {classes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7E5E4]">
            <EmptyState
              icon={School}
              title="Chưa có lớp học nào"
              hint="Bấm '+ Tạo lớp học mới' để bắt đầu quản lý học sinh."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-3xl p-5 border border-[#E7E5E4] shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-sm text-[#0F172A] truncate">{cls.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      Mã: {cls.code}
                    </span>
                    <span>•</span>
                    <span>{cls.students} học sinh</span>
                    <span>•</span>
                    <span>{cls.activeExams} bài mở</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    title={copiedId === cls.id ? 'Đã sao chép!' : 'Sao chép mã lớp'}
                    onClick={() => handleCopyCode(cls.id, cls.code)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      copiedId === cls.id
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-[#E7E5E4] hover:bg-[#FAFAF9] text-[#57534E]'
                    }`}
                  >
                    {copiedId === cls.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenClass?.(cls.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1F2937] text-white text-xs font-bold cursor-pointer"
                  >
                    Giao đề
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ============================================================================
 * 3. ADMIN DASHBOARD — Purple brand
 * ============================================================================
 */

type UserRecordStatus = 'active' | 'locked';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserRecordStatus;
  storageUsed: string;
  joinedDate: string;
}

type RoleFilter = 'all' | UserRole;

interface AdminDashboardProps {
  users?: UserRecord[];
  onUpdateUsers?: (users: UserRecord[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users: initialUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const defaultUsers: UserRecord[] = [
    {
      id: '1',
      name: 'Nguyễn Văn Trí',
      email: 'vantritran518@gmail.com',
      role: 'student',
      status: 'active',
      storageUsed: '124 MB',
      joinedDate: '12/01/2025',
    },
    {
      id: '2',
      name: 'Cô Trần Mai Linh',
      email: 'mailinh.edu@gmail.com',
      role: 'teacher',
      status: 'active',
      storageUsed: '840 MB',
      joinedDate: '05/01/2025',
    },
    {
      id: '3',
      name: 'TS. Minh Tuấn',
      email: 'minhtuan.lecturer@vnu.edu.vn',
      role: 'teacher',
      status: 'active',
      storageUsed: '1.2 GB',
      joinedDate: '18/12/2024',
    },
    {
      id: '4',
      name: 'Lê Hoàng Long',
      email: 'hoanglong_bot@test.com',
      role: 'student',
      status: 'locked',
      storageUsed: '12 MB',
      joinedDate: '02/02/2025',
    },
    {
      id: '5',
      name: 'Ban Quản Trị Trung Tâm',
      email: 'admin@vantrix.edu.vn',
      role: 'admin',
      status: 'active',
      storageUsed: '240 MB',
      joinedDate: '01/01/2024',
    },
  ];

  const [users, setUsers] = useState<UserRecord[]>(initialUsers ?? defaultUsers);

  const kpis: StatCardProps[] = [
    {
      label: 'Tổng Người Dùng',
      value: '1,420',
      meta: '920 HS • 500 GV',
      icon: UserCheck,
      tone: 'purple',
    },
    {
      label: 'Dung Lượng Đã Dùng',
      value: '3.42 GB',
      meta: 'Giới hạn 10 GB (34.2%)',
      icon: Database,
      tone: 'emerald',
    },
    {
      label: 'Tài Khoản Bị Khóa',
      value: '3 tài khoản',
      meta: 'Vi phạm bảo mật / gian lận',
      icon: ShieldAlert,
      tone: 'rose',
    },
  ];

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'locked' : 'active' } : u
      )
    );
  };

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const roleBadge = (role: UserRole) => {
    if (role === 'admin')
      return (
        <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[#4C1D95] font-bold text-[10px] border border-purple-200">
          Quản trị viên
        </span>
      );
    if (role === 'teacher')
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-[#78350F] font-bold text-[10px] border border-amber-200">
          Giáo viên
        </span>
      );
    return (
      <span className="px-2.5 py-1 rounded-full bg-[#E6F2F5] text-[#0D5C75] font-bold text-[10px] border border-[#C7E5EA]">
        Học sinh
      </span>
    );
  };

  const statusBadge = (status: UserRecordStatus) =>
    status === 'active' ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Hoạt động
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-bold text-[10px] border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Đã khóa
      </span>
    );

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A] text-white text-xs font-semibold mb-2">
            <span>Vantrix Master Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Trị Người Dùng & Hạ Tầng Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Giám sát tài khoản, phân bổ quyền hạn và quản lý dung lượng lưu trữ tài nguyên toàn trường.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E7E5E4] text-xs font-semibold text-[#44403C] flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Máy chủ 99.98%</span>
        </div>
      </motion.div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            meta={kpi.meta}
            icon={kpi.icon}
            tone={kpi.tone}
            delay={idx * 0.08}
          />
        ))}
      </div>

      {/* User Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-5 sm:p-6 border-b border-[#F5F5F4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(['all', 'student', 'teacher', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  roleFilter === r
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
                }`}
              >
                {r === 'all' ? 'Tất cả' : r === 'student' ? 'Học sinh' : r === 'teacher' ? 'Giáo viên' : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF9] text-[#A8A29E] uppercase text-[10px] font-bold tracking-wider border-b border-[#F5F5F4]">
              <tr>
                <th className="py-3.5 px-6">Người dùng</th>
                <th className="py-3.5 px-6">Vai trò</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6">Dung lượng</th>
                <th className="py-3.5 px-6">Ngày tham gia</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Search}
                      title="Không tìm thấy người dùng phù hợp"
                      hint="Thử xoá từ khóa tìm kiếm hoặc chọn bộ lọc khác."
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAFAF9]/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0F172A] text-xs sm:text-sm">{u.name}</div>
                      <div className="text-[#A8A29E] text-[11px] truncate max-w-[220px]">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">{roleBadge(u.role)}</td>
                    <td className="py-4 px-6">{statusBadge(u.status)}</td>
                    <td className="py-4 px-6 font-mono text-[#57534E] font-semibold">
                      {u.storageUsed}
                    </td>
                    <td className="py-4 px-6 text-[#A8A29E]">{u.joinedDate}</td>
                    <td className="py-4 px-6 text-right">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 ${
                          u.status === 'active'
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Khóa</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Mở khóa</span>
                          </>
                        )}
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};