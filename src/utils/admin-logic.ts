/**
 * ============================================================================
 * FILE: admin-logic.ts — Vantrix AI
 * PHÂN HỆ: UTILITIES — LOGIC QUẢN TRỊ HỆ THỐNG
 * ============================================================================
 */

import type { AppUser, AuditLog } from '../types/admin';
import type { EducationLevel } from '../types/quiz';

export interface UserFilters {
  search?: string;
  role?: 'all' | 'student' | 'teacher' | 'admin';
  educationLevel?: 'all' | EducationLevel;
  status?: 'all' | 'active' | 'suspended' | 'pending';
}

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function filterUsers(users: AppUser[], filters: UserFilters): AppUser[] {
  const { search = '', role = 'all', educationLevel = 'all', status = 'all' } = filters;
  const rawQ = search.trim().toLowerCase();
  const normalizedQ = removeVietnameseTones(rawQ);

  return users.filter((u) => {
    const rawTarget = `${u.name} ${u.email} ${u.schoolOrOrg} ${u.gradeOrClass} ${u.phone || ''}`.toLowerCase();
    const normalizedTarget = removeVietnameseTones(rawTarget);

    const matchSearch = !rawQ || rawTarget.includes(rawQ) || normalizedTarget.includes(normalizedQ);
    const matchRole = role === 'all' || u.role === role;
    const matchLevel = educationLevel === 'all' || u.educationLevel === educationLevel;
    const matchStatus = status === 'all' || u.status === status;

    return matchSearch && matchRole && matchLevel && matchStatus;
  });
}

export interface UserSummaryStats {
  total: number;
  activeCount: number;
  suspendedCount: number;
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  byLevel: { tieuhoc: number; thcs: number; thpt: number; daihoc: number };
}

export function calculateUserStats(users: AppUser[]): UserSummaryStats {
  const stats: UserSummaryStats = {
    total: users.length,
    activeCount: 0,
    suspendedCount: 0,
    studentsCount: 0,
    teachersCount: 0,
    adminsCount: 0,
    byLevel: { tieuhoc: 0, thcs: 0, thpt: 0, daihoc: 0 },
  };

  for (const u of users) {
    if (u.status === 'active') stats.activeCount++;
    if (u.status === 'suspended') stats.suspendedCount++;

    if (u.role === 'student') stats.studentsCount++;
    else if (u.role === 'teacher') stats.teachersCount++;
    else if (u.role === 'admin') stats.adminsCount++;

    if (u.educationLevel && stats.byLevel[u.educationLevel] !== undefined) {
      stats.byLevel[u.educationLevel]++;
    }
  }

  return stats;
}

export function validateUserCreation(data: {
  name: string;
  email: string;
  role: string;
  educationLevel: string;
}): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim().length < 2) return { valid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) return { valid: false, error: 'Địa chỉ email không hợp lệ' };
  if (!['student', 'teacher', 'admin'].includes(data.role)) return { valid: false, error: 'Vai trò người dùng không hợp lệ' };
  if (!['tieuhoc', 'thcs', 'thpt', 'daihoc'].includes(data.educationLevel)) return { valid: false, error: 'Cấp học không hợp lệ' };
  return { valid: true };
}

/** Escape CSV RFC 4180 để chống injection */
function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function generateUserCsv(users: AppUser[]): string {
  const headers = ['ID', 'Họ tên', 'Email', 'Vai trò', 'Cấp học', 'Trường / Đơn vị', 'Lớp', 'Trạng thái', 'Đề đã làm', 'Điểm TB'];
  const rows = users.map((u) => [
    escapeCsv(u.id),
    escapeCsv(u.name),
    escapeCsv(u.email),
    u.role === 'admin' ? 'Quản trị viên' : u.role === 'teacher' ? 'Giáo viên' : 'Học sinh',
    u.educationLevel === 'tieuhoc' ? 'Tiểu học' : u.educationLevel === 'thcs' ? 'THCS' : u.educationLevel === 'thpt' ? 'THPT' : 'Đại học',
    escapeCsv(u.schoolOrOrg),
    escapeCsv(u.gradeOrClass),
    u.status === 'active' ? 'Hoạt động' : u.status === 'suspended' ? 'Bị khóa' : 'Chờ duyệt',
    u.examsTakenCount,
    u.averageScore || 0,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function filterAuditLogs(
  logs: AuditLog[],
  category: 'all' | 'user' | 'exam' | 'system' | 'ai',
  severity: 'all' | 'info' | 'warning' | 'critical',
  searchQuery: string
): AuditLog[] {
  const q = searchQuery.trim().toLowerCase();
  return logs.filter((log) => {
    const matchCat = category === 'all' || log.category === category;
    const matchSev = severity === 'all' || log.severity === severity;
    const matchSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    return matchCat && matchSev && matchSearch;
  });
}