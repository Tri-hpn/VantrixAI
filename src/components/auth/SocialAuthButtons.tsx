/**
 * ============================================================================
 * FILE: SocialAuthButtons.tsx — Vantrix AI
 * PHÂN HỆ: AUTH — Nút Đăng Nhập Bằng Mạng Xã Hội (SSO)
 * ĐƯỜNG DẪN: /src/components/auth/SocialAuthButtons.tsx
 * FIX: Xoá hoàn toàn form chọn tư cách (Role Picker) cũ. 
 *      Bấm nút sẽ giả lập quá trình chuyển hướng sang Google/Microsoft.
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { AppUser } from '../../types/admin';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  onSuccess: (user: AppUser) => void;
  mode?: 'login' | 'register';
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ onSuccess }) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'microsoft' | null>(null);

  const handleSocialLogin = (provider: 'google' | 'microsoft') => {
    setLoadingProvider(provider);

    // Giả lập thời gian chờ gọi API OAuth / Chuyển hướng trang
    setTimeout(() => {
      const mockUser: AppUser = {
        id: `usr-${provider}-${Date.now()}`,
        name: provider === 'google' ? 'Google User' : 'Microsoft User',
        email: provider === 'google' ? 'user.google@vantrix.edu.vn' : 'user.microsoft@vantrix.edu.vn',
        role: 'student', // Mặc định vào app là Học sinh. Có thể đổi vai trò sau ở Hồ sơ.
        educationLevel: 'thpt',
        gradeOrClass: 'Lớp 12',
        schoolOrOrg: 'Vantrix Academy',
        status: 'active',
        joinedAt: Date.now(),
        lastLoginAt: Date.now(),
        examsTakenCount: 0,
        classesCount: 0,
        averageScore: 0,
      };

      onSuccess(mockUser);
      setLoadingProvider(null);
    }, 1200); // 1.2 giây
  };

  return (
    <div className="space-y-3">
      {/* Nút Google */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleSocialLogin('google')}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] text-[#0F172A] font-semibold text-sm shadow-sm transition-all disabled:opacity-60 cursor-pointer"
      >
        {loadingProvider === 'google' ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        )}
        <span>{loadingProvider === 'google' ? 'Đang chuyển hướng...' : 'Đăng nhập với Google'}</span>
      </motion.button>

      {/* Nút Microsoft */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleSocialLogin('microsoft')}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] text-[#0F172A] font-semibold text-sm shadow-sm transition-all disabled:opacity-60 cursor-pointer"
      >
        {loadingProvider === 'microsoft' ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#f35325]" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
        )}
        <span>{loadingProvider === 'microsoft' ? 'Đang chuyển hướng...' : 'Đăng nhập với Microsoft'}</span>
      </motion.button>
    </div>
  );
};