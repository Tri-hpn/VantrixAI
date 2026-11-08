/**
 * ============================================================================
 * TRANG / THÀNH PHẦN: TopBarQuickEditModal
 * PHÂN HỆ: DÙNG CHUNG (COMMON) - CHỈNH SỬA TRỰC TIẾP TỪ TOPBAR
 * ĐƯỜNG DẪN: /src/components/common/TopBarQuickEditModal.tsx
 * CHỨC NĂNG CHÍNH:
 *  - Cho phép người dùng chỉnh sửa nhanh thanh TopBar và Banner thông báo trực tiếp
 *    ngay trên đỉnh trang mà không cần phải truy cập trang Quản Trị Viên!
 *  - Tùy chỉnh tức thì:
 *      + Banner thông báo: Nội dung, Bật/Tắt, Tiêu đề hành động, Loại thông báo
 *      + Hotline hỗ trợ & Khung giờ phục vụ
 *      + Dòng cấu trúc niên khóa (Bộ GD&ĐT / ĐHQG / Bách Khoa)
 *      + Trạng thái AI Engine (Gemini 2.5 Flash / % Sẵn sàng)
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Megaphone,
  Save,
  CheckCircle2,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { SystemSettings } from '../../types/admin';

interface TopBarQuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (updated: SystemSettings) => void;
}

export const TopBarQuickEditModal: React.FC<TopBarQuickEditModalProps> = ({
  isOpen,
  onClose,
  systemSettings,
  onUpdateSystemSettings,
}) => {
  const [formData, setFormData] = useState({
    // Banner
    bannerEnabled: systemSettings.announcement.enabled,
    bannerMessage: systemSettings.announcement.message,
    bannerLinkText: systemSettings.announcement.linkText || 'Xem đề thi mới',
    bannerType: systemSettings.announcement.type,
    // Topbar items
    hotline: systemSettings.topBarConfig?.hotline || '0865542505',
    hotlineHours: systemSettings.topBarConfig?.hotlineHours || '(08:00 - 22:00)',
    standardsText:
      systemSettings.topBarConfig?.standardsText ||
      'Chuẩn cấu trúc Bộ GD&ĐT 2025 • ĐHQG & TSA Bách Khoa',
    aiEngineName: systemSettings.topBarConfig?.aiEngineName || 'Gemini 2.5 Flash Engine',
    aiEngineStatus: systemSettings.topBarConfig?.aiEngineStatus || '99.98% Sẵn sàng',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSettings: SystemSettings = {
      ...systemSettings,
      announcement: {
        ...systemSettings.announcement,
        enabled: formData.bannerEnabled,
        message: formData.bannerMessage,
        linkText: formData.bannerLinkText,
        type: formData.bannerType,
        updatedAt: Date.now(),
      },
      topBarConfig: {
        hotline: formData.hotline,
        hotlineHours: formData.hotlineHours,
        standardsText: formData.standardsText,
        aiEngineName: formData.aiEngineName,
        aiEngineStatus: formData.aiEngineStatus,
      },
    };

    onUpdateSystemSettings(updatedSettings);
    localStorage.setItem('quizflow_system_settings', JSON.stringify(updatedSettings));

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetDefaults = () => {
    setFormData({
      bannerEnabled: true,
      bannerMessage:
        'Chào mừng kỳ thi thử 2025: Đã cập nhật ngân hàng đề thi chuẩn Bộ GD&ĐT cho Cấp 1, Cấp 2, Cấp 3 và Đề thi ĐGNL ĐHQG!',
      bannerLinkText: 'Xem đề thi mới',
      bannerType: 'info',
      hotline: '0865542505',
      hotlineHours: '(08:00 - 22:00)',
      standardsText: 'Chuẩn cấu trúc Bộ GD&ĐT 2025 • ĐHQG & TSA Bách Khoa',
      aiEngineName: 'Gemini 2.5 Flash Engine',
      aiEngineStatus: '99.98% Sẵn sàng',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                Chỉnh Sửa Nhanh TopBar & Banner Thông Báo
              </h3>
              <p className="text-xs text-slate-300">
                Thay đổi trực tiếp nội dung hiển thị ở đầu trang (không cần vào trang Quản trị viên)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* SECTION 1: BANNER THÔNG BÁO TOÀN TRƯỜNG */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm text-slate-900">
                  Dòng Banner Thông Báo Toàn Trường (Ghim đầu trang)
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bannerEnabled}
                  onChange={(e) => setFormData({ ...formData, bannerEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">Hiển thị banner</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung thông báo:
                </label>
                <textarea
                  value={formData.bannerMessage}
                  onChange={(e) => setFormData({ ...formData, bannerMessage: e.target.value })}
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="Nhập thông điệp thông báo toàn trường..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhãn nút hành động:
                  </label>
                  <input
                    type="text"
                    value={formData.bannerLinkText}
                    onChange={(e) => setFormData({ ...formData, bannerLinkText: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Xem đề thi mới"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kiểu thông báo:
                  </label>
                  <select
                    value={formData.bannerType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bannerType: e.target.value as 'info' | 'warning' | 'alert' | 'success',
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="info">Thông tin (Xanh tím trang nhã)</option>
                    <option value="success">Thành công / Chúc mừng (Xanh lá)</option>
                    <option value="warning">Khẩn cấp / Lưu ý thi (Vàng cam)</option>
                    <option value="alert">Cảnh báo / Bảo trì (Đỏ)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TOPBAR UTILITY STRIP */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-sm text-slate-900">
                Thanh Tiện Ích TopBar (Hotline, Tiêu Chuẩn & AI)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số Hotline khảo thí:
                </label>
                <input
                  type="text"
                  value={formData.hotline}
                  onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  placeholder="0865542505"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khung giờ phục vụ:
                </label>
                <input
                  type="text"
                  value={formData.hotlineHours}
                  onChange={(e) => setFormData({ ...formData, hotlineHours: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="(08:00 - 22:00)"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dòng cam kết chuẩn cấu trúc giáo dục:
                </label>
                <input
                  type="text"
                  value={formData.standardsText}
                  onChange={(e) => setFormData({ ...formData, standardsText: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="Chuẩn cấu trúc Bộ GD&ĐT 2025 • ĐHQG & TSA Bách Khoa"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên AI Engine hiển thị:
                </label>
                <input
                  type="text"
                  value={formData.aiEngineName}
                  onChange={(e) => setFormData({ ...formData, aiEngineName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="Gemini 2.5 Flash Engine"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tình trạng sẵn sàng (%):
                </label>
                <input
                  type="text"
                  value={formData.aiEngineStatus}
                  onChange={(e) => setFormData({ ...formData, aiEngineStatus: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-emerald-600"
                  placeholder="99.98% Sẵn sàng"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <div className="flex items-center gap-2">
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi ngay</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

