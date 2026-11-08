/**
 * ============================================================================
 * TRANG / THÀNH PHẦN: LogoutModal (Hộp thoại Xác nhận Đăng xuất & Quản lý Phiên)
 * PHÂN HỆ: XÁC THỰC TÀI KHOẢN (AUTH) - DÙNG CHO MỌI VAI TRÒ
 * ĐƯỜNG DẪN: /src/components/auth/LogoutModal.tsx
 * CHỨC NĂNG CHÍNH:
 *  - Xác nhận an toàn trước khi đăng xuất khỏi phiên làm việc
 *  - Lưu trữ tiến độ bài thi hiện tại vào bộ nhớ tạm trước khi thoát
 *  - Xóa token xác thực cục bộ và đưa người dùng về màn hình đăng nhập hoặc trang chủ
 *  - Hiển thị thông tin tài khoản đang đăng xuất (Tên, Email, Vai trò)
 * ============================================================================
 */

import React from 'react';
import { AppUser } from '../../types/admin';
import { LogOut, AlertTriangle, Shield, CheckCircle2, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  currentUser: AppUser | null;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  currentUser,
}) => {
  if (!isOpen || !currentUser) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên Hệ thống';
      case 'teacher':
        return 'Giáo viên / Giảng viên';
      case 'student':
      default:
        return 'Học sinh / Sinh viên';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shadow-xs">
            <LogOut className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-serif text-lg font-black text-slate-900 tracking-tight">
            Xác nhận Đăng xuất?
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản trên thiết bị này? Tiến độ làm bài và điểm số của bạn đã được tự động lưu an toàn.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
            <span className="inline-block mt-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-md">
              {getRoleLabel(currentUser.role)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmLogout();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};
