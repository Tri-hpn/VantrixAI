/**
 * ============================================================================
 * TRANG / THÀNH PHẦN: BroadcastBanner (Dải Thông Báo Ghim Toàn Trang)
 * PHÂN HỆ: DÙNG CHUNG (COMMON) - TRUYỀN THÔNG ĐIỆP HỆ THỐNG
 * ĐƯỜNG DẪN: /src/components/common/BroadcastBanner.tsx
 * CHỨC NĂNG CHÍNH:
 *  - Ghim thông báo khẩn cấp từ Ban Quản trị lên đầu trang cho toàn bộ người dùng
 *  - Hỗ trợ các phân loại: Khẩn cấp (Đỏ), Cảnh báo (Cam), Thông tin (Lam), Chúc mừng (Xanh)
 *  - Cho phép người dùng tắt (dismiss) hoặc bấm link chuyển hướng nhanh
 * ============================================================================
 */

import React, { useState } from 'react';
import { BroadcastAnnouncement } from '../../types/admin';
import { Megaphone, X, ExternalLink, AlertTriangle, CheckCircle2, Info, Edit3 } from 'lucide-react';

interface BroadcastBannerProps {
  announcement: BroadcastAnnouncement;
  onOpenAdminSettings?: () => void;
  onQuickEdit?: () => void;
  isAdmin?: boolean;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({
  announcement,
  onOpenAdminSettings,
  onQuickEdit,
  isAdmin,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!announcement.enabled || isDismissed) {
    return null;
  }

  const typeStyles = {
    info: {
      bg: 'bg-gradient-to-r from-[#042F2E] via-[#0D5C75] to-[#042F2E]',
      border: 'border-teal-700/50',
      icon: <Info className="w-4 h-4 text-teal-300 shrink-0" />,
      badge: 'bg-teal-500/30 text-teal-200 border-teal-400/30',
      badgeText: 'Thông Báo Vantrix AI',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900',
      border: 'border-amber-700/50',
      icon: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />,
      badge: 'bg-amber-500/30 text-amber-200 border-amber-400/30',
      badgeText: 'Lưu Ý Kỳ Thi',
    },
    alert: {
      bg: 'bg-gradient-to-r from-red-900 via-red-800 to-red-900',
      border: 'border-red-700/50',
      icon: <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />,
      badge: 'bg-red-500/30 text-red-200 border-red-400/30',
      badgeText: 'Khẩn Cấp / Bảo Trì',
    },
    success: {
      bg: 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900',
      border: 'border-emerald-700/50',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />,
      badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30',
      badgeText: 'Tin Mới',
    },
  }[announcement.type || 'info'];

  return (
    <aside aria-label="Thông báo hệ thống" className={`${typeStyles.bg} text-white border-b ${typeStyles.border} py-2 px-4 text-xs font-medium relative z-50 shadow-sm transition-all animate-in fade-in duration-200`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {typeStyles.icon}
          <span className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeStyles.badge}`}>
            {typeStyles.badgeText}
          </span>
          <p className="truncate text-xs text-white/95">{announcement.message}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {announcement.linkText && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 hover:text-white underline underline-offset-2">
              <span>{announcement.linkText}</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          )}

          {/* Quick edit button right from Topbar banner */}
          {onQuickEdit && (
            <button
              type="button"
              onClick={onQuickEdit}
              className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 hover:bg-white/25 text-white px-2 py-0.5 rounded border border-white/20 transition-colors cursor-pointer"
              title="Chỉnh sửa nhanh thông báo và TopBar"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa nhanh</span>
            </button>
          )}

          {isAdmin && onOpenAdminSettings && !onQuickEdit && (
            <button
              type="button"
              onClick={onOpenAdminSettings}
              className="text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded border border-white/20 transition-colors"
            >
              Chỉnh sửa thông báo
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
