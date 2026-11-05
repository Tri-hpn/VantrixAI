/**
 * ============================================================================
 * TRANG / THÀNH PHẦN: Index Barrel Export
 * PHÂN HỆ: CẤU TRÚC HỆ THỐNG ĐIỀU PHỐI (BARREL EXPORTS)
 * ĐƯỜNG DẪN: /src/components/index.ts
 * CHỨC NĂNG CHÍNH:
 *  - Phân loại rõ ràng các nhóm chức năng đồng bộ theo tiền tố định danh vai trò:
 *      1. Phân hệ Học sinh & Sinh viên: Gồm ĐÚNG 5 TẬP TIN CHÍNH chuẩn hóa theo Image 4:
 *         - StudentExamLibrary.tsx (Thư viện đề, Runner, Result, QuestionMatrix)
 *         - StudentMistakeNotebook.tsx (Sổ tay lỗi sai, Micro-review modal)
 *         - StudentClassrooms.tsx (Không gian Lớp học & Bài tập sinh viên)
 *         - StudentStatsView.tsx (Báo cáo năng lực, Chuỗi ngày Streak, Daily review)
 *         - StudentAiQuizGenerator.tsx (Trợ lý soạn & luyện đề AI)
 *      2. Phân hệ Giảng viên & Giáo viên: Tất cả tập tin đều mang tiền tố Teacher*:
 *         - TeacherPortal.tsx (và alias ClassroomHub)
 *         - TeacherClassroomManagement.tsx
 *         - TeacherExamAssignment.tsx
 *         - TeacherLeaderboard.tsx
 *         - TeacherGradeAnalytics.tsx
 *      3. Phân hệ Quản trị viên Hệ thống (Admin*.tsx)
 *      4. Phân hệ Xác thực Tài khoản & SSO (auth/)
 *      5. Phân hệ Dùng chung, Header, TopBar, Footer & Mobile Navigation (common/)
 * ============================================================================
 */

// 1. Phân hệ Học sinh & Sinh viên (Đúng 5 tập tin chính chuẩn hóa)
export {
  StudentExamLibrary,
  ExamLibrary,
  StudentExamRunner,
  ExamRunner,
  StudentResultView,
  ResultView,
  StudentQuestionMatrix,
  QuestionMatrix,
  StudentSubmitModal,
  SubmitModal,
  StudentPortal,
  ExamDifficultyPieChart,
  AverageDifficultyPill,
} from './student/StudentExamLibrary';

export {
  StudentMistakeNotebook,
  MistakeNotebook,
  StudentQuickMistakeReviewModal,
  QuickMistakeReviewModal,
} from './student/StudentMistakeNotebook';

export { StudentClassrooms } from './student/StudentClassrooms';

export {
  StudentStatsView,
  StatsView,
  StudentDailyStudyStreakCard,
  DailyStudyStreakCard,
  StudentDailyReviewWidget,
  DailyReviewWidget,
} from './student/StudentStatsView';

export {
  StudentAiQuizGenerator,
  AiQuizGenerator,
} from './student/StudentAiQuizGenerator';

export {
  StudentPersonalRoadmap,
  StudentPersonalRoadmap as PersonalRoadmap,
} from './student/StudentPersonalRoadmap';

// 2. Phân hệ Giảng viên & Giáo viên (Toàn bộ mang tiền tố Teacher*)
export { TeacherPortal, ClassroomHub } from './teacher/TeacherPortal';
export { TeacherClassroomManagement } from './teacher/TeacherClassroomManagement';
export { TeacherExamAssignment } from './teacher/TeacherExamAssignment';
export { TeacherLeaderboard } from './teacher/TeacherLeaderboard';
export { TeacherGradeAnalytics } from './teacher/TeacherGradeAnalytics';

// 3. Phân hệ Quản trị viên Hệ thống (Admin)
export { AdminPortal } from './admin/AdminPortal';
export { AdminStudentManagement } from './admin/AdminStudentManagement';
export { AdminTeacherManagement } from './admin/AdminTeacherManagement';
export { AdminExamModeration } from './admin/AdminExamModeration';
export { AdminSystemSettings } from './admin/AdminSystemSettings';
export { AdminAuditLogs } from './admin/AdminAuditLogs';

// 4. Phân hệ Xác thực Tài khoản & SSO (Auth)
export { AuthPages } from './auth/AuthPages';
export { SocialAuthButtons } from './auth/SocialAuthButtons';
export { LogoutModal } from './auth/LogoutModal';

// 5. Phân hệ Dùng chung (Common) & Điều Hướng
export { TopBar } from './common/TopBar';
export { TopBarQuickEditModal } from './common/TopBarQuickEditModal';
export { Header } from './common/Header';
export { MobileHeader } from './common/MobileHeader';
export { Footer } from './common/Footer';
export { UserProfilePage } from './common/UserProfilePage';
export { Navbar } from './common/Navbar';
export { MobileBottomNav } from './common/MobileBottomNav';
export { BroadcastBanner } from './common/BroadcastBanner';
export { FileUploadModal } from './common/FileUploadModal';
export { ExamPdfExportModal } from './common/ExamPdfExportModal';
export { NotificationCenterModal } from './common/NotificationCenterModal';
export { NotificationToastContainer } from './common/NotificationToastContainer';
export { MathText } from './common/MathText';
