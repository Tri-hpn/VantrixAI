/**
 * ============================================================================
 * FILE: AuthPages.tsx — Vantrix AI
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: XÁC THỰC TÀI KHOẢN (AUTH) — Học sinh, Giáo viên & Admin
 * ĐƯỜNG DẪN: /src/components/auth/AuthPages.tsx
 * CHỨC NĂNG:
 *  - Đăng nhập bằng email / SĐT + mật khẩu (có lưu ghi nhớ đăng nhập)
 *  - SSO 1-chạm (Google, Microsoft)
 *  - Đăng ký phân quyền: Học sinh vs Giáo viên, đủ 4 cấp học
 *  - Quên mật khẩu với OTP 6 số, bộ đếm ngược 60s gửi lại OTP
 *  - Modal xem Điều khoản & Chính sách quyền riêng tư tương tác thực tế
 *  - 1-Click Demo Login nhanh cho 3 tài khoản chuẩn (Admin, GV, HS)
 *  - Typography chuẩn Academic: Tiêu đề Serif (Playfair Display/Merriweather),
 *    nội dung Sans-serif (Inter).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppUser } from '../../types/admin';
import type { EducationLevel } from '../../types/quiz';
import {
  validateLoginForm,
  validateRegisterForm,
  validateForgotPassword,
  validateResetPassword,
  calculatePasswordStrength,
  type RegisterFormData,
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
  RotateCcw,
  BookOpen,
  FileText,
  X,
  Check,
} from 'lucide-react';

export type AuthMode = 'login' | 'register' | 'forgot_password';

interface AuthPagesProps {
  initialMode?: AuthMode;
  onLoginSuccess: (user: AppUser) => void;
  onBackToApp: () => void;
  existingUsers: AppUser[];
  onRegisterUser: (newUser: AppUser) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onBackToApp,
  existingUsers,
  onRegisterUser,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);

  // Login State
  const [loginEmail, setLoginEmail] = useState(() => {
    try {
      return localStorage.getItem('vantrix_remembered_email') || 'student@vantrix.edu.vn';
    } catch {
      return 'student@vantrix.edu.vn';
    }
  });
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginRemember, setLoginRemember] = useState(() => {
    try {
      return localStorage.getItem('vantrix_remember_login') === 'true';
    } catch {
      return true;
    }
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register State
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    educationLevel: 'thpt',
    gradeOrClass: 'Lớp 12',
    schoolOrOrg: 'THPT Chuyên Hà Nội - Amsterdam',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Terms & Privacy Modal
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms');

  // Cooldown countdown for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ---------------------------------------------------------------------------
  // 1-Click Demo Login
  // ---------------------------------------------------------------------------
  const handleQuickDemoLogin = (userEmail: string) => {
    setLoginError(null);
    const found = existingUsers.find(
      (u) => u.email.toLowerCase() === userEmail.toLowerCase()
    );
    if (found) {
      if (found.status === 'suspended') {
        setLoginError('Tài khoản này hiện đang bị khóa bởi Quản trị viên.');
        return;
      }
      if (loginRemember) {
        try {
          localStorage.setItem('vantrix_remembered_email', found.email);
          localStorage.setItem('vantrix_remember_login', 'true');
        } catch { /* ignore */ }
      }
      onLoginSuccess(found);
    } else {
      const demoRole = userEmail.includes('admin')
        ? 'admin'
        : userEmail.includes('teacher')
        ? 'teacher'
        : 'student';
      const createdUser: AppUser = {
        id: `usr-${Date.now()}`,
        name: userEmail.includes('admin')
          ? 'Trần Văn Trí (Admin)'
          : userEmail.includes('teacher')
          ? 'Thầy Trần Văn Trí'
          : 'Nguyễn Văn Trí (Học sinh)',
        email: userEmail,
        role: demoRole,
        educationLevel: 'thpt',
        gradeOrClass: demoRole === 'teacher' ? 'Tổ Toán THPT' : 'Khối 12 Chuyên',
        schoolOrOrg: 'THPT Chuyên Hà Nội - Amsterdam',
        status: 'active',
        joinedAt: Date.now(),
        lastLoginAt: Date.now(),
        examsTakenCount: demoRole === 'student' ? 15 : 0,
        classesCount: demoRole === 'teacher' ? 3 : 1,
        averageScore: 9.2,
      };
      onRegisterUser(createdUser);
      onLoginSuccess(createdUser);
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

    // Persist remember me
    try {
      if (loginRemember) {
        localStorage.setItem('vantrix_remembered_email', loginEmail.trim());
        localStorage.setItem('vantrix_remember_login', 'true');
      } else {
        localStorage.removeItem('vantrix_remembered_email');
        localStorage.setItem('vantrix_remember_login', 'false');
      }
    } catch { /* ignore */ }

    const found = existingUsers.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.trim().toLowerCase() ||
        (u.phone && u.phone === loginEmail.trim())
    );

    if (found) {
      if (found.status === 'suspended') {
        setLoginError(
          'Tài khoản này đã bị khóa do vi phạm nội quy. Vui lòng liên hệ ban quản trị Vantrix AI.'
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
      schoolOrOrg: registerData.schoolOrOrg.trim() || 'Trường học',
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
    setResendCooldown(60);
    setForgotSuccessMessage(
      `Mã xác thực OTP gồm 6 chữ số đã được gửi tới ${forgotEmail}. Vui lòng kiểm tra hộp thư.`
    );
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setForgotSuccessMessage(`Mã OTP mới đã được gửi lại tới ${forgotEmail}. Mã mẫu dùng thử: 889922.`);
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
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      {/* Brand header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <button
          type="button"
          onClick={onBackToApp}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ Vantrix</span>
        </button>

        <div className="flex items-center justify-center gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-2xl tracking-tight text-slate-900">
                Vantrix AI
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                v2.5
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans font-medium">
              Hệ thống Khảo thí Toàn cấp (Cấp 1 Đến Đại Học)
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200"
        >
          <AnimatePresence mode="wait">
            {/* ============================================================ */}
            {/* 1. LOGIN MODE */}
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
                  <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                    Đăng nhập tài khoản
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 font-sans leading-relaxed">
                    Chào mừng bạn quay lại! Nhập thông tin để tiếp tục ôn luyện, thi thử và quản lý lớp học.
                  </p>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{loginError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLoginError(null)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email hoặc Số điện thoại
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="vidu@vantrix.edu.vn hoặc 0912..."
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Mật khẩu
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(1);
                          setForgotEmail(loginEmail);
                          setAuthMode('forgot_password');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loginRemember}
                      onChange={(e) => setLoginRemember(e.target.checked)}
                      className="accent-indigo-600 rounded w-4 h-4 cursor-pointer"
                    />
                    <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Đăng nhập vào Vantrix AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>

                <div className="pt-2">
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-3 font-semibold text-slate-400">
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

                {/* 1-Click Demo Logins */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center font-sans">
                    Đăng nhập nhanh 3 tài khoản mẫu (1-Click Demo)
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin@vantrix.edu.vn')}
                      className="p-3 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-semibold text-left transition-all flex flex-col gap-1 cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-1.5 text-purple-700">
                        <Shield className="w-4 h-4 shrink-0" />
                        <span className="font-serif font-bold text-xs">Admin</span>
                      </div>
                      <p className="text-[11px] font-bold text-purple-950 truncate">Trần Văn Trí</p>
                      <p className="text-[10px] text-purple-600 font-mono truncate">admin@...</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => handleQuickDemoLogin('teacher@vantrix.edu.vn')}
                      className="p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-semibold text-left transition-all flex flex-col gap-1 cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-1.5 text-amber-700">
                        <School className="w-4 h-4 shrink-0" />
                        <span className="font-serif font-bold text-xs">Giáo viên</span>
                      </div>
                      <p className="text-[11px] font-bold text-amber-950 truncate">Thầy Văn Trí</p>
                      <p className="text-[10px] text-amber-600 font-mono truncate">teacher@...</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => handleQuickDemoLogin('student@vantrix.edu.vn')}
                      className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-semibold text-left transition-all flex flex-col gap-1 cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <GraduationCap className="w-4 h-4 shrink-0" />
                        <span className="font-serif font-bold text-xs">Học sinh</span>
                      </div>
                      <p className="text-[11px] font-bold text-emerald-950 truncate">Nguyễn Văn Trí</p>
                      <p className="text-[10px] text-emerald-600 font-mono truncate">student@...</p>
                    </motion.button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 font-sans">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Đăng ký tài khoản mới ngay
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* 2. REGISTER MODE */}
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
                  <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                    Tạo tài khoản Vantrix AI
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 font-sans leading-relaxed">
                    Đăng ký cho học sinh 4 cấp học (Tiểu học đến Đại học) hoặc Thầy Cô giáo để bắt đầu số hóa và thi thử.
                  </p>
                </div>

                {registerError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{registerError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegisterError(null)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-sans">
                  {/* Role Switcher */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Bạn tham gia với tư cách:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, role: 'student' })}
                        className={`py-2.5 px-3 rounded-2xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          registerData.role === 'student'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span className="font-serif">Học sinh / Sinh viên</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, role: 'teacher' })}
                        className={`py-2.5 px-3 rounded-2xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          registerData.role === 'teacher'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <School className="w-4 h-4 text-amber-600" />
                        <span className="font-serif">Giáo viên / Giảng viên</span>
                      </button>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Cấp học & Đào tạo:
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
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                            registerData.educationLevel === lvl.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Trần Văn Trí"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, name: e.target.value })
                        }
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Email liên hệ *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="email@vidu.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, email: e.target.value })
                          }
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="0912345678"
                          value={registerData.phone}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, phone: e.target.value })
                          }
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* School & Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Trường học / Đơn vị
                      </label>
                      <input
                        type="text"
                        placeholder="THPT Chuyên Hà Nội - Amsterdam"
                        value={registerData.schoolOrOrg}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, schoolOrOrg: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Lớp học / Bộ môn
                      </label>
                      <input
                        type="text"
                        placeholder="Lớp 12A1 / Tổ Toán"
                        value={registerData.gradeOrClass}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, gradeOrClass: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Mật khẩu *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          placeholder="Tối thiểu 6 ký tự"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, password: e.target.value })
                          }
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Xác nhận mật khẩu *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggle show password */}
                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((p) => !p)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      <span>{showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                    </button>
                  </div>

                  {/* Strength meter */}
                  {registerData.password && (
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                        <span className="font-bold text-slate-800">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.score / 4) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={registerData.agreeTerms}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          agreeTerms: e.target.checked,
                        })
                      }
                      className="accent-indigo-600 mt-0.5 rounded w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600 leading-relaxed">
                      Tôi đồng ý với các{' '}
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setTermsTab('terms');
                          setIsTermsModalOpen(true);
                        }}
                        className="font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Điều khoản sử dụng
                      </button>{' '}
                      và{' '}
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setTermsTab('privacy');
                          setIsTermsModalOpen(true);
                        }}
                        className="font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Chính sách quyền riêng tư
                      </button>{' '}
                      của Vantrix AI.
                    </span>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Hoàn tất đăng ký & Bắt đầu học</span>
                  </motion.button>
                </form>

                <div className="pt-2">
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-3 font-semibold text-slate-400">
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

                <div className="text-center pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-sans">
                    Đã có tài khoản rồi?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Đăng nhập tại đây
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* 3. FORGOT PASSWORD MODE */}
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
                  <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <KeyRound className="w-6 h-6 text-indigo-600" />
                    <span>Khôi phục mật khẩu</span>
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 font-sans leading-relaxed">
                    Lấy lại quyền truy cập vào tài khoản Vantrix của bạn một cách an toàn và bảo mật.
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-200">
                  <span className={forgotStep >= 1 ? 'text-indigo-600' : ''}>1. Nhập Email</span>
                  <span>→</span>
                  <span className={forgotStep >= 2 ? 'text-indigo-600' : ''}>2. Xác thực OTP</span>
                  <span>→</span>
                  <span className={forgotStep >= 3 ? 'text-indigo-600' : ''}>3. Mật khẩu mới</span>
                </div>

                {forgotError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{forgotError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotError(null)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {forgotSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{forgotSuccessMessage}</span>
                  </motion.div>
                )}

                {/* Step 1: Request OTP */}
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotStep1} className="space-y-4 font-sans">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Email đăng ký tài khoản
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="vidu@vantrix.edu.vn"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Gửi mã OTP xác thực</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </form>
                )}

                {/* Step 2 & 3: Input OTP and Set New Password */}
                {(forgotStep === 2 || forgotStep === 3) && (
                  <form onSubmit={handleForgotResetSubmit} className="space-y-4 text-xs font-sans">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-800">
                          Mã xác thực OTP (6 chữ số) *
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setForgotOtp('889922')}
                            className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                          >
                            Dùng OTP mẫu (889922)
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="889922"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-center font-mono text-base tracking-widest bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                        <span>Chưa nhận được mã?</span>
                        <button
                          type="button"
                          disabled={resendCooldown > 0}
                          onClick={handleResendOtp}
                          className="font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>
                            {resendCooldown > 0
                              ? `Gửi lại sau (${resendCooldown}s)`
                              : 'Gửi lại mã OTP'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Nhập lại mật khẩu mới *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận & Cập nhật mật khẩu mới</span>
                    </motion.button>
                  </form>
                )}

                {/* Step 4: Finished */}
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
                    <h3 className="font-serif text-xl font-bold text-slate-900">
                      Khôi phục mật khẩu thành công!
                    </h3>
                    <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto leading-relaxed">
                      Mật khẩu của tài khoản <strong>{forgotEmail}</strong> đã được cập nhật thành công. Bạn có thể đăng nhập ngay với mật khẩu mới.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setLoginEmail(forgotEmail);
                        setLoginPassword(newPassword);
                        setAuthMode('login');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      Đăng nhập ngay
                    </motion.button>
                  </motion.div>
                )}

                <div className="text-center pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
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

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-xs text-slate-400 font-sans">
        © 2026 Vantrix AI. Built by Tran Van Tri.
      </footer>

      {/* Interactive Terms & Privacy Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      Quy Chuẩn Giáo Dục & Điều Khoản Vantrix AI
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Bảo đảm an toàn dữ liệu học thuật và quyền lợi người học
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setTermsTab('terms')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    termsTab === 'terms'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Điều khoản sử dụng
                </button>
                <button
                  type="button"
                  onClick={() => setTermsTab('privacy')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    termsTab === 'privacy'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Chính sách quyền riêng tư
                </button>
              </div>

              {/* Content Body */}
              <div className="max-h-[300px] overflow-y-auto space-y-3 text-slate-600 leading-relaxed pr-1">
                {termsTab === 'terms' ? (
                  <>
                    <h4 className="font-serif font-bold text-slate-800 text-xs">1. Phạm vi áp dụng & Mục đích giáo dục</h4>
                    <p>
                      Vantrix AI là nền tảng khảo thí và hỗ trợ học tập thông minh trực thuộc hệ sinh thái EdTech do Trần Văn Trí phát triển. Hệ thống phục vụ việc luyện thi, đánh giá năng lực học sinh, sinh viên từ Cấp 1 đến Đại học.
                    </p>
                    <h4 className="font-serif font-bold text-slate-800 text-xs">2. Liêm chính học thuật</h4>
                    <p>
                      Mọi hành vi gian lận trong phòng thi trực tuyến, sao chép trái phép ngân hàng câu hỏi độc quyền hoặc cố tình can thiệp vào mã nguồn thi thử đều bị coi là vi phạm nghiêm trọng và tài khoản có thể bị khóa vĩnh viễn.
                    </p>
                    <h4 className="font-serif font-bold text-slate-800 text-xs">3. Trách nhiệm của Giáo viên & Giảng viên</h4>
                    <p>
                      Giáo viên chịu trách nhiệm về tính chuẩn mực của đề thi tự tải lên lớp học, cam kết không vi phạm bản quyền xuất bản hoặc phân phối nội dung không lành mạnh.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-serif font-bold text-slate-800 text-xs">1. Thu thập và bảo vệ dữ liệu</h4>
                    <p>
                      Vantrix AI cam kết mã hóa toàn bộ mật khẩu, lịch sử làm bài và sổ tay lỗi sai của học sinh. Dữ liệu này chỉ được sử dụng cho thuật toán AI chẩn đoán lỗ hổng kiến thức và gợi ý lộ trình cá nhân hóa.
                    </p>
                    <h4 className="font-serif font-bold text-slate-800 text-xs">2. Không chia sẻ cho bên thứ ba</h4>
                    <p>
                      Thông tin cá nhân (Email, Số điện thoại, Điểm số) tuyệt đối không được bán hoặc thương mại hóa dưới bất kỳ hình thức nào.
                    </p>
                    <h4 className="font-serif font-bold text-slate-800 text-xs">3. Quyền của người học</h4>
                    <p>
                      Người dùng có quyền xuất dữ liệu điểm số, yêu cầu xóa tài khoản hoặc đổi thông tin cá nhân bất kỳ lúc nào thông qua trang Quản lý hồ sơ.
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Phiên bản quy chế: 2.5 (2026)</span>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all cursor-pointer"
                >
                  Tôi đã hiểu và Đồng ý
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};