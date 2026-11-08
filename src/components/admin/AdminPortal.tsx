/**
 * ============================================================================
 * FILE: AdminPortal.tsx — Vantrix AI
 * PHÂN HỆ: QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN DASHBOARD & ARCHITECTURE)
 * ĐƯỜNG DẪN: /src/components/admin/AdminPortal.tsx
 * KIẾN TRÚC & GIAO DIỆN:
 *  - Áp dụng cấu trúc chuẩn Reference Dashboard (Image 2) trên dữ liệu thực tế Vantrix AI:
 *    A. Sidebar bên trái (Left Column):
 *       + Chiều cao 100vh, nền trắng tinh tế (bg-white), viền phải border-slate-200.
 *       + Logo Vantrix AI v2.5 Pro ở góc trên cùng.
 *       + Menu điều hướng phân nhóm rõ ràng (MAIN MENU, QUẢN LÝ DỮ LIỆU, CẤU HÌNH & HỆ THỐNG).
 *       + Active item có background highlight xanh ngọc (bg-teal-50 text-teal-800 border-r-2 border-teal-600).
 *       + User Profile Card (Sam Smith / Tran Van Tri) được ghim chặt ở đáy (mt-auto / absolute bottom).
 *    B. Top Bar (Header):
 *       + Tối giản, thanh lịch, nền trắng (bg-white border-b border-slate-200).
 *       + Thanh tìm kiếm trung tâm rộng rãi, tinh tế (bg-slate-100 rounded-lg max-w-lg).
 *       + Cụm nút tác vụ nhanh bên phải (Trạng thái Uptime, Nút thêm mới, Thông báo, Cài đặt).
 *    C. Main Content Area:
 *       + Nền xám ấm nhạt (bg-[#F9FAFB]).
 *       + Hàng đầu: 4 thẻ KPI riêng biệt có trend badges (Tổng người dùng, Đề thi, Lượt nộp, Dung lượng lưu trữ).
 *       + Thân trang chia lưới 2 cột:
 *         * Cột rộng (Trái): Bảng Nhật ký kiểm toán & An toàn hệ thống (Audit Logs) mật độ cao, lọc và xuất CSV.
 *         * Cột hẹp (Phải): Dòng hoạt động trực tiếp (Recent Activity), Nhiệm vụ chờ xử lý & Sức khỏe hệ thống (System Health).
 *    D. Tích hợp chuyển đổi mượt sang các phân hệ chi tiết: Học sinh, Giáo viên, Duyệt đề, Cấu hình.
 * ============================================================================
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppUser, SystemSettings, AuditLog, SystemMetric } from '../../types/admin';
import type { Exam, Classroom } from '../../types/quiz';
import { AdminStudentManagement } from './AdminStudentManagement';
import { AdminTeacherManagement } from './AdminTeacherManagement';
import { AdminExamModeration } from './AdminExamModeration';
import { AdminSystemSettings } from './AdminSystemSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  FileText,
  Sliders,
  Shield,
  Search,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Globe,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Download,
  Filter,
  Plus,
  RefreshCw,
  LogOut,
  Sparkles,
  ChevronRight,
  Server,
  FileCheck,
  UserCheck,
  Layers,
  ArrowRight,
  Trash2,
  TrendingUp,
  Copy,
  BookOpen,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'exams'
  | 'settings'
  | 'logs';

export interface AdminPortalProps {
  users: AppUser[];
  onUpdateUsers: (newUsers: AppUser[]) => void;
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (newSettings: SystemSettings) => void;
  auditLogs: AuditLog[];
  onAddAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  systemMetrics: SystemMetric;
  exams: Exam[];
  onUpdateExams: (newExams: Exam[]) => void;
  onPreviewExam: (exam: Exam) => void;
  classrooms?: Classroom[];
  onUpdateClassrooms?: (newClasses: Classroom[]) => void;
  activeTab?: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
  onExitAdmin?: () => void;
  onChangeRole?: (role: 'student' | 'teacher' | 'admin') => void;
  currentUser?: AppUser | null;
  currentRole?: 'student' | 'teacher' | 'admin';
  onOpenProfile?: () => void;
  onOpenNotificationCenter?: () => void;
  onLogout?: () => void;
  unreadNotificationCount?: number;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  users,
  onUpdateUsers,
  systemSettings,
  onUpdateSystemSettings,
  auditLogs,
  onAddAuditLog,
  systemMetrics,
  exams,
  onUpdateExams,
  onPreviewExam,
  classrooms = [],
  onUpdateClassrooms,
  activeTab: controlledTab,
  onSelectTab,
  onExitAdmin,
  onChangeRole,
  currentUser,
  currentRole = 'admin',
  onOpenProfile,
  onOpenNotificationCenter,
  onLogout,
  unreadNotificationCount,
  onOpenAuth,
}) => {
  const [internalTab, setInternalTab] = useState<AdminTab>('overview');
  const isControlled = controlledTab !== undefined;
  const activeTab = isControlled ? controlledTab : internalTab;

  const setActiveTab = (tab: AdminTab) => {
    if (!isControlled) setInternalTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  // State popover cài đặt theo hình 2
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const settingsPopoverRef = useRef<HTMLDivElement>(null);

  // Cài đặt nhanh dùng chung cho cả 3 trang
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'compact'>('light');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsPopoverRef.current && !settingsPopoverRef.current.contains(event.target as Node)) {
        setShowSettingsPopover(false);
      }
    };
    if (showSettingsPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsPopover]);

  // Top Bar Search
  const [searchQuery, setSearchQuery] = useState('');

  // Audit Logs Filter inside Overview
  const [logCategoryFilter, setLogCategoryFilter] = useState<'all' | 'user' | 'exam' | 'system' | 'ai'>('all');
  const [logSeverityFilter, setLogSeverityFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  const [logTimeRangeFilter, setLogTimeRangeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Quick Action notification popup simulation
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const triggerToast = (msg: string) => {
    setNotificationMessage(msg);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3500);
  };

  // Classrooms Filter & Management inside Admin
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [classLevelFilter, setClassLevelFilter] = useState<'all' | string>('all');
  const [copiedClassCode, setCopiedClassCode] = useState<string | null>(null);
  const [selectedClassStudents, setSelectedClassStudents] = useState<Classroom | null>(null);

  const filteredClassrooms = useMemo(() => {
    const q = classSearchQuery.trim().toLowerCase();
    return classrooms.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q) ||
        c.teacherEmail.toLowerCase().includes(q);
      const matchLevel = classLevelFilter === 'all' || c.educationLevel === classLevelFilter;
      return matchSearch && matchLevel;
    });
  }, [classrooms, classSearchQuery, classLevelFilter]);

  const handleCopyClassCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedClassCode(code);
    triggerToast(`Đã sao chép mã lớp "${code}" vào clipboard!`);
    setTimeout(() => setCopiedClassCode(null), 2500);
  };

  const handleDeleteClassroom = (classId: string) => {
    if (!onUpdateClassrooms) return;
    const target = classrooms.find((c) => c.id === classId);
    if (!window.confirm(`Bạn có chắc muốn xóa/lưu trữ lớp "${target?.name}"?`)) return;
    onUpdateClassrooms(classrooms.filter((c) => c.id !== classId));
    onAddAuditLog({
      adminName: currentUser?.name || 'Trần Văn Trí (Admin)',
      adminEmail: currentUser?.email || 'admin@vantrix.edu.vn',
      action: 'Xóa lớp học',
      target: target?.name || classId,
      details: `Đã lưu trữ lớp học mã ${target?.code} của giáo viên ${target?.teacherName}`,
      severity: 'warning',
      category: 'system',
    });
    triggerToast(`Đã xóa/lưu trữ lớp thành công.`);
  };

  // Metrics Calculations
  const studentCount = useMemo(() => users.filter((u) => u.role === 'student').length, [users]);
  const teacherCount = useMemo(() => users.filter((u) => u.role === 'teacher').length, [users]);
  const pendingApprovals = useMemo(() => users.filter((u) => u.status === 'pending').length, [users]);
  const pendingExams = useMemo(() => exams.filter((e) => e.createdBy === 'user' || e.createdBy === 'teacher').length, [exams]);

  // Storage calculation
  const storagePercentage = useMemo(() => {
    if (!systemMetrics.storageLimitMb) return 24;
    return Math.min(100, Math.round((systemMetrics.storageUsedMb / systemMetrics.storageLimitMb) * 100));
  }, [systemMetrics]);

  // Filtered logs for the embedded table
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchCategory = logCategoryFilter === 'all' || log.category === logCategoryFilter;
      const matchSeverity =
        logSeverityFilter === 'all' ||
        (logSeverityFilter === 'info' && log.severity === 'info') ||
        (logSeverityFilter === 'warning' && log.severity === 'warning') ||
        ((logSeverityFilter === 'error' || logSeverityFilter === 'critical') && (log.severity === 'critical' || log.severity === 'error'));

      let matchTime = true;
      if (logTimeRangeFilter === 'today') {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        matchTime = log.timestamp >= startOfToday;
      } else if (logTimeRangeFilter === '7days') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchTime = log.timestamp >= sevenDaysAgo;
      } else if (logTimeRangeFilter === '30days') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        matchTime = log.timestamp >= thirtyDaysAgo;
      }

      const matchSearch =
        !logSearchQuery.trim() ||
        log.adminName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(logSearchQuery.toLowerCase());
      return matchCategory && matchSeverity && matchTime && matchSearch;
    });
  }, [auditLogs, logCategoryFilter, logSeverityFilter, logTimeRangeFilter, logSearchQuery]);

  // Export CSV helper for audit logs
  const handleExportCsv = () => {
    const headers = ['Thời gian', 'Quản trị viên', 'Email', 'Danh mục', 'Mức độ', 'Thao tác', 'Mục tiêu', 'Chi tiết'];
    const rows = filteredAuditLogs.map((l) => [
      new Date(l.timestamp).toLocaleString('vi-VN'),
      l.adminName,
      l.adminEmail,
      l.category,
      l.severity,
      l.action,
      l.target,
      l.details.replace(/"/g, '""'),
    ]);
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vantrix_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Đã xuất thành công file báo cáo CSV Nhật ký kiểm toán!');
  };

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] text-slate-800 overflow-hidden font-sans antialiased">
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================================
          A. THE SIDEBAR (LEFT COLUMN) — RECTANGULAR, CLEAN WHITE & ANCHORED USER
          ====================================================================== */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none z-20">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Brand */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Vantrix <span className="text-teal-600">AI</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Hệ thống Khảo thí Toàn cấp</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-4 space-y-6">
            {/* Section 1: MAIN MENU */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                MAIN MENU
              </div>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-teal-50 text-teal-800 font-bold border-r-2 border-teal-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>Tổng quan (Overview)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'logs'
                      ? 'bg-teal-50 text-teal-800 font-bold border-r-2 border-teal-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className={`w-4 h-4 ${activeTab === 'logs' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>Nhật ký & An toàn</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {auditLogs.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Section 2: MANAGEMENT & DATA */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                QUẢN LÝ DỮ LIỆU
              </div>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'students'
                      ? 'bg-teal-50 text-teal-800 font-bold border-r-2 border-teal-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`w-4 h-4 ${activeTab === 'students' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>Học sinh & Lớp học</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold">
                    {studentCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('teachers')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'teachers'
                      ? 'bg-teal-50 text-teal-800 font-bold border-r-2 border-teal-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <School className={`w-4 h-4 ${activeTab === 'teachers' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>Giáo viên & Quyền hạn</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {teacherCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('classes')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'classes'
                      ? 'bg-teal-50 text-teal-800 font-bold border-r-2 border-teal-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 ${activeTab === 'classes' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>Lớp học Toàn Trường</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {classrooms.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'exams'
                      ? 'bg-teal-50 text-teal-800 font-bold border-r-2 border-teal-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${activeTab === 'exams' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>Ngân hàng Đề thi</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {exams.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Section 3: SYSTEM SETTINGS */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CẤU HÌNH & HỆ THỐNG
              </div>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-teal-50 text-teal-800 font-bold border-r-2 border-teal-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Sliders className={`w-4 h-4 ${activeTab === 'settings' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>Cài đặt & Gemini AI</span>
                </button>
              </nav>
            </div>

            {/* Section 4: PORTAL SWITCH */}
            {onExitAdmin && (
              <div>
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CỔNG THI & HỌC SINH
                </div>
                <nav className="space-y-0.5">
                  <button
                    type="button"
                    onClick={onExitAdmin}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
                    <span>Về Thư Viện Đề Thi</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Server Status Indicator */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-slate-50 to-teal-50/50 border border-teal-100/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-800">Trạng thái máy chủ</span>
          </div>
          <div className="text-[10px] text-slate-500 mb-2 leading-relaxed">
            Gemini 2.5 Flash Engine đang hoạt động ổn định 99.98%.
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${storagePercentage}%` }} />
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
            <span>Ổ đĩa đã dùng: {systemMetrics.storageUsedMb}MB</span>
            <span>{storagePercentage}%</span>
          </div>
        </div>

        {/* User Profile Card — ANCHORED AT ABSOLUTE BOTTOM */}
        <div className="p-3 border-t border-slate-200 bg-white relative" ref={settingsPopoverRef}>
          {/* Settings Popover like Image 2 */}
          <AnimatePresence>
            {showSettingsPopover && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-2 left-2 w-76 bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-3.5 z-50 text-xs"
              >
                {/* Header info */}
                <div className="pb-3 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-extrabold text-slate-900 text-sm truncate max-w-[190px]">
                      {currentUser ? currentUser.name : 'Thầy Nguyễn Văn Trí'}
                    </p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mb-2">
                    {currentUser?.email || 'vantritran518@gmail.com'}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {currentUser?.gradeOrClass || 'Khối 12 Chuyên'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 truncate max-w-[150px]">
                      {currentUser?.schoolOrOrg || 'THPT Chuyên Hà Nội - Ams'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsPopover(false);
                      if (onOpenProfile) onOpenProfile();
                      else setActiveTab('settings');
                    }}
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm shadow-teal-700/20"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-xs">Xem & Sửa Hồ Sơ</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Switch Role Section */}
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    CHUYỂN VAI TRÒ TRẢI NGHIỆM:
                  </p>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onChangeRole?.('student');
                        setShowSettingsPopover(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg font-semibold flex items-center justify-between transition-colors hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-teal-600" />
                        <span>Học sinh / Sinh viên</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onChangeRole?.('teacher');
                        setShowSettingsPopover(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg font-semibold flex items-center justify-between transition-colors hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-amber-600" />
                        <span>Giáo viên / Giảng viên</span>
                      </div>
                    </button>

                    <div className="w-full py-1.5 px-2.5 rounded-lg font-bold flex items-center justify-between bg-purple-50 text-purple-900 border border-purple-200/60">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Quản trị viên (Admin)</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đang chọn
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Settings for all 3 pages */}
                <div className="pt-2 mb-2.5 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    CÀI ĐẶT DÙNG CHUNG (3 PHÂN HỆ):
                  </p>

                  {/* Theme Mode */}
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      {themeMode === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                      <span>Giao diện</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setThemeMode('light')}
                        className={`px-1.5 py-0.5 rounded font-bold transition-colors ${themeMode === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                      >
                        Sáng
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('compact')}
                        className={`px-1.5 py-0.5 rounded font-bold transition-colors ${themeMode === 'compact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                      >
                        Gọn
                      </button>
                    </div>
                  </div>

                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      {soundAlerts ? <Volume2 className="w-3.5 h-3.5 text-teal-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                      <span>Âm thanh nộp bài & lỗi</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundAlerts(!soundAlerts)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${soundAlerts ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {soundAlerts ? 'Bật' : 'Tắt'}
                    </button>
                  </div>

                  {/* Language */}
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ngôn ngữ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      {language === 'vi' ? 'Tiếng Việt' : 'English'}
                    </button>
                  </div>
                </div>

                {/* Actions & Logout */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('settings');
                      setShowSettingsPopover(false);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 text-left transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>Vào Cấu Hình Quản Trị Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsPopover(false);
                      onOpenAuth?.('login');
                    }}
                    className="w-full py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 text-left transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đổi tài khoản / Đăng nhập khác</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsPopover(false);
                      onLogout?.();
                    }}
                    className="w-full py-1.5 px-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Đăng xuất an toàn</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Profile Trigger Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            {/* Avatar & Name - CLICKING OPENS PROFILE */}
            <button
              type="button"
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
                else setActiveTab('settings');
              }}
              className="flex items-center gap-3 min-w-0 text-left cursor-pointer group flex-1"
              title="Nhấn vào hình đại diện để mở Hồ sơ cá nhân"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-teal-500/40 transition-all">
                {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'TR'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                  {currentUser?.name || 'Trần Văn Trí'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'admin@vantrix.edu.vn'} (Admin)
                </p>
              </div>
            </button>

            {/* GEAR BUTTON - CLICKING OPENS SETTINGS LIST LIKE IMAGE 2 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSettingsPopover((prev) => !prev);
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                showSettingsPopover
                  ? 'bg-teal-50 text-teal-700 ring-2 ring-teal-500/20'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Cài đặt hệ thống & Chuyển vai trò"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================================
          B & C. MAIN CONTAINER (TOP BAR + MAIN CONTENT AREA)
          ====================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* ====================================================================
            B. THE TOP BAR (HEADER) — MINIMALIST WHITE & SEARCH-CENTERED
            ==================================================================== */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
          {/* Left: View breadcrumb / Page title */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                {activeTab === 'overview' && 'Bảng Điều Khiển Quản Trị'}
                {activeTab === 'students' && 'Quản Lý Học Sinh & Kết Quả Luyện Thi'}
                {activeTab === 'teachers' && 'Quản Lý Giáo Viên & Duyệt Phân Quyền'}
                {activeTab === 'classes' && 'Quản Lý Lớp Học Toàn Trường & Giáo Viên Sở Hữu'}
                {activeTab === 'exams' && 'Kiểm Duyệt & Ngân Hàng Đề Thi'}
                {activeTab === 'settings' && 'Cấu Hình Hệ Thống & Tham Số Gemini AI'}
                {activeTab === 'logs' && 'Nhật Ký Kiểm Toán & An Toàn Dữ Liệu'}
              </h1>
            </div>
          </div>

          {/* Center: Wide subtle search bar */}
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative flex items-center bg-slate-100 hover:bg-slate-100/90 focus-within:bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 border border-transparent rounded-lg transition-all px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh, giáo viên, đề thi hoặc tác vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Quick action icons & Buttons */}
          <div className="flex items-center gap-3">
            {/* Live Uptime Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Máy chủ 99.98%</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => {
                if (onOpenNotificationCenter) onOpenNotificationCenter();
                else triggerToast('Đang mở trung tâm thông báo...');
              }}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Trung tâm thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              {((unreadNotificationCount !== undefined ? unreadNotificationCount : pendingApprovals + pendingExams) > 0) && (
                <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 px-0.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* ====================================================================
            C. MAIN CONTENT AREA — LIGHT WARM GRAY BACKGROUND (bg-[#F9FAFB])
            ==================================================================== */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sub-tabs Rendering when not on Overview */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Quay lại Tổng quan Dashboard
                </button>
              </div>
              <AdminStudentManagement
                users={users}
                onUpdateUsers={onUpdateUsers}
                onAddAuditLog={onAddAuditLog}
              />
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Quay lại Tổng quan Dashboard
                </button>
              </div>
              <AdminTeacherManagement
                users={users}
                onUpdateUsers={onUpdateUsers}
                onAddAuditLog={onAddAuditLog}
              />
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Quay lại Tổng quan Dashboard
                </button>
                <div className="text-right">
                  <span className="text-xs text-slate-500">
                    Đang hiển thị <strong>{filteredClassrooms.length}</strong> / {classrooms.length} lớp học trong hệ thống
                  </span>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Số Lớp Học</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{classrooms.length}</p>
                  <p className="text-[10px] text-teal-700 mt-0.5">Toàn bộ giáo viên</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Học Sinh Ghi Danh</p>
                  <p className="text-2xl font-black text-teal-700 mt-1">
                    {classrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Lượt tham gia lớp</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đề Thi Đã Giao</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {classrooms.reduce((acc, c) => acc + (c.assignedExamIds?.length || 0), 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Đề luyện thi & kiểm tra</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Giáo Viên Phụ Trách</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">
                    {new Set(classrooms.map((c) => c.teacherEmail)).size}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Thầy cô đang mở lớp</p>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên lớp, mã lớp (e.g. TOAN12-A1), hoặc giáo viên..."
                    value={classSearchQuery}
                    onChange={(e) => setClassSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={classLevelFilter}
                    onChange={(e) => setClassLevelFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 outline-none"
                  >
                    <option value="all">Tất cả cấp học</option>
                    <option value="tieuhoc">Tiểu học (Cấp 1)</option>
                    <option value="thcs">THCS (Cấp 2)</option>
                    <option value="thpt">THPT (Cấp 3)</option>
                    <option value="daihoc">Đại học & Chứng chỉ</option>
                  </select>
                </div>
              </div>

              {/* Classrooms Data Table */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Mã Lớp (Code)</th>
                        <th className="py-3 px-4">Tên Lớp Học & Cấp Học</th>
                        <th className="py-3 px-4">Giáo Viên Sở Hữu</th>
                        <th className="py-3 px-4 text-center">Sĩ Số</th>
                        <th className="py-3 px-4 text-center">Đề Đã Giao</th>
                        <th className="py-3 px-4 text-right">Tác Vụ Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClassrooms.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            Không tìm thấy lớp học nào phù hợp với bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredClassrooms.map((cls) => (
                          <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-teal-800">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[11px]">
                                  {cls.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyClassCode(cls.code)}
                                  className="text-slate-400 hover:text-teal-700 p-1 rounded"
                                  title="Sao chép mã lớp"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{cls.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {cls.educationLevelLabel || cls.educationLevel.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-slate-400">{cls.grade}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{cls.teacherName}</p>
                              <p className="text-[10px] text-slate-400">{cls.teacherEmail}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedClassStudents(cls)}
                                className="font-bold text-teal-700 hover:underline cursor-pointer"
                              >
                                {cls.students?.length || 0} học sinh
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-slate-700">
                                {cls.assignedExamIds?.length || 0} đề
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedClassStudents(cls)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                                >
                                  Học viên
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClassroom(cls.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Xóa/Lưu trữ lớp"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Xem Danh Sách Học Sinh Trong Lớp */}
              <AnimatePresence>
                {selectedClassStudents && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="font-serif font-bold text-sm text-slate-900">
                            Danh sách học sinh — {selectedClassStudents.name}
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Mã lớp: <strong className="text-teal-700">{selectedClassStudents.code}</strong> • Giáo viên: {selectedClassStudents.teacherName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedClassStudents(null)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {selectedClassStudents.students?.length === 0 ? (
                          <p className="text-center py-6 text-slate-400">Chưa có học sinh nào tham gia lớp này.</p>
                        ) : (
                          selectedClassStudents.students?.map((st) => (
                            <div key={st.id} className="py-2.5 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-800">{st.name}</p>
                                <p className="text-[10px] text-slate-400">{st.email}</p>
                              </div>
                              <div className="text-right text-[11px]">
                                <span className="text-teal-700 font-bold">{st.completedExamsCount || 0} bài đã nộp</span>
                                {st.averageScore && (
                                  <span className="text-slate-500 block text-[10px]">ĐTB: {st.averageScore}đ</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedClassStudents(null)}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer hover:bg-slate-800"
                        >
                          Đóng
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Quay lại Tổng quan Dashboard
                </button>
              </div>
              <AdminExamModeration
                exams={exams}
                onUpdateExams={onUpdateExams}
                onPreviewExam={onPreviewExam}
                onAddAuditLog={onAddAuditLog}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Quay lại Tổng quan Dashboard
                </button>
              </div>
              <AdminSystemSettings
                systemSettings={systemSettings}
                onUpdateSystemSettings={onUpdateSystemSettings}
                onAddAuditLog={onAddAuditLog}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  ← Quay lại Tổng quan Dashboard
                </button>
              </div>
              <AdminAuditLogs auditLogs={auditLogs} />
            </div>
          )}

          {/* OVERVIEW DASHBOARD — STRUCTURED PRECISELY ACCORDING TO IMAGE 2 ARCHITECTURE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* TOP ROW: 4 SEPARATE KPI SUMMARY CARDS MIRRORING IMAGE 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI Card 1: Total Users */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Tổng Người Dùng
                      </p>
                      <h3 className="font-serif text-2xl font-extrabold text-slate-900 mt-1">
                        {users.length}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {studentCount} HS • {teacherCount} GV
                    </span>
                  </div>
                </div>

                {/* KPI Card 2: Total Active Exams */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Đề Thi Chuẩn Hóa
                      </p>
                      <h3 className="font-serif text-2xl font-extrabold text-slate-900 mt-1">
                        {exams.length}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +8.6%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {exams.filter((e) => e.createdBy === 'system' || !e.classId).length} chuẩn hoá
                    </span>
                  </div>
                </div>

                {/* KPI Card 3: Submissions & Exam Runs */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Lượt Nộp & Khảo Thí
                      </p>
                      <h3 className="font-serif text-2xl font-extrabold text-slate-900 mt-1">
                        {systemMetrics.totalSubmissions || 248}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +24.1%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Hôm nay: {systemMetrics.activeUsersToday || 42} người
                    </span>
                  </div>
                </div>

                {/* KPI Card 4: System Storage & Capacity */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Dung Lượng Đã Dùng
                      </p>
                      <h3 className="font-serif text-2xl font-extrabold text-slate-900 mt-1">
                        {systemMetrics.storageUsedMb}{' '}
                        <span className="text-xs font-semibold text-slate-400">/ {systemMetrics.storageLimitMb} MB</span>
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                      <HardDrive className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      {storagePercentage}% dung lượng
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Bình thường
                    </span>
                  </div>
                </div>
              </div>

              {/* MAIN SECTION: 2 COLUMNS (WIDE AUDIT LOGS TABLE + RIGHT RECENT ACTIVITY CARD) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* WIDE CARD (Col 1-2): AUDIT LOGS & SYSTEM SAFETY TABLE */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
                  {/* Table Header & Controls */}
                  <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="w-6 h-6 rounded-md bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <h2 className="text-sm font-serif font-bold text-slate-900">
                          Audit Logs & An Toàn Hệ Thống
                        </h2>

                        {/* Dropdown Menu Lọc Cấp Độ Log: INFO | WARNING | ERROR tại tiêu đề Audit Logs */}
                        <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
                          <label htmlFor="audit-log-level-filter" className="text-[11px] font-semibold text-slate-400">
                            Cấp độ:
                          </label>
                          <select
                            id="audit-log-level-filter"
                            value={logSeverityFilter}
                            onChange={(e) => setLogSeverityFilter(e.target.value as any)}
                            className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-all cursor-pointer shadow-xs outline-none ${
                              logSeverityFilter === 'info'
                                ? 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-200'
                                : logSeverityFilter === 'warning'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200'
                                : logSeverityFilter === 'error' || logSeverityFilter === 'critical'
                                ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
                            }`}
                            aria-label="Lọc nhật ký theo cấp độ INFO, WARNING, ERROR"
                          >
                            <option value="all">⚡ Tất cả cấp độ (ALL)</option>
                            <option value="info">🔵 INFO (Thông tin)</option>
                            <option value="warning">🟡 WARNING (Cảnh báo)</option>
                            <option value="error">🔴 ERROR (Lỗi / Nghiêm trọng)</option>
                          </select>
                        </div>

                        {/* Dropdown Menu Lọc Khoảng Thời Gian: Hôm nay | 7 ngày qua | 30 ngày qua */}
                        <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
                          <label htmlFor="audit-log-time-filter" className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Thời gian:</span>
                          </label>
                          <select
                            id="audit-log-time-filter"
                            value={logTimeRangeFilter}
                            onChange={(e) => setLogTimeRangeFilter(e.target.value as any)}
                            className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-all cursor-pointer shadow-xs outline-none ${
                              logTimeRangeFilter !== 'all'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
                            }`}
                            aria-label="Lọc nhật ký theo khoảng thời gian Hôm nay, 7 ngày qua, 30 ngày qua"
                          >
                            <option value="all">📅 Tất cả thời gian</option>
                            <option value="today">⏱️ Hôm nay</option>
                            <option value="7days">🗓️ 7 ngày qua</option>
                            <option value="30days">📆 30 ngày qua</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Theo dõi mọi thao tác phê duyệt, cập nhật đề thi và cấu hình
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Search in table */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Lọc nhật ký..."
                          value={logSearchQuery}
                          onChange={(e) => setLogSearchQuery(e.target.value)}
                          className="pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-teal-500 w-36 sm:w-44"
                        />
                      </div>

                      {/* CSV Export Button */}
                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        title="Tải tệp CSV báo cáo"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Xuất CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Dense Table */}
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Thời gian</th>
                          <th className="py-2.5 px-3">Quản trị viên</th>
                          <th className="py-2.5 px-3">Thao tác</th>
                          <th className="py-2.5 px-3">Mục tiêu</th>
                          <th className="py-2.5 px-3 text-center">Mức độ</th>
                          <th className="py-2.5 px-3">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAuditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              Không tìm thấy nhật ký kiểm toán phù hợp với bộ lọc ({logSeverityFilter.toUpperCase()}).
                            </td>
                          </tr>
                        ) : (
                          filteredAuditLogs.slice(0, 7).map((log) => {
                            const isCritical = log.severity === 'critical' || log.severity === 'error';
                            const isWarning = log.severity === 'warning';
                            return (
                              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                                  {new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                  {log.adminName}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 font-medium truncate max-w-[140px]">
                                  {log.target}
                                </td>
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  {isCritical ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                      <AlertTriangle className="w-3 h-3" /> ERROR
                                    </span>
                                  ) : isWarning ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      <AlertTriangle className="w-3 h-3" /> WARNING
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                      <Info className="w-3 h-3" /> INFO
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 truncate max-w-[200px]" title={log.details}>
                                  {log.details}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="p-3 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Hiển thị {Math.min(7, filteredAuditLogs.length)} trên tổng số {filteredAuditLogs.length} bản ghi
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('logs')}
                      className="text-teal-700 hover:text-teal-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem toàn bộ nhật ký kiểm toán</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN (Col 3): RECENT ACTIVITY & SYSTEM HEALTH MIRRORING IMAGE 2 */}
                <div className="space-y-6">
                  {/* Card: Recent Activity */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <h3 className="font-serif text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        <span>Hoạt Động Gần Đây</span>
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                        Trực tiếp
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                          TH
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-xs">
                            Trần Văn Trí đã duyệt đề Toán 12
                          </p>
                          <p className="text-[10px] text-slate-400">Đề cấu trúc GDPT 2025 • 2 phút trước</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                          NV
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-xs">
                            Nguyễn Văn A nộp bài ĐGNL HSA
                          </p>
                          <p className="text-[10px] text-slate-400">Đạt 112/150 điểm • 15 phút trước</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                          LT
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-xs">
                            Cô Lê Thị Mai đăng ký tài khoản GV
                          </p>
                          <p className="text-[10px] text-slate-400">Trường THPT Chuyên • 42 phút trước</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                          AI
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-xs">
                            Gemini 2.5 giải thích 18 câu trắc nghiệm
                          </p>
                          <p className="text-[10px] text-slate-400">Phản hồi 1.2s • 1 giờ trước</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('students')}
                      className="mt-4 pt-3 border-t border-slate-100 text-center text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
                    >
                      Xem lịch sử nộp bài học sinh →
                    </button>
                  </div>

                  {/* Card: Pending Admin Tasks & Fast Actions */}
                  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <h3 className="font-serif text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tác Vụ Chờ Xử Lý</span>
                      </h3>
                      <span className="text-[10px] font-extrabold text-slate-500">
                        {pendingApprovals + pendingExams} việc
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Duyệt đề thi mới</p>
                          <p className="text-[10px] text-slate-400">{pendingExams} đề đang chờ kiểm tra</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('exams')}
                          className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Xử lý
                        </button>
                      </div>

                      <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Phê duyệt Giáo viên</p>
                          <p className="text-[10px] text-slate-400">{pendingApprovals} yêu cầu phân quyền</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('teachers')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Xem xét
                        </button>
                      </div>

                      <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Cấu hình Gemini 2.5</p>
                          <p className="text-[10px] text-slate-400">Nhiệt độ & Ma trận đề</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('settings')}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                        >
                          Mở
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};