/**
 * ============================================================================
 * FILE: notification-logic.ts — Vantrix AI
 * PHÂN HỆ: UTILITIES — Xử lý logic thông báo
 * ĐƯỜNG DẪN: /src/utils/notification-logic.ts
 * ============================================================================
 */

import type { NotificationItem, NotificationFilter } from '../types/notification';

export function filterNotifications(
  items: NotificationItem[],
  filter: NotificationFilter
): NotificationItem[] {
  if (!Array.isArray(items)) return [];

  switch (filter) {
    case 'teacher_assignment':
      return items.filter((n) => n.type === 'teacher_assignment');
    case 'mistake_review':
      return items.filter((n) => n.type === 'mistake_review');
    case 'unread':
      return items.filter((n) => !n.isRead);
    case 'all':
    default:
      return items;
  }
}

export function countUnreadNotifications(items: NotificationItem[]): number {
  if (!Array.isArray(items)) return 0;
  return items.filter((n) => !n.isRead).length;
}

/**
 * Định dạng thời gian tương đối (VD: "Vừa xong", "5 phút trước", "Hôm qua")
 */
export function formatNotificationTime(timestamp: number, nowMs: number = Date.now()): string {
  if (!timestamp || isNaN(timestamp)) return 'Vừa xong';

  const diffSeconds = Math.max(0, Math.floor((nowMs - timestamp) / 1000));

  if (diffSeconds < 60) return 'Vừa xong';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month} ${hours}:${minutes}`;
}

/**
 * Tạo thông báo: Giáo viên giao bài tập mới
 */
export function createTeacherAssignmentNotification(params: {
  id?: string;
  teacherName: string;
  examTitle: string;
  examId: string;
  className?: string;
  deadline?: string;
  now?: number;
}): NotificationItem {
  const timestamp = params.now ?? Date.now();
  const id = params.id || `notif-assign-${timestamp}-${Math.random().toString(36).slice(2, 7)}`;
  const classNotice = params.className ? ` cho lớp [${params.className}]` : '';
  const deadlineNotice = params.deadline ? ` • Hạn nộp: ${params.deadline}` : '';

  return {
    id,
    type: 'teacher_assignment',
    title: `Đề thi mới từ ${params.teacherName}`,
    message: `${params.teacherName} vừa giao đề thi "${params.examTitle}"${classNotice}.${deadlineNotice} Hãy làm bài đúng hạn để giáo viên chấm điểm.`,
    createdAt: timestamp,
    isRead: false,
    senderName: params.teacherName,
    senderRole: 'Giáo viên',
    examId: params.examId,
    priority: 'high',
    soundAlert: true,
    action: {
      label: 'Vào làm bài ngay',
      actionType: 'START_EXAM',
      payload: { examId: params.examId },
    },
  };
}

/**
 * Tạo thông báo: Nhắc nhở ôn tập sổ tay lỗi sai
 */
export function createMistakeReviewNotification(params: {
  id?: string;
  unmasteredCount: number;
  topTopics?: string[];
  now?: number;
}): NotificationItem {
  const timestamp = params.now ?? Date.now();
  const id = params.id || `notif-mistake-${timestamp}-${Math.random().toString(36).slice(2, 7)}`;
  const count = Math.max(1, params.unmasteredCount);

  let topicSnippet = '';
  if (params.topTopics && params.topTopics.length > 0) {
    topicSnippet = ` (${params.topTopics.slice(0, 2).join(', ')})`;
  }

  return {
    id,
    type: 'mistake_review',
    title: 'Đã đến giờ ôn tập sổ tay lỗi sai!',
    message: `Theo đường cong quên lãng Ebbinghaus, bạn có ${count} câu hỏi chưa thành thạo${topicSnippet}. Dành 5 phút ôn lại ngay để khắc phục lỗ hổng kiến thức.`,
    createdAt: timestamp,
    isRead: false,
    senderName: 'Vantrix AI Spaced Repetition',
    senderRole: 'Hệ thống',
    priority: 'urgent',
    soundAlert: true,
    action: {
      label: 'Ôn 5 phút ngay',
      actionType: 'START_QUICK_REVIEW',
      payload: { topic: params.topTopics?.[0] },
    },
  };
}

export function markAllNotificationsAsRead(items: NotificationItem[]): NotificationItem[] {
  return items.map((n) => (n.isRead ? n : { ...n, isRead: true }));
}

export function markNotificationAsRead(items: NotificationItem[], id: string): NotificationItem[] {
  return items.map((n) => (n.id === id ? { ...n, isRead: true } : n));
}

export function removeNotification(items: NotificationItem[], id: string): NotificationItem[] {
  return items.filter((n) => n.id !== id);
}

export function clearAllReadNotifications(items: NotificationItem[]): NotificationItem[] {
  return items.filter((n) => !n.isRead);
}