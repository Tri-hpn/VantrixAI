/**
 * ============================================================================
 * FILE: AdminSystemSettings.tsx — Vantrix AI
 * PHÂN HỆ: QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) — CẤU HÌNH HỆ THỐNG
 * ĐƯỜNG DẪN: /src/components/admin/AdminSystemSettings.tsx
 * CHỨC NĂNG:
 *  - Bật/tắt bảo trì toàn trang, thông điệp tuỳ chỉnh
 *  - Cấu hình Broadcast Banner
 *  - Cấu hình AI Engine (Gemini Flash, max câu/lần)
 *  - Anti-cheat & xuất PDF có watermark
 * GHI CHÚ: KHÔNG gọi localStorage — parent App.tsx sync state.
 *          useEffect sync formData khi prop systemSettings thay đổi từ bên ngoài.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SystemSettings, AuditLog } from '../../types/admin';
import {
  Settings,
  Megaphone,
  Shield,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const ADMIN = {
  main: '#6D28D9',
  hover: '#5B21B6',
  tint: '#F3E8FF',
  border: '#DDD6FE',
  deep: '#4C1D95',
} as const;

const ADMIN_ACTOR = {
  name: 'Quản Trị Viên (Trí)',
  email: 'admin@vantrix.edu.vn',
};

interface AdminSystemSettingsProps {
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (newSettings: SystemSettings) => void;
  onAddAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

/* ============================================================================
 * ToggleSwitch — tái sử dụng cho 5 toggle
 * ============================================================================ */
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  label: string;
  activeColor?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  id,
  label,
  activeColor = ADMIN.main,
}) => (
  <label htmlFor={id} className="relative inline-flex items-center cursor-pointer shrink-0">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only peer"
      aria-label={label}
    />
    <div
      className="w-11 h-6 bg-[#E7E5E4] peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D6D3D1] after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors"
      style={
        {
          ['--tw-ring-color' as string]: `${activeColor}33`,
        } as React.CSSProperties
      }
      data-active-color={activeColor}
    />
    <style>{`
      input#${id}:checked + div {
        background-color: ${activeColor};
      }
    `}</style>
  </label>
);

/* ============================================================================
 * SettingCard — wrapper cho mỗi khối setting
 * ============================================================================ */
interface SettingCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

const SettingCard: React.FC<SettingCardProps> = ({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  children,
}) => (
  <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-4">
    <div className="flex items-center gap-2 pb-3 border-b border-[#F5F5F4]">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
    </div>
    {children}
  </div>
);

/* ============================================================================
 * Main
 * ============================================================================ */
export const AdminSystemSettings: React.FC<AdminSystemSettingsProps> = ({
  systemSettings,
  onUpdateSystemSettings,
  onAddAuditLog,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(systemSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 🔧 Sync khi prop thay đổi từ bên ngoài (TopBar Quick Edit, hoặc load mới)
  useEffect(() => {
    setFormData(systemSettings);
  }, [systemSettings]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(systemSettings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Clamp maxQuestions về [5, 50] phòng user nhập ngoài khoảng
    const sanitized: SystemSettings = {
      ...formData,
      aiConfig: {
        ...formData.aiConfig,
        maxQuestionsPerGenerate: Math.min(
          50,
          Math.max(5, formData.aiConfig.maxQuestionsPerGenerate || 5)
        ),
      },
    };

    onUpdateSystemSettings(sanitized);

    onAddAuditLog({
      adminName: ADMIN_ACTOR.name,
      adminEmail: ADMIN_ACTOR.email,
      action: 'Cập nhật cấu hình hệ thống',
      target: 'SystemSettings',
      details: `Đã lưu: Bảo trì=${sanitized.maintenanceMode}, Banner=${sanitized.announcement.enabled}`,
      severity: 'warning',
      category: 'system',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setFormData(systemSettings);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      {/* Header & actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: ADMIN.tint, border: `1px solid ${ADMIN.border}` }}
          >
            <Settings className="w-6 h-6" style={{ color: ADMIN.main }} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight">
              Cấu hình Vận hành Hệ thống & AI
            </h2>
            <p className="text-xs text-[#78716C]">
              Bảo trì, Broadcast Banner, hạn mức AI và chống gian lận khảo thí
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AnimatePresence>
            {savedSuccess && (
              <motion.span
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
              </motion.span>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] text-[#57534E] text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={isDirty ? 'Huỷ thay đổi, khôi phục về cấu hình đã lưu' : 'Không có thay đổi'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={!isDirty}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ADMIN.main }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ADMIN.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ADMIN.main)}
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
        >
          <SettingCard
            icon={AlertTriangle}
            iconColor="#D97706"
            iconBg="#FEF3C7"
            title="Trạng thái Vận hành & Bảo trì"
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/60 border border-[#FDE68A]">
              <div className="pr-3">
                <p className="text-xs font-bold" style={{ color: '#78350F' }}>
                  Chế độ Bảo trì (Maintenance Mode)
                </p>
                <p className="text-[11px]" style={{ color: '#92400E' }}>
                  Khi bật, chỉ Admin mới truy cập được
                </p>
              </div>
              <ToggleSwitch
                id="maintenance-mode"
                label="Chế độ bảo trì"
                checked={formData.maintenanceMode}
                onChange={(v) => setFormData({ ...formData, maintenanceMode: v })}
                activeColor="#D97706"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Thông báo khi bảo trì
              </label>
              <textarea
                rows={2}
                value={formData.maintenanceNotice}
                onChange={(e) =>
                  setFormData({ ...formData, maintenanceNotice: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs focus:outline-none focus:ring-2 transition-all resize-none"
                style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">
                  Tên ứng dụng
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs focus:outline-none focus:ring-2 transition-all"
                  style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">
                  Email hỗ trợ
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, supportEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs focus:outline-none focus:ring-2 transition-all"
                  style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
                />
              </div>
            </div>
          </SettingCard>
        </motion.div>

        {/* Card 2: Broadcast banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        >
          <SettingCard
            icon={Megaphone}
            iconColor={ADMIN.main}
            iconBg={ADMIN.tint}
            title="Thông báo Ghim Toàn Hệ thống (Broadcast)"
          >
            <div
              className="flex items-center justify-between p-3 rounded-xl border"
              style={{ backgroundColor: `${ADMIN.tint}80`, borderColor: ADMIN.border }}
            >
              <div className="pr-3">
                <p className="text-xs font-bold" style={{ color: ADMIN.deep }}>
                  Bật Banner Thông Báo
                </p>
                <p className="text-[11px]" style={{ color: ADMIN.main }}>
                  Hiển thị trên thanh tiêu đề của mọi người dùng
                </p>
              </div>
              <ToggleSwitch
                id="announcement-enabled"
                label="Bật banner thông báo"
                checked={formData.announcement.enabled}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    announcement: { ...formData.announcement, enabled: v },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Nội dung thông báo
              </label>
              <input
                type="text"
                value={formData.announcement.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcement: { ...formData.announcement, message: e.target.value },
                  })
                }
                placeholder="Ví dụ: Kỳ thi thử ĐGNL ĐHQG bắt đầu lúc 19:30 tối nay..."
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs focus:outline-none focus:ring-2 transition-all"
                style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">
                  Loại cảnh báo
                </label>
                <select
                  value={formData.announcement.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        type: e.target.value as 'info' | 'warning' | 'alert' | 'success',
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-white focus:outline-none focus:ring-2 transition-all"
                  style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
                >
                  <option value="info">Thông tin (Xanh lam)</option>
                  <option value="warning">Cảnh báo (Vàng cam)</option>
                  <option value="alert">Khẩn cấp (Đỏ)</option>
                  <option value="success">Tin vui (Xanh lá)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">
                  Đối tượng nhận tin
                </label>
                <select
                  value={formData.announcement.targetAudience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        targetAudience: e.target.value as
                          | 'all'
                          | 'students'
                          | 'teachers',
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-white focus:outline-none focus:ring-2 transition-all"
                  style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
                >
                  <option value="all">Tất cả mọi người</option>
                  <option value="students">Chỉ Học sinh / Sinh viên</option>
                  <option value="teachers">Chỉ Giáo viên / Giảng viên</option>
                </select>
              </div>
            </div>
          </SettingCard>
        </motion.div>

        {/* Card 3: AI Engine */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
        >
          <SettingCard
            icon={Sparkles}
            iconColor="#D97706"
            iconBg="#FEF3C7"
            title="Cấu hình Động cơ AI (Gemini Flash)"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">
                  Mô hình AI
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.aiConfig.model}
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-[#F5F5F4] font-mono text-[#78716C] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">
                  Số câu tối đa / lần tạo
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={formData.aiConfig.maxQuestionsPerGenerate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aiConfig: {
                        ...formData.aiConfig,
                        maxQuestionsPerGenerate: Number(e.target.value) || 5,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs focus:outline-none focus:ring-2 transition-all"
                  style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
                />
                <p className="text-[10px] text-[#A8A29E] mt-1">Giới hạn 5 – 50 câu</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-xs font-medium text-[#57534E] cursor-pointer p-2 rounded-lg hover:bg-[#FAFAF9] transition-colors">
                <input
                  type="checkbox"
                  checked={formData.aiConfig.allowStudentFileParse}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aiConfig: {
                        ...formData.aiConfig,
                        allowStudentFileParse: e.target.checked,
                      },
                    })
                  }
                  className="rounded mt-0.5 shrink-0"
                  style={{ accentColor: ADMIN.main }}
                />
                <span>
                  Cho phép học sinh tự tải file PDF/Word lên để AI bóc tách câu hỏi
                </span>
              </label>
              <label className="flex items-start gap-2 text-xs font-medium text-[#57534E] cursor-pointer p-2 rounded-lg hover:bg-[#FAFAF9] transition-colors">
                <input
                  type="checkbox"
                  checked={formData.aiConfig.enableExplainStepByStep}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aiConfig: {
                        ...formData.aiConfig,
                        enableExplainStepByStep: e.target.checked,
                      },
                    })
                  }
                  className="rounded mt-0.5 shrink-0"
                  style={{ accentColor: ADMIN.main }}
                />
                <span>
                  Kích hoạt giải thích chi tiết từng bước cho câu sai trong sổ tay
                </span>
              </label>
            </div>
          </SettingCard>
        </motion.div>

        {/* Card 4: Anti-cheat */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
        >
          <SettingCard
            icon={Shield}
            iconColor="#059669"
            iconBg="#D1FAE5"
            title="An toàn & Chống gian lận Khảo thí"
          >
            <div className="space-y-2">
              {[
                {
                  key: 'antiCheatShuffleDefault' as const,
                  label:
                    'Tự động xáo trộn ngẫu nhiên thứ tự câu hỏi và đáp án',
                },
                {
                  key: 'enforceFullScreenOnExam' as const,
                  label: 'Yêu cầu chế độ toàn màn hình khi làm bài chính thức',
                },
                {
                  key: 'watermarkPdfExport' as const,
                  label: 'Đóng Watermark bảo vệ bản quyền khi xuất PDF đề thi',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] cursor-pointer hover:bg-[#F5F5F4] transition-colors"
                >
                  <span className="text-xs font-semibold text-[#57534E] leading-relaxed">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.security[item.key]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        security: {
                          ...formData.security,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded w-4 h-4 shrink-0"
                    style={{ accentColor: ADMIN.main }}
                  />
                </label>
              ))}
            </div>
          </SettingCard>
        </motion.div>
      </div>

      {/* Unsaved changes hint (sticky bottom on mobile) */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="sticky bottom-4 z-20 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0F172A] text-white shadow-2xl border border-white/10"
          >
            <span className="text-xs font-medium">
              Bạn có thay đổi chưa lưu. Bấm "Lưu thay đổi" để áp dụng.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer transition-colors"
              >
                Huỷ
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                style={{ backgroundColor: ADMIN.main }}
              >
                Lưu ngay
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};