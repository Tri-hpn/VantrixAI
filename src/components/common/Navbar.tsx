/**
 * ============================================================================
 * TRANG / THÀNH PHẦN: Navbar (Thanh Điều Hướng & Tiêu Đề Hệ Thống)
 * PHÂN HỆ: DÙNG CHUNG (COMMON) - DÀNH CHO MỌI VAI TRÒ
 * ĐƯỜNG DẪN: /src/components/common/Navbar.tsx
 * CHỨC NĂNG CHÍNH:
 *  - Bộ chọn nhanh cấp độ học tập: Tiểu học, Cấp 2, Cấp 3, Đại học
 *  - Điều hướng các phân hệ: Thư viện Đề, Sổ tay Lỗi sai, Lớp học, Thống kê, Quản trị Admin
 *  - Chống co giật chữ (whitespace-nowrap 100%)
 *  - Menu tài khoản người dùng: Đổi vai trò, Xem hồ sơ cá nhân, Đăng xuất an toàn
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Brain,
  Sparkles,
  BookmarkCheck,
  BarChart3,
  Users,
  Upload,
  GraduationCap,
  Bell,
  Shield,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  School,
  Sliders,
  Check,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { UserRole } from '../../types/quiz';
import { AppUser } from '../../types/admin';
import { useNotifications } from '../../context/NotificationContext';

interface NavbarProps {
  currentTab: 'exams' | 'exam_runner' | 'result' | 'mistakes' | 'generator' | 'stats' | 'classes' | 'admin' | 'auth' | 'profile';
  onSelectTab: (tab: any) => void;
  mistakeCount: number;
  unmasteredMistakeCount: number;
  activeExamTitle?: string;
  onExitExam?: () => void;
  currentUser: AppUser | null;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenUploadModal: () => void;
  onStartQuickReview: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenNotificationCenter?: () => void;
  onOpenProfile?: () => void;
  adminTab?: 'overview' | 'students' | 'teachers' | 'exams' | 'settings' | 'logs';
  onSelectAdminTab?: (tab: 'overview' | 'students' | 'teachers' | 'exams' | 'settings' | 'logs') => void;
  studentCount?: number;
  teacherCount?: number;
  examCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  mistakeCount,
  unmasteredMistakeCount,
  activeExamTitle,
  onExitExam,
  currentUser,
  currentRole,
  onChangeRole,
  onOpenUploadModal,
  onStartQuickReview,
  onOpenAuth,
  onLogout,
  onOpenNotificationCenter,
  onOpenProfile,
  adminTab,
  onSelectAdminTab,
  studentCount,
  teacherCount,
  examCount,
}) => {
  const { unreadCount } = useNotifications();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 select-none">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('exams')}
            className="flex items-center gap-2.5 cursor-pointer group text-left shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D5C75] to-[#042F2E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Brain className="w-5 h-5 text-teal-200" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#0F172A] whitespace-nowrap">
                  Vantrix
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E6F4F1] text-[#0D5C75] border border-[#B3E0D8] whitespace-nowrap">
                  AI 2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none hidden lg:block whitespace-nowrap">
                Khảo thí & Luyện thi thông minh toàn cấp
              </p>
            </div>
          </button>

          {/* Active Exam indicator in header */}
          {activeExamTitle && currentTab === 'exam_runner' && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-xs font-semibold text-slate-900 max-w-[180px] truncate whitespace-nowrap">
                Đang làm: {activeExamTitle}
              </span>
              {onExitExam && (
                <button
                  type="button"
                  onClick={onExitExam}
                  className="text-xs text-rose-600 hover:text-rose-700 ml-1 px-2 py-0.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer font-bold whitespace-nowrap"
                >
                  Thoát đề
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation items - Dynamically rendered per Role */}
        {currentTab !== 'exam_runner' ? (
          <nav className="flex items-center gap-1 lg:gap-1.5 shrink-0">
            {/* 1. HỌC SINH / SINH VIÊN (STUDENT) */}
            {currentRole === 'student' && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTab('exams')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'exams'
                      ? 'bg-[#E6F4F1] text-[#0D5C75] border border-[#B3E0D8] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0 text-[#0D5C75]" />
                  <span>Thư viện đề</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('mistakes')}
                  className={`relative px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'mistakes'
                      ? 'bg-[#E6F4F1] text-[#0D5C75] border border-[#B3E0D8] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4 shrink-0 text-[#0D5C75]" />
                  <span className="hidden xl:inline">Sổ tay lỗi sai</span>
                  <span className="xl:hidden">Sổ lỗi</span>
                  {mistakeCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      {mistakeCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('classes')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'classes'
                      ? 'bg-[#E6F4F1] text-[#0D5C75] border border-[#B3E0D8] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 text-[#0D5C75]" />
                  <span>Lớp học</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('stats')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 hidden lg:inline-flex cursor-pointer ${
                    currentTab === 'stats'
                      ? 'bg-[#E6F4F1] text-[#0D5C75] border border-[#B3E0D8] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0 text-[#0D5C75]" />
                  <span>Thống kê</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('generator')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'generator'
                      ? 'bg-[#E6F4F1] text-[#0D5C75] border border-[#B3E0D8] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#0D5C75] shrink-0" />
                  <span className="hidden xl:inline">Luyện đề AI</span>
                  <span className="xl:hidden">Luyện AI</span>
                </button>
              </>
            )}

            {/* 2. GIÁO VIÊN / GIẢNG VIÊN (TEACHER) */}
            {currentRole === 'teacher' && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTab('classes')}
                  className={`px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'classes'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <School className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Quản lý Lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('exams')}
                  className={`px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'exams'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="hidden xl:inline">Ngân hàng Đề</span>
                  <span className="xl:hidden">Đề thi</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('generator')}
                  className={`px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'generator'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Soạn đề AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('stats')}
                  className={`px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 hidden lg:inline-flex cursor-pointer ${
                    currentTab === 'stats'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Phổ điểm</span>
                </button>
              </>
            )}

            {/* 3. QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) */}
            {/* 3. QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) - CÁC NÚT ĐỘC LẬP */}
            {currentRole === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAdminTab) onSelectAdminTab('overview');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'admin' && (!adminTab || adminTab === 'overview')
                      ? 'bg-purple-100 text-purple-900 border border-purple-200/80 font-bold shadow-2xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                  title="Bảng điều khiển & Giám sát tổng quan"
                >
                  <Activity className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>Tổng quan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAdminTab) onSelectAdminTab('students');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'admin' && adminTab === 'students'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200/80 font-bold shadow-2xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                  title="Quản lý khách hàng học sinh toàn cấp"
                >
                  <GraduationCap className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>Học sinh</span>
                  {studentCount !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        currentTab === 'admin' && adminTab === 'students'
                          ? 'bg-purple-200 text-purple-900'
                          : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      {studentCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAdminTab) onSelectAdminTab('teachers');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'admin' && adminTab === 'teachers'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200/80 font-bold shadow-2xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                  title="Quản lý giáo viên & giảng viên"
                >
                  <School className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Giáo viên</span>
                  {teacherCount !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        currentTab === 'admin' && adminTab === 'teachers'
                          ? 'bg-purple-200 text-purple-900'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      }`}
                    >
                      {teacherCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAdminTab) onSelectAdminTab('exams');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'admin' && adminTab === 'exams'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200/80 font-bold shadow-2xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                  title="Kiểm duyệt & quản lý ngân hàng đề thi"
                >
                  <BookOpen className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>Duyệt Đề</span>
                  {examCount !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        currentTab === 'admin' && adminTab === 'exams'
                          ? 'bg-purple-200 text-purple-900'
                          : 'bg-blue-50 text-blue-800 border border-blue-200/60'
                      }`}
                    >
                      {examCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAdminTab) onSelectAdminTab('settings');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'admin' && adminTab === 'settings'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200/80 font-bold shadow-2xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                  title="Cấu hình hệ thống & AI Engine"
                >
                  <Sliders className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>Cấu hình AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAdminTab) onSelectAdminTab('logs');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    currentTab === 'admin' && adminTab === 'logs'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200/80 font-bold shadow-2xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                  title="Nhật ký an toàn & kiểm toán bảo mật"
                >
                  <Shield className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Nhật ký</span>
                </button>
              </>
            )}
          </nav>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#667085] bg-[#F1F5F9] px-2.5 py-1 rounded-md whitespace-nowrap">
              Chế độ phòng thi nghiêm ngặt
            </span>
          </div>
        )}

        {/* Right Tools: Notification Bell + Upload Button + User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notification Bell */}
          {currentTab !== 'exam_runner' && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenNotificationCenter) {
                    onOpenNotificationCenter();
                  } else {
                    setShowNotificationMenu((prev) => !prev);
                  }
                }}
                className="relative p-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] text-[#464555] transition-colors cursor-pointer shrink-0"
                title="Thông báo"
              >
                <Bell className="w-4 h-4 text-[#4F46E5]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E7EB]">
                    <span className="font-bold text-xs text-[#1E1B4B] flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>Nhắc Nhở Ôn Tập Hàng Ngày</span>
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {unmasteredMistakeCount} câu chưa thuộc
                    </span>
                  </div>

                  <p className="text-xs text-[#464555] leading-relaxed mb-3">
                    {unmasteredMistakeCount > 0
                      ? `Bạn có ${unmasteredMistakeCount} câu hỏi làm sai chưa thành thạo trong sổ tay. Ôn lại ngay 5 phút để ghi nhớ lâu hơn!`
                      : 'Tuyệt vời! Bạn không còn câu hỏi nào chưa thành thạo.'}
                  </p>

                  {unmasteredMistakeCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotificationMenu(false);
                        onStartQuickReview();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>Ôn nhanh 3 câu ngay (5 phút)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotificationMenu(false);
                        onSelectTab('mistakes');
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-[#D1D5DB] hover:bg-[#F1F5F9] text-xs font-semibold text-[#172033] cursor-pointer whitespace-nowrap"
                    >
                      Mở Sổ tay lỗi sai
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Upload Button (Học sinh được đẩy đề tự ôn, Giáo viên tải đề giao lớp, Admin duyệt đề) */}
          {currentTab !== 'exam_runner' && (
            <button
              type="button"
              onClick={onOpenUploadModal}
              className={`px-2.5 lg:px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                currentRole === 'teacher'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : currentRole === 'admin'
                  ? 'bg-purple-700 hover:bg-purple-800'
                  : 'bg-[#0D5C75] hover:bg-[#084356] border border-[#0D5C75]'
              }`}
              title={
                currentRole === 'teacher'
                  ? 'Tải file đề Word/PDF lên và giao cho lớp học'
                  : currentRole === 'admin'
                  ? 'Tải file đề lên và kiểm duyệt vào ngân hàng đề toàn trường'
                  : 'Tải file đề Word/PDF của bạn lên để tự ôn tập'
              }
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">
                {currentRole === 'teacher' ? 'Tải file đề' : currentRole === 'admin' ? 'Tải đề kiểm duyệt' : 'Tải đề tự ôn'}
              </span>
              <span className="xl:hidden">
                {currentRole === 'teacher' ? 'Tải đề' : currentRole === 'admin' ? 'Duyệt đề' : 'Tải đề'}
              </span>
            </button>
          )}

          {/* User Profile & Role Switcher Dropdown (Single Line, Never Wraps) */}
          {currentTab !== 'exam_runner' && (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className={`p-1 lg:px-2.5 lg:py-1.5 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                  currentTab === 'profile'
                    ? 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-300'
                    : currentRole === 'admin'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                    : currentRole === 'teacher'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-[#E5E7EB] text-[#464555] hover:bg-[#F8FAFC]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                    currentRole === 'admin'
                      ? 'bg-purple-600'
                      : currentRole === 'teacher'
                      ? 'bg-amber-600'
                      : 'bg-indigo-600'
                  }`}
                >
                  {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'HS'}
                </div>

                <div className="hidden sm:block text-left shrink-0">
                  <p className="text-xs font-bold leading-tight truncate max-w-[110px] lg:max-w-[150px] whitespace-nowrap text-slate-900">
                    {currentUser ? currentUser.name : 'Người dùng'}
                  </p>
                  <p className="text-[10px] text-[#667085] leading-none mt-0.5 font-semibold whitespace-nowrap">
                    {currentRole === 'admin'
                      ? 'Quản trị viên'
                      : currentRole === 'teacher'
                      ? 'Giáo viên'
                      : 'Học sinh'}
                  </p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Menu Popover */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  {/* User info head */}
                  <div className="pb-3 mb-3 border-b border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-[#1E1B4B] text-sm truncate max-w-[180px]">
                        {currentUser ? currentUser.name : 'Văn Trí (Học sinh)'}
                      </p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        Online
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] truncate mb-2">
                      {currentUser ? currentUser.email : 'vantritran518@gmail.com'}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {currentUser?.gradeOrClass || 'Lớp 12'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 truncate max-w-[150px]">
                        {currentUser?.schoolOrOrg || 'THPT Chuyên'}
                      </span>
                    </div>

                    {/* Prominent View Profile Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onOpenProfile) onOpenProfile();
                        else onSelectTab('profile');
                      }}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Xem & Sửa Hồ Sơ Cá Nhân</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Switch Role Fast Buttons */}
                  <div className="mb-2.5">
                    <p className="text-[10px] font-bold text-[#667085] uppercase tracking-wider mb-2">
                      Chuyển đổi vai trò trải nghiệm:
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onChangeRole('student');
                          setShowUserMenu(false);
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          currentRole === 'student'
                            ? 'bg-indigo-50 text-[#4F46E5] font-bold'
                            : 'hover:bg-slate-50 text-[#464555]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Học sinh / Sinh viên</span>
                        </div>
                        {currentRole === 'student' && (
                          <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đang chọn
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onChangeRole('teacher');
                          setShowUserMenu(false);
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          currentRole === 'teacher'
                            ? 'bg-amber-50 text-amber-900 font-bold'
                            : 'hover:bg-slate-50 text-[#464555]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <School className="w-3.5 h-3.5 text-amber-600" />
                          <span>Giáo viên / Giảng viên</span>
                        </div>
                        {currentRole === 'teacher' && (
                          <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đang chọn
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onChangeRole('admin');
                          onSelectTab('admin');
                          setShowUserMenu(false);
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          currentRole === 'admin'
                            ? 'bg-purple-50 text-purple-900 font-bold'
                            : 'hover:bg-slate-50 text-[#464555]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          <span>Quản trị viên (Admin)</span>
                        </div>
                        {currentRole === 'admin' && (
                          <span className="text-[10px] font-bold text-purple-800 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đang chọn
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions: Admin portal / Auth / Logout */}
                  <div className="pt-2 border-t border-[#E5E7EB] space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg text-left font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Vào Trang Quản Trị Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth('login');
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg text-left font-semibold text-[#464555] hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-500" />
                      <span>Đổi tài khoản / Đăng nhập khác</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg text-left font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất an toàn</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
