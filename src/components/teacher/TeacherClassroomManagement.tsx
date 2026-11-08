/**
 * ============================================================================
 * FILE: TeacherClassroomManagement.tsx — Vantrix AI
 * PHÂN HỆ: GIẢNG VIÊN & GIÁO VIÊN (TEACHER)
 * ĐƯỜNG DẪN: /src/components/teacher/TeacherClassroomManagement.tsx
 * CHỨC NĂNG:
 *  - Tạo lớp học mới với mã 6 ký tự bảo mật
 *  - Quản lý danh sách lớp: khối, sĩ số, số đề đã giao
 *  - Xem roster học sinh, sao chép mã mời
 *  - Thêm / Xóa học sinh trực tiếp khỏi lớp học
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Classroom, UserRole } from '../../types/quiz';
import {
  Users,
  PlusCircle,
  Copy,
  Check,
  School,
  GraduationCap,
  BookOpen,
  Search,
  X,
  CheckCircle2,
  UserPlus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const TEACHER = {
  main: '#B45309',
  hover: '#92400E',
  tint: '#FEF3C7',
  border: '#FDE68A',
  deep: '#78350F',
} as const;

const SUBJECTS = [
  { value: 'toan', label: 'Toán học' },
  { value: 'ly', label: 'Vật lý' },
  { value: 'dgnl', label: 'ĐGNL ĐHQG' },
  { value: 'ielts', label: 'Tiếng Anh / IELTS' },
] as const;
type TeacherSubject = (typeof SUBJECTS)[number]['value'];

const GRADES = [
  { value: 'Khối 12', label: 'Khối 12 (Thi THPT & ĐGNL)' },
  { value: 'Khối 11', label: 'Khối 11' },
  { value: 'Khối 10', label: 'Khối 10' },
  { value: 'Khối 9', label: 'Khối 9 (Thi vào 10 chuyên)' },
  { value: 'Đại học', label: 'Đại học / Cao đẳng' },
] as const;

export interface TeacherClassroomManagementProps {
  classrooms: Classroom[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  onCreateClassroom: (newClass: Classroom) => void;
  currentRole: UserRole;
}

interface RosterStudent {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  avgScore: number;
  status: 'Hoạt động' | 'Cần kèm';
}

export const TeacherClassroomManagement: React.FC<TeacherClassroomManagementProps> = ({
  classrooms,
  selectedClassId,
  onSelectClass,
  onCreateClassroom,
  currentRole,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState<TeacherSubject>('toan');
  const [newClassGrade, setNewClassGrade] = useState<string>('Khối 12');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manage roster state locally with initial students
  const [rosterList, setRosterList] = useState<RosterStudent[]>([
    { id: 'hs-01', name: 'Nguyễn Văn Trí (Tôi)', email: 'vantritran518@gmail.com', joinedAt: '20/10/2025', avgScore: 9.5, status: 'Hoạt động' },
    { id: 'hs-02', name: 'Trần Minh Anh', email: 'minhanh.tran@gmail.com', joinedAt: '21/10/2025', avgScore: 8.8, status: 'Hoạt động' },
    { id: 'hs-03', name: 'Lê Hoàng Nam', email: 'nam.lehoang@gmail.com', joinedAt: '22/10/2025', avgScore: 8.2, status: 'Hoạt động' },
    { id: 'hs-04', name: 'Phạm Thu Thảo', email: 'thuthao.pham@gmail.com', joinedAt: '23/10/2025', avgScore: 9.2, status: 'Hoạt động' },
    { id: 'hs-05', name: 'Vũ Đức Thịnh', email: 'ducthinh.vu@gmail.com', joinedAt: '24/10/2025', avgScore: 7.6, status: 'Cần kèm' },
  ]);

  const selectedClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  const handleCopyCode = async () => {
    if (!selectedClass) return;
    try {
      await navigator.clipboard.writeText(selectedClass.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      /* clipboard fallback */
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass: Classroom = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      code,
      teacherName: 'Thầy Nguyễn Văn Trí',
      teacherEmail: 'vantritran518@gmail.com',
      educationLevel: 'thpt',
      educationLevelLabel: 'Cấp 3 - THPT',
      grade: newClassGrade,
      subject: newClassSubject,
      description:
        newClassDesc.trim() || 'Lớp ôn luyện khảo thí chuyên đề chuẩn Bộ GD&ĐT',
      assignedExamIds: ['thpt-toan-2025-01'],
      students: [
        {
          id: 'stu-init',
          name: 'Nguyễn Minh Quân',
          email: 'minhquan.thpt@gmail.com',
          joinedAt: Date.now(),
          completedExamsCount: 0,
          averageScore: 0,
        },
      ],
      createdAt: Date.now(),
    };

    onCreateClassroom(newClass);
    setIsCreateModalOpen(false);
    setNewClassName('');
    setNewClassDesc('');
    onSelectClass(newClass.id);
    setToastMessage(`Đã tạo thành công lớp học "${newClass.name}" (Mã: ${newClass.code})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    const newStudent: RosterStudent = {
      id: `hs-${Date.now()}`,
      name: newStudentName.trim(),
      email: newStudentEmail.trim(),
      joinedAt: 'Hôm nay',
      avgScore: 8.0,
      status: 'Hoạt động',
    };

    setRosterList((prev) => [newStudent, ...prev]);
    setIsAddStudentModalOpen(false);
    setNewStudentName('');
    setNewStudentEmail('');
    setToastMessage(`Đã thêm học sinh "${newStudent.name}" vào danh sách lớp.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    setRosterList((prev) => prev.filter((s) => s.id !== studentId));
    setToastMessage(`Đã xóa học sinh "${studentName}" khỏi lớp.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredRoster = useMemo(() => {
    const q = searchStudent.trim().toLowerCase();
    if (!q) return rosterList;
    return rosterList.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [rosterList, searchStudent]);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1 font-medium">{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E5E4] shadow-sm font-sans">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#0F172A] flex items-center gap-2">
            <School className="w-5 h-5" style={{ color: TEACHER.main }} />
            <span>Quản Lý Lớp Học & Sĩ Số</span>
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5 font-sans">
            Tạo lớp theo từng bộ môn, cấp mã mời bảo mật và giám sát học sinh theo lớp.
          </p>
        </div>

        {currentRole === 'teacher' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: TEACHER.main }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEACHER.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEACHER.main)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Lớp Học Mới</span>
          </motion.button>
        )}
      </div>

      {/* Class selector */}
      {classrooms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#E7E5E4] p-12 text-center font-sans">
          <School className="w-12 h-12 text-[#D6D3D1] mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-[#0F172A] mb-1">Chưa có lớp học nào</h3>
          <p className="text-xs text-[#78716C] max-w-md mx-auto mb-4 font-sans">
            Bấm "Tạo Lớp Học Mới" để bắt đầu quản lý học sinh và giao bài tập.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer font-sans"
            style={{ backgroundColor: TEACHER.main }}
          >
            + Tạo lớp đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          {classrooms.map((cls, idx) => {
            const isSelected = cls.id === selectedClass?.id;
            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2), ease: 'easeOut' }}
                whileHover={{ y: -2 }}
                onClick={() => onSelectClass(cls.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected ? 'shadow-md' : 'bg-white border-[#E7E5E4] hover:shadow-sm'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${TEACHER.tint}80`,
                        borderColor: TEACHER.border,
                        boxShadow: `0 0 0 2px ${TEACHER.main}33`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: TEACHER.tint,
                      color: TEACHER.deep,
                      borderColor: TEACHER.border,
                    }}
                  >
                    {cls.grade}
                  </span>
                  <span className="font-mono text-xs font-black text-[#57534E] bg-[#F5F5F4] px-2 py-0.5 rounded">
                    MÃ: {cls.code}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-[#0F172A] leading-snug mb-1">
                  {cls.name}
                </h3>
                <p className="text-xs text-[#78716C] line-clamp-2 mb-3 font-sans">{cls.description}</p>

                <div className="flex items-center justify-between text-xs text-[#57534E] pt-2 border-t border-[#F5F5F4]">
                  <span className="flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <strong>{cls.students?.length ?? 0}</strong> học sinh
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <strong>{cls.assignedExamIds?.length ?? 0}</strong> đề
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Class detail */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm space-y-6 font-sans"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F5F5F4]">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-xl font-serif font-black text-[#0F172A]">{selectedClass.name}</h3>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold border"
                  style={{
                    backgroundColor: TEACHER.tint,
                    color: TEACHER.deep,
                    borderColor: TEACHER.border,
                  }}
                >
                  {selectedClass.grade}
                </span>
              </div>
              <p className="text-xs text-[#78716C] font-sans">
                Giáo viên phụ trách: <strong className="text-[#0F172A]">{selectedClass.teacherName}</strong> • {selectedClass.description}
              </p>
            </div>

            {/* Invite code box */}
            <div className="flex items-center gap-3 bg-[#FAFAF9] p-3 rounded-2xl border border-[#E7E5E4] shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block font-sans">
                  MÃ MỜI HỌC SINH
                </span>
                <span
                  className="font-mono text-lg font-black tracking-wider"
                  style={{ color: TEACHER.main }}
                >
                  {selectedClass.code}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-white border border-[#E7E5E4] text-[#57534E] hover:text-[#78350F] transition-colors cursor-pointer"
                title={copiedCode ? 'Đã sao chép!' : 'Sao chép mã lớp'}
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Roster */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h4 className="font-serif font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" style={{ color: TEACHER.main }} />
                  <span>
                    Danh Sách Học Sinh ({filteredRoster.length}
                    {searchStudent && `/${rosterList.length}`})
                  </span>
                </h4>
                {/* HỒI SINH TÍNH NĂNG: Thêm học sinh trực tiếp vào lớp */}
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#78350F] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm học sinh</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Tìm học sinh theo tên, email..."
                  className="pl-8 pr-7 py-1.5 rounded-xl border border-[#E7E5E4] text-xs w-full sm:w-64 bg-white focus:outline-none focus:ring-2 transition-all font-sans"
                  style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                />
                {searchStudent && (
                  <button
                    type="button"
                    onClick={() => setSearchStudent('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filteredRoster.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border border-dashed border-[#E7E5E4] bg-[#FAFAF9]">
                <Users className="w-10 h-10 text-[#D6D3D1] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#0F172A]">
                  Không tìm thấy học sinh phù hợp
                </p>
                <p className="text-[11px] text-[#A8A29E] mt-1 font-sans">
                  Thử xoá từ khóa tìm kiếm hoặc kiểm tra lại danh sách.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#E7E5E4]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF9] text-[#57534E] font-bold border-b border-[#E7E5E4]">
                    <tr>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Ngày tham gia</th>
                      <th className="py-3 px-4 text-center">Điểm TB</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F4] font-medium text-[#0F172A]">
                    {filteredRoster.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAFAF9]/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0F172A]">{s.name}</td>
                        <td className="py-3 px-4 text-[#78716C] font-mono">{s.email}</td>
                        <td className="py-3 px-4 text-[#78716C] font-mono">{s.joinedAt}</td>
                        <td
                          className="py-3 px-4 text-center font-bold tabular-nums font-mono"
                          style={{ color: TEACHER.main }}
                        >
                          {s.avgScore}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              s.status === 'Hoạt động'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(s.id, s.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa học sinh khỏi lớp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Add student modal */}
      <AnimatePresence>
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F4]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#78350F] flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#0F172A]">Thêm Học Sinh Vào Lớp</h3>
                    <p className="text-[11px] text-[#78716C]">{selectedClass.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="space-y-3 font-sans">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên học sinh *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hoàng Văn Nam"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email học sinh *</label>
                  <input
                    type="email"
                    required
                    placeholder="VD: nam.hoang@gmail.com"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                  >
                    Thêm ngay
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create class modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5E4]"
            >
              <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#F5F5F4]">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#0F172A]">Tạo Lớp Học Mới</h3>
                  <p className="text-xs text-[#78716C] mt-0.5 font-sans">
                    Mã lớp 6 ký tự bảo mật sẽ được tạo tự động.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-[#57534E] mb-1.5 uppercase tracking-wider">
                    Tên lớp học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ví dụ: Lớp 12A1 - Chuyên Đề Tích Phân & Oxyz"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-sm font-semibold text-[#0F172A] transition-all font-sans"
                    style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#57534E] mb-1.5 uppercase tracking-wider">
                      Khối lớp
                    </label>
                    <select
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 font-semibold text-[#0F172A] bg-white transition-all font-sans"
                    >
                      {GRADES.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#57534E] mb-1.5 uppercase tracking-wider">
                      Bộ môn
                    </label>
                    <select
                      value={newClassSubject}
                      onChange={(e) => setNewClassSubject(e.target.value as TeacherSubject)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 font-semibold text-[#0F172A] bg-white transition-all font-sans"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#57534E] mb-1.5 uppercase tracking-wider">
                    Mô tả mục tiêu lớp học
                  </label>
                  <textarea
                    rows={3}
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    placeholder="Ví dụ: Rèn luyện kỹ năng giải nhanh đề thi THPT Quốc gia 2025 theo cấu trúc mới."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 text-[#0F172A] transition-all resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F5F5F4]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#57534E] hover:bg-[#F5F5F4] font-semibold cursor-pointer transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5 font-sans"
                    style={{ backgroundColor: TEACHER.main }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tạo Lớp Ngay
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};