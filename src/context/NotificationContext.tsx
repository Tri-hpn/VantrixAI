/**
 * ============================================================================
 * FILE: NotificationContext.tsx — Vantrix AI
 * PHÂN HỆ: CONTEXT — Quản lý trạng thái thông báo toàn cục
 * ĐƯỜNG DẪN: /src/context/NotificationContext.tsx
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  NotificationItem,
  NotificationType,
  NotificationAction,
  ToastItem,
} from '../types/notification';
import {
  countUnreadNotifications,
  createTeacherAssignmentNotification,
  createMistakeReviewNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotification as removeNotifLogic,
  clearAllReadNotifications,
} from '../utils/notification-logic';
import { playNotificationChime } from '../utils/sound';

interface NotificationContextType {
  notifications: NotificationItem[];
  toasts: ToastItem[];
  unreadCount: number;
  soundEnabled: boolean;
  desktopPermission: NotificationPermission;
  notify: (params: {
    title: string;
    message: string;
    type: NotificationType;
    action?: NotificationAction;
    priority?: 'normal' | 'high' | 'urgent';
    soundAlert?: boolean;
    examId?: string;
    classId?: string;
    senderName?: string;
  }) => void;
  notifyTeacherAssignment: (params: {
    teacherName: string;
    examTitle: string;
    examId: string;
    className?: string;
    deadline?: string;
  }) => void;
  notifyMistakeReview: (params: {
    unmasteredCount: number;
    topTopics?: string[];
  }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllRead: () => void;
  dismissToast: (id: string) => void;
  toggleSound: () => void;
  requestDesktopPermission: () => Promise<boolean>;
  simulateTeacherAssignment: (examTitle?: string, teacherName?: string) => void;
  simulateMistakeReviewReminder: (unmasteredCount?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'seed-notif-assignment',
    type: 'teacher_assignment',
    title: 'Đề thi mới từ Thầy Nguyễn Văn Trí',
    message:
      'Thầy Trí vừa giao đề "Đề Thi Thử Tốt Nghiệp THPT 2025 - Môn Vật Lí" cho lớp [12 Chuyên Lý]. Hạn nộp bài: 23:59 Chủ Nhật tuần này.',
    createdAt: Date.now() - 1000 * 60 * 18,
    isRead: false,
    senderName: 'Thầy Nguyễn Văn Trí',
    senderRole: 'Giáo viên',
    examId: 'thpt-ly-chuyen-2025',
    priority: 'high',
    action: {
      label: 'Vào làm bài ngay',
      actionType: 'START_EXAM',
      payload: { examId: 'thpt-ly-chuyen-2025' },
    },
  },
  {
    id: 'seed-notif-mistake',
    type: 'mistake_review',
    title: 'Đã đến giờ ôn tập sổ tay lỗi sai!',
    message:
      'Theo chu kỳ lặp lại ngắt quãng Ebbinghaus, bạn có 2 câu hỏi chưa làm chủ (Chuyển động đều, Phân số). Dành 5 phút củng cố ngay để đạt điểm tối đa.',
    createdAt: Date.now() - 1000 * 60 * 65,
    isRead: false,
    senderName: 'Vantrix AI Spaced Repetition',
    senderRole: 'Hệ thống',
    priority: 'urgent',
    action: {
      label: 'Ôn 5 phút ngay',
      actionType: 'START_QUICK_REVIEW',
      payload: { topic: 'Toán học' },
    },
  },
  {
    id: 'seed-notif-system',
    type: 'system',
    title: 'Vantrix AI 2.5: Kích hoạt thông báo học tập',
    message:
      'Hệ thống thông báo thời gian thực đã sẵn sàng nhắc nhở khi có bài thi mới từ thầy cô và thông báo ôn tập định kỳ.',
    createdAt: Date.now() - 1000 * 3600 * 8,
    isRead: true,
    senderName: 'Ban Quản Trị Vantrix',
    senderRole: 'Quản trị viên',
    priority: 'normal',
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('vantrix_notifications_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return INITIAL_SEED_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vantrix_sound_enabled');
      if (saved !== null) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return true;
  });

  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Đồng bộ LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('vantrix_notifications_list', JSON.stringify(notifications));
    } catch {
      /* ignore */
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('vantrix_sound_enabled', JSON.stringify(soundEnabled));
    } catch {
      /* ignore */
    }
  }, [soundEnabled]);

  const unreadCount = useMemo(() => countUnreadNotifications(notifications), [notifications]);

  const triggerDesktopNotification = useCallback((title: string, body: string) => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    } catch {
      /* ignore browser security restrictions */
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (params: {
      title: string;
      message: string;
      type: NotificationType;
      action?: NotificationAction;
      priority?: 'normal' | 'high' | 'urgent';
      soundAlert?: boolean;
      examId?: string;
      classId?: string;
      senderName?: string;
    }) => {
      const now = Date.now();
      const newNotif: NotificationItem = {
        id: `notif-${now}-${Math.random().toString(36).substring(2, 7)}`,
        type: params.type,
        title: params.title,
        message: params.message,
        createdAt: now,
        isRead: false,
        action: params.action,
        priority: params.priority || 'normal',
        examId: params.examId,
        classId: params.classId,
        senderName: params.senderName,
      };

      setNotifications((prev) => [newNotif, ...prev]);

      const newToast: ToastItem = {
        id: `toast-${now}`,
        title: params.title,
        message: params.message,
        type: params.type,
        action: params.action,
        durationMs: 7000,
        createdAt: now,
      };
      
      // Chỉ giữ tối đa 4 toast trên màn hình
      setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

      if (soundEnabled && params.soundAlert !== false) {
        playNotificationChime(
          params.type === 'teacher_assignment'
            ? 'teacher_assignment'
            : params.type === 'mistake_review'
            ? 'mistake_review'
            : 'default'
        );
      }

      triggerDesktopNotification(params.title, params.message);
    },
    [soundEnabled, triggerDesktopNotification]
  );

  const notifyTeacherAssignment = useCallback(
    (params: {
      teacherName: string;
      examTitle: string;
      examId: string;
      className?: string;
      deadline?: string;
    }) => {
      const notif = createTeacherAssignmentNotification(params);
      notify({
        title: notif.title,
        message: notif.message,
        type: notif.type,
        action: notif.action,
        priority: notif.priority,
        soundAlert: true,
        examId: params.examId,
        senderName: params.teacherName,
      });
    },
    [notify]
  );

  const notifyMistakeReview = useCallback(
    (params: { unmasteredCount: number; topTopics?: string[] }) => {
      const notif = createMistakeReviewNotification(params);
      notify({
        title: notif.title,
        message: notif.message,
        type: notif.type,
        action: notif.action,
        priority: notif.priority,
        soundAlert: true,
        senderName: notif.senderName,
      });
    },
    [notify]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => markNotificationAsRead(prev, id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => markAllNotificationsAsRead(prev));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => removeNotifLogic(prev, id));
  }, []);

  const clearAllRead = useCallback(() => {
    setNotifications((prev) => clearAllReadNotifications(prev));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const requestDesktopPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setDesktopPermission(res);
        return res === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  const simulateTeacherAssignment = useCallback(
    (examTitle?: string, teacherName?: string) => {
      notifyTeacherAssignment({
        teacherName: teacherName || 'Thầy Nguyễn Văn Trí',
        examTitle: examTitle || 'Đề Kiểm Tra Giữa Kỳ Toán & Khoa Học 2025',
        examId: 'tieuhoc-toan-lop5-2025',
        className: 'Lớp 12 Chuyên Toán & Khoa Học',
        deadline: '21:00 Ngày mai',
      });
    },
    [notifyTeacherAssignment]
  );

  const simulateMistakeReviewReminder = useCallback(
    (unmasteredCount: number = 3) => {
      notifyMistakeReview({
        unmasteredCount,
        topTopics: ['Chuyển động đều', 'Phân số & tỉ số', 'Hàm số mũ'],
      });
    },
    [notifyMistakeReview]
  );

  // Bọc toàn bộ giá trị context trong useMemo để tránh re-render không cần thiết
  const contextValue = useMemo<NotificationContextType>(
    () => ({
      notifications,
      toasts,
      unreadCount,
      soundEnabled,
      desktopPermission,
      notify,
      notifyTeacherAssignment,
      notifyMistakeReview,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllRead,
      dismissToast,
      toggleSound,
      requestDesktopPermission,
      simulateTeacherAssignment,
      simulateMistakeReviewReminder,
    }),
    [
      notifications, toasts, unreadCount, soundEnabled, desktopPermission,
      notify, notifyTeacherAssignment, notifyMistakeReview,
      markAsRead, markAllAsRead, removeNotification, clearAllRead,
      dismissToast, toggleSound, requestDesktopPermission,
      simulateTeacherAssignment, simulateMistakeReviewReminder
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};