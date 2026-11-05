/**
 * ============================================================================
 * FILE: UserProfilePage.tsx — Vantrix AI
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — HỒ SƠ CÁ NHÂN & QUẢN LÝ TÀI KHOẢN
 * ĐƯỜNG DẪN: /src/components/common/UserProfilePage.tsx
 * CHỨC NĂNG:
 *  - Phân tách Profile cho 3 vai trò: Học sinh, Giáo viên, Admin
 *  - Cơ chế View / Edit Mode (thêm nút Sửa mới hiện Lưu)
 *  - Đồng bộ palette: Teal (Student) / Amber (Teacher) / Purple (Admin)
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
  ArrowLeft,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  BookmarkCheck,
  BarChart3,
  Globe,
  Bell,
  Volume2,
  Maximize2,
  Eye,
  EyeOff,
  Edit3,
  X,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import type { AppUser } from '../../types/admin';
import type { UserRole, EducationLevel } from '../../types/quiz';
import { calculatePasswordStrength } from '../../utils/auth-logic';
import { StudentDailyStudyStreakCard } from '../student/StudentStatsView';

const ROLE_THEME = {
  student: {
    main: '#0D5C75',
    tint: '#E6F2F5',
    border: '#C7E5EA',
    gradient: 'from-[#042F2E] via-[#0F172A] to-[#0D5C75]',
    label: 'Học sinh / Sinh viên',
    icon: GraduationCap,
  },
  teacher: {
    main: '#B45309',
    tint: '#FEF3C7',
    border: '#FDE68A',
    gradient: 'from-[#78350F] via-[#0F172A] to-[#B45309]',
    label: 'Giáo viên / Giảng viên',
    icon: School,
  },
  admin: {
    main: '#6D28D9',
    tint: '#F3E8FF',
    border: '#DDD6FE',
    gradient: 'from-[#4C1D95] via-[#0F172A] to-[#6D28D9]',
    label: 'Quản trị viên',
    icon: ShieldCheck,
  },
} as const;

export interface UserProfilePageProps {
  currentUser: AppUser | null;
  currentRole: UserRole;
  onUpdateUser: (updatedUser: AppUser) => void;
  onBackToMain: () => void;
  onLogout: () => void;
  unmasteredMistakeCount?: number;
  onStartExam?: () => void;
  onReviewMistakes?: () => void;
  onStartQuickReview?: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  currentUser,
  currentRole,
  onUpdateUser,
  onBackToMain,
  onLogout,
  unmasteredMistakeCount = 0,
  onStartExam,
  onReviewMistakes,
  onStartQuickReview,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'security' | 'sso' | 'preferences'>('info');
  
  // State quản lý chế độ Sửa / Xem
  const [isEditing, setIsEditing] = useState(false);

  const theme = ROLE_THEME[currentRole];
  const RoleIcon = theme.icon;

  // Personal Info Form State
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Nguyễn Văn Trí',
    email: currentUser?.email || 'vantritran518@gmail.com',
    phone: currentUser?.phone || '0988 123 456',
    educationLevel: (currentUser?.educationLevel || 'thpt') as EducationLevel,
    gradeOrClass: currentUser?.gradeOrClass || (currentRole === 'teacher' ? 'Toán học & Luyện thi' : 'Lớp 12A1 Chuyên Toán'),
    schoolOrOrg: currentUser?.schoolOrOrg || (currentRole === 'admin' ? 'Ban Quản Trị Hệ Thống' : 'THPT Chuyên Chu Văn An'),
    notes: currentUser?.notes || 'Mục tiêu 28+ điểm khối A00, xét tuyển Đại học Bách Khoa Hà Nội & ĐHQG.',
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // SSO State
  const [isGoogleLinked, setIsGoogleLinked] = useState(true);
  const [isMicrosoftLinked, setIsMicrosoftLinked] = useState(false);

  // Preferences State
  const [prefSound, setPrefSound] = useState(true);
  const [prefDailyReminder, setPrefDailyReminder] = useState(true);
  const [prefAutoFullscreen, setPrefAutoFullscreen] = useState(false);

  // Status
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  const passwordStrength = calculatePasswordStrength(newPassword);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: AppUser = {
      ...currentUser,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      educationLevel: formData.educationLevel,
      gradeOrClass: formData.gradeOrClass.trim(),
      schoolOrOrg: formData.schoolOrOrg.trim(),
      notes: formData.notes.trim(),
    };

    onUpdateUser(updated);
    setIsEditing(false); // Thoát chế độ sửa
    setSaveSuccessMessage('Thông tin cá nhân đã được lưu thành công!');
    setTimeout(() => setSaveSuccessMessage(''), 4000);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset lại form data về dữ liệu gốc
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        educationLevel: currentUser.educationLevel || 'thpt',
        gradeOrClass: currentUser.gradeOrClass || '',
        schoolOrOrg: currentUser.schoolOrOrg || '',
        notes: currentUser.notes || '',
      });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMessage('');
    setPasswordSuccessMessage('');

    if (!currentPassword) {
      setPasswordErrorMessage('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setPasswordSuccessMessage('Đổi mật khẩu bảo mật thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
      {/* Top Back & Logout */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBackToMain}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#57534E] hover:text-[#0F172A] transition-colors p-2 -ml-2 rounded-xl hover:bg-[#F5F5F4] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm mb-6 relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-r ${theme.gradient} -z-0 opacity-90`} />

        <div className="relative z-10 pt-8 sm:pt-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-3xl text-white font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-white"
                style={{ backgroundColor: theme.main }}
              >
                {formData.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">{formData.name}</h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 border"
                  style={{ backgroundColor: theme.tint, color: theme.main, borderColor: theme.border }}
                >
                  <RoleIcon className="w-3 h-3" />
                  <span>{theme.label}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  Đã xác minh
                </span>
              </div>

              <p className="text-sm text-[#78716C] flex items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>{formData.email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>{formData.schoolOrOrg}</span>
                </span>
              </p>
            </div>
          </div>

          {/* Role-specific stats pill */}
          <div className="flex items-center gap-3 bg-[#FAFAF9] p-2 sm:p-2.5 rounded-2xl border border-[#E7E5E4]">
            {currentRole === 'student' && (
              <>
                <div className="text-center px-3 border-r border-[#E7E5E4]">
                  <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Đề đã làm</p>
                  <p className="text-lg font-black text-[#0F172A]">{currentUser?.examsTakenCount || 12}</p>
                </div>
                <div className="text-center px-3 border-r border-[#E7E5E4]">
                  <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Điểm TB</p>
                  <p className="text-lg font-black" style={{ color: theme.main }}>{currentUser?.averageScore || 8.65}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('stats')}
                  className="text-center px-3 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer group"
                >
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500 fill-current animate-pulse" />
                    <span>Chuỗi Ngày</span>
                  </p>
                  <p className="text-lg font-black text-amber-600 group-hover:scale-105 transition-transform">7 Ngày</p>
                </button>
              </>
            )}
            
            {currentRole === 'teacher' && (
              <>
                <div className="text-center px-3 border-r border-[#E7E5E4]">
                  <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Lớp dạy</p>
                  <p className="text-lg font-black text-[#0F172A]">{currentUser?.classesCount || 4}</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Đề đã tạo</p>
                  <p className="text-lg font-black" style={{ color: theme.main }}>18</p>
                </div>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <div className="text-center px-3 border-r border-[#E7E5E4]">
                  <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Người dùng</p>
                  <p className="text-lg font-black text-[#0F172A]">1,420</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Hệ thống</p>
                  <p className="text-lg font-black" style={{ color: theme.main }}>Ổn định</p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#E7E5E4] text-xs sm:text-sm font-bold no-scrollbar">
        {[
          { id: 'info' as const, label: 'Thông tin cá nhân', icon: User },
          { id: 'stats' as const, label: 'Thành tích & Năng lực', icon: BarChart3 },
          { id: 'security' as const, label: 'Mật khẩu & Bảo mật', icon: KeyRound },
          { id: 'sso' as const, label: 'Liên kết SSO', icon: Globe },
          { id: 'preferences' as const, label: 'Cài đặt trải nghiệm', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive ? 'text-white shadow-md' : 'text-[#57534E] hover:text-[#0F172A] hover:bg-[#F5F5F4]'
              }`}
              style={isActive ? { backgroundColor: theme.main } : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INFO */}
      <AnimatePresence mode="wait">
        {activeTab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#F5F5F4]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Chi Tiết Hồ Sơ</h2>
                <p className="text-xs text-[#78716C]">
                  {isEditing ? 'Đang chỉnh sửa. Nhấn Lưu để áp dụng thay đổi.' : 'Thông tin này hiển thị trên phiếu điểm và danh sách lớp.'}
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  style={{ backgroundColor: theme.main }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>
              )}
            </div>

            {saveSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSaveInfo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm font-semibold text-[#0F172A]"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm font-semibold text-[#0F172A]">{formData.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">Địa chỉ Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm font-semibold text-[#0F172A]"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm font-semibold text-[#0F172A]">{formData.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm font-semibold text-[#0F172A]"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm font-semibold text-[#0F172A]">{formData.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {/* Role-Specific Field 1 */}
                <div>
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">
                    {currentRole === 'student' ? 'Cấp học' : currentRole === 'teacher' ? 'Bộ môn giảng dạy' : 'Phòng ban'}
                  </label>
                  {isEditing ? (
                    currentRole === 'student' ? (
                      <select
                        value={formData.educationLevel}
                        onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm font-semibold text-[#0F172A] bg-white"
                      >
                        <option value="tieuhoc">Tiểu học (Lớp 1 - 5)</option>
                        <option value="thcs">THCS (Lớp 6 - 9)</option>
                        <option value="thpt">THPT (Lớp 10 - 12)</option>
                        <option value="daihoc">Đại học / Cao đẳng</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.gradeOrClass}
                        onChange={(e) => setFormData({ ...formData, gradeOrClass: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm font-semibold text-[#0F172A]"
                      />
                    )
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm font-semibold text-[#0F172A]">
                      {currentRole === 'student' ? formData.educationLevel.toUpperCase() : formData.gradeOrClass}
                    </p>
                  )}
                </div>

                {/* Role-Specific Field 2 */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">
                    {currentRole === 'student' ? 'Trường học / Lớp' : currentRole === 'teacher' ? 'Trường / Tổ chức công tác' : 'Quyền hạn hệ thống'}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.schoolOrOrg}
                      onChange={(e) => setFormData({ ...formData, schoolOrOrg: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm font-semibold text-[#0F172A]"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm font-semibold text-[#0F172A]">
                      {currentRole === 'student' ? `${formData.schoolOrOrg} • ${formData.gradeOrClass}` : currentRole === 'teacher' ? formData.schoolOrOrg : 'Toàn quyền quản trị (Super Admin)'}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">
                    {currentRole === 'student' ? 'Mục tiêu học tập & Ghi chú' : currentRole === 'teacher' ? 'Chứng chỉ & Thông tin thêm' : 'Ghi chú quản trị'}
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm text-[#0F172A]"
                    />
                  ) : (
                    <p className="px-4 py-3 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-sm text-[#57534E] whitespace-pre-wrap">
                      {formData.notes || 'Chưa có ghi chú.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-end gap-2 pt-4 border-t border-[#F5F5F4]"
                >
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E5E4] text-[#57534E] hover:bg-[#FAFAF9] text-xs font-bold cursor-pointer transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    style={{ backgroundColor: theme.main }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thay Đổi</span>
                  </button>
                </motion.div>
              )}
            </form>
          </motion.div>
        )}

        {/* ... (Các Tabs: stats, security, sso, preferences giữ nguyên cấu trúc) ... */}
        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {currentRole === 'student' && (
              <StudentDailyStudyStreakCard
                onStartExam={() => { if (onStartExam) onStartExam(); else onBackToMain(); }}
                onReviewMistakes={onReviewMistakes}
                onStartQuickReview={onStartQuickReview}
                unmasteredMistakeCount={unmasteredMistakeCount}
              />
            )}
            <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 text-center">
              <BarChart3 className="w-10 h-10 mx-auto mb-2" style={{ color: theme.main }} />
              <h3 className="text-base font-bold text-[#0F172A]">Thành Tích & Năng Lực</h3>
              <p className="text-xs text-[#78716C]">Tính năng đang được đồng bộ dữ liệu...</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm">
            <div className="pb-4 mb-6 border-b border-[#F5F5F4]">
              <h2 className="text-lg font-bold text-[#0F172A]">Bảo Mật Tài Khoản</h2>
            </div>
            <form onSubmit={handleChangePassword} className="max-w-xl space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#57534E] uppercase mb-2">Mật khẩu hiện tại</label>
                <input type={showPasswords ? 'text' : 'password'} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#57534E] uppercase mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input type={showPasswords ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm" />
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-3 text-[#A8A29E] cursor-pointer">
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#57534E] uppercase mb-2">Xác nhận mật khẩu</label>
                <input type={showPasswords ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm" />
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md cursor-pointer" style={{ backgroundColor: theme.main }}>Cập Nhật Mật Khẩu</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};