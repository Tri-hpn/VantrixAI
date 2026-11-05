/**
 * ============================================================================
 * FILE: AuthPages (Hệ Thống Xác Thực: Đăng Nhập, Đăng Ký, Quên Mật Khẩu)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: XÁC THỰC TÀI KHOẢN (AUTH) — Học sinh, Giáo viên & Admin
 * ĐƯỜNG DẪN: /src/components/auth/AuthPages.tsx
 * CHỨC NĂNG:
 *  - Đăng nhập bằng email / SĐT + mật khẩu
 *  - SSO 1-chạm (Google, Microsoft)
 *  - Đăng ký phân quyền: Học sinh vs Giáo viên, đủ 4 cấp học
 *  - Quên mật khẩu với OTP 6 số
 *  - 1-Click Demo Login nhanh cho nhà đánh giá
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppUser } from '../../types/admin';
import { EducationLevel, UserRole } from '../../types/quiz';
import {
  validateLoginForm,
  validateRegisterForm,
  validateForgotPassword,
  validateResetPassword,
  calculatePasswordStrength,
  RegisterFormData,
} from '../../utils/auth-logic';
import { SocialAuthButtons } from './SocialAuthButtons';
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  School,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Shield,
  Sparkles,
} from 'lucide-react';

export type AuthMode = 'login' | 'register' | 'forgot_password';

interface AuthPagesProps {
  initialMode?: AuthMode;
  onLoginSuccess: (user: AppUser) => void;
  onBackToApp: () => void;
  existingUsers: AppUser[];
  onRegisterUser: (newUser: AppUser) => void;
}

const PALETTE = {
  brand: '#0D5C75',
  brandHover: '#084356',
  brandTint: '#E6F2F5',
  brandBorder: '#C7E5EA',
  ink: '#0F172A',
  muted: '#78716C',
  border: '#E7E5E4',
} as const;

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onBackToApp,
  existingUsers,
  onRegisterUser,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);

  // Login
  const [loginEmail, setLoginEmail] = useState('vantritran518@gmail.com');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginRemember, setLoginRemember] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    educationLevel: 'thpt',
    gradeOrClass: 'Lớp 12',
    schoolOrOrg: 'THPT Chu Văn An',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Forgot Password
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 1-Click Demo Login
  // ---------------------------------------------------------------------------
  const handleQuickDemoLogin = (userEmail: string) => {
    const found = existingUsers.find(
      (u) => u.email.toLowerCase() === userEmail.toLowerCase()
    );
    if (found) {
      if (found.status === 'suspended') {
        setLoginError('Tài khoản này hiện đang bị khóa bởi Quản trị viên.');
        return;
      }
      onLoginSuccess(found);
    } else {
      onLoginSuccess({
        id: `usr-${Date.now()}`,
        name: 'Văn Trí (Học sinh)',
        email: userEmail,
        role: 'student',
        educationLevel: 'thpt',
        gradeOrClass: 'Lớp 12',
        schoolOrOrg: 'THPT Yên Hòa',
        status: 'active',
        joinedAt: Date.now(),
        lastLoginAt: Date.now(),
        examsTakenCount: 15,
        classesCount: 2,
        averageScore: 8.8,
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Login Submit
  // ---------------------------------------------------------------------------
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const validation = validateLoginForm(loginEmail, loginPassword);
    if (!validation.valid) {
      setLoginError(validation.error || 'Dữ liệu không hợp lệ');
      return;
    }

    const found = existingUsers.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.trim().toLowerCase() ||
        (u.phone && u.phone === loginEmail.trim())
    );

    if (found) {
      if (found.status === 'suspended') {
        setLoginError(
          'Tài khoản này đã bị khóa do vi phạm nội quy. Vui lòng liên hệ ban quản trị.'
        );
        return;
      }
      onLoginSuccess(found);
    } else {
      const mockCreated: AppUser = {
        id: `usr-${Date.now()}`,
        name: loginEmail.split('@')[0],
        email: loginEmail.trim(),
        role: 'student',
        educationLevel: 'thpt',
        gradeOrClass: 'Lớp 12',
        schoolOrOrg: 'Trường THPT',
        status: 'active',
        joinedAt: Date.now(),
        lastLoginAt: Date.now(),
        examsTakenCount: 0,
        classesCount: 0,
        averageScore: 0,
      };
      onRegisterUser(mockCreated);
      onLoginSuccess(mockCreated);
    }
  };

  // ---------------------------------------------------------------------------
  // Register Submit
  // ---------------------------------------------------------------------------
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const validation = validateRegisterForm(registerData);
    if (!validation.valid) {
      setRegisterError(validation.error || 'Dữ liệu không hợp lệ');
      return;
    }

    if (
      existingUsers.some(
        (u) => u.email.toLowerCase() === registerData.email.trim().toLowerCase()
      )
    ) {
      setRegisterError(
        'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.'
      );
      return;
    }

    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      name: registerData.name.trim(),
      email: registerData.email.trim(),
      phone: registerData.phone?.trim() || undefined,
      role: registerData.role,
      educationLevel: registerData.educationLevel,
      gradeOrClass: registerData.gradeOrClass.trim() || 'Lớp 12',
      schoolOrOrg: registerData.schoolOrOrg.trim() || 'Chưa cập nhật',
      status: 'active',
      joinedAt: Date.now(),
      lastLoginAt: Date.now(),
      examsTakenCount: 0,
      classesCount: 0,
      averageScore: 0,
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
  };

  // ---------------------------------------------------------------------------
  // Forgot Password
  // ---------------------------------------------------------------------------
  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const validation = validateForgotPassword(forgotEmail);
    if (!validation.valid) {
      setForgotError(validation.error || 'Email không hợp lệ');
      return;
    }

    setForgotStep(2);
    setForgotSuccessMessage(
      `Mã xác thực OTP gồm 6 chữ số đã được gửi tới ${forgotEmail}.`
    );
  };

  const handleForgotResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const validation = validateResetPassword(
      forgotOtp,
      newPassword,
      confirmNewPassword
    );
    if (!validation.valid) {
      setForgotError(validation.error || 'Dữ liệu không hợp lệ');
      return;
    }

    setForgotStep(4);
    setForgotSuccessMessage('Mật khẩu của bạn đã được đặt lại thành công!');
  };

  const passwordStrength = calculatePasswordStrength(registerData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] via-[#F0F9FB] to-[#FAFAF9] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <button
          type="button"
          onClick={onBackToApp}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#78716C] hover:text-[#0D5C75] mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ Vantrix</span>
        </button>

        <div className="flex items-center justify-center gap-2.5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0D5C75] to-[#042F2E] flex items-center justify-center text-white shadow-lg shadow-[#0D5C75]/20"
          >
            <Brain className="w-6 h-6 text-teal-200" />
          </motion.div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">
              Vantrix AI
            </span>
            <p className="text-xs text-[#78716C]">
              Nền tảng Khảo thí & Luyện thi Toàn cấp
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white py-8 px-6 sm:px-10 shadow-2xl shadow-[#0D5C75]/5 rounded-3xl border border-[#E7E5E4]"
        >
          <AnimatePresence mode="wait">
            {/* ============================================================ */}
            {/* 1. LOGIN */}
            {/* ============================================================ */}
            {authMode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                    Đăng nhập tài khoản
                  </h2>
                  <p className="mt-1 text-xs text-[#78716C]">
                    Chào mừng bạn quay lại! Nhập thông tin để tiếp tục ôn luyện và thi thử.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Email hoặc Số điện thoại
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="vidu@vantrix.edu.vn hoặc 0912..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E7E5E4] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#0F172A]">
                        Mật khẩu
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(1);
                          setForgotEmail(loginEmail);
                          setAuthMode('forgot_password');
                        }}
                        className="text-xs font-bold text-[#0D5C75] hover:underline cursor-pointer"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E7E5E4] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C] p-0.5"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-[#57534E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loginRemember}
                      onChange={(e) => setLoginRemember(e.target.checked)}
                      className="accent-[#0D5C75] rounded"
                    />
                    <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-lg shadow-[#0D5C75]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Đăng nhập vào Vantrix</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>

                <div className="pt-2">
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E7E5E4]" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-3 font-semibold text-[#78716C]">
                        Hoặc đăng nhập nhanh với
                      </span>
                    </div>
                  </div>

                  <SocialAuthButtons
                    onSuccess={(user) => {
                      onRegisterUser(user);
                      onLoginSuccess(user);
                    }}
                    mode="login"
                  />
                </div>

                {/* Quick Demo Logins */}
                <div className="pt-4 border-t border-[#E7E5E4]">
                  <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-2 text-center">
                    Đăng nhập nhanh tài khoản mẫu (1-Click Demo)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('vantritran518@gmail.com')}
                      className="p-2 rounded-xl border border-[#C7E5EA] bg-[#E6F2F5] hover:bg-[#D6E9EE] text-[#084356] font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-[#0D5C75] shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[11px]">Học sinh THPT</p>
                        <p className="text-[10px] text-[#0D5C75]">Văn Trí (9.0+)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('mailinh.edu@gmail.com')}
                      className="p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <School className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[11px]">Giáo viên Tiểu học</p>
                        <p className="text-[10px] text-amber-700">Cô Mai Linh</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('minhtuan.lecturer@vnu.edu.vn')}
                      className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[11px]">Giảng viên ĐH</p>
                        <p className="text-[10px] text-emerald-700">TS. Tuấn (ĐHQG)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin@vantrix.edu.vn')}
                      className="p-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-[11px]">Quản trị viên</p>
                        <p className="text-[10px] text-purple-700">Admin Tổng</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-[#78716C]">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="font-bold text-[#0D5C75] hover:underline cursor-pointer"
                    >
                      Đăng ký tài khoản mới ngay
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* 2. REGISTER */}
            {/* ============================================================ */}
            {authMode === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                    Tạo tài khoản Vantrix
                  </h2>
                  <p className="mt-1 text-xs text-[#78716C]">
                    Dành cho học sinh từ Tiểu học, THCS, THPT đến Đại học và Thầy Cô giáo.
                  </p>
                </div>

                {registerError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{registerError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  {/* Role Switcher */}
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1.5">
                      Bạn là:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, role: 'student' })}
                        className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          registerData.role === 'student'
                            ? 'bg-[#E6F2F5] border-[#0D5C75] text-[#0D5C75] shadow-sm'
                            : 'bg-white border-[#E7E5E4] text-[#57534E] hover:bg-[#FAFAF9]'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Học sinh / Sinh viên</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, role: 'teacher' })}
                        className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          registerData.role === 'teacher'
                            ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                            : 'bg-white border-[#E7E5E4] text-[#57534E] hover:bg-[#FAFAF9]'
                        }`}
                      >
                        <School className="w-4 h-4" />
                        <span>Giáo viên / Giảng viên</span>
                      </button>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1.5">
                      Cấp học:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'tieuhoc', label: 'Cấp 1 Tiểu học' },
                        { id: 'thcs', label: 'Cấp 2 THCS' },
                        { id: 'thpt', label: 'Cấp 3 THPT' },
                        { id: 'daihoc', label: 'Đại học' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() =>
                            setRegisterData({
                              ...registerData,
                              educationLevel: lvl.id as EducationLevel,
                            })
                          }
                          className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                            registerData.educationLevel === lvl.id
                              ? 'bg-[#0D5C75] text-white border-[#0D5C75]'
                              : 'bg-white border-[#E7E5E4] text-[#78716C] hover:bg-[#FAFAF9]'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, name: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="email@vidu.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, email: e.target.value })
                          }
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="0912345678"
                          value={registerData.phone}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, phone: e.target.value })
                          }
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* School & Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Trường học
                      </label>
                      <input
                        type="text"
                        placeholder="THPT Chuyên Hà Nội..."
                        value={registerData.schoolOrOrg}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, schoolOrOrg: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Lớp / Khóa
                      </label>
                      <input
                        type="text"
                        placeholder="Lớp 12A1 / Lớp 5A / K22"
                        value={registerData.gradeOrClass}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, gradeOrClass: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Mật khẩu *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          placeholder="Tối thiểu 6 ký tự"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, password: e.target.value })
                          }
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Xác nhận mật khẩu *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          placeholder="Nhập lại mật khẩu"
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggle show password */}
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((p) => !p)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#78716C] hover:text-[#0D5C75] cursor-pointer"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>{showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                  </button>

                  {/* Strength meter */}
                  {registerData.password && (
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-[#78716C]">Độ mạnh mật khẩu:</span>
                        <span className="font-bold text-[#0F172A]">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F5F4] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.score / 4) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={registerData.agreeTerms}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          agreeTerms: e.target.checked,
                        })
                      }
                      className="accent-[#0D5C75] mt-0.5 rounded"
                    />
                    <span className="text-[11px] text-[#57534E]">
                      Tôi đồng ý với các <strong>Điều khoản sử dụng</strong> và{' '}
                      <strong>Chính sách quyền riêng tư</strong> của Vantrix AI.
                    </span>
                  </label>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-lg shadow-[#0D5C75]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Hoàn tất đăng ký & Bắt đầu học</span>
                  </motion.button>
                </form>

                <div className="pt-2">
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E7E5E4]" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-3 font-semibold text-[#78716C]">
                        Hoặc đăng ký nhanh với
                      </span>
                    </div>
                  </div>

                  <SocialAuthButtons
                    onSuccess={(user) => {
                      onRegisterUser(user);
                      onLoginSuccess(user);
                    }}
                    mode="register"
                  />
                </div>

                <div className="text-center pt-2 border-t border-[#E7E5E4]">
                  <p className="text-xs text-[#78716C]">
                    Đã có tài khoản rồi?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="font-bold text-[#0D5C75] hover:underline cursor-pointer"
                    >
                      Đăng nhập tại đây
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* 3. FORGOT PASSWORD */}
            {/* ============================================================ */}
            {authMode === 'forgot_password' && (
              <motion.div
                key="forgot_password"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                    <KeyRound className="w-6 h-6 text-[#0D5C75]" />
                    <span>Khôi phục mật khẩu</span>
                  </h2>
                  <p className="mt-1 text-xs text-[#78716C]">
                    Lấy lại quyền truy cập vào tài khoản Vantrix của bạn chỉ trong 3 bước.
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-[#78716C] pb-2 border-b border-[#E7E5E4]">
                  <span className={forgotStep >= 1 ? 'text-[#0D5C75]' : ''}>1. Email</span>
                  <span>→</span>
                  <span className={forgotStep >= 2 ? 'text-[#0D5C75]' : ''}>2. OTP</span>
                  <span>→</span>
                  <span className={forgotStep >= 3 ? 'text-[#0D5C75]' : ''}>
                    3. Mật khẩu mới
                  </span>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{forgotSuccessMessage}</span>
                  </div>
                )}

                {forgotStep === 1 && (
                  <form onSubmit={handleForgotStep1} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Email đăng ký tài khoản
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="vidu@vantrix.edu.vn"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E7E5E4] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-lg shadow-[#0D5C75]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Gửi mã OTP xác thực</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </form>
                )}

                {(forgotStep === 2 || forgotStep === 3) && (
                  <form onSubmit={handleForgotResetSubmit} className="space-y-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-[#0F172A]">
                          Mã xác thực OTP (6 chữ số) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotOtp('889922')}
                          className="text-[11px] font-bold text-[#0D5C75] hover:underline cursor-pointer"
                        >
                          Dùng OTP mẫu (889922)
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="889922"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E7E5E4] text-center font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        Nhập lại mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75] transition-all"
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-lg shadow-[#0D5C75]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận & Cập nhật mật khẩu mới</span>
                    </motion.button>
                  </form>
                )}

                {forgotStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="text-center py-4 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      Khôi phục mật khẩu thành công!
                    </h3>
                    <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                      Mật khẩu tài khoản <strong>{forgotEmail}</strong> đã được cập nhật. Bạn
                      có thể đăng nhập ngay bằng mật khẩu mới.
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => {
                        setLoginEmail(forgotEmail);
                        setLoginPassword(newPassword);
                        setAuthMode('login');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#0D5C75] hover:bg-[#084356] text-white font-bold text-xs shadow-lg shadow-[#0D5C75]/20 transition-all cursor-pointer"
                    >
                      Đăng nhập ngay
                    </motion.button>
                  </motion.div>
                )}

                <div className="text-center pt-2 border-t border-[#E7E5E4]">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs font-bold text-[#78716C] hover:text-[#0D5C75] flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại trang Đăng nhập</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};