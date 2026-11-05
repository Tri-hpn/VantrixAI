/**
 * ============================================================================
 * FILE: MobileHeader (Thanh Tiêu Đề Ứng Dụng Điện Thoại Chuẩn Native)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — MOBILE APP-BAR
 * ĐƯỜNG DẪN: /src/components/common/MobileHeader.tsx
 * CHỨC NĂNG:
 *  - App-Bar chuẩn iOS/Android (< 768px), safe-area aware
 *  - Nhận diện vai trò + drawer chuyển vai trò (Framer Motion)
 *  - Chuông thông báo & avatar mở Hồ sơ cá nhân
 *  - Chế độ cô đọng khi đang trong phòng thi (đồng hồ + thoát an toàn)
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Bell,
  User,
  Shield,
  School,
  GraduationCap,
  LogOut,
  X,
} from 'lucide-react';
import type { UserRole } from '../../types/quiz';
import type { AppUser } from '../../types/admin';
import { useNotifications } from '../../context/NotificationContext';

export interface MobileHeaderProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  currentUser: AppUser | null;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeExamTitle?: string;
  timeRemainingSeconds?: number;
  onExitExam?: () => void;
  onOpenNotificationCenter: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

const ROLE_META: Record<
  UserRole,
  { label: string; short: string; icon: React.ReactNode; pill: string; avatar: string }
> = {
  student: {
    label: 'Học sinh / Sinh viên',
    short: 'Học sinh',
    icon: <GraduationCap className="w-2.5 h-2.5 text-[#0D5C75]" />,
    pill: 'bg-[#E6F2F5] text-[#0D5C75] border-[#C7E5EA]',
    avatar: 'bg-[#0D5C75]',
  },
  teacher: {
    label: 'Giáo viên / Giảng viên',
    short: 'Giáo viên',
    icon: <School className="w-2.5 h-2.5 text-amber-600" />,
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    avatar: 'bg-amber-600',
  },
  admin: {
    label: 'Quản trị viên (Admin)',
    short: 'Admin',
    icon: <Shield className="w-2.5 h-2.5 text-purple-600" />,
    pill: 'bg-purple-50 text-purple-800 border-purple-200',
    avatar: 'bg-purple-600',
  },
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  currentRole,
  onChangeRole,
  activeExamTitle,
  timeRemainingSeconds,
  onExitExam,
  onOpenNotificationCenter,
  onOpenProfile,
  onLogout,
}) => {
  const { unreadCount } = useNotifications();
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const meta = ROLE_META[currentRole];

  const formatTimer = (sec: number = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Exam mode header
  if (currentTab === 'exam_runner') {
    return (
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4] px-3.5 py-2 safe-top-padding shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider leading-none">
                Đang làm bài
              </p>
              <p className="text-xs font-bold text-[#0F172A] truncate max-w-[170px]">
                {activeExamTitle || 'Bài thi trắc nghiệm'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {timeRemainingSeconds !== undefined && (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-[#78350F] border border-amber-200">
                {formatTimer(timeRemainingSeconds)}
              </span>
            )}
            {onExitExam && (
              <button
                type="button"
                onClick={onExitExam}
                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Thoát
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4] px-3.5 py-2.5 safe-top-padding shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left: Brand + role pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('exams')}
              className="flex items-center gap-2 text-left cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0D5C75] to-[#042F2E] flex items-center justify-center text-white shadow-sm">
                <Brain className="w-4 h-4 text-teal-200" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-black text-sm tracking-tight text-[#0F172A]">Vantrix</span>
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#E6F2F5] text-[#0D5C75] border border-[#C7E5EA]">
                  AI
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowRoleDrawer(true)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${meta.pill}`}
              title="Nhấn để đổi vai trò"
            >
              {meta.icon}
              <span>{meta.short}</span>
            </button>
          </div>

          {/* Right: Bell + Avatar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNotificationCenter}
              className="relative p-2 rounded-xl text-[#57534E] hover:text-[#0D5C75] hover:bg-[#F5F5F4] transition-colors active:scale-95 cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-1 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              className={`relative p-0.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                currentTab === 'profile'
                  ? 'ring-2 ring-[#0D5C75] border-[#0D5C75]'
                  : 'border-[#E7E5E4] hover:border-[#D6D3D1]'
              }`}
              title="Hồ sơ cá nhân"
            >
              <div
                className={`w-7 h-7 rounded-[10px] text-white font-bold text-xs flex items-center justify-center ${meta.avatar}`}
              >
                {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'HS'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Role Switcher Drawer */}
      <AnimatePresence>
        {showRoleDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setShowRoleDrawer(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-5 shadow-2xl safe-bottom-padding border-t border-[#E7E5E4]"
            >
              <div className="w-12 h-1.5 bg-[#E7E5E4] rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F5F5F4]">
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">Chuyển Đổi Vai Trò</h3>
                  <p className="text-xs text-[#78716C]">
                    Trải nghiệm hệ thống từ góc nhìn Học sinh, Giáo viên hoặc Admin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleDrawer(false)}
                  className="p-1 rounded-full text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {(
                  [
                    {
                      role: 'student' as UserRole,
                      icon: <GraduationCap className="w-5 h-5" />,
                      title: 'Học sinh / Sinh viên',
                      desc: 'Làm đề thi, sổ lỗi sai, luyện đề AI',
                      accent: {
                        box: 'bg-[#E6F2F5] text-[#0D5C75]',
                        active: 'bg-[#E6F2F5]/80 border-[#C7E5EA] ring-1 ring-[#0D5C75]/40',
                        badge: 'bg-[#E6F2F5] text-[#0D5C75]',
                      },
                      tab: 'exams' as const,
                    },
                    {
                      role: 'teacher' as UserRole,
                      icon: <School className="w-5 h-5" />,
                      title: 'Giáo viên / Giảng viên',
                      desc: 'Quản lý lớp học, soạn đề, phổ điểm',
                      accent: {
                        box: 'bg-amber-100 text-amber-700',
                        active: 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400',
                        badge: 'bg-amber-100 text-amber-800',
                      },
                      tab: 'classes' as const,
                    },
                    {
                      role: 'admin' as UserRole,
                      icon: <Shield className="w-5 h-5" />,
                      title: 'Quản trị viên (Admin)',
                      desc: 'CRM người dùng, duyệt đề, cấu hình AI',
                      accent: {
                        box: 'bg-purple-100 text-purple-700',
                        active: 'bg-purple-50/80 border-purple-300 ring-1 ring-purple-400',
                        badge: 'bg-purple-100 text-purple-800',
                      },
                      tab: 'admin' as const,
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      onChangeRole(item.role);
                      onSelectTab(item.tab);
                      setShowRoleDrawer(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      currentRole === item.role
                        ? item.accent.active
                        : 'bg-white border-[#E7E5E4] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${item.accent.box}`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#0F172A]">{item.title}</p>
                        <p className="text-xs text-[#78716C]">{item.desc}</p>
                      </div>
                    </div>
                    {currentRole === item.role && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.accent.badge}`}
                      >
                        Đang chọn
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#F5F5F4] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleDrawer(false);
                    onOpenProfile();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#44403C] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Xem Hồ sơ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRoleDrawer(false);
                    onLogout();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};