/**
 * ============================================================================
 * FILE: AdminPortal.tsx — Vantrix AI
 * PHÂN HỆ: QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) — WORKSPACE BỐ CỤC THEO THIẾT KẾ MẪU
 * ĐƯỜNG DẪN: /src/components/admin/AdminPortal.tsx
 * THIẾT KẾ:
 *  - Mô phỏng hoàn hảo giao diện Safari / Stratify AI Workspace hiện đại:
 *    + Khung cửa sổ macOS với 3 nút điều khiển (đỏ, vàng, xanh) & thanh địa chỉ stratify.com
 *    + Cột Sidebar bên trái: User Profile (Sam Smith / Trần Văn Trí), Home, New Chat,
 *      My Tasks, My Meetings, Saved Files, Shared with me, lịch sử Today/Yesterday,
 *      thẻ nâng cấp Pro "Only 5 AI reports left" & Settings.
 *    + Khu vực trung tâm:
 *      * Lời chào: "Welcome, Sam! 👋" & "How can I help you today?"
 *      * Thẻ Sticky Note vàng: "Previously viewed files" (Miro, Figma, PDF)
 *      * Thẻ "Summarize your last meeting" với icon Google Meet & lịch hẹn
 *      * 2 thẻ Suggested Task: "Conduct UX Research" & "Write a prospect email"
 *      * Thẻ danh sách "My Tasks 13" với thanh tìm kiếm, nút "Prioritize Tasks",
 *        các hàng nhiệm vụ đa trạng thái (Urgent, In progress, To do, Join now).
 *      * Thanh nhập liệu thông minh AI nổi ở cuối trang (Floating Prompt Bar).
 *    + Tích hợp chuyển đổi mượt mà sang các phân hệ: Học sinh, Giáo viên, Duyệt đề, Cấu hình, Nhật ký.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppUser, SystemSettings, AuditLog, SystemMetric } from '../../types/admin';
import type { Exam } from '../../types/quiz';
import { AdminStudentManagement } from './AdminStudentManagement';
import { AdminTeacherManagement } from './AdminTeacherManagement';
import { AdminExamModeration } from './AdminExamModeration';
import { AdminSystemSettings } from './AdminSystemSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Share,
  Plus,
  Home,
  MessageSquare,
  CheckSquare,
  Video,
  Folder,
  Share2,
  Settings,
  Sparkles,
  Search,
  ArrowRight,
  MoreVertical,
  Calendar,
  Clock,
  Compass,
  FileText,
  Pin,
  Send,
  Zap,
  Shield,
  GraduationCap,
  School,
  Database,
  Sliders,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'students'
  | 'teachers'
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
  activeTab?: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
}

interface AdminTaskItem {
  id: string;
  title: string;
  time?: string;
  color: 'orange' | 'red' | 'blue' | 'green';
  actionType?: 'join';
  urgentBadge?: string;
  dueBadge?: string;
  statusBadge?: string;
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
  activeTab: controlledTab,
  onSelectTab,
}) => {
  const [internalTab, setInternalTab] = useState<AdminTab>('overview');
  const isControlled = controlledTab !== undefined;
  const activeTab = isControlled ? controlledTab : internalTab;

  const setActiveTab = (tab: AdminTab) => {
    if (!isControlled) setInternalTab(tab);
    onSelectTab?.(tab);
  };

  // State for AI prompt bar and Task search
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessageNotice, setAiMessageNotice] = useState<string | null>(null);
  const [proUpgradeOpen, setProUpgradeOpen] = useState(false);
  const [activeMeetingNotice, setActiveMeetingNotice] = useState(false);

  const studentCount = users.filter((u) => u.role === 'student').length;
  const teacherCount = users.filter((u) => u.role === 'teacher').length;

  // Mock tasks exactly following the image
  const initialTasks: AdminTaskItem[] = [
    {
      id: 't-1',
      title: 'Design Meeting',
      time: '2pm',
      color: 'orange',
      actionType: 'join',
    },
    {
      id: 't-2',
      title: 'Refine UI components based on user feedback',
      color: 'red',
      urgentBadge: 'Urgent',
      dueBadge: 'By today',
    },
    {
      id: 't-3',
      title: 'Prepare a prototype for usability testing',
      color: 'blue',
      statusBadge: 'In progress',
      dueBadge: 'By tomorrow',
    },
    {
      id: 't-4',
      title: 'Collaborate with developers on implementation detail',
      color: 'green',
      statusBadge: 'To do',
      dueBadge: 'By tomorrow',
    },
    {
      id: 't-5',
      title: 'Kiểm duyệt đề thi thử Bộ GD&ĐT Toán 12 (Mã 101)',
      color: 'red',
      urgentBadge: 'Cần duyệt',
      dueBadge: 'Hôm nay',
    },
    {
      id: 't-6',
      title: 'Xuất báo cáo năng lực học sinh & Phổ điểm tuần',
      color: 'blue',
      statusBadge: 'Đang xử lý',
      dueBadge: 'Tuần này',
    },
  ];

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return initialTasks;
    const q = searchQuery.toLowerCase();
    return initialTasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiMessageNotice(`AI Assistant: Đang xử lý yêu cầu "${aiPrompt.trim()}"...`);
    setTimeout(() => {
      setAiMessageNotice(`AI Assistant: Đã hoàn tất phân tích cho "${aiPrompt.trim()}".`);
      setAiPrompt('');
      setTimeout(() => setAiMessageNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 font-sans">
      {/* =========================================================================
       * 1. MACOS-STYLE WINDOW FRAME SHELL
       * ========================================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col transition-all">
        
        {/* Safari Top Window Bar */}
        <div className="h-11 bg-slate-50/90 border-b border-slate-200 px-4 flex items-center justify-between select-none">
          {/* Mac window dots & nav */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-xs" />
            </div>
            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="p-1 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                title="Quay lại Tổng quan"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 text-slate-300 cursor-not-allowed rounded"
                disabled
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Browser Address Bar: stratify.com */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="bg-white/80 hover:bg-white border border-slate-200/90 rounded-lg px-3 py-1 flex items-center justify-between text-xs text-slate-600 shadow-2xs transition-colors">
              <div className="flex items-center gap-2 truncate">
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700 truncate tracking-tight text-[11px] sm:text-xs">
                  stratify.com
                </span>
                <span className="hidden md:inline text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.2 rounded font-semibold border border-teal-200">
                  vantrix.ai/admin
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAiMessageNotice('Đã làm mới dữ liệu hệ thống.');
                  setTimeout(() => setAiMessageNotice(null), 2500);
                }}
                className="text-slate-400 hover:text-slate-700 transition-colors ml-1"
                title="Tải lại trang"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Window action buttons */}
          <div className="flex items-center gap-2.5 text-slate-400 text-xs">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                setAiMessageNotice('Đã sao chép liên kết trang quản trị!');
                setTimeout(() => setAiMessageNotice(null), 2500);
              }}
              className="hover:text-slate-700 transition-colors hidden sm:inline"
              title="Chia sẻ liên kết"
            >
              <Share className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="hover:text-slate-700 transition-colors"
              title="Tab mới"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
         * 2. MAIN APPLICATION WORKSPACE (TWO COLUMNS: SIDEBAR + CONTENT)
         * ========================================================================= */}
        <div className="flex flex-col lg:flex-row min-h-[640px] bg-[#FDFEFE]">
          
          {/* ==================== LEFT SIDEBAR ==================== */}
          <aside className="w-full lg:w-64 bg-[#FAFAF9] border-b lg:border-b-0 lg:border-r border-slate-200/90 flex flex-col justify-between p-4 select-none shrink-0">
            <div className="space-y-5">
              
              {/* User profile at top: Sam Smith / Trần Văn Trí */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs shrink-0 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Sam Smith"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback text avatar
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span>SS</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Sam Smith</p>
                    <p className="text-[10px] text-slate-400 truncate">Trần Văn Trí (Admin)</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                  title="Thu gọn sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation items: Home, New Chat, My Tasks, My Meetings, Saved Files, Shared with me */}
              <nav className="space-y-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-slate-200/80 text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-slate-700" />
                    <span>Home</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>New Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                    activeTab === 'exams'
                      ? 'bg-slate-200/80 text-slate-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-slate-500" />
                    <span>My Tasks</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {initialTasks.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMeetingNotice(true);
                    setTimeout(() => setActiveMeetingNotice(false), 3000);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4 text-slate-500" />
                  <span>My Meetings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Folder className="w-4 h-4 text-slate-500" />
                  <span>Saved Files</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('teachers')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Shared with me</span>
                </button>
              </nav>

              {/* Sub-section: Today */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Today
                </p>
                <div className="space-y-1 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt('Yêu cầu hỗ trợ nghiên cứu cấu trúc đề thi Bộ GD&ĐT 2025');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors truncate block"
                  >
                    Research Assistance Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt('Tóm tắt buổi họp giao ban khảo thí gần nhất');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors truncate block"
                  >
                    Summarizing Last Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt('Sắp xếp ưu tiên các nhiệm vụ kiểm duyệt đề thi');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors truncate block"
                  >
                    Prioritizing Tasks Request
                  </button>
                </div>
              </div>

              {/* Sub-section: Yesterday */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                  Yesterday
                </p>
                <div className="space-y-1 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt('Tóm tắt tài liệu đề thi và phổ điểm hôm qua');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors truncate block"
                  >
                    Document Summary Request
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Pro Upgrade Card & Settings */}
            <div className="pt-4 space-y-3 mt-4 border-t border-slate-200/60">
              {/* Only 5 AI reports left widget */}
              <div className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 inline-block shrink-0" />
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    Only 5 AI reports left
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 pl-5 leading-tight">
                  Get deeper insights with Pro
                </p>
                <button
                  type="button"
                  onClick={() => setProUpgradeOpen(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer text-center"
                >
                  Upgrade Now
                </button>
              </div>

              {/* Settings button */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-slate-200/80 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Settings</span>
                </div>
                <span className="text-slate-400 text-xs">···</span>
              </button>
            </div>
          </aside>

          {/* ==================== RIGHT MAIN CANVAS ==================== */}
          <main className="flex-1 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto min-h-[580px]">
            
            {/* If a sub-tab (Students, Teachers, Exams, Settings, Logs) is selected, show that with a Back button */}
            {activeTab !== 'overview' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại Bảng điều khiển (Home)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                      Phân hệ: {activeTab.toUpperCase()}
                    </span>
                  </div>
                </div>

                {activeTab === 'students' && (
                  <AdminStudentManagement
                    users={users}
                    onUpdateUsers={onUpdateUsers}
                    onAddAuditLog={onAddAuditLog}
                  />
                )}
                {activeTab === 'teachers' && (
                  <AdminTeacherManagement
                    users={users}
                    onUpdateUsers={onUpdateUsers}
                    onAddAuditLog={onAddAuditLog}
                  />
                )}
                {activeTab === 'exams' && (
                  <AdminExamModeration
                    exams={exams}
                    onUpdateExams={onUpdateExams}
                    onPreviewExam={onPreviewExam}
                    onAddAuditLog={onAddAuditLog}
                  />
                )}
                {activeTab === 'settings' && (
                  <AdminSystemSettings
                    systemSettings={systemSettings}
                    onUpdateSystemSettings={onUpdateSystemSettings}
                    onAddAuditLog={onAddAuditLog}
                  />
                )}
                {activeTab === 'logs' && <AdminAuditLogs auditLogs={auditLogs} />}
              </div>
            ) : (
              /* ==================== OVERVIEW WORKSPACE (THE EXACT MOCKUP) ==================== */
              <div className="space-y-6 max-w-4xl mx-auto w-full">
                
                {/* Greeting banner */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold text-xs shadow-2xs">
                    <span>Welcome, Sam!</span>
                    <span className="text-sm">👋</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-normal text-slate-600 tracking-tight">
                    How can I help you today?
                  </h1>
                </div>

                {/* Notification toast alert if any action triggered */}
                {aiMessageNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium flex items-center justify-between"
                  >
                    <span>{aiMessageNotice}</span>
                    <button
                      type="button"
                      onClick={() => setAiMessageNotice(null)}
                      className="text-teal-600 hover:text-teal-900 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}

                {activeMeetingNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-medium flex items-center justify-between"
                  >
                    <span>Đang kết nối phòng họp trực tuyến Google Meet...</span>
                    <button
                      type="button"
                      onClick={() => setActiveMeetingNotice(false)}
                      className="text-blue-600 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}

                {/* Bento Grid: Row 1 (Sticky Note Card + Summarize Meeting Card) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Card 1: Warm yellow sticky note ("Previously viewed files") */}
                  <div className="bg-[#FEF9C3] border border-[#FDE047]/70 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[170px] group transition-all hover:shadow-md">
                    <div>
                      {/* Card header with vertical dots */}
                      <div className="flex items-center justify-between pb-3 text-amber-900 font-bold text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-800" />
                          <span>Previously viewed files</span>
                        </div>
                        <button
                          type="button"
                          className="text-amber-800/70 hover:text-amber-900 cursor-pointer p-1"
                          title="Tùy chọn"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('exams');
                          }}
                          className="w-full flex items-center gap-2.5 text-left text-amber-950 font-semibold hover:underline cursor-pointer truncate"
                        >
                          <span className="w-4 h-4 rounded bg-amber-400 text-amber-950 flex items-center justify-center font-black text-[9px] shrink-0">
                            M
                          </span>
                          <span className="truncate">Miro - Product Analytics and Statistics</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('students');
                          }}
                          className="w-full flex items-center gap-2.5 text-left text-amber-950 font-semibold hover:underline cursor-pointer truncate"
                        >
                          <span className="w-4 h-4 rounded bg-purple-400 text-white flex items-center justify-center font-black text-[9px] shrink-0">
                            F
                          </span>
                          <span className="truncate">Figma - UX Research</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (exams.length > 0) onPreviewExam(exams[0]);
                          }}
                          className="w-full flex items-center gap-2.5 text-left text-amber-950 font-semibold hover:underline cursor-pointer truncate"
                        >
                          <span className="w-4 h-4 rounded bg-rose-500 text-white flex items-center justify-center font-black text-[9px] shrink-0">
                            P
                          </span>
                          <span className="truncate">R2 Strategic Goals & Objectives.pdf</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Fold Pin / Corner Icon */}
                    <div className="flex justify-end pt-2 text-amber-800/50">
                      <Pin className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 2: Summarize your last meeting Card */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[170px] hover:shadow-md transition-all">
                    <div>
                      {/* Header */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Summarize your last meeting</span>
                      </div>

                      {/* Content Row: Avatar + Google Meet event */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-300 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                            alt="Organizer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {/* Google Meet colored icon */}
                            <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                              M
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              UX Strategy Meet up
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            1 Apr 2025, 14:00 pm
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">Google Calendar synced</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAiMessageNotice('AI đang tóm tắt nội dung cuộc họp "UX Strategy Meet up"...');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        Tóm tắt ngay →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bento Grid: Row 2 (Suggested Task Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Suggested Task 1: Conduct UX Research */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('students');
                    }}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Compass className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      <span>Suggested Task</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                      Conduct UX Research
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Khảo sát ý kiến học sinh & sinh viên về giao diện thi mới ({studentCount} người học).
                    </p>
                  </button>

                  {/* Suggested Task 2: Write a prospect email */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('teachers');
                    }}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Compass className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      <span>Suggested Task</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                      Write a prospect email
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Soạn thảo thư mời hợp tác giảng dạy gửi tới {teacherCount} giáo viên & giảng viên đối tác.
                    </p>
                  </button>
                </div>

                {/* Bento Grid: Row 3 (My Tasks 13 with search bar and task list) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                  {/* Top bar of Tasks Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm font-bold text-slate-900">
                        My Tasks
                      </h2>
                      <span className="text-xs text-slate-400 font-normal">13</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Search for name... input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for name..."
                          className="bg-slate-50 text-xs rounded-full pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-40 sm:w-48 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Prioritize Tasks button with gradient border */}
                      <button
                        type="button"
                        onClick={() => {
                          setAiMessageNotice('AI đã tự động phân loại thứ tự ưu tiên các nhiệm vụ theo mức độ khẩn cấp!');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Prioritize Tasks</span>
                      </button>
                    </div>
                  </div>

                  {/* Task list items */}
                  <div className="space-y-2.5 text-xs">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200/60"
                      >
                        {/* Left: bullet dot + Title + time */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Dot color */}
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              task.color === 'orange'
                                ? 'bg-amber-500'
                                : task.color === 'red'
                                ? 'bg-rose-500'
                                : task.color === 'blue'
                                ? 'bg-sky-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <p className="font-semibold text-slate-800 truncate">
                            {task.title}
                          </p>
                          {task.time && (
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {task.time}
                            </span>
                          )}
                        </div>

                        {/* Right: Badges / Action button */}
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {task.actionType === 'join' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMeetingNotice(true);
                                setTimeout(() => setActiveMeetingNotice(false), 3000);
                              }}
                              className="px-3 py-1 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                            >
                              Join now
                            </button>
                          )}

                          {task.urgentBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                              {task.urgentBadge}
                            </span>
                          )}

                          {task.statusBadge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              task.statusBadge === 'In progress' || task.statusBadge === 'Đang xử lý'
                                ? 'bg-sky-50 text-sky-600 border-sky-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {task.statusBadge}
                            </span>
                          )}

                          {task.dueBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200 text-[10px] font-bold">
                              {task.dueBadge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick management portal links */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-400 transition-all text-left shadow-2xs group"
                  >
                    <div className="flex items-center justify-between text-teal-700">
                      <GraduationCap className="w-4 h-4" />
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-2">Học sinh ({studentCount})</p>
                    <p className="text-[10px] text-slate-400">Quản lý & Bảng điểm</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('teachers')}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-400 transition-all text-left shadow-2xs group"
                  >
                    <div className="flex items-center justify-between text-amber-700">
                      <School className="w-4 h-4" />
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-2">Giáo viên ({teacherCount})</p>
                    <p className="text-[10px] text-slate-400">Phê duyệt & Phân quyền</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('exams')}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition-all text-left shadow-2xs group"
                  >
                    <div className="flex items-center justify-between text-indigo-700">
                      <FileText className="w-4 h-4" />
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-2">Đề thi ({exams.length})</p>
                    <p className="text-[10px] text-slate-400">Kiểm duyệt & Ma trận</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('logs')}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-400 transition-all text-left shadow-2xs group"
                  >
                    <div className="flex items-center justify-between text-purple-700">
                      <Shield className="w-4 h-4" />
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-2">Nhật ký ({auditLogs.length})</p>
                    <p className="text-[10px] text-slate-400">An toàn & Kiểm toán</p>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
             * 3. FLOATING BOTTOM AI PROMPT INPUT BAR
             * ========================================================================= */}
            {activeTab === 'overview' && (
              <div className="sticky bottom-0 pt-4 mt-6 z-20">
                <form
                  onSubmit={handleSendPrompt}
                  className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200/90 p-1.5 pl-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask or search for anything. Use @ to tag a file or collection."
                      className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shrink-0 cursor-pointer"
                    title="Gửi câu hỏi"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Pro Upgrade Modal Dialog */}
      {proUpgradeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0284C7]" />
                <h3 className="font-bold text-slate-900 text-base">Nâng cấp Vantrix Pro</h3>
              </div>
              <button
                type="button"
                onClick={() => setProUpgradeOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mở khóa không giới hạn báo cáo AI, trích xuất đề thi PDF siêu tốc với Gemini 2.5 Flash, và phân tích lỗ hổng kiến thức toàn trường.
            </p>
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 space-y-1.5 text-xs text-sky-900 font-medium">
              <p>✓ Không giới hạn số lượng câu hỏi AI</p>
              <p>✓ Xuất PDF A4 chuẩn Bộ GD&ĐT có watermark trường</p>
              <p>✓ Đồng bộ trực tiếp Google Classroom & Microsoft Teams</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProUpgradeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => {
                  setProUpgradeOpen(false);
                  setAiMessageNotice('Cảm ơn bạn! Tài khoản đã được nâng cấp lên hạn mức Pro.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs"
              >
                Xác nhận nâng cấp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { AdminPortal as MasterAdminPortal };
export type { AdminPortalProps as MasterAdminPortalProps };