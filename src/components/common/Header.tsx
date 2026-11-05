/**
 * ============================================================================
 * FILE: Header (Thanh Điều Hướng Máy Tính Chuẩn Chuyên Nghiệp)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: DÙNG CHUNG (COMMON) - GIAO DIỆN DESKTOP & LAPTOP
 * ĐƯỜNG DẪN: /src/components/common/Header.tsx
 * CHỨC NĂNG CHÍNH:
 *  - Cố định thanh điều hướng chống co giật chữ (whitespace-nowrap 100%)
 *  - Phân tách tab theo 3 vai trò (Học sinh / Giáo viên / Admin)
 *  - Tích hợp chuông thông báo, dropdown hồ sơ & chuyển vai trò mượt mà
 *  - KHÔNG còn nút "Tải đề" trên Header — entry point tải đề đã chuyển về
 *    các module chuyên biệt (StudentExamLibrary / StudentPersonalRoadmap)
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  BookOpen,
  BookmarkCheck,
  Users,
  BarChart3,
  Sparkles,
  School,
  Shield,
  Bell,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  GraduationCap,
  Sliders,
  Check,
  ArrowRight,
  Activity,
  Compass,
} from 'lucide-react';
import { UserRole } from '../../types/quiz';
import { AppUser } from '../../types/admin';
import { useNotifications } from '../../context/NotificationContext';

export interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  mistakeCount: number;
  unmasteredMistakeCount: number;
  activeExamTitle?: string;
  onExitExam?: () => void;
  currentUser: AppUser | null;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  /**
   * @deprecated Nút "Tải đề" đã được gỡ khỏi Header. Prop được giữ optional
   * để tương thích ngược với App.tsx — sẽ bị xoá ở phiên bản lớn tiếp theo.
   */
  onOpenUploadModal?: () => void;
  onStartQuickReview: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenNotificationCenter?: () => void;
  onOpenProfile?: () => void;
  adminTab?: 'overview' | 'students' | 'teachers' | 'exams' | 'settings' | 'logs';
  onSelectAdminTab?: (
    tab: 'overview' | 'students' | 'teachers' | 'exams' | 'settings' | 'logs'
  ) => void;
  studentCount?: number;
  teacherCount?: number;
  examCount?: number;
}

const ROLE_ACCENT: Record<UserRole, { main: string; tint: string; border: string }> = {
  student: { main: '#0D5C75', tint: '#E6F2F5', border: '#C7E5EA' },
  teacher: { main: '#B45309', tint: '#FEF3C7', border: '#FDE68A' },
  admin: { main: '#6D28D9', tint: '#F3E8FF', border: '#DDD6FE' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  mistakeCount,
  unmasteredMistakeCount,
  activeExamTitle,
  onExitExam,
  currentUser,
  currentRole,
  onChangeRole,
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
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Click-outside cho cả 2 dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotificationMenu(false);
      }
    };
    if (showUserMenu || showNotificationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showNotificationMenu]);

  const accent = ROLE_ACCENT[currentRole];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-[#E7E5E4] h-16 transition-all select-none">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* ========================================================= */}
        {/* 1. BRAND LOGO & TAGLINE                                  */}
        {/* ========================================================= */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('exams')}
            className="flex items-center gap-2.5 group cursor-pointer text-left shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D5C75] to-[#042F2E] flex items-center justify-center text-white shadow-sm shadow-[#0D5C75]/20 group-hover:scale-105 transition-transform shrink-0">
              <Brain className="w-5 h-5 text-teal-200" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#0F172A] whitespace-nowrap">
                  Vantrix
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E6F2F5] text-[#0D5C75] border border-[#C7E5EA] whitespace-nowrap">
                  AI 2.5
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] leading-none whitespace-nowrap hidden lg:block">
                Khảo thí & Luyện thi toàn cấp
              </p>
            </div>
          </button>

          {/* Active Exam indicator */}
          {activeExamTitle && currentTab === 'exam_runner' && (
            <div className="flex items-center gap-2 pl-3 border-l border-[#E7E5E4] shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-[#0F172A] max-w-[200px] truncate whitespace-nowrap">
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

        {/* ========================================================= */}
        {/* 2. ROLE-BASED NAVIGATION                                 */}
        {/* ========================================================= */}
        {currentTab !== 'exam_runner' ? (
          <nav className="flex items-center gap-1 lg:gap-1.5 shrink-0 overflow-visible">
            {/* 1. HỌC SINH / SINH VIÊN */}
            {currentRole === 'student' && (
              <>
                <NavButton
                  active={currentTab === 'exams'}
                  onClick={() => onSelectTab('exams')}
                  icon={<BookOpen className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span>Thư viện đề</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'mistakes'}
                  onClick={() => onSelectTab('mistakes')}
                  icon={<BookmarkCheck className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span className="hidden xl:inline">Sổ tay lỗi sai</span>
                  <span className="xl:hidden">Sổ lỗi</span>
                  {mistakeCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                      {mistakeCount}
                    </span>
                  )}
                </NavButton>

                <NavButton
                  active={currentTab === 'roadmap'}
                  onClick={() => onSelectTab('roadmap')}
                  icon={<Compass className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span className="hidden xl:inline">Lộ trình cá nhân</span>
                  <span className="xl:hidden">Lộ trình</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'classes'}
                  onClick={() => onSelectTab('classes')}
                  icon={<Users className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span>Lớp học</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'stats'}
                  onClick={() => onSelectTab('stats')}
                  icon={<BarChart3 className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  className="hidden lg:inline-flex"
                >
                  <span>Thống kê</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'generator'}
                  onClick={() => onSelectTab('generator')}
                  icon={<Sparkles className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span className="hidden xl:inline">Luyện đề AI</span>
                  <span className="xl:hidden">Luyện AI</span>
                </NavButton>
              </>
            )}

            {/* 2. GIÁO VIÊN / GIẢNG VIÊN */}
            {currentRole === 'teacher' && (
              <>
                <NavButton
                  active={currentTab === 'classes'}
                  onClick={() => onSelectTab('classes')}
                  icon={<School className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span>Quản lý Lớp</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'exams'}
                  onClick={() => onSelectTab('exams')}
                  icon={<BookOpen className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span className="hidden xl:inline">Ngân hàng Đề</span>
                  <span className="xl:hidden">Đề thi</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'generator'}
                  onClick={() => onSelectTab('generator')}
                  icon={<Sparkles className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                >
                  <span>Soạn đề AI</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'stats'}
                  onClick={() => onSelectTab('stats')}
                  icon={<BarChart3 className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  className="hidden lg:inline-flex"
                >
                  <span>Phổ điểm</span>
                </NavButton>
              </>
            )}

            {/* 3. QUẢN TRỊ VIÊN */}
            {currentRole === 'admin' && (
              <>
                <NavButton
                  active={currentTab === 'admin' && (!adminTab || adminTab === 'overview')}
                  onClick={() => {
                    onSelectAdminTab?.('overview');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  icon={<Activity className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  title="Bảng điều khiển & Giám sát tổng quan"
                >
                  <span>Tổng quan</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'admin' && adminTab === 'students'}
                  onClick={() => {
                    onSelectAdminTab?.('students');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  icon={<GraduationCap className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  title="Quản lý học sinh toàn cấp"
                >
                  <span>Học sinh</span>
                  {studentCount !== undefined && (
                    <Badge small active={currentTab === 'admin' && adminTab === 'students'}>
                      {studentCount}
                    </Badge>
                  )}
                </NavButton>

                <NavButton
                  active={currentTab === 'admin' && adminTab === 'teachers'}
                  onClick={() => {
                    onSelectAdminTab?.('teachers');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  icon={<School className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  title="Quản lý giáo viên & giảng viên"
                >
                  <span>Giáo viên</span>
                  {teacherCount !== undefined && (
                    <Badge small active={currentTab === 'admin' && adminTab === 'teachers'}>
                      {teacherCount}
                    </Badge>
                  )}
                </NavButton>

                <NavButton
                  active={currentTab === 'admin' && adminTab === 'exams'}
                  onClick={() => {
                    onSelectAdminTab?.('exams');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  icon={<BookOpen className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  title="Kiểm duyệt & quản lý ngân hàng đề thi"
                >
                  <span>Duyệt Đề</span>
                  {examCount !== undefined && (
                    <Badge small active={currentTab === 'admin' && adminTab === 'exams'}>
                      {examCount}
                    </Badge>
                  )}
                </NavButton>

                <NavButton
                  active={currentTab === 'admin' && adminTab === 'settings'}
                  onClick={() => {
                    onSelectAdminTab?.('settings');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  icon={<Sliders className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  title="Cấu hình hệ thống & AI Engine"
                >
                  <span>Cấu hình AI</span>
                </NavButton>

                <NavButton
                  active={currentTab === 'admin' && adminTab === 'logs'}
                  onClick={() => {
                    onSelectAdminTab?.('logs');
                    if (currentTab !== 'admin') onSelectTab('admin');
                  }}
                  icon={<Shield className="w-4 h-4 shrink-0" />}
                  accent={accent.main}
                  tint={accent.tint}
                  border={accent.border}
                  title="Nhật ký an toàn & kiểm toán bảo mật"
                >
                  <span>Nhật ký</span>
                </NavButton>
              </>
            )}
          </nav>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#57534E] bg-[#F5F5F4] px-3 py-1 rounded-full font-semibold whitespace-nowrap">
              Chế độ phòng thi nghiêm ngặt
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. RIGHT TOOLS: NOTIFICATIONS + USER PROFILE              */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notification Bell */}
          {currentTab !== 'exam_runner' && (
            <div className="relative shrink-0" ref={notifMenuRef}>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  if (onOpenNotificationCenter) {
                    onOpenNotificationCenter();
                  } else {
                    setShowNotificationMenu((prev) => !prev);
                    setShowUserMenu(false);
                  }
                }}
                className="relative p-2 rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] text-[#57534E] hover:text-[#0D5C75] transition-colors cursor-pointer shrink-0"
                title="Thông báo hệ thống & bài tập"
                aria-label="Mở trung tâm thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotificationMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E7E5E4] shadow-2xl shadow-slate-900/10 p-4 z-50 origin-top-right"
                  >
                    {currentRole === 'student' && (
                      <>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F5F4]">
                          <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5 text-[#0D5C75]" />
                            <span>Nhắc Nhở Ôn Tập</span>
                          </span>
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            {unmasteredMistakeCount} câu chưa thuộc
                          </span>
                        </div>
                        <p className="text-xs text-[#57534E] leading-relaxed mb-3">
                          {unmasteredMistakeCount > 0
                            ? `Bạn có ${unmasteredMistakeCount} câu hỏi làm sai trong sổ tay. Ôn lại 5 phút để ghi nhớ lâu hơn!`
                            : 'Tuyệt vời! Bạn không còn câu hỏi nào chưa thành thạo.'}
                        </p>
                        {unmasteredMistakeCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowNotificationMenu(false);
                              onStartQuickReview();
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-sm shadow-[#0D5C75]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            Ôn nhanh 3 câu ngay (5 phút)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowNotificationMenu(false);
                              onSelectTab('mistakes');
                            }}
                            className="w-full py-2 px-3 rounded-xl border border-[#E7E5E4] hover:bg-[#FAFAF9] text-xs font-semibold text-[#0F172A] cursor-pointer whitespace-nowrap"
                          >
                            Mở Sổ tay lỗi sai
                          </button>
                        )}
                      </>
                    )}

                    {currentRole === 'teacher' && (
                      <>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F5F4]">
                          <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                            <School className="w-3.5 h-3.5 text-amber-600" />
                            <span>Hoạt Động Lớp Học</span>
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Giáo viên
                          </span>
                        </div>
                        <p className="text-xs text-[#57534E] leading-relaxed mb-3">
                          Học sinh vừa nộp bài trực tuyến. Nhấn để chấm bài, xem phổ điểm hoặc
                          soạn đề AI giao cho lớp.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotificationMenu(false);
                            onSelectTab('classes');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Xem Lớp & Chấm bài</span>
                        </button>
                      </>
                    )}

                    {currentRole === 'admin' && (
                      <>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5F5F4]">
                          <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            <span>Bảng Tin Quản Trị</span>
                          </span>
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Admin
                          </span>
                        </div>
                        <p className="text-xs text-[#57534E] leading-relaxed mb-3">
                          Hệ thống ổn định (99.98%). Giám sát tài khoản và phê duyệt ngân hàng đề.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotificationMenu(false);
                            onSelectTab('admin');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Mở Bảng Điều Khiển</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile & Role Switcher Dropdown */}
          {currentTab !== 'exam_runner' && (
            <div className="relative shrink-0" ref={userMenuRef}>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setShowUserMenu((prev) => !prev);
                  setShowNotificationMenu(false);
                }}
                className={`p-1 lg:px-2.5 lg:py-1.5 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
                  currentTab === 'profile'
                    ? 'ring-2 ring-[#0D5C75]/40 bg-[#E6F2F5]/70 border-[#C7E5EA]'
                    : currentRole === 'admin'
                    ? 'bg-purple-50 border-purple-300 text-purple-900'
                    : currentRole === 'teacher'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-[#E7E5E4] text-[#57534E] hover:bg-[#FAFAF9]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${
                    currentRole === 'admin'
                      ? 'bg-purple-600'
                      : currentRole === 'teacher'
                      ? 'bg-amber-600'
                      : 'bg-[#0D5C75]'
                  }`}
                >
                  {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'HS'}
                </div>

                <div className="text-left hidden sm:block shrink-0">
                  <p className="text-xs font-bold leading-tight truncate max-w-[110px] lg:max-w-[150px] whitespace-nowrap text-[#0F172A]">
                    {currentUser ? currentUser.name : 'Người dùng'}
                  </p>
                  <p className="text-[10px] text-[#78716C] font-semibold leading-none mt-0.5 whitespace-nowrap">
                    {currentRole === 'admin'
                      ? 'Quản trị viên'
                      : currentRole === 'teacher'
                      ? 'Giáo viên'
                      : 'Học sinh'}
                  </p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#A8A29E] shrink-0 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-[#E7E5E4] shadow-2xl shadow-slate-900/10 p-3.5 z-50 origin-top-right text-xs"
                  >
                    {/* User info */}
                    <div className="pb-3 mb-3 border-b border-[#F5F5F4]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-black text-[#0F172A] text-sm truncate max-w-[180px]">
                          {currentUser ? currentUser.name : 'Văn Trí (Học sinh)'}
                        </p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-[#78716C] truncate mb-2">
                        {currentUser ? currentUser.email : 'vantritran518@gmail.com'}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F2F5] text-[#0D5C75] border border-[#C7E5EA]">
                          {currentUser?.gradeOrClass || 'Lớp 12'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F4] text-[#57534E] truncate max-w-[150px]">
                          {currentUser?.schoolOrOrg || 'THPT Chuyên'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onOpenProfile) onOpenProfile();
                          else onSelectTab('profile');
                        }}
                        className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#0D5C75] to-[#084356] hover:from-[#084356] hover:to-[#042F2E] text-white font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm shadow-[#0D5C75]/20"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="text-xs">Xem & Sửa Hồ Sơ</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Switch role */}
                    <div className="mb-2.5">
                      <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">
                        Chuyển vai trò trải nghiệm:
                      </p>
                      <div className="space-y-1">
                        {(
                          [
                            {
                              role: 'student' as UserRole,
                              icon: <GraduationCap className="w-3.5 h-3.5 text-[#0D5C75]" />,
                              label: 'Học sinh / Sinh viên',
                              activeBg: 'bg-[#E6F2F5] text-[#0D5C75]',
                            },
                            {
                              role: 'teacher' as UserRole,
                              icon: <School className="w-3.5 h-3.5 text-amber-600" />,
                              label: 'Giáo viên / Giảng viên',
                              activeBg: 'bg-amber-50 text-amber-900',
                            },
                            {
                              role: 'admin' as UserRole,
                              icon: <Shield className="w-3.5 h-3.5 text-purple-600" />,
                              label: 'Quản trị viên (Admin)',
                              activeBg: 'bg-purple-50 text-purple-900',
                            },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.role}
                            type="button"
                            onClick={() => {
                              onChangeRole(item.role);
                              if (item.role === 'admin') onSelectTab('admin');
                              setShowUserMenu(false);
                            }}
                            className={`w-full py-1.5 px-2.5 rounded-xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              currentRole === item.role
                                ? `${item.activeBg} font-bold`
                                : 'hover:bg-[#FAFAF9] text-[#57534E]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {currentRole === item.role && (
                              <span className="text-[10px] font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đang chọn
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#F5F5F4] space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg text-left font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Vào Cổng Quản Trị Admin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAuth('login');
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg text-left font-semibold text-[#57534E] hover:bg-[#FAFAF9] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>Đổi tài khoản / Đăng nhập khác</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg text-left font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất an toàn</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/* =========================================================================
 * Sub-component: NavButton — pill navigation với accent theo role
 * ========================================================================= */
interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  accent: string;
  tint: string;
  border: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  accent,
  tint,
  border,
  children,
  className = '',
  title,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={
      active
        ? { backgroundColor: tint, color: accent, borderColor: border }
        : undefined
    }
    className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border ${
      active
        ? 'font-bold shadow-sm'
        : 'text-[#57534E] hover:text-[#0F172A] hover:bg-[#F5F5F4] border-transparent'
    } ${className}`}
  >
    <span style={active ? { color: accent } : { color: '#78716C' }}>{icon}</span>
    {children}
  </button>
);

/* =========================================================================
 * Sub-component: Badge — số đếm gọn trong nav
 * ========================================================================= */
const Badge: React.FC<{ children: React.ReactNode; small?: boolean; active?: boolean }> = ({
  children,
  active,
}) => (
  <span
    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
      active
        ? 'bg-purple-200 text-purple-900'
        : 'bg-[#F5F5F4] text-[#57534E] border border-[#E7E5E4]'
    }`}
  >
    {children}
  </span>
);