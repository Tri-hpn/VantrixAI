/**
 * ============================================================================
 * FILE: TeacherPortal.tsx — Vantrix AI
 * PHÂN HỆ: GIẢNG VIÊN & GIÁO VIÊN (TEACHER PORTAL COORDINATOR)
 * ĐƯỜNG DẪN: /src/components/teacher/TeacherPortal.tsx
 * CHỨC NĂNG:
 *  - Điều phối 4 phân hệ giáo viên:
 *    1. Quản lý Lớp học & Sĩ số
 *    2. Ngân hàng Đề thi & Giao bài
 *    3. Bảng điểm & Xếp hạng
 *    4. Phổ điểm & Năng lực
 * ============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Classroom, Exam, StudentSubmission, UserRole } from '../../types/quiz';
import { TeacherClassroomManagement } from './TeacherClassroomManagement';
import { TeacherExamAssignment } from './TeacherExamAssignment';
import { TeacherLeaderboard } from './TeacherLeaderboard';
import { TeacherGradeAnalytics } from './TeacherGradeAnalytics';
import { School, BookOpen, Trophy, BarChart3 } from 'lucide-react';

const TEACHER = {
  main: '#B45309',
  hover: '#92400E',
  tint: '#FEF3C7',
  border: '#FDE68A',
  deep: '#78350F',
} as const;

export interface TeacherPortalProps {
  currentRole: UserRole;
  classrooms: Classroom[];
  exams: Exam[];
  submissions: StudentSubmission[];
  onCreateClassroom: (newClass: Classroom) => void;
  /** @deprecated — Không còn sử dụng trong UI, giữ để tương thích App.tsx. */
  onJoinClassroom?: (classCode: string) => { success: boolean; message: string };
  onStartExam: (exam: Exam) => void;
  onOpenUploadForClass: (classId: string) => void;
  onExportExamPdf: (exam: Exam) => void;
  onShuffleExam: (exam: Exam) => void;
}

type TeacherTab = 'classes' | 'exams' | 'leaderboard' | 'analytics';

const TABS: { key: TeacherTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'classes', label: '1. Quản lý Lớp học & Sĩ số', icon: School },
  { key: 'exams', label: '2. Đề thi & Giao bài tập', icon: BookOpen },
  { key: 'leaderboard', label: '3. Bảng điểm & Thứ hạng', icon: Trophy },
  { key: 'analytics', label: '4. Phổ điểm & Năng lực', icon: BarChart3 },
];

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  currentRole,
  classrooms,
  exams,
  submissions,
  onCreateClassroom,
  onStartExam,
  onOpenUploadForClass,
  onExportExamPdf,
  onShuffleExam,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [activeTab, setActiveTab] = useState<TeacherTab>('classes');

  const selectedClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: TEACHER.main }}
            />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: TEACHER.main }}
            >
              Không Gian Giảng Viên & Giáo Viên
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Cổng Quản Trị Lớp Học & Khảo Thí Vantrix AI
          </h1>
          <p className="text-xs text-[#78716C] mt-1 max-w-2xl">
            Tạo lớp, phát mã mời học sinh, giao đề thi từ ngân hàng và giám sát phổ điểm theo
            chuẩn ma trận Bộ GD&ĐT.
          </p>
        </div>

        {/* Quick highlights */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#FAFAF9] border border-[#E7E5E4] px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">
              Tổng Số Lớp
            </span>
            <span className="text-xl font-black" style={{ color: TEACHER.main }}>
              {classrooms.length} Lớp
            </span>
          </div>
          <div className="bg-[#FAFAF9] border border-[#E7E5E4] px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">
              Bài Nộp
            </span>
            <span className="text-xl font-black text-[#0F172A]">
              {submissions.length} Bài
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab nav */}
      <div className="flex items-center gap-2 border-b border-[#E7E5E4] pb-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'text-white shadow-md border-transparent'
                  : 'text-[#57534E] hover:text-[#0F172A] hover:bg-[#F5F5F4] border-transparent'
              }`}
              style={isActive ? { backgroundColor: TEACHER.main } : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {activeTab === 'classes' && (
            <TeacherClassroomManagement
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              onCreateClassroom={onCreateClassroom}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'exams' && (
            <TeacherExamAssignment
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              exams={exams}
              onStartExam={onStartExam}
              onOpenUploadForClass={onOpenUploadForClass}
              onExportExamPdf={onExportExamPdf}
              onShuffleExam={onShuffleExam}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'leaderboard' && (
            <TeacherLeaderboard
              submissions={submissions}
              selectedClass={selectedClass}
            />
          )}

          {activeTab === 'analytics' && (
            <TeacherGradeAnalytics
              submissions={submissions}
              selectedClass={selectedClass}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export { TeacherPortal as ClassroomHub };
export type { TeacherPortalProps as ClassroomHubProps };