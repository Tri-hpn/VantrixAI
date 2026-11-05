/**
 * ============================================================================
 * FILE: AdminTeacherManagement.tsx — Vantrix AI
 * PHÂN HỆ: QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) — CRM GIÁO VIÊN & GIẢNG VIÊN
 * ĐƯỜNG DẪN: /src/components/admin/AdminTeacherManagement.tsx
 * FIX: Bọc <ShieldCheck> trong <span title="..."> để tránh lỗi TS.
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppUser, AuditLog } from '../../types/admin';
import type { EducationLevel } from '../../types/quiz';
import {
  School,
  Search,
  Filter,
  Plus,
  Lock,
  Unlock,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Phone,
  X,
  ChevronRight,
  ShieldCheck,
  BadgeAlert,
} from 'lucide-react';

const TEACHER = {
  main: '#B45309',
  hover: '#92400E',
  tint: '#FEF3C7',
  border: '#FDE68A',
  deep: '#78350F',
} as const;

const ADMIN_ACTOR = {
  name: 'Quản Trị Viên (Trí)',
  email: 'admin@vantrix.edu.vn',
};

type StatusFilter = 'all' | 'active' | 'suspended' | 'pending';
type LevelFilter = 'all' | EducationLevel;

interface AdminTeacherManagementProps {
  users: AppUser[];
  onUpdateUsers: (newUsers: AppUser[]) => void;
  onAddAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/* ============================================================================
 * Sub-components
 * ============================================================================ */
const LevelBadge: React.FC<{ level: EducationLevel }> = ({ level }) => {
  const map: Record<EducationLevel, { label: string; bg: string; text: string; border: string }> = {
    tieuhoc: { label: 'Cấp 1', bg: '#FEF3C7', text: '#78350F', border: '#FDE68A' },
    thcs: { label: 'Cấp 2', bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
    thpt: { label: 'Cấp 3', bg: TEACHER.tint, text: TEACHER.deep, border: TEACHER.border },
    daihoc: { label: 'Đại học', bg: '#F3E8FF', text: '#4C1D95', border: '#DDD6FE' },
  };
  const c = map[level] ?? map.thpt;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
};

const KpiCard: React.FC<{ label: string; value: string | number; meta: string; tone: 'amber' | 'emerald' | 'indigo' | 'rose' }> = ({
  label,
  value,
  meta,
  tone,
}) => {
  const tones = {
    amber: { color: '#D97706', meta: '#D97706' },
    emerald: { color: '#059669', meta: '#059669' },
    indigo: { color: '#4F46E5', meta: '#4F46E5' },
    rose: { color: '#E11D48', meta: '#E11D48' },
  } as const;
  const t = tones[tone];
  return (
    <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-sm">
      <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black mt-1 tabular-nums" style={{ color: t.color }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: t.meta }}>{meta}</p>
    </div>
  );
};

/* ============================================================================
 * Main
 * ============================================================================ */
export const AdminTeacherManagement: React.FC<AdminTeacherManagementProps> = ({
  users,
  onUpdateUsers,
  onAddAuditLog,
}) => {
  const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<AppUser | null>(null);
  const [lockConfirmUser, setLockConfirmUser] = useState<AppUser | null>(null);
  const [lockReason, setLockReason] = useState('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AppUser | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    educationLevel: 'thpt' as EducationLevel,
    subjectTitle: 'Toán học & Luyện thi',
    schoolOrOrg: 'THPT Chuyên Hà Nội - Amsterdam',
    notes: 'Giáo viên bộ môn Toán',
  });

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.schoolOrOrg.toLowerCase().includes(q) ||
        t.gradeOrClass.toLowerCase().includes(q) ||
        (t.phone ?? '').includes(q);
      const matchLevel = levelFilter === 'all' || t.educationLevel === levelFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchLevel && matchStatus;
    });
  }, [teachers, searchQuery, levelFilter, statusFilter]);

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === 'active').length;
  const pendingTeachers = teachers.filter((t) => t.status === 'pending').length;
  const totalClassesManaged = teachers.reduce((a, t) => a + (t.classesCount || 0), 0);

  const hasAnyTeacher = totalTeachers > 0;
  const hasResults = filteredTeachers.length > 0;

  /* ===== Actions ===== */
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTeacherForm.name.trim() || !newTeacherForm.email.trim()) {
      setFormError('Vui lòng điền họ tên và email hợp lệ.');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === newTeacherForm.email.trim().toLowerCase())) {
      setFormError('Email này đã được sử dụng trong hệ thống.');
      return;
    }

    const newTeacher: AppUser = {
      id: `usr-tch-${Date.now()}`,
      name: newTeacherForm.name.trim(),
      email: newTeacherForm.email.trim().toLowerCase(),
      phone: newTeacherForm.phone.trim() || undefined,
      role: 'teacher',
      educationLevel: newTeacherForm.educationLevel,
      gradeOrClass: newTeacherForm.subjectTitle.trim() || 'Giáo viên bộ môn',
      schoolOrOrg: newTeacherForm.schoolOrOrg.trim() || 'Trường học',
      status: 'active',
      joinedAt: Date.now(),
      lastLoginAt: Date.now(),
      examsTakenCount: 0,
      classesCount: 0,
      averageScore: 0,
      notes: newTeacherForm.notes.trim() || 'Đã xác minh thông tin chứng chỉ sư phạm',
    };

    onUpdateUsers([newTeacher, ...users]);

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Thêm giáo viên mới',
      target: newTeacher.name,
      details: `Kích hoạt tài khoản giảng viên môn ${newTeacher.gradeOrClass} trường ${newTeacher.schoolOrOrg}`,
      severity: 'info',
      category: 'user',
    });

    setIsAddModalOpen(false);
    setNewTeacherForm({
      name: '',
      email: '',
      phone: '',
      educationLevel: 'thpt',
      subjectTitle: 'Toán học & Luyện thi',
      schoolOrOrg: 'THPT Chuyên Hà Nội - Amsterdam',
      notes: 'Giáo viên bộ môn Toán',
    });
  };

  const handleToggleLockTeacher = () => {
    if (!lockConfirmUser) return;
    const isLocking = lockConfirmUser.status === 'active';

    onUpdateUsers(
      users.map((u) =>
        u.id === lockConfirmUser.id
          ? {
              ...u,
              status: (isLocking ? 'suspended' : 'active') as 'active' | 'suspended',
              notes: isLocking && lockReason ? `Khóa: ${lockReason}` : u.notes,
            }
          : u
      )
    );

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: isLocking ? 'Khóa tài khoản giáo viên' : 'Mở khóa tài khoản giáo viên',
      target: lockConfirmUser.name,
      details: isLocking
        ? `Lý do: ${lockReason || 'Cần kiểm tra lại tư cách sư phạm'}`
        : 'Đã mở khóa hoạt động lại',
      severity: isLocking ? 'warning' : 'info',
      category: 'user',
    });

    setLockConfirmUser(null);
    setLockReason('');
  };

  const handleDeleteTeacher = () => {
    if (!deleteConfirmUser) return;
    onUpdateUsers(users.filter((u) => u.id !== deleteConfirmUser.id));

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Xóa tài khoản giáo viên',
      target: deleteConfirmUser.name,
      details: `Đã xóa giáo viên ${deleteConfirmUser.email} khỏi cơ sở dữ liệu`,
      severity: 'critical',
      category: 'user',
    });

    if (selectedTeacher?.id === deleteConfirmUser.id) setSelectedTeacher(null);
    setDeleteConfirmUser(null);
  };

  const handleApproveTeacher = (teacher: AppUser) => {
    onUpdateUsers(
      users.map((u) =>
        u.id === teacher.id
          ? {
              ...u,
              status: 'active' as const,
              notes: `${u.notes ?? ''} | Đã duyệt hồ sơ ngày ${new Date().toLocaleDateString('vi-VN')}`.trim(),
            }
          : u
      )
    );

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Duyệt hồ sơ giáo viên',
      target: teacher.name,
      details: `Xác minh thành công tài khoản giáo viên ${teacher.email}`,
      severity: 'info',
      category: 'user',
    });
  };

  const handleExportCsv = () => {
    if (!hasResults) return;

    const headers = [
      'ID', 'Họ Tên', 'Email', 'Điện Thoại', 'Cấp Giảng Dạy',
      'Bộ Môn / Khoa', 'Trường / Đơn Vị', 'Trạng Thái',
      'Số Lớp', 'Đề Đã Tạo', 'Ghi Chú',
    ];
    const rows = filteredTeachers.map((t) => [
      escapeCsv(t.id),
      escapeCsv(t.name),
      escapeCsv(t.email),
      escapeCsv(t.phone ?? ''),
      t.educationLevel.toUpperCase(),
      escapeCsv(t.gradeOrClass),
      escapeCsv(t.schoolOrOrg),
      t.status === 'active' ? 'Đã duyệt' : t.status === 'pending' ? 'Chờ duyệt' : 'Bị khóa',
      t.classesCount ?? 0,
      t.examsTakenCount ?? 0,
      escapeCsv(t.notes ?? ''),
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Giao_Vien_Vantrix_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* ===== Render ===== */
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
            style={{ backgroundColor: TEACHER.tint, border: `1px solid ${TEACHER.border}` }}
          >
            <School className="w-6 h-6" style={{ color: TEACHER.main }} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2 flex-wrap">
              <span>Quản lý Giáo viên & Giảng viên</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold tabular-nums"
                style={{ backgroundColor: TEACHER.tint, color: TEACHER.deep }}
              >
                {totalTeachers} thầy cô
              </span>
            </h2>
            <p className="text-xs text-[#78716C]">
              CRM tài khoản giáo viên các cấp, giảng viên đại học và trung tâm luyện thi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!hasResults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] text-[#57534E] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV</span>
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            style={{ backgroundColor: TEACHER.main }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEACHER.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEACHER.main)}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Giáo viên</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Tổng thầy cô" value={totalTeachers} meta="Giáo viên & Giảng viên" tone="amber" />
        <KpiCard label="Đã xác minh" value={activeTeachers} meta="Được tạo lớp & giao đề" tone="emerald" />
        <KpiCard label="Lớp đang phụ trách" value={totalClassesManaged} meta="Phòng thi trực tuyến" tone="indigo" />
        <KpiCard label="Chờ duyệt hồ sơ" value={pendingTeachers} meta="Yêu cầu mở lớp" tone="rose" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên thầy cô, email, bộ môn, trường..."
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 transition-all"
            style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-xl text-xs overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-[#78716C] px-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Cấp dạy:
            </span>
            {(['all', 'tieuhoc', 'thcs', 'thpt', 'daihoc'] as const).map((lvl) => {
              const isActive = levelFilter === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-white shadow-sm' : 'text-[#57534E] hover:text-[#0F172A]'
                  }`}
                  style={isActive ? { color: TEACHER.main } : undefined}
                >
                  {lvl === 'all' ? 'Tất cả' : lvl === 'tieuhoc' ? 'Cấp 1' : lvl === 'thcs' ? 'Cấp 2' : lvl === 'thpt' ? 'Cấp 3' : 'ĐH'}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-xl text-xs">
            <span className="text-[11px] font-bold text-[#78716C] px-2 shrink-0">Trạng thái:</span>
            {(['all', 'active', 'suspended'] as const).map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-white shadow-sm' : 'text-[#57534E] hover:text-[#0F172A]'
                  }`}
                  style={isActive ? { color: TEACHER.main } : undefined}
                >
                  {st === 'all' ? 'Tất cả' : st === 'active' ? 'Đã duyệt' : 'Bị khóa'}
                </button>
              );
            })}
          </div>
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
                <th className="py-3 px-4">Giáo viên / Giảng viên</th>
                <th className="py-3 px-4">Bộ môn & Cấp dạy</th>
                <th className="py-3 px-4">Đơn vị công tác</th>
                <th className="py-3 px-4 text-center">Lớp phụ trách</th>
                <th className="py-3 px-4 text-center">Đề đã soạn</th>
                <th className="py-3 px-4 text-center">Xác thực</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {!hasResults ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-2">
                      <School className="w-6 h-6 text-[#A8A29E]" />
                    </div>
                    <p className="font-bold text-[#0F172A] text-sm">
                      {hasAnyTeacher ? 'Không tìm thấy giáo viên phù hợp' : 'Chưa có giáo viên nào'}
                    </p>
                    <p className="text-[11px] text-[#78716C] mt-1 max-w-md mx-auto">
                      {hasAnyTeacher
                        ? 'Thử xoá từ khóa hoặc chọn bộ lọc khác.'
                        : 'Bấm "Thêm Giáo viên" để tạo tài khoản đầu tiên.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, idx) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.15) }}
                    className="hover:bg-[#FAFAF9]/70 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0"
                          style={{ backgroundColor: TEACHER.main }}
                        >
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                            <span className="truncate">{teacher.name}</span>
                            {/* 🔧 FIXED: Bọc trong span để có tooltip, tránh lỗi TS trên Lucide icon */}
                            <span title="Đã xác thực" className="cursor-help">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            </span>
                          </div>
                          <span className="text-[11px] text-[#78716C] font-mono truncate block">
                            {teacher.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <LevelBadge level={teacher.educationLevel} />
                          <span className="font-semibold text-[#0F172A]">{teacher.gradeOrClass}</span>
                        </div>
                        {teacher.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-[#78716C]">
                            <Phone className="w-3 h-3 text-[#A8A29E]" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-[#57534E] font-medium truncate max-w-[200px]">
                        {teacher.schoolOrOrg}
                      </p>
                      {teacher.notes && (
                        <p
                          className="text-[10px] px-1.5 py-0.5 rounded-md inline-block mt-0.5 truncate max-w-[180px]"
                          style={{ backgroundColor: TEACHER.tint, color: TEACHER.deep }}
                        >
                          {teacher.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-[#0F172A] tabular-nums">{teacher.classesCount ?? 0}</span>
                      <span className="text-[10px] text-[#A8A29E] block">lớp học</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black tabular-nums" style={{ color: TEACHER.main }}>
                        {teacher.examsTakenCount ?? 0}
                      </span>
                      <span className="text-[10px] text-[#A8A29E] block">đề thi</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {teacher.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                        </span>
                      ) : teacher.status === 'pending' ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleApproveTeacher(teacher)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                        >
                          <BadgeAlert className="w-3 h-3" /> Phê duyệt
                        </motion.button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Lock className="w-3 h-3" /> Đang khóa
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTeacher(teacher)}
                          title="Xem hồ sơ"
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-[#B45309] hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLockConfirmUser(teacher)}
                          title={teacher.status === 'active' ? 'Khóa' : 'Mở khóa'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            teacher.status === 'active'
                              ? 'text-[#78716C] hover:text-amber-600 hover:bg-amber-50'
                              : 'text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          {teacher.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmUser(teacher)}
                          title="Xóa"
                          className="p-1.5 rounded-lg text-[#A8A29E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ModalShell onClose={() => setIsAddModalOpen(false)}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F4]">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5" style={{ color: TEACHER.main }} />
                <h3 className="font-bold text-[#0F172A] text-sm">Thêm Giáo viên / Giảng viên</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A8A29E] hover:text-[#57534E] p-1 rounded-lg cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#57534E] mb-1">Họ tên Thầy Cô / Học hàm *</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                  placeholder="Ví dụ: Thầy Trần Anh Tuấn (Thạc sĩ)"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newTeacherForm.email}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                    placeholder="tuan.tran@edu.vn"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newTeacherForm.phone}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                    placeholder="0987654321"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Cấp học phụ trách</label>
                  <select
                    value={newTeacherForm.educationLevel}
                    onChange={(e) =>
                      setNewTeacherForm({ ...newTeacherForm, educationLevel: e.target.value as EducationLevel })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 bg-white"
                    style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                  >
                    <option value="tieuhoc">Tiểu học (Lớp 1–5)</option>
                    <option value="thcs">THCS (Lớp 6–9)</option>
                    <option value="thpt">THPT (Lớp 10–12)</option>
                    <option value="daihoc">Đại học / Viện nghiên cứu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Bộ môn / Khoa</label>
                  <input
                    type="text"
                    value={newTeacherForm.subjectTitle}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, subjectTitle: e.target.value })}
                    placeholder="Toán giải tích / Tiếng Anh"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#57534E] mb-1">Trường / Cơ sở đào tạo</label>
                <input
                  type="text"
                  value={newTeacherForm.schoolOrOrg}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, schoolOrOrg: e.target.value })}
                  placeholder="THPT Chuyên Hà Nội - Amsterdam / ĐHQG Hà Nội"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                />
              </div>

              <div>
                <label className="block font-bold text-[#57534E] mb-1">Ghi chú xác thực hồ sơ</label>
                <input
                  type="text"
                  value={newTeacherForm.notes}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, notes: e.target.value })}
                  placeholder="Đã kiểm tra văn bằng Thạc sĩ Sư phạm"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                />
              </div>

              <div className="pt-4 border-t border-[#F5F5F4] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E7E5E4] text-[#57534E] font-bold hover:bg-[#FAFAF9] cursor-pointer"
                >
                  Hủy
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: TEACHER.main }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Lưu & Cấp quyền
                </motion.button>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Profile Drawer */}
      <AnimatePresence>
        {selectedTeacher && (
          <DrawerShell onClose={() => setSelectedTeacher(null)}>
            <div className="flex items-center justify-between pb-4 border-b border-[#F5F5F4]">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5" style={{ color: TEACHER.main }} />
                <h3 className="font-black text-[#0F172A] text-base">Hồ sơ Thầy Cô</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="text-[#A8A29E] hover:text-[#57534E] p-1 rounded-lg cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#FAFAF9] p-4 rounded-2xl border border-[#E7E5E4]">
              <div
                className="w-14 h-14 rounded-2xl text-white font-black text-xl flex items-center justify-center shadow-md shrink-0"
                style={{ backgroundColor: TEACHER.main }}
              >
                {selectedTeacher.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-[#0F172A] text-base flex items-center gap-1.5">
                  <span className="truncate">{selectedTeacher.name}</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                </h4>
                <p className="text-xs text-[#78716C] font-mono truncate">{selectedTeacher.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <LevelBadge level={selectedTeacher.educationLevel} />
                  <span className="text-[11px] font-bold text-[#57534E]">{selectedTeacher.gradeOrClass}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-3 rounded-xl text-center"
                style={{ backgroundColor: TEACHER.tint, border: `1px solid ${TEACHER.border}` }}
              >
                <p className="text-[10px] font-bold uppercase" style={{ color: TEACHER.deep }}>
                  Lớp học quản lý
                </p>
                <p className="text-xl font-black mt-0.5" style={{ color: TEACHER.deep }}>
                  {selectedTeacher.classesCount ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl text-center bg-indigo-50 border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-700 uppercase">Đề đã biên soạn</p>
                <p className="text-xl font-black text-indigo-950 mt-0.5">
                  {selectedTeacher.examsTakenCount ?? 0}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Đơn vị công tác', value: selectedTeacher.schoolOrOrg },
                { label: 'Số điện thoại', value: selectedTeacher.phone || 'Chưa cập nhật' },
                {
                  label: 'Ngày tham gia',
                  value: new Date(selectedTeacher.joinedAt).toLocaleDateString('vi-VN'),
                },
                {
                  label: 'Tình trạng xét duyệt',
                  value:
                    selectedTeacher.status === 'active'
                      ? 'Đã xác minh'
                      : selectedTeacher.status === 'pending'
                      ? 'Đang chờ duyệt'
                      : 'Đang bị tạm khóa',
                  color:
                    selectedTeacher.status === 'active'
                      ? 'text-emerald-600'
                      : selectedTeacher.status === 'pending'
                      ? 'text-amber-600'
                      : 'text-rose-600',
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-[#F5F5F4] gap-3">
                  <span className="text-[#78716C] shrink-0">{row.label}:</span>
                  <span className={`font-semibold text-right truncate ${row.color ?? 'text-[#0F172A]'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
              {selectedTeacher.notes && (
                <div className="py-2">
                  <span className="text-[#78716C] block mb-1">Ghi chú sư phạm:</span>
                  <p className="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-medium">
                    {selectedTeacher.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[#F5F5F4] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setLockConfirmUser(selectedTeacher);
                  setSelectedTeacher(null);
                }}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  selectedTeacher.status === 'active'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {selectedTeacher.status === 'active' ? (
                  <>
                    <Lock className="w-4 h-4" /> Tạm khóa tài khoản
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" /> Mở khóa tài khoản
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E7E5E4] text-[#57534E] font-bold text-xs hover:bg-[#FAFAF9] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </DrawerShell>
        )}
      </AnimatePresence>

      {/* Lock Confirm Modal */}
      <AnimatePresence>
        {lockConfirmUser && (
          <ModalShell onClose={() => setLockConfirmUser(null)} maxWidth="max-w-sm" bodyClassName="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm">
                  {lockConfirmUser.status === 'active' ? 'Khóa tài khoản giáo viên?' : 'Mở khóa tài khoản?'}
                </h4>
                <p className="text-xs text-[#78716C] font-semibold">{lockConfirmUser.name}</p>
              </div>
            </div>

            {lockConfirmUser.status === 'active' && (
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">Lý do tạm khóa</label>
                <input
                  type="text"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra bản quyền đề thi..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as string]: '#D9770633' }}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLockConfirmUser(null)}
                className="px-4 py-2 rounded-xl border border-[#E7E5E4] text-[#57534E] text-xs font-bold hover:bg-[#FAFAF9] cursor-pointer"
              >
                Hủy
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleToggleLockTeacher}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer ${
                  lockConfirmUser.status === 'active' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Xác nhận
              </motion.button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <ModalShell onClose={() => setDeleteConfirmUser(null)} maxWidth="max-w-sm" bodyClassName="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-sm">Xóa tài khoản thầy cô?</h4>
                <p className="text-xs text-[#78716C] font-semibold">{deleteConfirmUser.name}</p>
              </div>
            </div>
            <p className="text-xs text-[#57534E]">
              Hành động này không thể hoàn tác. Các lớp học và đề thi do thầy cô tạo sẽ được chuyển sang chế độ lưu trữ.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl border border-[#E7E5E4] text-[#57534E] text-xs font-bold hover:bg-[#FAFAF9] cursor-pointer"
              >
                Hủy
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleDeleteTeacher}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Xóa vĩnh viễn
              </motion.button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================================
 * ModalShell / DrawerShell — wrapper chung
 * ============================================================================ */
const ModalShell: React.FC<{
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  bodyClassName?: string;
}> = ({ onClose, children, maxWidth = 'max-w-lg', bodyClassName = 'p-6 space-y-4 text-xs' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      className={`bg-white rounded-2xl ${maxWidth} w-full border border-[#E7E5E4] shadow-2xl overflow-hidden`}
    >
      <div className={bodyClassName}>{children}</div>
    </motion.div>
  </motion.div>
);

const DrawerShell: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
    onClick={onClose}
  >
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col gap-5"
    >
      {children}
    </motion.div>
  </motion.div>
);