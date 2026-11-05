import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterNotifications,
  countUnreadNotifications,
  formatNotificationTime,
  createTeacherAssignmentNotification,
  createMistakeReviewNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotification,
  clearAllReadNotifications,
} from './notification-logic';
import { NotificationItem } from '../types/notification';

const SAMPLE_NOTIFS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'teacher_assignment',
    title: 'Đề thi Toán 12',
    message: 'Thầy Trí đã giao đề mới',
    createdAt: 1000000,
    isRead: false,
  },
  {
    id: 'n2',
    type: 'mistake_review',
    title: 'Đến giờ ôn tập',
    message: 'Có 3 câu hỏi cần ôn',
    createdAt: 950000,
    isRead: true,
  },
  {
    id: 'n3',
    type: 'system',
    title: 'Hệ thống cập nhật',
    message: 'QuizFlow phiên bản mới',
    createdAt: 900000,
    isRead: false,
  },
];

test('filterNotifications: correctly filters by type and unread state', () => {
  assert.equal(filterNotifications(SAMPLE_NOTIFS, 'all').length, 3);
  assert.equal(filterNotifications(SAMPLE_NOTIFS, 'teacher_assignment').length, 1);
  assert.equal(filterNotifications(SAMPLE_NOTIFS, 'mistake_review').length, 1);
  assert.equal(filterNotifications(SAMPLE_NOTIFS, 'unread').length, 2);
  assert.equal(filterNotifications([], 'all').length, 0);
});

test('countUnreadNotifications: counts unread notifications properly', () => {
  assert.equal(countUnreadNotifications(SAMPLE_NOTIFS), 2);
  assert.equal(countUnreadNotifications([]), 0);
  assert.equal(countUnreadNotifications([{ id: 'x', isRead: true } as any]), 0);
});

test('formatNotificationTime: formats relative Vietnamese timestamps accurately', () => {
  const baseTime = 1000000000000;
  // < 60s
  assert.equal(formatNotificationTime(baseTime - 30 * 1000, baseTime), 'Vừa xong');
  // minutes
  assert.equal(formatNotificationTime(baseTime - 5 * 60 * 1000, baseTime), '5 phút trước');
  // hours
  assert.equal(formatNotificationTime(baseTime - 3 * 3600 * 1000, baseTime), '3 giờ trước');
  // yesterday (1 day)
  assert.equal(formatNotificationTime(baseTime - 24 * 3600 * 1000, baseTime), 'Hôm qua');
  // days
  assert.equal(formatNotificationTime(baseTime - 4 * 24 * 3600 * 1000, baseTime), '4 ngày trước');
});

test('createTeacherAssignmentNotification: generates compliant notification object with action', () => {
  const notif = createTeacherAssignmentNotification({
    teacherName: 'Thầy Nguyễn Văn Trí',
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025',
    examId: 'thpt-ly-chuyen-2025',
    className: '12 Chuyên Lý',
    deadline: '23:59 Chủ Nhật',
  });

  assert.equal(notif.type, 'teacher_assignment');
  assert.equal(notif.isRead, false);
  assert.ok(notif.title.includes('Thầy Nguyễn Văn Trí'));
  assert.ok(notif.message.includes('12 Chuyên Lý'));
  assert.ok(notif.message.includes('23:59 Chủ Nhật'));
  assert.equal(notif.action?.actionType, 'START_EXAM');
  assert.equal(notif.action?.payload?.examId, 'thpt-ly-chuyen-2025');
  assert.equal(notif.priority, 'high');
});

test('createMistakeReviewNotification: generates urgent reminder with mistake topics', () => {
  const notif = createMistakeReviewNotification({
    unmasteredCount: 4,
    topTopics: ['Chuyển động đều', 'Phân số'],
  });

  assert.equal(notif.type, 'mistake_review');
  assert.equal(notif.isRead, false);
  assert.ok(notif.message.includes('4 câu hỏi chưa thành thạo'));
  assert.ok(notif.message.includes('Chuyển động đều'));
  assert.equal(notif.action?.actionType, 'START_QUICK_REVIEW');
  assert.equal(notif.action?.payload?.topic, 'Chuyển động đều');
  assert.equal(notif.priority, 'urgent');
});

test('markAllNotificationsAsRead: sets isRead true for all items', () => {
  const updated = markAllNotificationsAsRead(SAMPLE_NOTIFS);
  assert.equal(updated.every((n) => n.isRead), true);
  assert.equal(updated.length, 3);
});

test('markNotificationAsRead: sets isRead true only for target ID', () => {
  const updated = markNotificationAsRead(SAMPLE_NOTIFS, 'n1');
  assert.equal(updated.find((n) => n.id === 'n1')?.isRead, true);
  assert.equal(updated.find((n) => n.id === 'n3')?.isRead, false);
});

test('removeNotification: removes item by id', () => {
  const updated = removeNotification(SAMPLE_NOTIFS, 'n2');
  assert.equal(updated.length, 2);
  assert.equal(updated.some((n) => n.id === 'n2'), false);
});

test('clearAllReadNotifications: keeps only unread items', () => {
  const unreadOnly = clearAllReadNotifications(SAMPLE_NOTIFS);
  assert.equal(unreadOnly.length, 2);
  assert.equal(unreadOnly.some((n) => n.id === 'n2'), false);
});
