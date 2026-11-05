export type NotificationType = 'teacher_assignment' | 'mistake_review' | 'system' | 'badge_reward';

export type NotificationActionType = 'START_EXAM' | 'OPEN_MISTAKES' | 'OPEN_CLASSES' | 'START_QUICK_REVIEW' | 'OPEN_ROADMAP';

export interface NotificationAction {
  label: string;
  actionType: NotificationActionType;
  payload?: {
    examId?: string;
    classId?: string;
    topic?: string;
  };
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number; // epoch ms
  isRead: boolean;
  senderName?: string;
  senderRole?: string;
  examId?: string;
  classId?: string;
  action?: NotificationAction;
  priority?: 'normal' | 'high' | 'urgent';
  soundAlert?: boolean;
}

export type NotificationFilter = 'all' | 'teacher_assignment' | 'mistake_review' | 'unread';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  action?: NotificationAction;
  durationMs?: number;
  createdAt: number;
}
