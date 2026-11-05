/**
 * ============================================================================
 * FILE: auth-logic.ts (Logic Xác Thực — Vantrix AI)
 * PHÂN HỆ: UTILITIES
 * ĐƯỜNG DẪN: /src/utils/auth-logic.ts
 * ============================================================================
 */

import type { EducationLevel, UserRole } from '../types/quiz';

export interface RegisterFormData {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  educationLevel: EducationLevel;
  gradeOrClass: string;
  schoolOrOrg: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export function validateLoginForm(
  email: string,
  password: string
): { valid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Vui lòng nhập email hoặc số điện thoại' };
  }
  if (!password || password.length < 6) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  return { valid: true };
}

export function validateRegisterForm(data: RegisterFormData): {
  valid: boolean;
  error?: string;
} {
  if (!data.name || data.name.trim().length < 2) {
    return { valid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    return { valid: false, error: 'Email không đúng định dạng' };
  }
  if (!data.password || data.password.length < 6) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  if (data.password !== data.confirmPassword) {
    return { valid: false, error: 'Mật khẩu xác nhận không khớp' };
  }
  if (!data.agreeTerms) {
    return {
      valid: false,
      error: 'Bạn cần đồng ý với Điều khoản sử dụng của Vantrix AI',
    };
  }
  return { valid: true };
}

export function validateForgotPassword(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Vui lòng nhập email đã đăng ký' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Email không hợp lệ' };
  }
  return { valid: true };
}

export function validateResetPassword(
  otp: string,
  newPass: string,
  confirmPass: string
): { valid: boolean; error?: string } {
  if (!otp || otp.trim().length !== 6) {
    return { valid: false, error: 'Mã xác thực OTP phải gồm đúng 6 chữ số' };
  }
  if (!newPass || newPass.length < 6) {
    return { valid: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự' };
  }
  if (newPass !== confirmPass) {
    return { valid: false, error: 'Mật khẩu xác nhận không trùng khớp' };
  }
  return { valid: true };
}

export function calculatePasswordStrength(password: string): {
  score: number;
  label: 'Rất yếu' | 'Yếu' | 'Trung bình' | 'Khá mạnh' | 'Rất mạnh';
  color: string;
} {
  if (!password) return { score: 0, label: 'Rất yếu', color: 'bg-[#E7E5E4]' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  switch (score) {
    case 1:
      return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
    case 2:
      return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    case 3:
      return { score: 3, label: 'Khá mạnh', color: 'bg-teal-500' };
    case 4:
      return { score: 4, label: 'Rất mạnh', color: 'bg-emerald-500' };
    default:
      return { score: 0, label: 'Rất yếu', color: 'bg-[#E7E5E4]' };
  }
}