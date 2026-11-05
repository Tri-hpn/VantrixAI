import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterUsers,
  calculateUserStats,
  validateUserCreation,
  generateUserCsv,
  filterAuditLogs,
} from './admin-logic';
import { AppUser, AuditLog } from '../types/admin';

const sampleUsers: AppUser[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nva@gmail.com',
    role: 'student',
    educationLevel: 'thpt',
    gradeOrClass: '12A1',
    schoolOrOrg: 'THPT Chu Văn An',
    status: 'active',
    joinedAt: 1000,
    lastLoginAt: 2000,
    examsTakenCount: 10,
    classesCount: 1,
    averageScore: 8.5,
  },
  {
    id: '2',
    name: 'Cô Mai Linh',
    email: 'mailinh@school.edu.vn',
    role: 'teacher',
    educationLevel: 'tieuhoc',
    gradeOrClass: 'Lớp 5',
    schoolOrOrg: 'Tiểu học Dịch Vọng',
    status: 'active',
    joinedAt: 1000,
    lastLoginAt: 2000,
    examsTakenCount: 5,
    classesCount: 3,
    averageScore: 9.0,
  },
  {
    id: '3',
    name: 'Học sinh Bị Khóa',
    email: 'khoa@gmail.com',
    role: 'student',
    educationLevel: 'daihoc',
    gradeOrClass: 'Đại học KHTN',
    schoolOrOrg: 'ĐHQG',
    status: 'suspended',
    joinedAt: 1000,
    lastLoginAt: 2000,
    examsTakenCount: 1,
    classesCount: 0,
    averageScore: 3.5,
  },
];

test('calculateUserStats calculates correct counts by role, status and tier', () => {
  const stats = calculateUserStats(sampleUsers);
  assert.equal(stats.total, 3);
  assert.equal(stats.activeCount, 2);
  assert.equal(stats.suspendedCount, 1);
  assert.equal(stats.studentsCount, 2);
  assert.equal(stats.teachersCount, 1);
  assert.equal(stats.adminsCount, 0);
  assert.equal(stats.byLevel.thpt, 1);
  assert.equal(stats.byLevel.tieuhoc, 1);
  assert.equal(stats.byLevel.daihoc, 1);
  assert.equal(stats.byLevel.thcs, 0);
});

test('filterUsers filters by role correctly', () => {
  const filtered = filterUsers(sampleUsers, { role: 'teacher' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].email, 'mailinh@school.edu.vn');
});

test('filterUsers filters by educationLevel correctly', () => {
  const filtered = filterUsers(sampleUsers, { educationLevel: 'daihoc' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Học sinh Bị Khóa');
});

test('filterUsers filters by search query on name or email', () => {
  const filtered = filterUsers(sampleUsers, { search: 'chu van an' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].name, 'Nguyễn Văn A');
});

test('validateUserCreation checks name and email validity', () => {
  assert.equal(
    validateUserCreation({ name: '', email: 'test@gmail.com', role: 'student', educationLevel: 'thpt' }).valid,
    false
  );
  assert.equal(
    validateUserCreation({ name: 'Valid Name', email: 'invalid-email', role: 'student', educationLevel: 'thpt' }).valid,
    false
  );
  assert.equal(
    validateUserCreation({ name: 'Valid Name', email: 'valid@edu.vn', role: 'invalid_role', educationLevel: 'thpt' }).valid,
    false
  );
  assert.equal(
    validateUserCreation({ name: 'Nguyễn Văn Trí', email: 'tri@quizflow.edu.vn', role: 'teacher', educationLevel: 'daihoc' }).valid,
    true
  );
});

test('generateUserCsv outputs proper CSV headers and rows', () => {
  const csv = generateUserCsv(sampleUsers);
  assert.ok(csv.includes('ID,Họ tên,Email,Vai trò,Cấp học'));
  assert.ok(csv.includes('mailinh@school.edu.vn'));
  assert.ok(csv.includes('Giáo viên'));
});

test('filterAuditLogs filters by category, severity and search query', () => {
  const logs: AuditLog[] = [
    {
      id: 'l1',
      adminName: 'Admin',
      adminEmail: 'admin@edu.vn',
      action: 'Bật bảo trì',
      target: 'Hệ thống',
      details: 'Bảo trì server',
      timestamp: 100,
      severity: 'warning',
      category: 'system',
    },
    {
      id: 'l2',
      adminName: 'Admin',
      adminEmail: 'admin@edu.vn',
      action: 'Khóa user',
      target: 'user@gmail.com',
      details: 'Khóa user vi phạm',
      timestamp: 200,
      severity: 'critical',
      category: 'user',
    },
  ];

  const filtered = filterAuditLogs(logs, 'system', 'all', '');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'l1');

  const filteredSev = filterAuditLogs(logs, 'all', 'critical', '');
  assert.equal(filteredSev.length, 1);
  assert.equal(filteredSev[0].id, 'l2');
});
