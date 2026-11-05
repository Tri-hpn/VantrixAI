import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, School, ArrowRight, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const CompleteProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [educationLevel, setEducationLevel] = useState('thpt');
  const [gradeOrClass, setGradeOrClass] = useState('');
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [userName, setUserName] = useState('');

  // Lấy tên user hiện tại để chào mừng
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserName(data.user.name);
          // Nếu user đã hoàn thiện rồi thì đá về trang chủ
          if (data.user.profileCompleted) {
            window.location.href = '/';
          }
        } else {
          // Nếu chưa login -> về trang login
          window.location.href = '/';
        }
      })
      .catch(() => {
        window.location.href = '/';
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role, educationLevel, gradeOrClass, schoolOrOrg }),
      });

      if (res.ok) {
        // Thành công -> Reload lại trang chủ (App sẽ tự nhận diện qua Cookie)
        window.location.href = '/';
      } else {
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối Server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white max-w-lg w-full rounded-3xl shadow-xl border border-[#E7E5E4] p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#0F172A]">Chào mừng {userName || 'bạn'}!</h1>
          <p className="text-sm text-[#78716C] mt-2">
            Vui lòng chọn vai trò để Vantrix AI cá nhân hóa trải nghiệm học tập cho bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chọn Vai trò */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                role === 'student' ? 'border-[#0D5C75] bg-[#E6F2F5]' : 'border-[#E7E5E4] hover:border-[#0D5C75]/50'
              }`}
            >
              <GraduationCap className={`w-8 h-8 ${role === 'student' ? 'text-[#0D5C75]' : 'text-[#78716C]'}`} />
              <span className={`font-bold ${role === 'student' ? 'text-[#0D5C75]' : 'text-[#57534E]'}`}>Học sinh / Sinh viên</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                role === 'teacher' ? 'border-[#B45309] bg-[#FEF3C7]' : 'border-[#E7E5E4] hover:border-[#B45309]/50'
              }`}
            >
              <School className={`w-8 h-8 ${role === 'teacher' ? 'text-[#B45309]' : 'text-[#78716C]'}`} />
              <span className={`font-bold ${role === 'teacher' ? 'text-[#B45309]' : 'text-[#57534E]'}`}>Giáo viên / Giảng viên</span>
            </button>
          </div>

          {/* Cấp học */}
          <div>
            <label className="block text-xs font-bold text-[#57534E] uppercase mb-2">Cấp học / Giảng dạy</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75]"
            >
              <option value="tieuhoc">Tiểu học (Lớp 1 - 5)</option>
              <option value="thcs">THCS (Lớp 6 - 9)</option>
              <option value="thpt">THPT (Lớp 10 - 12)</option>
              <option value="daihoc">Đại học / Cao đẳng</option>
            </select>
          </div>

          {/* Lớp / Khoa */}
          <div>
            <label className="block text-xs font-bold text-[#57534E] uppercase mb-2">{role === 'student' ? 'Lớp / Niên khóa' : 'Bộ môn / Khoa'}</label>
            <input
              type="text"
              required
              value={gradeOrClass}
              onChange={(e) => setGradeOrClass(e.target.value)}
              placeholder={role === 'student' ? "Ví dụ: Lớp 12A1" : "Ví dụ: Khoa Toán - Tin học"}
              className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75]"
            />
          </div>

          {/* Trường / Tổ chức */}
          <div>
            <label className="block text-xs font-bold text-[#57534E] uppercase mb-2">Trường học / Đơn vị công tác</label>
            <input
              type="text"
              required
              value={schoolOrOrg}
              onChange={(e) => setSchoolOrOrg(e.target.value)}
              placeholder="Ví dụ: THPT Chu Văn An"
              className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C75]/20 focus:border-[#0D5C75]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1F2937] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {loading ? 'Đang lưu hồ sơ...' : 'Hoàn tất & Vào Vantrix AI'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};