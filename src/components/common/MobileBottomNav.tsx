/**
 * ============================================================================
 * FILE: MobileBottomNav (Thanh Điều Hướng Đáy Theo Vai Trò — Mobile UX)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — TỐI ƯU THIẾT BỊ DI ĐỘNG
 * ĐƯỜNG DẪN: /src/components/common/MobileBottomNav.tsx
 * CHỨC NĂNG:
 *  - Thanh cố định phía dưới màn hình (< 768px)
 *  - Tự thay đổi nút theo vai trò Học sinh / Giáo viên / Admin
 *  - Safe Area Inset cho iPhone / Android viền mỏng
 *  - Badge số câu chưa thuộc + thông báo chưa đọc
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  BookmarkCheck,
  Users,
  BarChart3,
  User,
  School,
  Sparkles,
  Activity,
  GraduationCap,
  Compass,
} from 'lucide-react';
import { UserRole } from '../../types/quiz';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: any) => void;
  adminSubTab?: 'overview' | 'students' | 'teachers' | 'classes' | 'exams' | 'settings' | 'logs';
  onSelectAdminSubTab?: (
    tab: 'overview' | 'students' | 'teachers' | 'classes' | 'exams' | 'settings' | 'logs'
  ) => void;
  mistakeCount: number;
  unreadNotificationCount: number;
  userRole: UserRole;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  userName?: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

const ROLE_ACCENT: Record<UserRole, string> = {
  student: '#0D5C75',
  teacher: '#B45309',
  admin: '#6D28D9',
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  adminSubTab = 'overview',
  onSelectAdminSubTab,
  mistakeCount,
  unreadNotificationCount,
  userRole,
  onOpenAuth,
  isLoggedIn,
  userName,
}) => {
  const accent = ROLE_ACCENT[userRole];

  // Build danh sách tab theo role
  const items: NavItem[] = [];

  if (userRole === 'student') {
    items.push(
      {
        key: 'library',
        label: 'Đề thi',
        icon: <BookOpen className="w-5 h-5" />,
        active: ['library', 'runner', 'result'].includes(currentTab),
        onClick: () => onTabChange('library'),
      },
      {
        key: 'mistakes',
        label: 'Sổ lỗi',
        icon: <BookmarkCheck className="w-5 h-5" />,
        active: currentTab === 'mistakes',
        onClick: () => onTabChange('mistakes'),
        badge: mistakeCount,
      },
      {
        key: 'roadmap',
        label: 'Lộ trình',
        icon: <Compass className="w-5 h-5" />,
        active: currentTab === 'roadmap',
        onClick: () => onTabChange('roadmap'),
      },
      {
        key: 'classrooms',
        label: 'Lớp học',
        icon: <Users className="w-5 h-5" />,
        active: currentTab === 'classrooms',
        onClick: () => onTabChange('classrooms'),
      },
      {
        key: 'stats',
        label: 'Thống kê',
        icon: <BarChart3 className="w-5 h-5" />,
        active: currentTab === 'stats',
        onClick: () => onTabChange('stats'),
      }
    );
  } else if (userRole === 'teacher') {
    items.push(
      {
        key: 'classrooms',
        label: 'Lớp học',
        icon: <School className="w-5 h-5" />,
        active: currentTab === 'classrooms',
        onClick: () => onTabChange('classrooms'),
      },
      {
        key: 'library',
        label: 'Đề thi',
        icon: <BookOpen className="w-5 h-5" />,
        active: ['library', 'runner', 'result'].includes(currentTab),
        onClick: () => onTabChange('library'),
      },
      {
        key: 'generator',
        label: 'Soạn AI',
        icon: <Sparkles className="w-5 h-5" />,
        active: currentTab === 'generator',
        onClick: () => onTabChange('generator'),
      },
      {
        key: 'stats',
        label: 'Phổ điểm',
        icon: <BarChart3 className="w-5 h-5" />,
        active: currentTab === 'stats',
        onClick: () => onTabChange('stats'),
      }
    );
  } else {
    items.push(
      {
        key: 'admin_overview',
        label: 'Tổng quan',
        icon: <Activity className="w-5 h-5" />,
        active: currentTab === 'admin' && adminSubTab === 'overview',
        onClick: () => {
          onTabChange('admin');
          onSelectAdminSubTab?.('overview');
        },
      },
      {
        key: 'admin_students',
        label: 'Học sinh',
        icon: <GraduationCap className="w-5 h-5" />,
        active: currentTab === 'admin' && adminSubTab === 'students',
        onClick: () => {
          onTabChange('admin');
          onSelectAdminSubTab?.('students');
        },
      },
      {
        key: 'admin_teachers',
        label: 'Giáo viên',
        icon: <School className="w-5 h-5" />,
        active: currentTab === 'admin' && adminSubTab === 'teachers',
        onClick: () => {
          onTabChange('admin');
          onSelectAdminSubTab?.('teachers');
        },
      },
      {
        key: 'admin_exams',
        label: 'Duyệt đề',
        icon: <BookOpen className="w-5 h-5" />,
        active: currentTab === 'admin' && adminSubTab === 'exams',
        onClick: () => {
          onTabChange('admin');
          onSelectAdminSubTab?.('exams');
        },
      }
    );
  }

  // Thêm tab Hồ sơ chung cho mọi role
  items.push({
    key: 'profile',
    label: isLoggedIn ? (userName ? userName.split(' ')[0] : 'Hồ sơ') : 'Đăng nhập',
    icon: <User className="w-5 h-5" />,
    active: currentTab === 'profile',
    onClick: () => {
      if (isLoggedIn) onTabChange('profile');
      else onOpenAuth();
    },
    badge: !isLoggedIn ? undefined : unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
  });

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E5E4] safe-bottom-padding shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.06)]"
      aria-label="Điều hướng chính"
    >
      <div
        className="grid h-16 items-center px-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <motion.button
            key={item.key}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={item.onClick}
            className={`relative flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              item.active ? 'font-bold' : 'font-medium text-[#78716C] hover:text-[#0F172A]'
            }`}
            style={item.active ? { color: accent } : undefined}
            aria-current={item.active ? 'page' : undefined}
          >
            <div
              className="p-1 rounded-xl transition-transform relative"
              style={
                item.active
                  ? { backgroundColor: `${accent}15`, transform: 'scale(1.05)' }
                  : undefined
              }
            >
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight truncate max-w-[60px]">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};