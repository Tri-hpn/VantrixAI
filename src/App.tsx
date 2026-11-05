import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type {
  Exam,
  OptionId,
  MistakeItem,
  Classroom,
  UserRole,
  StudentSubmission,
  Question,
} from './types/quiz';
import type { AppUser, SystemSettings, AuditLog, SystemMetric } from './types/admin';
import { MOCK_EXAMS } from './data/mockExams';
import { INITIAL_CLASSROOMS, INITIAL_SUBMISSIONS } from './data/mockClassrooms';
import {
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_METRICS,
  INITIAL_USERS,
} from './data/mockAdminData';
import { filterMistakeQuestions, computeExamSummary } from './utils/quiz-logic';
import { recordStudyActivity } from './utils/streak-logic';
import {
  TopBar,
  Header,
  MobileHeader,
  Footer,
  UserProfilePage,
  MobileBottomNav,
  BroadcastBanner,
  StudentExamLibrary,
  StudentExamRunner,
  StudentResultView,
  StudentMistakeNotebook,
  StudentAiQuizGenerator,
  StudentStatsView,
  StudentClassrooms,
  StudentPersonalRoadmap,
  StudentQuickMistakeReviewModal,
  TeacherPortal,
  TeacherGradeAnalytics,
  FileUploadModal,
  ExamPdfExportModal,
  AdminPortal,
  AuthPages,
  LogoutModal,
  NotificationToastContainer,
  NotificationCenterModal,
} from './components';
import type { AuthMode } from './components/auth/AuthPages';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import type { NotificationAction } from './types/notification';
import { CompleteProfile } from './components/auth/CompleteProfile'; // Import component mới

type HubTab =
  | 'exams' | 'exam_runner' | 'result' | 'mistakes' | 'generator' 
  | 'stats' | 'classes' | 'admin' | 'auth' | 'profile' | 'roadmap';

type AdminTab = 'overview' | 'students' | 'teachers' | 'exams' | 'settings' | 'logs';

const INITIAL_MISTAKES: MistakeItem[] = [
  {
    id: 'seed-mistake-1',
    examId: 'tieuhoc-toan-lop5-2025',
    examTitle: 'Đề Thi Thử Toán Tuổi Thơ & Violympic Lớp 5',
    question: MOCK_EXAMS[0].questions[0],
    selectedOption: 'B',
    savedAt: Date.now() - 86400000,
    isMastered: false,
  },
  {
    id: 'seed-mistake-2',
    examId: 'tieuhoc-toan-lop5-2025',
    examTitle: 'Đề Thi Thử Toán Tuổi Thơ & Violympic Lớp 5',
    question: MOCK_EXAMS[0].questions[1],
    selectedOption: 'C',
    savedAt: Date.now() - 43200000,
    isMastered: false,
  },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {
  // 1. Kiểm tra xem có phải đang ở trang Complete Profile không
  if (window.location.pathname === '/complete-profile') {
    return <CompleteProfile />;
  }

  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

function AppContent() {
  const { notify, notifyTeacherAssignment, unreadCount } = useNotifications();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('quizflow_current_user');
      if (saved) return JSON.parse(saved) as AppUser;
    } catch { /* ignore */ }
    return INITIAL_USERS[0];
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('quizflow_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role) return u.role;
      }
    } catch {}
    return 'admin';
  });
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('quizflow_users_db');
      if (saved) return JSON.parse(saved) as AppUser[];
    } catch { /* ignore */ }
    return INITIAL_USERS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('quizflow_system_settings');
      if (saved) return JSON.parse(saved) as SystemSettings;
    } catch { /* ignore */ }
    return INITIAL_SYSTEM_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('quizflow_audit_logs');
      if (saved) return JSON.parse(saved) as AuditLog[];
    } catch { /* ignore */ }
    return INITIAL_AUDIT_LOGS;
  });

  const [systemMetrics] = useState<SystemMetric>(INITIAL_SYSTEM_METRICS);

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem('quizflow_exams_db');
      if (saved) return JSON.parse(saved) as Exam[];
    } catch { /* ignore */ }
    return MOCK_EXAMS;
  });

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem('quizflow_classrooms_db');
      if (saved) return JSON.parse(saved) as Classroom[];
    } catch { /* ignore */ }
    return INITIAL_CLASSROOMS;
  });

  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('quizflow_submissions_db');
      if (saved) return JSON.parse(saved) as StudentSubmission[];
    } catch { /* ignore */ }
    return INITIAL_SUBMISSIONS;
  });

  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => {
    try {
      const saved = localStorage.getItem('quizflow_mistakes');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((item): item is MistakeItem => {
            if (!item || typeof item !== 'object') return false;
            const record = item as Record<string, unknown>;
            const question = record.question as Record<string, unknown> | undefined;
            return !!question && typeof question.id === 'string';
          });
          if (valid.length > 0) return valid;
        }
      }
    } catch { /* ignore */ }
    return INITIAL_MISTAKES;
  });

  const [currentTab, setCurrentTab] = useState<HubTab>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [authInitialMode, setAuthInitialMode] = useState<AuthMode>('login');

  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeClassIdForExam, setActiveClassIdForExam] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, OptionId>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [generatorInitialTopic, setGeneratorInitialTopic] = useState<string>('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pdfExportExam, setPdfExportExam] = useState<Exam | null>(null);
  const [isQuickReviewOpen, setIsQuickReviewOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [completedExamsCount, setCompletedExamsCount] = useState<number>(1);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitExamRef = useRef<() => void>(() => {});

  // Session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            // Nếu user chưa hoàn thiện profile, đẩy sang trang complete-profile
            if (data.user.profileCompleted === false) {
              window.location.href = '/complete-profile';
              return;
            }

            setCurrentUser(data.user);
            setCurrentRole(data.user.role);
            
            if (data.user.role === 'admin') setCurrentTab('admin');
            else if (data.user.role === 'teacher') setCurrentTab('classes');
            else setCurrentTab('exams');
          }
        }
      } catch (err) {
        console.warn('Chưa đăng nhập hoặc lỗi kết nối Server Auth', err);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Lỗi khi logout:', err);
    }
    setCurrentUser(null);
    setCurrentRole('student');
    setCurrentTab('auth');
    setAuthInitialMode('login');
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      return exists ? prev : [user, ...prev];
    });

    if (user.role === 'admin') setCurrentTab('admin');
    else if (user.role === 'teacher') setCurrentTab('classes');
    else setCurrentTab('exams');
  };

  const handleRegisterUser = (newUser: AppUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleAddAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = { id: `log-${Date.now()}`, timestamp: Date.now(), ...logData };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  useEffect(() => { try { localStorage.setItem('quizflow_mistakes', JSON.stringify(mistakes)); } catch { /* ignore */ } }, [mistakes]);
  useEffect(() => { try { localStorage.setItem('quizflow_users_db', JSON.stringify(users)); } catch { /* ignore */ } }, [users]);
  useEffect(() => { try { localStorage.setItem('quizflow_system_settings', JSON.stringify(systemSettings)); } catch { /* ignore */ } }, [systemSettings]);
  useEffect(() => { try { localStorage.setItem('quizflow_audit_logs', JSON.stringify(auditLogs)); } catch { /* ignore */ } }, [auditLogs]);
  useEffect(() => { try { localStorage.setItem('quizflow_exams_db', JSON.stringify(exams)); } catch { /* ignore */ } }, [exams]);
  useEffect(() => { try { localStorage.setItem('quizflow_classrooms_db', JSON.stringify(classrooms)); } catch { /* ignore */ } }, [classrooms]);
  useEffect(() => { try { localStorage.setItem('quizflow_submissions_db', JSON.stringify(submissions)); } catch { /* ignore */ } }, [submissions]);

  useEffect(() => {
    if (currentTab === 'exam_runner' && activeExam) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            submitExamRef.current();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentTab, activeExam]);

  const startExam = (exam: Exam, classId?: string) => {
    setActiveExam(exam);
    setActiveClassIdForExam(classId || exam.classId || null);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeRemainingSeconds(exam.durationMinutes * 60);
    setTimeSpentSeconds(0);
    setCurrentTab('exam_runner');
  };

  const handleNotificationAction = (action: NotificationAction) => {
    if (action.actionType === 'START_EXAM') {
      const examId = action.payload?.examId;
      const foundExam = exams.find((e) => e.id === examId) || exams[0];
      if (foundExam) startExam(foundExam);
    } else if (action.actionType === 'START_QUICK_REVIEW') {
      setIsQuickReviewOpen(true);
    } else if (action.actionType === 'OPEN_MISTAKES') {
      setCurrentTab('mistakes');
    } else if (action.actionType === 'OPEN_CLASSES') {
      setCurrentTab('classes');
    } else if (action.actionType === 'OPEN_ROADMAP') {
      setCurrentTab('roadmap');
    }
  };

  const handleSelectOption = (questionId: string, optionId: OptionId) => {
    setUserAnswers((prev) => {
      if (prev[questionId] === optionId) {
        const next = { ...prev };
        delete next[questionId];
        return next;
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const summary = computeExamSummary(activeExam.questions, userAnswers, activeExam.scoringScale);

    if (activeClassIdForExam) {
      const newSub: StudentSubmission = {
        id: `sub-${Date.now()}`,
        classId: activeClassIdForExam,
        examId: activeExam.id,
        studentId: currentUser?.id || 'hs-me',
        studentName: currentUser?.name || (currentRole === 'teacher' ? 'Thầy Văn Trí (Làm mẫu)' : 'Văn Trí (Học sinh)'),
        score: summary.score,
        totalQuestions: summary.total,
        correctCount: summary.correctCount,
        submittedAt: Date.now(),
        timeSpentSeconds,
        userAnswers,
      };
      setSubmissions((prev) => [newSub, ...prev]);
    }

    const mistakeItems = filterMistakeQuestions(activeExam.questions, userAnswers);
    if (mistakeItems.length > 0) {
      setMistakes((prev) => {
        const updated = [...prev];
        for (const m of mistakeItems) {
          const exists = updated.some((item) => item.question.id === m.question.id && item.examId === activeExam.id);
          if (!exists) {
            updated.unshift({
              id: `mistake-${Date.now()}-${m.question.id}`,
              examId: activeExam.id,
              examTitle: activeExam.title,
              question: m.question,
              selectedOption: m.selectedOption,
              savedAt: Date.now(),
              isMastered: false,
            });
          }
        }
        return updated;
      });
    }

    setCompletedExamsCount((c) => c + 1);
    recordStudyActivity('quiz', activeExam.questions.length);
    setCurrentTab('result');
  };

  submitExamRef.current = handleSubmitExam;

  const handleToggleMastered = (id: string) => {
    setMistakes((prev) => prev.map((m) => (m.id === id ? { ...m, isMastered: !m.isMastered } : m)));
  };

  const handleMarkAsMastered = (id: string) => {
    setMistakes((prev) => prev.map((m) => (m.id === id ? { ...m, isMastered: true } : m)));
    recordStudyActivity('mistake', 1);
  };

  const handleClearMastered = () => {
    setMistakes((prev) => prev.filter((m) => !m.isMastered));
  };

  const handleExamCreated = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
    startExam(newExam);
  };

  const handleSaveToPersonal = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
    notify({
      title: 'Đã lưu đề thi cá nhân',
      message: `Đề thi "${newExam.title}" (${newExam.questions.length} câu) đã được lưu vào thư viện cá nhân!`,
      type: 'system',
      action: { label: 'Làm bài ngay', actionType: 'START_EXAM', payload: { examId: newExam.id } },
    });
    setCurrentTab('exams');
  };

  const handleSaveAndAssignToClass = (newExam: Exam, classId: string) => {
    const updatedExam = { ...newExam, classId };
    setExams((prev) => [updatedExam, ...prev]);
    setClassrooms((prev) =>
      prev.map((c) => c.id === classId ? { ...c, assignedExamIds: [updatedExam.id, ...c.assignedExamIds] } : c)
    );

    const targetClass = classrooms.find((c) => c.id === classId);
    notifyTeacherAssignment({
      teacherName: currentUser?.name || 'Thầy Nguyễn Văn Trí',
      examTitle: newExam.title,
      examId: updatedExam.id,
      className: targetClass?.name,
      deadline: '23:59 Chủ Nhật tuần này',
    });
    setCurrentTab('classes');
  };

  const handleCreateClassroom = (newClass: Classroom) => {
    setClassrooms((prev) => [newClass, ...prev]);
    notify({
      title: 'Đã tạo lớp học thành công',
      message: `Lớp "${newClass.name}" đã được kích hoạt. Mã mời học sinh: ${newClass.code}`,
      type: 'system',
      action: { label: 'Vào lớp ngay', actionType: 'OPEN_CLASSES' },
    });
  };

  const handleJoinClassroom = (code: string) => {
    const found = classrooms.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!found) return { success: false, message: `Không tìm thấy lớp học có mã "${code}". Vui lòng kiểm tra lại.` };

    const email = currentUser?.email || 'vantritran518@gmail.com';
    const alreadyJoined = found.students.some((s) => s.email === email);
    if (alreadyJoined) return { success: true, message: `Bạn đã tham gia lớp "${found.name}" rồi.` };

    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === found.id
          ? { ...c, students: [...c.students, { id: `hs-new-${Date.now()}`, name: currentUser?.name || 'Văn Trí (Học sinh)', email, joinedAt: Date.now(), completedExamsCount: 0, averageScore: 0 }] }
          : c
      )
    );

    return { success: true, message: `Chúc mừng bạn đã tham gia lớp "${found.name}" thành công!` };
  };

  const handleShuffleExam = (exam: Exam) => {
    const newCode = Math.floor(100 + Math.random() * 899).toString();
    const shuffledQuestions: Question[] = [...exam.questions].sort(() => Math.random() - 0.5).map((q, idx) => ({ ...q, code: `Câu ${idx + 1}` }));
    const shuffledExam: Exam = {
      ...exam,
      id: `${exam.id}-shuffled-${Date.now()}`,
      title: `${exam.title} (Mã đề hoán vị ${newCode})`,
      questions: shuffledQuestions,
      tag: `Mã ${newCode}`,
    };

    setExams((prev) => [shuffledExam, ...prev]);
    notify({
      type: 'system',
      title: `Đã tạo mã đề hoán vị ${newCode}`,
      message: `Phiên bản đảo câu hỏi ngẫu nhiên đã được lưu vào thư viện: "${shuffledExam.title}"`,
      action: { label: 'Làm bài ngay', actionType: 'START_EXAM', payload: { examId: shuffledExam.id } },
    });
  };

  const handleOpenGeneratorWithTopic = (topic: string) => {
    setGeneratorInitialTopic(topic);
    setCurrentTab('generator');
  };

  const unmasteredCount = mistakes.filter((m) => !m.isMastered).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#0D5C75] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthPages
        initialMode={authInitialMode}
        onLoginSuccess={handleLoginSuccess}
        onBackToApp={() => handleLoginSuccess(INITIAL_USERS[1])}
        existingUsers={users}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-sans selection:bg-[#C7E5EA] selection:text-[#084356]">
      <BroadcastBanner
        announcement={systemSettings.announcement}
        isAdmin={currentRole === 'admin'}
        onOpenAdminSettings={() => setCurrentTab('admin')}
      />

      <TopBar
        systemSettings={systemSettings}
        currentRole={currentRole}
        onUpdateSystemSettings={(updated) => {
          setSystemSettings(updated);
          notify({
            type: 'system',
            title: 'Đã cập nhật TopBar & Thông báo',
            message: 'Thông số hiển thị đầu trang đã được lưu và áp dụng tức thì.',
          });
        }}
      />

      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (currentTab === 'exam_runner') {
            if (window.confirm('Bạn có chắc muốn tạm dừng bài thi hiện tại?')) setCurrentTab(tab);
          } else {
            setCurrentTab(tab);
          }
        }}
        mistakeCount={mistakes.length}
        unmasteredMistakeCount={unmasteredCount}
        activeExamTitle={activeExam?.title}
        onExitExam={() => {
          if (window.confirm('Bạn có chắc muốn thoát phòng thi?')) setCurrentTab('exams');
        }}
        currentUser={currentUser}
        currentRole={currentRole}
        onChangeRole={(newRole) => {
          setCurrentRole(newRole);
          if (newRole === 'admin') { setCurrentTab('admin'); setAdminTab('overview'); }
          else if (newRole === 'teacher') { setCurrentTab('classes'); }
          else { setCurrentTab('exams'); }
        }}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onStartQuickReview={() => setIsQuickReviewOpen(true)}
        onOpenAuth={(mode = 'login') => { setAuthInitialMode(mode); }}
        onLogout={() => setIsLogoutModalOpen(true)}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        onOpenProfile={() => setCurrentTab('profile')}
        adminTab={adminTab}
        onSelectAdminTab={(tab) => { setAdminTab(tab); setCurrentTab('admin'); }}
        studentCount={users.filter((u) => u.role === 'student').length}
        teacherCount={users.filter((u) => u.role === 'teacher').length}
        examCount={exams.length}
      />

      <MobileHeader
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (currentTab === 'exam_runner') {
            if (window.confirm('Bạn có chắc muốn tạm dừng bài thi hiện tại?')) setCurrentTab(tab);
          } else {
            setCurrentTab(tab);
          }
        }}
        currentUser={currentUser}
        currentRole={currentRole}
        onChangeRole={(newRole) => {
          setCurrentRole(newRole);
          if (newRole === 'admin') setCurrentTab('admin');
          else if (newRole === 'teacher') setCurrentTab('classes');
          else setCurrentTab('exams');
        }}
        activeExamTitle={activeExam?.title}
        timeRemainingSeconds={timeRemainingSeconds}
        onExitExam={() => {
          if (window.confirm('Bạn có chắc muốn thoát phòng thi?')) setCurrentTab('exams');
        }}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
        onOpenProfile={() => setCurrentTab('profile')}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex-1 pb-20 md:pb-6"
      >
        {currentTab === 'exams' && (
          <StudentExamLibrary
            exams={exams}
            onStartExam={(exam) => startExam(exam)}
            onOpenGenerator={() => { setGeneratorInitialTopic(''); setCurrentTab('generator'); }}
            onOpenMistakes={() => setCurrentTab('mistakes')}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenClasses={() => setCurrentTab('classes')}
            onExportExamPdf={(exam) => setPdfExportExam(exam)}
            onShuffleExam={handleShuffleExam}
            mistakeCount={unmasteredCount}
            currentRole={currentRole}
            mistakes={mistakes}
            onStartQuickReview={() => setIsQuickReviewOpen(true)}
            onOpenRoadmap={() => setCurrentTab('roadmap')}
            onOpenAdmin={() => setCurrentTab('admin')}
            onOpenStats={() => setCurrentTab('stats')}
          />
        )}

        {currentTab === 'classes' && currentRole === 'student' && (
          <StudentClassrooms
            classrooms={classrooms}
            exams={exams}
            submissions={submissions}
            onJoinClassroom={handleJoinClassroom}
            onStartExam={(exam, classId) => startExam(exam, classId)}
            currentUserEmail={currentUser?.email}
            currentUserName={currentUser?.name}
          />
        )}

        {currentTab === 'classes' && currentRole !== 'student' && (
          <TeacherPortal
            currentRole={currentRole}
            classrooms={classrooms}
            exams={exams}
            submissions={submissions}
            onCreateClassroom={handleCreateClassroom}
            onJoinClassroom={handleJoinClassroom}
            onStartExam={(exam) => startExam(exam)}
            onOpenUploadForClass={() => setIsUploadModalOpen(true)}
            onExportExamPdf={(exam) => setPdfExportExam(exam)}
            onShuffleExam={handleShuffleExam}
          />
        )}

        {currentTab === 'exam_runner' && activeExam && (
          <StudentExamRunner
            exam={activeExam}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            flaggedQuestions={flaggedQuestions}
            timeRemainingSeconds={timeRemainingSeconds}
            onSelectOption={handleSelectOption}
            onToggleFlag={handleToggleFlag}
            onNavigateQuestion={setCurrentIndex}
            onSubmitExam={handleSubmitExam}
            onExit={() => { if (window.confirm('Bạn có chắc muốn thoát bài thi?')) setCurrentTab('exams'); }}
          />
        )}

        {currentTab === 'result' && activeExam && (
          <StudentResultView
            exam={activeExam}
            userAnswers={userAnswers}
            timeSpentSeconds={timeSpentSeconds}
            onReviewMistakes={() => setCurrentTab('mistakes')}
            onRetakeExam={() => startExam(activeExam, activeClassIdForExam || undefined)}
            onGenerateAIQuiz={handleOpenGeneratorWithTopic}
            onBackToLibrary={() => setCurrentTab('exams')}
          />
        )}

        {currentTab === 'mistakes' && (
          <StudentMistakeNotebook
            mistakes={mistakes}
            onToggleMastered={handleToggleMastered}
            onClearMastered={handleClearMastered}
          />
        )}

        {currentTab === 'generator' && (
          <StudentAiQuizGenerator
            initialTopic={generatorInitialTopic}
            onExamCreated={handleExamCreated}
            onCancel={() => setCurrentTab('exams')}
          />
        )}

        {currentTab === 'roadmap' && (
          <StudentPersonalRoadmap
            mistakes={mistakes}
            submissions={submissions}
            exams={exams}
            onStartExam={(exam) => startExam(exam)}
            onOpenMistakes={() => setCurrentTab('mistakes')}
            onGenerateAiQuiz={handleOpenGeneratorWithTopic}
            onStartQuickReview={() => setIsQuickReviewOpen(true)}
            onGoToExams={() => setCurrentTab('exams')}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        )}

        {currentTab === 'stats' &&
          (currentRole === 'student' ? (
            <StudentStatsView
              completedExamsCount={completedExamsCount}
              totalQuestionsSolved={completedExamsCount * 20}
              averageScore={8.65}
              mistakes={mistakes}
              onGoToExams={() => setCurrentTab('exams')}
              onGoToMistakes={() => setCurrentTab('mistakes')}
              onGoToRoadmap={() => setCurrentTab('roadmap')}
            />
          ) : currentRole === 'teacher' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">Phổ Điểm & Báo Cáo Năng Lực Học Sinh</h1>
                  <p className="text-xs text-[#78716C] mt-1">Thống kê điểm số thực tế từ các bài nộp của học sinh theo lớp học đang phụ trách</p>
                </div>
                <button type="button" onClick={() => setCurrentTab('classes')} className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer">Về Quản lý Lớp</button>
              </div>
              <TeacherGradeAnalytics submissions={submissions} />
            </div>
          ) : (
            <AdminPortal
              users={users}
              onUpdateUsers={setUsers}
              systemSettings={systemSettings}
              onUpdateSystemSettings={setSystemSettings}
              auditLogs={auditLogs}
              onAddAuditLog={handleAddAuditLog}
              systemMetrics={systemMetrics}
              exams={exams}
              onUpdateExams={setExams}
              onPreviewExam={(exam) => startExam(exam)}
              activeTab="overview"
              onSelectTab={(tab) => setAdminTab(tab)}
            />
          ))}

        {currentTab === 'admin' && (
          <AdminPortal
            users={users}
            onUpdateUsers={setUsers}
            systemSettings={systemSettings}
            onUpdateSystemSettings={setSystemSettings}
            auditLogs={auditLogs}
            onAddAuditLog={handleAddAuditLog}
            systemMetrics={systemMetrics}
            exams={exams}
            onUpdateExams={setExams}
            onPreviewExam={(exam) => startExam(exam)}
            activeTab={adminTab}
            onSelectTab={(tab) => setAdminTab(tab)}
          />
        )}

        {currentTab === 'profile' && (
          <UserProfilePage
            currentUser={currentUser}
            currentRole={currentRole}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
              notify({ type: 'system', title: 'Hồ sơ đã lưu', message: 'Thông tin tài khoản đã được đồng bộ thành công.' });
            }}
            onBackToMain={() => setCurrentTab('exams')}
            onLogout={() => setIsLogoutModalOpen(true)}
            unmasteredMistakeCount={unmasteredCount}
            onStartExam={() => setCurrentTab('exams')}
            onReviewMistakes={() => setCurrentTab('mistakes')}
            onStartQuickReview={() => setIsQuickReviewOpen(true)}
          />
        )}
      </motion.div>

      <StudentQuickMistakeReviewModal
        isOpen={isQuickReviewOpen}
        onClose={() => setIsQuickReviewOpen(false)}
        unmasteredMistakes={mistakes.filter((m) => !m.isMastered)}
        onMarkAsMastered={handleMarkAsMastered}
      />

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveToPersonal={handleSaveToPersonal}
        onSaveAndAssignToClass={handleSaveAndAssignToClass}
        classrooms={classrooms}
        currentRole={currentRole}
      />

      <ExamPdfExportModal exam={pdfExportExam} isOpen={!!pdfExportExam} onClose={() => setPdfExportExam(null)} />

      <NotificationToastContainer onHandleAction={handleNotificationAction} />

      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onHandleAction={handleNotificationAction}
        unmasteredMistakeCount={unmasteredCount}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleLogout}
        currentUser={currentUser}
      />

      <MobileBottomNav
        currentTab={currentTab === 'exams' ? 'library' : currentTab === 'classes' ? 'classrooms' : currentTab}
        onTabChange={(tab) => {
          if (tab === 'library') setCurrentTab('exams');
          else if (tab === 'classrooms') setCurrentTab('classes');
          else setCurrentTab(tab);
        }}
        adminSubTab={adminTab}
        onSelectAdminSubTab={(tab) => { setAdminTab(tab); setCurrentTab('admin'); }}
        mistakeCount={unmasteredCount}
        unreadNotificationCount={unreadCount}
        userRole={currentRole}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenAuth={() => {
          if (currentUser) setIsLogoutModalOpen(true);
          else setAuthInitialMode('login');
        }}
        isLoggedIn={!!currentUser}
        userName={currentUser?.name}
      />

      {currentTab !== 'exam_runner' && <Footer onSelectLevel={() => setCurrentTab('exams')} />}
    </div>
  );
}