/**
 * ============================================================================
 * FILE: NotificationToastContainer.tsx — Vantrix AI
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — HỘP CHỨA TOAST THÔNG BÁO NỔI
 * ĐƯỜNG DẪN: /src/components/common/NotificationToastContainer.tsx
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import type { ToastItem, NotificationAction } from '../../types/notification';
import {
  GraduationCap,
  X,
  ArrowRight,
  BookmarkCheck,
  Info,
} from 'lucide-react';

const BRAND = '#0D5C75';

interface ToastContainerProps {
  onHandleAction: (action: NotificationAction) => void;
}

export const NotificationToastContainer: React.FC<ToastContainerProps> = ({ onHandleAction }) => {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] sm:w-96 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastSingleItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
            onAction={(action) => {
              onHandleAction(action);
              dismissToast(toast.id);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastSingleItemProps {
  toast: ToastItem;
  onDismiss: () => void;
  onAction: (action: NotificationAction) => void;
}

const ToastSingleItem: React.FC<ToastSingleItemProps> = ({ toast, onDismiss, onAction }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.durationMs || 7000;

  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const initialProgress = progress;
    const remainingDuration = (initialProgress / 100) * duration;

    const autoTimer = setTimeout(() => {
      onDismiss();
    }, remainingDuration);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentRemaining = Math.max(0, remainingDuration - elapsed);
      setProgress((currentRemaining / duration) * 100);
    }, 50);

    return () => {
      clearTimeout(autoTimer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, onDismiss, duration]);

  const isTeacher = toast.type === 'teacher_assignment';
  const isMistake = toast.type === 'mistake_review';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-white border shadow-2xl p-4 transition-all duration-300 ${
        isTeacher
          ? 'border-[#C7E5EA] ring-2 ring-[#0D5C75]/10'
          : isMistake
          ? 'border-amber-200 ring-2 ring-amber-500/10'
          : 'border-[#E7E5E4] ring-2 ring-slate-500/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm ${
              isTeacher ? '' : isMistake ? 'bg-amber-500' : 'bg-slate-700'
            }`}
            style={isTeacher ? { backgroundColor: BRAND } : undefined}
          >
            {isTeacher ? (
              <GraduationCap className="w-4 h-4" />
            ) : isMistake ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </div>
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isTeacher
                  ? 'bg-[#E6F2F5] text-[#0D5C75] border-[#C7E5EA]'
                  : isMistake
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-[#F5F5F4] text-[#57534E] border-[#E7E5E4]'
              }`}
            >
              {isTeacher
                ? 'Đề thi mới từ giáo viên'
                : isMistake
                ? 'Nhắc nhở ôn tập'
                : 'Hệ thống'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2.5">
        <h4 className="font-serif font-bold text-xs text-[#0F172A] leading-snug line-clamp-1">
          {toast.title}
        </h4>
        <p className="text-[11px] text-[#57534E] mt-1 leading-relaxed line-clamp-2">
          {toast.message}
        </p>
      </div>

      {toast.action && (
        <div className="mt-3 pt-2.5 border-t border-[#F5F5F4] flex items-center justify-between">
          <span className="text-[10px] text-[#A8A29E]">Vừa xong</span>
          <button
            type="button"
            onClick={() => onAction(toast.action!)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer text-white ${
              isTeacher ? 'hover:opacity-90' : isMistake ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-800 hover:bg-slate-900'
            }`}
            style={isTeacher ? { backgroundColor: BRAND } : undefined}
          >
            <span>{toast.action.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F5F5F4]">
        <div
          className={`h-full transition-all duration-75 ease-linear ${
            isTeacher ? '' : isMistake ? 'bg-amber-500' : 'bg-slate-500'
          }`}
          style={{ width: `${progress}%`, backgroundColor: isTeacher ? BRAND : undefined }}
        />
      </div>
    </motion.div>
  );
};