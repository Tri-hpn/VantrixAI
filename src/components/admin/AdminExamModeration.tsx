/**
 * ============================================================================
 * FILE: AdminExamModeration.tsx — Vantrix AI
 * PHÂN HỆ: QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) — KIỂM DUYỆT NỘI DUNG
 * ĐƯỜNG DẪN: /src/components/admin/AdminExamModeration.tsx
 * FIX: Bỏ key `custom` thừa trong LevelBadge (EducationLevel không có 'custom').
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exam, EducationLevel } from '../../types/quiz';
import type { AuditLog } from '../../types/admin';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

const ADMIN = {
  main: '#6D28D9',
  hover: '#5B21B6',
  tint: '#F3E8FF',
  border: '#DDD6FE',
  deep: '#4C1D95',
} as const;

const BRAND = '#0D5C75';

const ADMIN_ACTOR = {
  name: 'Quản Trị Viên (Trí)',
  email: 'admin@vantrix.edu.vn',
};

type LevelFilter = 'all' | EducationLevel;

interface AdminExamModerationProps {
  exams: Exam[];
  onUpdateExams: (newExams: Exam[]) => void;
  onPreviewExam: (exam: Exam) => void;
  onAddAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

/* ============================================================================
 * LevelBadge — 4 cấp học, palette semantic (FIXED)
 * ============================================================================ */
const LevelBadge: React.FC<{ level?: EducationLevel }> = ({ level }) => {
  if (!level) return null;

  const config: Record<
    EducationLevel,
    { label: string; bg: string; text: string; border: string }
  > = {
    tieuhoc: { label: 'Cấp 1', bg: '#FEF3C7', text: '#78350F', border: '#FDE68A' },
    thcs: { label: 'Cấp 2', bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
    thpt: { label: 'Cấp 3', bg: '#E6F2F5', text: BRAND, border: '#C7E5EA' },
    daihoc: { label: 'Đại học', bg: ADMIN.tint, text: ADMIN.deep, border: ADMIN.border },
  };

  const c = config[level];
  if (!c) return null;

  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
};

/* ============================================================================
 * Main
 * ============================================================================ */
export const AdminExamModeration: React.FC<AdminExamModerationProps> = ({
  exams,
  onUpdateExams,
  onPreviewExam,
  onAddAuditLog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);

  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exams.filter((e) => {
      const matchLevel = levelFilter === 'all' || e.educationLevel === levelFilter;
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.subjectLabel.toLowerCase().includes(q) ||
        (e.authorName ?? '').toLowerCase().includes(q);
      return matchLevel && matchSearch;
    });
  }, [exams, searchQuery, levelFilter]);

  const hasAnyExam = exams.length > 0;
  const hasResults = filteredExams.length > 0;

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const isVerifiedTag = (exam: Exam): boolean =>
    exam.tag.includes('Đã kiểm duyệt') || exam.tag.includes('Chuẩn Bộ');

  const handleToggleVerified = (exam: Exam) => {
    const isCurrentlyVerified = isVerifiedTag(exam);
    const newTag = isCurrentlyVerified
      ? 'Đề cộng đồng'
      : 'Chuẩn Bộ GD&ĐT (Đã kiểm duyệt)';

    onUpdateExams(exams.map((e) => (e.id === exam.id ? { ...e, tag: newTag } : e)));

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Kiểm duyệt đề thi',
      target: exam.title,
      details: isCurrentlyVerified
        ? 'Gỡ nhãn kiểm duyệt'
        : 'Gắn nhãn Chuẩn Bộ GD&ĐT đã kiểm duyệt',
      severity: 'info',
      category: 'exam',
    });

    showNotice(
      isCurrentlyVerified
        ? `Đã gỡ nhãn kiểm duyệt đề "${exam.title}".`
        : `Đã gắn nhãn "Chuẩn Bộ GD&ĐT" cho đề "${exam.title}".`
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;

    onUpdateExams(exams.filter((e) => e.id !== target.id));

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Xóa đề thi',
      target: target.title,
      details: `Đã xóa vĩnh viễn đề thi ${target.id} (${target.title}) khỏi thư viện`,
      severity: 'warning',
      category: 'exam',
    });

    showNotice(`Đã xóa đề "${target.title}".`);
    setDeleteTarget(null);
  };

  const levels: { value: LevelFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'tieuhoc', label: 'Tiểu học' },
    { value: 'thcs', label: 'Cấp 2' },
    { value: 'thpt', label: 'Cấp 3' },
    { value: 'daihoc', label: 'Đại học' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: ADMIN.tint, border: `1px solid ${ADMIN.border}` }}
          >
            <BookOpen className="w-6 h-6" style={{ color: ADMIN.main }} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2 flex-wrap">
              <span>Kiểm duyệt & Quản lý Ngân hàng Đề thi</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold tabular-nums"
                style={{ backgroundColor: ADMIN.tint, color: ADMIN.main }}
              >
                {exams.length} đề
              </span>
            </h2>
            <p className="text-xs text-[#78716C]">
              Kiểm tra tính chính xác của đáp án, nội dung chuẩn Bộ GD&ĐT trước khi công bố
              học sinh.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {noticeMessage && (
            <motion.span
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 max-w-md"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{noticeMessage}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên đề thi, môn học, giáo viên..."
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 transition-all"
            style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] cursor-pointer"
              aria-label="Xoá tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-xl text-xs overflow-x-auto no-scrollbar max-w-full">
          <span className="text-[11px] font-bold text-[#78716C] px-2 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Cấp học:
          </span>
          {levels.map((lvl) => {
            const isActive = levelFilter === lvl.value;
            return (
              <button
                key={lvl.value}
                type="button"
                onClick={() => setLevelFilter(lvl.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-white shadow-sm' : 'text-[#57534E] hover:text-[#0F172A]'
                }`}
                style={isActive ? { color: ADMIN.main } : undefined}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
        className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#57534E] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Tên đề thi & Môn học</th>
                <th className="py-3 px-4">Cấp học</th>
                <th className="py-3 px-4">Người biên soạn</th>
                <th className="py-3 px-4 text-center">Số câu</th>
                <th className="py-3 px-4 text-center">Thời gian</th>
                <th className="py-3 px-4 text-center">Nhãn kiểm duyệt</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {!hasResults ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-6 h-6 text-[#A8A29E]" />
                    </div>
                    <p className="font-bold text-[#0F172A] text-sm">
                      {hasAnyExam
                        ? 'Không tìm thấy đề thi phù hợp bộ lọc'
                        : 'Chưa có đề thi nào trong thư viện'}
                    </p>
                    <p className="text-[11px] text-[#78716C] mt-1 max-w-md mx-auto">
                      {hasAnyExam
                        ? 'Thử xoá từ khóa hoặc chọn cấp học khác.'
                        : 'Đề thi do giáo viên tạo sẽ xuất hiện tại đây để chờ duyệt.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam, idx) => {
                  const isVerified = isVerifiedTag(exam);
                  return (
                    <motion.tr
                      key={exam.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.15) }}
                      className="hover:bg-[#FAFAF9]/70 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A] line-clamp-1">
                          {exam.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[11px] font-semibold"
                            style={{ color: BRAND }}
                          >
                            {exam.subjectLabel}
                          </span>
                          <span className="text-[10px] text-[#A8A29E] font-mono truncate max-w-[120px]">
                            #{exam.id}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <LevelBadge level={exam.educationLevel} />
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#0F172A]">
                          {exam.authorName || 'Ban Khảo thí'}
                        </p>
                        <p className="text-[10px] text-[#A8A29E]">Giáo viên xác thực</p>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-[#0F172A] tabular-nums">
                        {exam.questions.length} câu
                      </td>

                      <td className="py-3.5 px-4 text-center text-[#57534E] tabular-nums">
                        {exam.durationMinutes} phút
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleToggleVerified(exam)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-[#F5F5F4] text-[#57534E] border-[#E7E5E4] hover:bg-[#E7E5E4]'
                          }`}
                          title={
                            isVerified
                              ? 'Bấm để gỡ nhãn kiểm duyệt'
                              : 'Bấm để gắn nhãn Chuẩn Bộ GD&ĐT'
                          }
                        >
                          {isVerified ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span>{isVerified ? 'Chuẩn Bộ (Đã duyệt)' : 'Chưa gắn nhãn'}</span>
                        </motion.button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewExam(exam)}
                            title="Làm thử / Xem trước đề thi"
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#0D5C75] hover:bg-[#E6F2F5] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(exam)}
                            title="Xóa đề thi khỏi thư viện"
                            className="p-1.5 rounded-lg text-[#A8A29E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5E4]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#0F172A]">Xóa đề thi?</h3>
                  <p className="text-xs text-[#78716C] mt-1">
                    Bạn sắp xóa vĩnh viễn đề thi sau khỏi thư viện. Hành động này{' '}
                    <strong className="text-rose-600">không thể hoàn tác</strong>.
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4]">
                    <p className="font-bold text-sm text-[#0F172A] line-clamp-2">
                      {deleteTarget.title}
                    </p>
                    <p className="text-[11px] text-[#78716C] mt-0.5">
                      {deleteTarget.questions.length} câu hỏi • {deleteTarget.durationMinutes} phút
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-[#F5F5F4]">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-[#57534E] hover:bg-[#F5F5F4] font-semibold text-xs cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa vĩnh viễn
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};