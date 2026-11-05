/**
 * ============================================================================
 * FILE: TopBar (Thanh Tiện Ích Đỉnh Trang & Trạng Thái Hệ Thống)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — DESKTOP & TABLET
 * ĐƯỜNG DẪN: /src/components/common/TopBar.tsx
 * CHỨC NĂNG:
 *  - Hotline 0865542505 + Trạng thái AI Engine
 *  - Niên khóa GDPT 2018 & Kỳ thi ĐHQG/Bách Khoa
 *  - Đồng hồ thời gian thực + Admin Quick-Edit
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { PhoneCall, Sparkles, Clock, ShieldCheck, HelpCircle, Edit3 } from 'lucide-react';
import type { SystemSettings } from '../../types/admin';
import type { UserRole } from '../../types/quiz';
import { TopBarQuickEditModal } from './TopBarQuickEditModal';

interface TopBarProps {
  onOpenHelp?: () => void;
  systemSettings?: SystemSettings;
  onUpdateSystemSettings?: (settings: SystemSettings) => void;
  currentRole?: UserRole;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenHelp,
  systemSettings,
  onUpdateSystemSettings,
  currentRole,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const hotline = systemSettings?.topBarConfig?.hotline || '0865542505';
  const hotlineHours = systemSettings?.topBarConfig?.hotlineHours || '(08:00 - 22:00)';
  const standardsText =
    systemSettings?.topBarConfig?.standardsText ||
    'Chuẩn cấu trúc Bộ GD&ĐT 2025 • ĐHQG & TSA Bách Khoa';
  const aiEngineName =
    systemSettings?.topBarConfig?.aiEngineName || 'Gemini 2.5 Flash Engine';
  const aiEngineStatus =
    systemSettings?.topBarConfig?.aiEngineStatus || '99.98% Sẵn sàng';

  return (
    <>
      <div className="hidden lg:block bg-[#0B1120] text-[#94A3B8] text-[11px] font-medium border-b border-slate-800 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          {/* Left: Hotline + Standards */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#CBD5E1] hover:text-white transition-colors">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>Hotline khảo thí:</span>
              <a
                href={`tel:${hotline}`}
                className="font-bold text-white tracking-wide hover:text-emerald-400 transition-colors"
              >
                {hotline}
              </a>
              <span className="text-[#64748B]">{hotlineHours}</span>
            </div>

            <div className="h-3 w-px bg-slate-700" />

            <div className="flex items-center gap-1.5 text-[#94A3B8]">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{standardsText}</span>
            </div>
          </div>

          {/* Right: AI status + Clock + Quick Edit */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span className="text-[#CBD5E1] font-semibold">{aiEngineName}</span>
              <span className="text-emerald-400 font-bold">{aiEngineStatus}</span>
            </div>

            <div className="h-3 w-px bg-slate-700" />

            <div className="flex items-center gap-1.5 text-[#94A3B8]">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="font-mono text-white tabular-nums">
                {timeStr || 'Đang đồng bộ...'}
              </span>
            </div>

            {currentRole === 'admin' && systemSettings && onUpdateSystemSettings && (
              <>
                <div className="h-3 w-px bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setIsQuickEditOpen(true)}
                  className="inline-flex items-center gap-1 text-purple-200 hover:text-white px-2 py-0.5 rounded-md bg-purple-900/60 hover:bg-purple-800 border border-purple-600/70 transition-colors cursor-pointer text-[10px] font-bold"
                  title="Chỉnh sửa TopBar và Banner (Chỉ Admin)"
                >
                  <Edit3 className="w-2.5 h-2.5 text-purple-300" />
                  <span>Sửa TopBar & Banner</span>
                </button>
              </>
            )}

            {onOpenHelp && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="text-[#94A3B8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Hướng dẫn</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {systemSettings && onUpdateSystemSettings && (
        <TopBarQuickEditModal
          isOpen={isQuickEditOpen}
          onClose={() => setIsQuickEditOpen(false)}
          systemSettings={systemSettings}
          onUpdateSystemSettings={onUpdateSystemSettings}
        />
      )}
    </>
  );
};