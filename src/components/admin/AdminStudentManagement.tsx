/**
 * ============================================================================
 * FILE: AdminStudentManagement.tsx — Vantrix AI
 * PHÂN HỆ: QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) — CRM HỌC SINH & SINH VIÊN
 * ĐƯỜNG DẪN: /src/components/admin/AdminStudentManagement.tsx
 * CHỨC NĂNG:
 *  - Xem, thêm, khoá/mở, xoá tài khoản học sinh 4 cấp học
 *  - Xem hồ sơ chi tiết dạng drawer
 *  - Xuất CSV báo cáo (escape đầy đủ, chống CSV injection)
 * GHI CHÚ: KHÔNG gọi localStorage.setItem — parent App.tsx đồng bộ state.
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppUser, AuditLog } from '../../types/admin';
import type { EducationLevel } from '../../types/quiz';
import {
  GraduationCap,
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
  Users,
} from 'lucide-react';

const STUDENT = {
  main: '#0D5C75',
  hover: '#084356',
  tint: '#E6F2F5',
  border: '#C7E5EA',
  deep: '#042F2E',
} as const;

const ADMIN_ACTOR = {
  name: 'Quản Trị Viên (Trí)',
  email: 'admin@vantrix.edu.vn',
};

type StatusFilter = 'all' | 'active' | 'suspended' | 'pending';
type LevelFilter = 'all' | EducationLevel;

interface AdminStudentManagementProps {
  users: AppUser[];
  onUpdateUsers: (newUsers: AppUser[]) => void;
  onAddAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

/** Escape theo chuẩn RFC 4180 để chống CSV injection. */
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
    tieuhoc: { label: 'Tiểu học', bg: '#FEF3C7', text: '#78350F', border: '#FDE68A' },
    thcs: { label: 'THCS', bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
    thpt: { label: 'THPT', bg: STUDENT.tint, text: STUDENT.main, border: STUDENT.border },
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

const KpiCard: React.FC<{ label: string; value: string | number; meta: string; tone: 'teal' | 'emerald' | 'rose' | 'amber' }> = ({
  label,
  value,
  meta,
  tone,
}) => {
  const tones = {
    teal: { color: STUDENT.main, meta: '#57534E' },
    emerald: { color: '#059669', meta: '#059669' },
    rose: { color: '#E11D48', meta: '#E11D48' },
    amber: { color: '#D97706', meta: '#D97706' },
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
export const AdminStudentManagement: React.FC<AdminStudentManagementProps> = ({
  users,
  onUpdateUsers,
  onAddAuditLog,
}) => {
  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AppUser | null>(null);
  const [lockConfirmUser, setLockConfirmUser] = useState<AppUser | null>(null);
  const [lockReason, setLockReason] = useState('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AppUser | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    educationLevel: 'thpt' as EducationLevel,
    gradeOrClass: 'Lớp 12A1',
    schoolOrOrg: 'THPT Chu Văn An',
    parentContact: '',
    notes: '',
  });

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.schoolOrOrg.toLowerCase().includes(q) ||
        s.gradeOrClass.toLowerCase().includes(q) ||
        (s.phone ?? '').includes(q);
      const matchLevel = levelFilter === 'all' || s.educationLevel === levelFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchLevel && matchStatus;
    });
  }, [students, searchQuery, levelFilter, statusFilter]);

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const suspendedStudents = students.filter((s) => s.status === 'suspended').length;
  const avgScore = totalStudents
    ? (students.reduce((a, s) => a + (s.averageScore || 0), 0) / totalStudents).toFixed(1)
    : '—';

  const hasAnyStudent = totalStudents > 0;
  const hasResults = filteredStudents.length > 0;

  /* ===== Actions ===== */
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newStudentForm.name.trim() || !newStudentForm.email.trim()) {
      setFormError('Vui lòng điền họ tên và email hợp lệ.');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === newStudentForm.email.trim().toLowerCase())) {
      setFormError('Email này đã được sử dụng trong hệ thống.');
      return;
    }

    const newStudent: AppUser = {
      id: `usr-std-${Date.now()}`,
      name: newStudentForm.name.trim(),
      email: newStudentForm.email.trim().toLowerCase(),
      phone: newStudentForm.phone.trim() || undefined,
      role: 'student',
      educationLevel: newStudentForm.educationLevel,
      gradeOrClass: newStudentForm.gradeOrClass.trim() || 'Lớp 12',
      schoolOrOrg: newStudentForm.schoolOrOrg.trim() || 'Trường THPT',
      status: 'active',
      joinedAt: Date.now(),
      lastLoginAt: Date.now(),
      examsTakenCount: 0,
      classesCount: 0,
      averageScore: 0,
      notes:
        newStudentForm.notes ||
        (newStudentForm.parentContact ? `PH: ${newStudentForm.parentContact}` : undefined),
    };

    onUpdateUsers([newStudent, ...users]);

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Thêm học sinh mới',
      target: newStudent.name,
      details: `Tạo tài khoản học sinh [${newStudent.educationLevel.toUpperCase()}] email ${newStudent.email}`,
      severity: 'info',
      category: 'user',
    });

    setIsAddModalOpen(false);
    setNewStudentForm({
      name: '',
      email: '',
      phone: '',
      educationLevel: 'thpt',
      gradeOrClass: 'Lớp 12A1',
      schoolOrOrg: 'THPT Chu Văn An',
      parentContact: '',
      notes: '',
    });
  };

  const handleToggleLockStudent = () => {
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
      action: isLocking ? 'Khóa tài khoản học sinh' : 'Mở khóa tài khoản học sinh',
      target: lockConfirmUser.name,
      details: isLocking
        ? `Lý do: ${lockReason || 'Vi phạm điều khoản thi cử'}`
        : 'Đã mở khóa học sinh hoạt động lại',
      severity: isLocking ? 'warning' : 'info',
      category: 'user',
    });

    setLockConfirmUser(null);
    setLockReason('');
  };

  const handleDeleteStudent = () => {
    if (!deleteConfirmUser) return;
    onUpdateUsers(users.filter((u) => u.id !== deleteConfirmUser.id));

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Xóa tài khoản học sinh',
      target: deleteConfirmUser.name,
      details: `Đã xóa học sinh ${deleteConfirmUser.email} khỏi cơ sở dữ liệu`,
      severity: 'critical',
      category: 'user',
    });

    if (selectedStudent?.id === deleteConfirmUser.id) setSelectedStudent(null);
    setDeleteConfirmUser(null);
  };

  const handleExportCsv = () => {
    if (!hasResults) return;

    const headers = [
      'ID', 'Họ Tên', 'Email', 'Điện Thoại', 'Cấp Học',
      'Lớp', 'Trường Học', 'Trạng Thái', 'Đề Đã Làm', 'Điểm TB', 'Ghi Chú',
    ];
    const rows = filteredStudents.map((s) => [
      escapeCsv(s.id),
      escapeCsv(s.name),
      escapeCsv(s.email),
      escapeCsv(s.phone ?? ''),
      s.educationLevel.toUpperCase(),
      escapeCsv(s.gradeOrClass),
      escapeCsv(s.schoolOrOrg),
      s.status === 'active' ? 'Hoạt động' : s.status === 'suspended' ? 'Bị khóa' : 'Chờ duyệt',
      s.examsTakenCount,
      s.averageScore ?? '',
      escapeCsv(s.notes ?? ''),
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Hoc_Sinh_Vantrix_${new Date().toISOString().slice(0, 10)}.csv`;
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
            style={{ backgroundColor: STUDENT.tint, border: `1px solid ${STUDENT.border}` }}
          >
            <GraduationCap className="w-6 h-6" style={{ color: STUDENT.main }} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2 flex-wrap">
              <span>Quản lý Học sinh & Sinh viên</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold tabular-nums"
                style={{ backgroundColor: STUDENT.tint, color: STUDENT.main }}
              >
                {totalStudents} học viên
              </span>
            </h2>
            <p className="text-xs text-[#78716C]">
              Phân hệ CRM toàn bộ người học từ Cấp 1, Cấp 2, Cấp 3 đến Đại học
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
            style={{ backgroundColor: STUDENT.main }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = STUDENT.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = STUDENT.main)}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Học sinh</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Tổng học sinh" value={totalStudents} meta="Toàn bộ các cấp học" tone="teal" />
        <KpiCard label="Đang hoạt động" value={activeStudents} meta="Tài khoản chuẩn" tone="emerald" />
        <KpiCard label="Tài khoản bị khóa" value={suspendedStudents} meta="Cần xử lý vi phạm" tone="rose" />
        <KpiCard label="Điểm TB hệ thống" value={`${avgScore}/10`} meta="Năng lực trung bình" tone="amber" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, trường, lớp, SĐT..."
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 transition-all"
            style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
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
              <Filter className="w-3 h-3" /> Cấp:
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
                  style={isActive ? { color: STUDENT.main } : undefined}
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
                  style={isActive ? { color: STUDENT.main } : undefined}
                >
                  {st === 'all' ? 'Tất cả' : st === 'active' ? 'Hoạt động' : 'Bị khóa'}
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
                <th className="py-3 px-4">Học sinh / Sinh viên</th>
                <th className="py-3 px-4">Cấp & Trường lớp</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4 text-center">Đề đã làm</th>
                <th className="py-3 px-4 text-center">Điểm TB</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {!hasResults ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-2">
                      <GraduationCap className="w-6 h-6 text-[#A8A29E]" />
                    </div>
                    <p className="font-bold text-[#0F172A] text-sm">
                      {hasAnyStudent ? 'Không tìm thấy học sinh phù hợp' : 'Chưa có học sinh nào'}
                    </p>
                    <p className="text-[11px] text-[#78716C] mt-1 max-w-md mx-auto">
                      {hasAnyStudent
                        ? 'Thử xoá từ khóa hoặc chọn bộ lọc khác.'
                        : 'Bấm "Thêm Học sinh" để tạo tài khoản đầu tiên.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.15) }}
                    className="hover:bg-[#FAFAF9]/70 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0"
                          style={{ backgroundColor: STUDENT.main }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#0F172A] truncate">{student.name}</div>
                          <span className="text-[11px] text-[#78716C] font-mono truncate block">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <LevelBadge level={student.educationLevel} />
                          <span className="font-semibold text-[#0F172A]">{student.gradeOrClass}</span>
                        </div>
                        <p className="text-[11px] text-[#78716C] truncate max-w-[200px]">
                          {student.schoolOrOrg}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[#57534E]">
                        {student.phone ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-[#A8A29E]" />
                            <span>{student.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#A8A29E] italic">Chưa có SĐT</span>
                        )}
                        {student.notes && (
                          <p
                            className="text-[10px] px-1.5 py-0.5 rounded-md inline-block truncate max-w-[180px]"
                            style={{ backgroundColor: STUDENT.tint, color: STUDENT.main }}
                          >
                            {student.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-[#0F172A] tabular-nums">{student.examsTakenCount}</span>
                      <span className="text-[10px] text-[#A8A29E] block">bài thi</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-black text-xs tabular-nums ${
                          (student.averageScore || 0) >= 8.5
                            ? 'bg-emerald-100 text-emerald-800'
                            : (student.averageScore || 0) >= 6.5
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {student.averageScore ? `${student.averageScore}/10` : '---'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {student.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Hoạt động
                        </span>
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
                          onClick={() => setSelectedStudent(student)}
                          title="Xem hồ sơ"
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-[#0D5C75] hover:bg-[#E6F2F5] transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLockConfirmUser(student)}
                          title={student.status === 'active' ? 'Khóa' : 'Mở khóa'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            student.status === 'active'
                              ? 'text-[#78716C] hover:text-amber-600 hover:bg-amber-50'
                              : 'text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          {student.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmUser(student)}
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
                <GraduationCap className="w-5 h-5" style={{ color: STUDENT.main }} />
                <h3 className="font-bold text-[#0F172A] text-sm">Thêm Học sinh / Sinh viên</h3>
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

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#57534E] mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Minh Quân"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    placeholder="minhquan@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Cấp học</label>
                  <select
                    value={newStudentForm.educationLevel}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, educationLevel: e.target.value as EducationLevel })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 bg-white"
                    style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
                  >
                    <option value="tieuhoc">Tiểu học (Lớp 1–5)</option>
                    <option value="thcs">THCS (Lớp 6–9)</option>
                    <option value="thpt">THPT (Lớp 10–12)</option>
                    <option value="daihoc">Đại học / Cao đẳng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#57534E] mb-1">Lớp / Khóa</label>
                  <input
                    type="text"
                    value={newStudentForm.gradeOrClass}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, gradeOrClass: e.target.value })}
                    placeholder="Lớp 12A1 / K23 CNTT"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                    style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#57534E] mb-1">Trường đang học</label>
                <input
                  type="text"
                  value={newStudentForm.schoolOrOrg}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, schoolOrOrg: e.target.value })}
                  placeholder="THPT Chu Văn An Hà Nội"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
                />
              </div>

              <div>
                <label className="block font-bold text-[#57534E] mb-1">SĐT Phụ huynh / Người bảo hộ</label>
                <input
                  type="text"
                  value={newStudentForm.parentContact}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, parentContact: e.target.value })}
                  placeholder="Mẹ — 0988.123.456"
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as string]: `${STUDENT.main}33` }}
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
                  style={{ backgroundColor: STUDENT.main }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Lưu & Tạo tài khoản
                </motion.button>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Profile Drawer */}
      <AnimatePresence>
        {selectedStudent && (
          <DrawerShell onClose={() => setSelectedStudent(null)}>
            <div className="flex items-center justify-between pb-4 border-b border-[#F5F5F4]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" style={{ color: STUDENT.main }} />
                <h3 className="font-black text-[#0F172A] text-base">Hồ sơ Học sinh</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-[#A8A29E] hover:text-[#57534E] p-1 rounded-lg cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#FAFAF9] p-4 rounded-2xl border border-[#E7E5E4]">
              <div
                className="w-14 h-14 rounded-2xl text-white font-black text-xl flex items-center justify-center shadow-md shrink-0"
                style={{ backgroundColor: STUDENT.main }}
              >
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-[#0F172A] text-base truncate">{selectedStudent.name}</h4>
                <p className="text-xs text-[#78716C] font-mono truncate">{selectedStudent.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <LevelBadge level={selectedStudent.educationLevel} />
                  <span className="text-[11px] font-bold text-[#57534E]">{selectedStudent.gradeOrClass}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: STUDENT.tint, border: `1px solid ${STUDENT.border}` }}>
                <p className="text-[10px] font-bold uppercase" style={{ color: STUDENT.main }}>
                  Đề đã hoàn thành
                </p>
                <p className="text-xl font-black mt-0.5" style={{ color: STUDENT.deep }}>
                  {selectedStudent.examsTakenCount}
                </p>
              </div>
              <div className="p-3 rounded-xl text-center bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Điểm trung bình</p>
                <p className="text-xl font-black text-emerald-950 mt-0.5">
                  {selectedStudent.averageScore ? `${selectedStudent.averageScore}/10` : '---'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Trường đang học', value: selectedStudent.schoolOrOrg },
                { label: 'Số điện thoại', value: selectedStudent.phone || 'Chưa cập nhật' },
                {
                  label: 'Ngày đăng ký',
                  value: new Date(selectedStudent.joinedAt).toLocaleDateString('vi-VN'),
                },
                {
                  label: 'Trạng thái',
                  value: selectedStudent.status === 'active' ? 'Đang hoạt động' : 'Đang bị tạm khóa',
                  color: selectedStudent.status === 'active' ? 'text-emerald-600' : 'text-rose-600',
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-[#F5F5F4] gap-3">
                  <span className="text-[#78716C] shrink-0">{row.label}:</span>
                  <span className={`font-semibold text-right truncate ${row.color ?? 'text-[#0F172A]'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
              {selectedStudent.notes && (
                <div className="py-2">
                  <span className="text-[#78716C] block mb-1">Ghi chú quản trị:</span>
                  <p className="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-medium">
                    {selectedStudent.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[#F5F5F4] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setLockConfirmUser(selectedStudent);
                  setSelectedStudent(null);
                }}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  selectedStudent.status === 'active'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {selectedStudent.status === 'active' ? (
                  <>
                    <Lock className="w-4 h-4" /> Khóa tài khoản
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" /> Mở khóa tài khoản
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
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
                  {lockConfirmUser.status === 'active' ? 'Khóa tài khoản học sinh?' : 'Mở khóa tài khoản?'}
                </h4>
                <p className="text-xs text-[#78716C] font-semibold">{lockConfirmUser.name}</p>
              </div>
            </div>

            {lockConfirmUser.status === 'active' && (
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">Lý do khóa</label>
                <input
                  type="text"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Ví dụ: Gian lận thi cử, spam hệ thống..."
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
                onClick={handleToggleLockStudent}
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
                <h4 className="font-bold text-[#0F172A] text-sm">Xóa học sinh này?</h4>
                <p className="text-xs text-[#78716C] font-semibold">{deleteConfirmUser.name}</p>
              </div>
            </div>
            <p className="text-xs text-[#57534E]">
              Hành động này không thể hoàn tác. Mọi kết quả bài thi và sổ lỗi của học sinh sẽ bị xóa vĩnh viễn.
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
                onClick={handleDeleteStudent}
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