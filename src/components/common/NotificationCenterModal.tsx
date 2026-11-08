/**
 * ============================================================================
 * FILE: NotificationCenterModal.tsx — Vantrix AI
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — TRUNG TÂM THÔNG BÁO
 * ĐƯỜNG DẪN: /src/components/common/NotificationCenterModal.tsx
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationFilter, NotificationAction } from '../../types/notification';
import { filterNotifications, formatNotificationTime } from '../../utils/notification-logic';
import {
  Bell,
  Sparkles,
  GraduationCap,
  BookmarkCheck,
  Check,
  CheckCheck,
  Trash2,
  X,
  Volume2,
  VolumeX,
  ArrowRight,
} from 'lucide-react';

const BRAND = '#0D5C75';
const BRAND_HOVER = '#084356';
const AMBER = '#B45309';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHandleAction: (action: NotificationAction) => void;
  unmasteredMistakeCount: number;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onHandleAction,
  unmasteredMistakeCount,
}) => {
  const {
    notifications,
    unreadCount,
    soundEnabled,
    desktopPermission,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllRead,
    toggleSound,
    requestDesktopPermission,
    simulateTeacherAssignment,
    simulateMistakeReviewReminder,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<NotificationFilter>('all');
  const [permissionMsg, setPermissionMsg] = useState<string>('');

  if (!isOpen) return null;

  const filteredItems = filterNotifications(notifications, activeTab);
  const teacherCount = filterNotifications(notifications, 'teacher_assignment').length;
  const mistakeCount = filterNotifications(notifications, 'mistake_review').length;

  const handleRequestPermission = async () => {
    const granted = await requestDesktopPermission();
    setPermissionMsg(
      granted
        ? 'Đã bật thông báo trình duyệt thành công!'
        : 'Trình duyệt chưa cho phép thông báo.'
    );
    setTimeout(() => setPermissionMsg(''), 4000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end sm:pr-6 pt-16 sm:pt-20 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden flex flex-col max-h-[85vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E7E5E4] bg-[#0B1120] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-white">Thông Báo & Nhắc Nhở</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-teal-200/80">Cập nhật đề thi & chu kỳ ôn tập</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-teal-600/40 border-teal-400/40 text-teal-200'
                      : 'bg-white/10 border-white/10 text-white/50'
                  }`}
                  title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {desktopPermission === 'granted' ? (
                  <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Thông báo Web: Hoạt động
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="text-[11px] text-teal-300 hover:text-white underline cursor-pointer"
                  >
                    Bật thông báo ngoài màn hình
                  </button>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đọc tất cả ({unreadCount})</span>
                </button>
              )}
            </div>

            {permissionMsg && (
              <div className="mt-2 text-xs bg-teal-500/20 border border-teal-400/30 text-teal-200 px-3 py-1.5 rounded-xl">
                {permissionMsg}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-[#F5F5F4] bg-[#FAFAF9] px-3 py-2 gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {[
              { id: 'all' as const, label: 'Tất cả', icon: Bell, count: notifications.length, activeColor: BRAND },
              { id: 'teacher_assignment' as const, label: 'Giáo viên giao', icon: GraduationCap, count: teacherCount, activeColor: BRAND },
              { id: 'mistake_review' as const, label: 'Nhắc ôn tập', icon: BookmarkCheck, count: mistakeCount, activeColor: AMBER },
              { id: 'unread' as const, label: 'Chưa đọc', icon: Sparkles, count: unreadCount, activeColor: '#E11D48' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white shadow-sm border border-[#E7E5E4]'
                      : 'text-[#57534E] hover:text-[#0F172A] hover:bg-[#F5F5F4]'
                  }`}
                  style={isActive ? { color: tab.activeColor } : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#F5F5F4] text-[#57534E]"
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F5F5F4] p-2 sm:p-3 space-y-2 min-h-[220px]">
            {filteredItems.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F4] text-[#A8A29E] flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">Không có thông báo nào</p>
                <p className="text-xs text-[#78716C] mt-1 max-w-xs mx-auto">
                  Khi giáo viên giao bài mới hoặc đến lịch ôn lại lỗi sai, thông báo sẽ xuất hiện.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isTeacher = item.type === 'teacher_assignment';
                const isMistake = item.type === 'mistake_review';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !item.isRead
                        ? 'bg-[#E6F2F5]/40 border-[#C7E5EA] shadow-sm'
                        : 'bg-white border-[#F5F5F4] hover:border-[#E7E5E4]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-white shadow-sm ${
                          isTeacher ? '' : isMistake ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                        style={isTeacher ? { backgroundColor: BRAND } : undefined}
                      >
                        {isTeacher ? <GraduationCap className="w-4 h-4" /> : isMistake ? <BookmarkCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isTeacher
                                  ? 'bg-[#E6F2F5] text-[#0D5C75]'
                                  : isMistake
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-[#F5F5F4] text-[#57534E]'
                              }`}
                            >
                              {isTeacher ? 'Giáo viên giao đề' : isMistake ? 'Nhắc ôn tập lỗi sai' : 'Hệ thống'}
                            </span>
                            {!item.isRead && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                          </div>
                          <span className="text-[11px] text-[#A8A29E] whitespace-nowrap">
                            {formatNotificationTime(item.createdAt)}
                          </span>
                        </div>

                        <h4 className={`text-xs font-bold mt-1 text-[#0F172A] leading-snug ${!item.isRead ? 'font-extrabold' : ''}`}>
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#57534E] mt-1 leading-relaxed">{item.message}</p>

                        {item.action && (
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                markAsRead(item.id);
                                onHandleAction(item.action!);
                                onClose();
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer text-white ${
                                isTeacher ? 'hover:opacity-90' : isMistake ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-800 hover:bg-slate-900'
                              }`}
                              style={isTeacher ? { backgroundColor: BRAND } : undefined}
                            >
                              <span>{item.action.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            {!item.isRead && (
                              <button
                                type="button"
                                onClick={() => markAsRead(item.id)}
                                className="px-2.5 py-1.5 rounded-xl border border-[#E7E5E4] text-[#57534E] hover:bg-[#F5F5F4] text-xs font-semibold cursor-pointer"
                                title="Đánh dấu đã đọc"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNotification(item.id)}
                              className="p-1.5 rounded-xl text-[#A8A29E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa thông báo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Simulator */}
          <div className="p-3 bg-[#FAFAF9] border-t border-[#E7E5E4] text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#57534E] text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: BRAND }} />
                <span>Giả Lập Thông Báo Tức Thời:</span>
              </span>
              {notifications.some((n) => n.isRead) && (
                <button
                  type="button"
                  onClick={clearAllRead}
                  className="text-[11px] text-[#A8A29E] hover:text-[#57534E] cursor-pointer"
                >
                  Xóa mục đã đọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => simulateTeacherAssignment()}
                className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border"
                style={{ backgroundColor: '#E6F2F5', color: BRAND, borderColor: '#C7E5EA' }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Giao đề mới (Thầy Trí)</span>
              </button>

              <button
                type="button"
                onClick={() => simulateMistakeReviewReminder(unmasteredMistakeCount || 2)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Đến giờ ôn lỗi sai</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};