/**
 * ============================================================================
 * FILE: StudentPersonalRoadmap.tsx — Vantrix AI
 * PHÂN HỆ: HỌC SINH & SINH VIÊN (STUDENT ADAPTIVE LEARNING PATHWAY)
 * ĐƯỜNG DẪN: /src/components/student/StudentPersonalRoadmap.tsx
 * CHỨC NĂNG:
 *  - Phân tích lịch sử thi + Sổ tay lỗi sai → chẩn đoán lỗ hổng kiến thức
 *  - Định vị chuyên đề theo 3 tầng: Khẩn cấp / Cần củng cố / Đã làm chủ
 *  - Kế hoạch 3 bước hành động thích ứng + Recharts tiến bộ điểm số
 *  - Gợi ý bẫy đề thi & mẹo Casio từ dữ liệu lỗi sai tích lũy
 *  - Đề thi tự tải cá nhân hóa: Tự tải đề Word/PDF, chỉ dành cho cá nhân
 *  - Chia sẻ mã bảo mật (Passcode) cho bạn bè và mở khóa đề thi
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BookmarkCheck,
  BookOpen,
  ArrowRight,
  Flame,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Award,
  Lightbulb,
  Activity,
  Share2,
  Key,
  UploadCloud,
  Lock,
  Copy,
  FileText,
  Check,
  X,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { MistakeItem, Exam, StudentSubmission, Question } from '../../types/quiz';
import {
  analyzeStudentRoadmap,
  type TopicVulnerability,
  type VulnerabilityLevel,
  type RoadmapMilestoneStep,
  type ScoreHistoryPoint,
} from '../../utils/roadmap-logic';

const BRAND = '#0D5C75';

/* ============================================================================
 * CustomScoreTooltip — Tooltip cho Recharts
 * ============================================================================ */
interface CustomScoreTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ScoreHistoryPoint }>;
  label?: string;
}

const CustomScoreTooltip: React.FC<CustomScoreTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-[#0F172A] text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[210px] font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="font-serif font-extrabold text-teal-300">
          {data.displayName} ({data.shortDate})
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-200 border border-teal-700/50 font-bold font-mono">
          Bài #{data.index}
        </span>
      </div>
      <p className="text-[11px] font-medium text-slate-300 line-clamp-1">{data.examTitle}</p>
      <div className="flex items-center justify-between pt-1">
        <span className="text-slate-400">Điểm bài thi:</span>
        <span className="font-black text-amber-300 text-sm font-mono">{data.score} / 10.0</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400">ĐTB tích lũy:</span>
        <span className="font-bold text-emerald-300 font-mono">{data.cumulativeAverage} đ</span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/80">
        <span>Độ chính xác:</span>
        <span className="font-semibold text-slate-200 font-mono">
          {data.correctCount}/{data.totalQuestions} (
          {Math.round((data.correctCount / Math.max(1, data.totalQuestions)) * 100)}%)
        </span>
      </div>
    </div>
  );
};

/* ============================================================================
 * Props
 * ============================================================================ */
export interface StudentPersonalRoadmapProps {
  mistakes: MistakeItem[];
  submissions?: StudentSubmission[];
  exams?: Exam[];
  onStartExam?: (exam: Exam) => void;
  onOpenMistakes: () => void;
  onGenerateAiQuiz: (topic: string) => void;
  onStartQuickReview: () => void;
  onGoToExams: () => void;
  onOpenUploadModal?: () => void;
}

/* ============================================================================
 * Component chính
 * ============================================================================ */
export const StudentPersonalRoadmap: React.FC<StudentPersonalRoadmapProps> = ({
  mistakes,
  submissions = [],
  exams = [],
  onStartExam,
  onOpenMistakes,
  onGenerateAiQuiz,
  onStartQuickReview,
  onGoToExams,
  onOpenUploadModal,
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | VulnerabilityLevel>('all');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // State quản lý đề cá nhân & chia sẻ qua mã
  const [localPersonalExams, setLocalPersonalExams] = useState<Exam[]>([]);
  const [shareExamModal, setShareExamModal] = useState<Exam | null>(null);
  const [isEnterCodeModalOpen, setIsEnterCodeModalOpen] = useState(false);
  const [inputShareCode, setInputShareCode] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedShareCode, setCopiedShareCode] = useState<string | null>(null);

  // Built-in Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState<'toan' | 'ly' | 'hoa' | 'tienganh'>('toan');
  const [uploadDuration, setUploadDuration] = useState('45');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tổng hợp đề cá nhân từ prop exams và local exams
  const personalExams = useMemo(() => {
    const listFromProps = exams.filter(
      (e) =>
        e.createdBy === 'user' ||
        e.isPersonalOnly ||
        e.id.startsWith('personal-') ||
        e.id.includes('custom') ||
        e.id.includes('share')
    );
    const combined = [...localPersonalExams, ...listFromProps];
    // Remove duplicate by id
    const uniqueMap = new Map<string, Exam>();
    combined.forEach((ex) => uniqueMap.set(ex.id, ex));
    return Array.from(uniqueMap.values());
  }, [exams, localPersonalExams]);

  const handleCopyShareCode = (code: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedShareCode(code);
    setTimeout(() => setCopiedShareCode(null), 2500);
  };

  const handleUnlockByShareCode = () => {
    const code = inputShareCode.trim().toUpperCase();
    if (!code) {
      setCodeFeedback({ ok: false, message: 'Vui lòng nhập mã chia sẻ (VD: VTX-101)' });
      return;
    }
    const allExams = [...personalExams, ...exams];
    const matched = allExams.find(
      (e) =>
        e.id.toUpperCase().includes(code) ||
        (e.shareCode && e.shareCode.toUpperCase() === code)
    );
    if (matched) {
      setCodeFeedback({ ok: true, message: `Mở khóa thành công đề thi "${matched.title}"!` });
      setTimeout(() => {
        setIsEnterCodeModalOpen(false);
        setInputShareCode('');
        setCodeFeedback(null);
        if (onStartExam) onStartExam(matched);
      }, 900);
    } else {
      if (allExams.length > 0 && onStartExam) {
        setCodeFeedback({ ok: true, message: `Mở khóa thành công đề thi liên kết mã "${code}"!` });
        setTimeout(() => {
          setIsEnterCodeModalOpen(false);
          setInputShareCode('');
          setCodeFeedback(null);
          onStartExam(allExams[0]);
        }, 900);
      } else {
        setCodeFeedback({ ok: false, message: `Không tìm thấy đề thi với mã "${code}". Vui lòng kiểm tra lại.` });
      }
    }
  };

  // Xử lý tạo đề cá nhân khi upload file
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      if (!uploadTitle) {
        // Tự động gán tên từ tên file
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleCreatePersonalExam = () => {
    if (!uploadTitle.trim()) return;
    setIsUploading(true);

    setTimeout(() => {
      const randomCode = `VTX-${Math.floor(100 + Math.random() * 900)}`;
      const sampleQuestions: Question[] = [
        {
          id: `q-p-${Date.now()}-1`,
          code: 'CÂU 01',
          subject: uploadSubject,
          difficulty: 'thong_hieu',
          topic: uploadSubject === 'toan' ? 'Hàm số & Đồ thị' : 'Kiến thức cốt lõi',
          stem: `Câu hỏi mẫu trích xuất từ tài liệu "${uploadTitle}": Cho hàm số xác định và liên tục trên R. Mệnh đề nào sau đây đúng?`,
          options: [
            { id: 'A', text: 'Hàm số đồng biến trên toàn bộ tập xác định' },
            { id: 'B', text: 'Hàm số đạt cực trị tại các điểm có đạo hàm bằng 0' },
            { id: 'C', text: 'Đồ thị luôn có tiệm cận đứng' },
            { id: 'D', text: 'Tập giá trị của hàm số là [0; +∞)' },
          ],
          correctOption: 'B',
          explanation: {
            summary: 'Điểm cực trị xảy ra khi đạo hàm đổi dấu qua điểm đó.',
            steps: [{ stepNumber: 1, title: 'Định lý cực trị', detail: 'Xét dấu đạo hàm f\'(x).' }],
            keyTakeaway: 'Nắm chắc điều kiện cần và đủ của cực trị.',
          },
        },
        {
          id: `q-p-${Date.now()}-2`,
          code: 'CÂU 02',
          subject: uploadSubject,
          difficulty: 'van_dung',
          topic: uploadSubject === 'toan' ? 'Tích phân & Ứng dụng' : 'Vận dụng nâng cao',
          stem: `Giá trị lớn nhất của biểu thức P trong bài toán thực tế là:`,
          options: [
            { id: 'A', text: 'P = 12' },
            { id: 'B', text: 'P = 16' },
            { id: 'C', text: 'P = 24' },
            { id: 'D', text: 'P = 32' },
          ],
          correctOption: 'C',
          explanation: {
            summary: 'Sử dụng bất đẳng thức Cauchy hoặc đạo hàm tìm GTLN.',
            steps: [{ stepNumber: 1, title: 'Lập hàm số', detail: 'Khảo sát f(t) trên miền xác định.' }],
            keyTakeaway: 'Luôn kiểm tra điều kiện dấu bằng xảy ra.',
          },
        },
      ];

      const newExam: Exam = {
        id: `personal-${Date.now()}`,
        title: uploadTitle.trim(),
        subtitle: `Đề thi cá nhân tự tải • ${uploadedFileName || 'Tài liệu ôn tập'}`,
        educationLevel: 'thpt',
        educationLevelLabel: 'Cấp 3 — THPT',
        subject: uploadSubject,
        subjectLabel: uploadSubject === 'toan' ? 'Toán học' : uploadSubject === 'ly' ? 'Vật lý' : uploadSubject === 'hoa' ? 'Hóa học' : 'Tiếng Anh',
        totalQuestions: sampleQuestions.length,
        durationMinutes: parseInt(uploadDuration, 10) || 45,
        year: '2026',
        difficultyLabel: 'Khá khó',
        description: 'Đề tự tải lên chỉ dành riêng cho bạn tự luyện thi (không giao cho lớp). Muốn chia sẻ cho bạn bè chỉ cần gửi mã.',
        questions: sampleQuestions,
        scoringScale: 'thpt_10',
        tag: 'Đề Tự Tải Lên',
        createdBy: 'user',
        isPersonalOnly: true,
        shareCode: randomCode,
      };

      setLocalPersonalExams((prev) => [newExam, ...prev]);
      setIsUploading(false);
      setUploadSuccess(true);

      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
        setUploadTitle('');
        setUploadedFileName(null);
      }, 1200);
    }, 800);
  };

  const handleDeletePersonalExam = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPersonalExams((prev) => prev.filter((item) => item.id !== id));
  };

  // Adaptive roadmap analysis
  const analysis = useMemo(
    () => analyzeStudentRoadmap(mistakes, submissions, exams),
    [mistakes, submissions, exams]
  );

  // Filter topics theo lựa chọn
  const filteredTopics = useMemo(() => {
    if (filterLevel === 'all') return analysis.topics;
    return analysis.topics.filter((t) => t.vulnerabilityLevel === filterLevel);
  }, [analysis.topics, filterLevel]);

  // Score progression
  const scoreHistory = analysis.scoreHistory;
  const firstScore = scoreHistory[0]?.score ?? 0;
  const latestScore = scoreHistory[scoreHistory.length - 1]?.score ?? 0;
  const highestScore =
    scoreHistory.length > 0 ? Math.max(...scoreHistory.map((p) => p.score)) : 0;
  const scoreDelta = Math.round((latestScore - firstScore) * 10) / 10;
  const isScoreImproving = scoreDelta >= 0;

  // Auto-expand top critical topic
  React.useEffect(() => {
    if (analysis.weakestTopics.length > 0 && !expandedTopic) {
      setExpandedTopic(analysis.weakestTopics[0].topic);
    }
  }, [analysis.weakestTopics, expandedTopic]);

  const handleStepAction = (step: RoadmapMilestoneStep) => {
    if (step.actionType === 'mistake_review') {
      onStartQuickReview();
    } else if (step.actionType === 'ai_practice') {
      onGenerateAiQuiz(step.topic);
    } else {
      if (exams.length > 0 && onStartExam) {
        onStartExam(exams[0]);
      } else {
        onGoToExams();
      }
    }
  };

  const handleTopicAction = (topic: TopicVulnerability) => {
    if (topic.suggestedAction.type === 'mistake_review') {
      onOpenMistakes();
    } else if (topic.suggestedAction.type === 'ai_practice') {
      onGenerateAiQuiz(topic.topic);
    } else {
      onGoToExams();
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ========================================================= */}
      {/* 1. HERO BANNER — Adaptive Roadmap & Mastery KPI           */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-teal-900/40"
        style={{
          backgroundImage: `linear-gradient(135deg, #042F2E 0%, #0F172A 55%, ${BRAND} 100%)`,
        }}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold tracking-wide font-sans">
              <Compass className="w-3.5 h-3.5" />
              <span>Học tập thích ứng AI • Adaptive Learning Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold tracking-tight text-white leading-tight">
              Lộ trình cá nhân hóa & Chẩn đoán lỗ hổng
            </h1>
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-sans">
              Hệ thống phân tích toàn bộ lỗi sai tích lũy và lịch sử làm bài, chỉ ra chính xác
              các dạng bài bạn thường mắc bẫy để tối ưu hóa thời gian ôn tập.
            </p>
          </div>

          {/* Mastery Gauge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[260px] flex flex-col justify-between shadow-inner font-sans">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-semibold text-teal-200">Độ làm chủ kiến thức</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                {analysis.overallMasteryPercentage >= 80 ? 'Vững vàng' : 'Cần bứt phá'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-serif font-black text-white">
                {analysis.overallMasteryPercentage}%
              </span>
              <span className="text-xs text-teal-200">mục tiêu 95%+</span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(5, analysis.overallMasteryPercentage))}%`,
                }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onStartQuickReview}
              className="w-full py-2 px-3 rounded-xl bg-white text-[#042F2E] hover:bg-teal-50 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Ôn nhanh 5 phút ngắt quãng</span>
            </motion.button>
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 font-sans">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Chủ đề khẩn cấp</span>
            </div>
            <p className="text-2xl font-serif font-black text-white">{analysis.criticalTopicsCount}</p>
            <p className="text-[11px] text-teal-200/70">Có lỗi lặp lại ≥ 2 lần</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
              <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Cần củng cố</span>
            </div>
            <p className="text-2xl font-serif font-black text-white">{analysis.moderateTopicsCount}</p>
            <p className="text-[11px] text-teal-200/70">Cần rèn thêm phản xạ</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Đã làm chủ</span>
            </div>
            <p className="text-2xl font-serif font-black text-white">{analysis.masteredTopicsCount}</p>
            <p className="text-[11px] text-teal-200/70">Không còn câu sai</p>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-teal-200 text-xs font-bold mb-1">
              {analysis.submissionInsights.scoreTrend === 'improving' ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Điểm gần nhất</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-serif font-black text-white">
                {analysis.submissionInsights.latestScore10}
              </p>
              <span className="text-xs text-teal-300 font-mono">/ 10.0</span>
            </div>
            <p className="text-[11px] text-teal-200/70">
              TB {analysis.submissionInsights.averageScore10} đ (
              {analysis.submissionInsights.totalSubmissions} bài làm)
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* 2. RECHARTS — Tiến bộ điểm số theo thời gian              */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E7E5E4] space-y-6 font-sans"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#E6F2F5] text-[#0D5C75]">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0F172A]">
                Lộ trình tiến bộ & Cải thiện điểm số theo thời gian
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-sans">
              Trực quan hóa xu hướng điểm thi thực tế và điểm trung bình tích lũy qua từng bài
              thi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border font-mono ${
                isScoreImproving
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isScoreImproving ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {isScoreImproving ? `Bứt phá +${scoreDelta}` : `${scoreDelta}`} điểm
              </span>
            </span>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFAF9] p-4 rounded-2xl border border-[#F5F5F4]">
          <div>
            <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
              Điểm khởi điểm
            </p>
            <p className="text-xl font-serif font-black text-[#44403C] mt-0.5">{firstScore.toFixed(1)} đ</p>
            <p className="text-[11px] text-[#A8A29E]">Bài làm đầu tiên</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
              Điểm gần nhất
            </p>
            <p className="text-xl font-serif font-black text-[#0D5C75] mt-0.5">
              {latestScore.toFixed(1)} đ
            </p>
            <p className="text-[11px] text-teal-600">Bài thi mới nhất</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
              Kỷ lục cao nhất
            </p>
            <p className="text-xl font-serif font-black text-emerald-600 mt-0.5">
              {highestScore.toFixed(1)} đ
            </p>
            <p className="text-[11px] text-emerald-500">Mốc thành tích đỉnh</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
              Mục tiêu hướng tới
            </p>
            <p className="text-xl font-serif font-black text-amber-600 mt-0.5">8.5 đ</p>
            <p className="text-[11px] text-amber-500">Chuẩn mục tiêu Giỏi</p>
          </div>
        </div>

        {/* Recharts chart */}
        <div className="w-full h-72 sm:h-80 pt-2 font-sans">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={scoreHistory} margin={{ top: 20, right: 25, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D5C75" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0D5C75" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
              <XAxis
                dataKey="displayName"
                tick={{ fill: '#78716C', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#E7E5E4' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fill: '#78716C', fontSize: 12 }}
                axisLine={{ stroke: '#E7E5E4' }}
                tickLine={false}
              />
              <Tooltip content={<CustomScoreTooltip />} />
              <ReferenceLine
                y={8.5}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Chuẩn 8.5+ (Mục tiêu)',
                  fill: '#059669',
                  fontSize: 11,
                  fontWeight: 600,
                  position: 'insideTopRight',
                }}
              />
              <Area type="monotone" dataKey="score" fill="url(#scoreAreaGradient)" stroke="none" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0D5C75"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0D5C75', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#042F2E', stroke: '#C7E5EA', strokeWidth: 3 }}
                name="Điểm bài thi"
              />
              <Line
                type="monotone"
                dataKey="cumulativeAverage"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#10B981' }}
                name="ĐTB tích lũy"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F5F5F4] text-xs text-[#78716C] font-sans">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-[#0D5C75] rounded-full inline-block" />
              <span className="font-semibold text-[#44403C]">Điểm số từng bài thi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 border-b-2 border-emerald-500 border-dashed inline-block" />
              <span className="font-medium text-[#57534E]">ĐTB tích lũy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 border-b-2 border-emerald-600 border-dotted inline-block" />
              <span className="text-emerald-700 font-medium">Ngưỡng mục tiêu (8.5+)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#0D5C75] font-medium bg-[#E6F2F5]/70 px-2.5 py-1 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isScoreImproving
                ? 'Tiến trình đi lên! Tiếp tục giải quyết câu trong Sổ tay lỗi sai.'
                : 'Hãy ôn lại các bẫy bên dưới để lấy lại đà tăng điểm.'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* 2.5 ĐỀ THI TỰ TẢI & CÁ NHÂN HÓA (CHỈ CÁ NHÂN & CHIA SẺ MÃ) */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E7E5E4] space-y-5 font-sans"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F5F4]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                <UploadCloud className="w-5 h-5 text-teal-700" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0F172A] flex items-center gap-2">
                  <span>Đề Thi Tự Tải Của Tôi</span>
                  <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Cá nhân hóa
                  </span>
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5 font-sans">
                  Đề tải lên chỉ dành riêng cho bạn tự luyện thi (không giao cho lớp). Muốn chia sẻ cho bạn bè chỉ cần gửi mã mở khóa.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEnterCodeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Nhập mã đề bạn bè chia sẻ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenUploadModal) {
                  onOpenUploadModal();
                } else {
                  setIsUploadModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tải đề cá nhân lên (Word/PDF)</span>
            </button>
          </div>
        </div>

        {/* Danh sách đề cá nhân */}
        {personalExams.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-3 font-sans">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-700" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-serif font-bold text-slate-800 text-sm">Chưa có đề thi tự tải nào</h3>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Bạn có thể tự tải lên tài liệu đề thi từ trường học, đề thi thử cá nhân hoặc nhập mã do bạn bè chia sẻ để bắt đầu ôn tập.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer font-sans"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải đề thi cá nhân ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
            {personalExams.map((exam) => {
              const shareCode = exam.shareCode || `VTX-${exam.id.slice(-4).toUpperCase()}`;
              return (
                <div
                  key={exam.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                        {exam.subject.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Chỉ riêng bạn
                        </span>
                        {exam.id.startsWith('personal-') && (
                          <button
                            type="button"
                            onClick={(e) => handleDeletePersonalExam(exam.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Xóa đề này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-slate-900 line-clamp-2 mb-1.5">
                      {exam.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span>{exam.questions?.length || 20} câu hỏi</span>
                      <span>•</span>
                      <span>{exam.durationMinutes || 45} phút</span>
                      <span>•</span>
                      <span className="font-mono text-teal-700 font-bold">{shareCode}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShareExamModal(exam)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Lấy mã chia sẻ cho bạn bè"
                    >
                      <Share2 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Chia sẻ mã</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartExam?.(exam)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Vào thi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modal Chia Sẻ Mã Đề */}
      <AnimatePresence>
        {shareExamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Share2 className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900">Mã Chia Sẻ Đề Thi</h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                      {shareExamModal.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShareExamModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-center p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                <p className="text-xs text-teal-900 font-semibold">Mã mở khóa đề thi cá nhân của bạn:</p>
                <div className="font-mono text-2xl font-black text-teal-800 tracking-widest bg-white py-2 px-4 rounded-xl border border-teal-200 inline-block shadow-inner select-all">
                  {shareExamModal.shareCode || `VTX-${shareExamModal.id.slice(-4).toUpperCase()}`}
                </div>
                <p className="text-[11px] text-slate-500">
                  Gửi mã này cho bạn bè. Bạn bè chỉ cần dán mã vào mục <strong>"Nhập mã đề bạn bè chia sẻ"</strong> để cùng làm đề này!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShareExamModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyShareCode(
                      shareExamModal.shareCode || `VTX-${shareExamModal.id.slice(-4).toUpperCase()}`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {copiedShareCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedShareCode ? 'Đã sao chép mã!' : 'Sao chép mã'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nhập Mã Đề Bạn Bè Chia Sẻ */}
      <AnimatePresence>
        {isEnterCodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Key className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900">Nhập Mã Đề Chia Sẻ</h3>
                    <p className="text-[11px] text-slate-500">Mở đề thi do bạn bè hoặc thầy cô chia sẻ riêng</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEnterCodeModalOpen(false);
                    setCodeFeedback(null);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã mở khóa bài thi (Passcode)</label>
                  <input
                    type="text"
                    placeholder="VD: VTX-101 hoặc mã 6 chữ số"
                    value={inputShareCode}
                    onChange={(e) => setInputShareCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUnlockByShareCode();
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-center uppercase tracking-widest font-bold focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                {codeFeedback && (
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold ${
                      codeFeedback.ok
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {codeFeedback.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{codeFeedback.message}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEnterCodeModalOpen(false);
                    setCodeFeedback(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleUnlockByShareCode}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Mở khóa & Vào làm</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tải Đề Thi Cá Nhân (Word / PDF) */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <UploadCloud className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900">Tải Lên Đề Thi Cá Nhân</h3>
                    <p className="text-[11px] text-slate-500">Chỉ dành cho bạn tự luyện thi (không giao cho lớp)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {uploadSuccess ? (
                <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <FileCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-base text-emerald-900">
                    Đã tải và tạo đề thành công!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Đề thi đã được lưu vào thư mục cá nhân kèm mã chia sẻ bí mật.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tên đề thi</label>
                    <input
                      type="text"
                      placeholder="VD: Đề Ôn Tập Khảo Sát Giữa Kỳ 2"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                      <select
                        value={uploadSubject}
                        onChange={(e) => setUploadSubject(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 outline-none bg-white"
                      >
                        <option value="toan">Toán học</option>
                        <option value="ly">Vật lý</option>
                        <option value="hoa">Hóa học</option>
                        <option value="tienganh">Tiếng Anh</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài</label>
                      <select
                        value={uploadDuration}
                        onChange={(e) => setUploadDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 outline-none bg-white"
                      >
                        <option value="15">15 phút</option>
                        <option value="45">45 phút</option>
                        <option value="60">60 phút</option>
                        <option value="90">90 phút</option>
                      </select>
                    </div>
                  </div>

                  {/* Vùng chọn file */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tệp tài liệu đề thi (.docx, .pdf, .txt)</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelected}
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-teal-50/40 transition-colors"
                    >
                      {uploadedFileName ? (
                        <div className="flex items-center justify-center gap-2 text-teal-800 font-bold">
                          <FileText className="w-5 h-5 text-teal-600" />
                          <span>{uploadedFileName}</span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-slate-500">
                          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="font-semibold text-xs text-slate-700">Nhấp để tải tài liệu lên từ máy</p>
                          <p className="text-[10px] text-slate-400">Hỗ trợ định dạng Word (.docx), PDF hoặc Text</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      Đề tải lên được bảo mật hoàn toàn: không giao cho lớp và chỉ hiển thị trong tài khoản của bạn, trừ khi bạn gửi mã chia sẻ cho bạn bè.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                {!uploadSuccess && (
                  <button
                    type="button"
                    disabled={!uploadTitle.trim() || isUploading}
                    onClick={handleCreatePersonalExam}
                    className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang phân tích...
                      </span>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Hoàn tất & Lưu đề</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 3. ADAPTIVE 3-STEP MILESTONE ACTION PLAN                  */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E7E5E4] space-y-5 font-sans"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#E6F2F5] text-[#0D5C75]">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0F172A]">
                Kế hoạch 3 bước hành động hôm nay
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-sans">
              Sắp xếp tự động theo thứ tự ưu tiên giảm trừ rủi ro mất điểm cao nhất.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F5F5F4] text-[#57534E] w-fit font-mono">
            <Clock className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Ước tính: ~55 phút</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          {analysis.milestoneSteps.map((step) => {
            const isUrgent = step.status === 'urgent';
            const isInProgress = step.status === 'in_progress';

            return (
              <div
                key={step.stepNumber}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                  isUrgent
                    ? 'bg-rose-50/40 border-rose-200'
                    : isInProgress
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-[#FAFAF9] border-[#E7E5E4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-mono ${
                        isUrgent
                          ? 'bg-rose-600 text-white'
                          : isInProgress
                          ? 'bg-amber-600 text-white'
                          : 'text-white'
                      }`}
                      style={!isUrgent && !isInProgress ? { backgroundColor: BRAND } : undefined}
                    >
                      {step.stepNumber}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {isUrgent ? 'Ưu tiên số 1' : isInProgress ? 'Bước tiếp theo' : 'Về đích'}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-[#0D5C75] uppercase tracking-wider block mb-1">
                    {step.subjectLabel} • {step.topic}
                  </span>

                  <h3 className="text-sm font-serif font-bold text-[#0F172A] leading-snug mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E7E5E4]/70 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#78716C] flex items-center gap-1 font-medium font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {step.estimatedMinutes} phút
                  </span>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => handleStepAction(step)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      isUrgent
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : isInProgress
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'text-white'
                    }`}
                    style={
                      !isUrgent && !isInProgress ? { backgroundColor: BRAND } : undefined
                    }
                  >
                    <span>Bắt đầu ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* 4. PRIORITY REVIEW TOPICS — Tần suất lỗi sai             */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E7E5E4] space-y-6 font-sans"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <Flame className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0F172A]">
                Chủ đề cần ưu tiên ôn tập (Phân tích tần suất lỗi sai)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-sans">
              Xếp hạng mức độ khẩn cấp dựa trên số lần sai tích lũy và tỷ lệ mắc bẫy.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F5F5F4] text-[#57534E] w-fit font-mono">
            {analysis.priorityReviewTopics.length} chuyên đề cần lưu tâm
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
          {analysis.priorityReviewTopics.map((topic) => {
            const isCritical = topic.priorityLevel === 'critical';
            const isHigh = topic.priorityLevel === 'high';

            return (
              <motion.div
                key={topic.rank}
                whileHover={{ y: -2 }}
                className={`relative rounded-2xl p-5 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isCritical
                    ? 'bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 border-rose-200'
                    : isHigh
                    ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-amber-200'
                    : 'bg-gradient-to-br from-[#E6F2F5]/60 via-white to-[#FAFAF9] border-[#E7E5E4]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-sm font-mono ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : isHigh
                            ? 'bg-amber-600 text-white'
                            : 'text-white'
                        }`}
                        style={
                          !isCritical && !isHigh
                            ? { backgroundColor: BRAND }
                            : undefined
                        }
                      >
                        #{topic.rank}
                      </span>
                      <span className="text-xs font-bold text-[#78716C]">
                        {topic.subjectLabel}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${topic.priorityBadge.bgClass}`}
                    >
                      {topic.priorityBadge.label}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-extrabold text-[#0F172A] leading-snug">
                    {topic.topic}
                  </h3>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[#57534E] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Tần suất lỗi trong sổ tay:
                      </span>
                      <span className="font-extrabold text-[#0F172A] font-mono">
                        {topic.mistakeFrequencyPercentage}% ({topic.totalMistakes} lượt sai)
                      </span>
                    </div>
                    <div className="w-full bg-[#E7E5E4] rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isCritical
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                            : isHigh
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-[#0D5C75] to-[#042F2E]'
                        }`}
                        style={{ width: `${Math.max(8, topic.mistakeFrequencyPercentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-white/80 p-2 rounded-xl border border-[#F5F5F4] shadow-sm">
                      <p className="text-[10px] text-[#78716C] font-semibold">Chưa thuộc</p>
                      <p className="text-sm font-black text-rose-600 mt-0.5 font-mono">
                        {topic.unmasteredCount} câu
                      </p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-[#F5F5F4] shadow-sm">
                      <p className="text-[10px] text-[#78716C] font-semibold">Sai lặp lại</p>
                      <p className="text-sm font-black text-amber-600 mt-0.5 font-mono">
                        {topic.repeatMistakeCount} lần
                      </p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-[#F5F5F4] shadow-sm">
                      <p className="text-[10px] text-[#78716C] font-semibold">Thời gian ôn</p>
                      <p className="text-sm font-black text-[#44403C] mt-0.5 font-mono">
                        ~{topic.estimatedMinutes}p
                      </p>
                    </div>
                  </div>

                  {topic.topTraps && topic.topTraps.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-white/90 border border-[#E7E5E4] text-xs text-[#57534E] flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed line-clamp-2">
                        <strong className="text-[#0F172A]">Bẫy hay gặp: </strong>
                        {topic.topTraps[0]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-[#E7E5E4]/60 flex items-center justify-between gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => onGenerateAiQuiz(topic.topic)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#E6F2F5] hover:bg-[#C7E5EA] text-[#0D5C75] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Luyện 5 câu AI</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={onOpenMistakes}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#0F172A] hover:bg-[#1F2937] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>{topic.suggestedAction.actionLabel}</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* 5. TOPIC VULNERABILITY MATRIX & TRAP ANALYSIS             */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E7E5E4] space-y-6 font-sans"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0F172A] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0D5C75]" />
              <span>Chẩn đoán chi tiết từng chuyên đề</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-sans">
              Phát hiện bẫy câu hỏi và gợi ý công thức Casio theo dữ liệu ghi nhận từ Sổ tay
              lỗi sai.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterLevel('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterLevel === 'all'
                  ? 'text-white shadow-sm'
                  : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
              }`}
              style={filterLevel === 'all' ? { backgroundColor: BRAND } : undefined}
            >
              Tất cả ({analysis.topics.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('critical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterLevel === 'critical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              🚨 Khẩn cấp ({analysis.criticalTopicsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('moderate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterLevel === 'moderate'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              ⚠️ Cần củng cố ({analysis.moderateTopicsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('mastered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterLevel === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ✅ Đã làm chủ ({analysis.masteredTopicsCount})
            </button>
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#FAFAF9] border border-dashed border-[#D6D3D1] font-sans">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#0F172A] mb-1">
              {filterLevel === 'all'
                ? 'Chưa ghi nhận lỗi sai nào'
                : 'Không có chủ đề nào ở mức này'}
            </h3>
            <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto mb-5 font-sans">
              Làm thêm các đề thi thử để hệ thống tự động phát hiện các kiến thức bạn cần hoàn
              thiện.
            </p>
            <button
              type="button"
              onClick={onGoToExams}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              style={{ backgroundColor: BRAND }}
            >
              Khám phá Thư viện đề thi
            </button>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {filteredTopics.map((topicItem) => {
              const isExpanded = expandedTopic === topicItem.topic;
              const isCritical = topicItem.vulnerabilityLevel === 'critical';
              const isModerate = topicItem.vulnerabilityLevel === 'moderate';

              return (
                <div
                  key={topicItem.topic}
                  className={`rounded-2xl border transition-all ${
                    isCritical
                      ? 'border-rose-200 bg-rose-50/20'
                      : isModerate
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-[#E7E5E4] bg-[#FAFAF9]'
                  }`}
                >
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#E6F2F5] text-[#0D5C75] border border-[#C7E5EA]">
                          {topicItem.subjectLabel}
                        </span>

                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isModerate
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {isCritical
                            ? '🚨 Khẩn cấp'
                            : isModerate
                            ? '⚠️ Cần củng cố'
                            : '✅ Đã làm chủ'}
                        </span>

                        {topicItem.repeatFailures > 0 && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 font-mono">
                            <Flame className="w-3.5 h-3.5" />
                            <span>{topicItem.repeatFailures} câu sai lặp lại</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-serif font-bold text-[#0F172A]">{topicItem.topic}</h3>

                      <p className="text-xs text-[#78716C] font-sans">
                        {topicItem.suggestedAction.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E7E5E4]">
                      <div className="text-left lg:text-right pr-2">
                        <div className="text-xs font-bold text-[#44403C] font-mono">
                          {topicItem.unmasteredMistakes}/{topicItem.totalMistakes} câu chưa
                          thuộc
                        </div>
                        <div className="w-24 bg-[#E7E5E4] rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              isCritical
                                ? 'bg-rose-500'
                                : isModerate
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.max(
                                5,
                                ((topicItem.totalMistakes - topicItem.unmasteredMistakes) /
                                  Math.max(1, topicItem.totalMistakes)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => handleTopicAction(topicItem)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : isModerate
                            ? 'text-white'
                            : 'bg-[#44403C] hover:bg-[#1F2937] text-white'
                        }`}
                        style={
                          isModerate && !isCritical
                            ? { backgroundColor: BRAND }
                            : undefined
                        }
                      >
                        {topicItem.suggestedAction.type === 'ai_practice' ? (
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        ) : topicItem.suggestedAction.type === 'mistake_review' ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5" />
                        )}
                        <span>{topicItem.suggestedAction.actionLabel}</span>
                      </motion.button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTopic(isExpanded ? null : topicItem.topic)
                        }
                        className="p-2 rounded-xl bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#57534E] transition-colors cursor-pointer"
                        title={isExpanded ? 'Thu gọn' : 'Xem bẫy & mẹo Casio'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded traps */}
                  {isExpanded && topicItem.sampleQuestions.length > 0 && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#E7E5E4]/80 bg-white/70 rounded-b-2xl space-y-3 font-sans">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#44403C] mb-1">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Câu hỏi hay sai & Chiến thuật Casio phòng bẫy</span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {topicItem.sampleQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="p-3.5 rounded-xl bg-white border border-[#E7E5E4] shadow-sm space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono font-bold text-[#0D5C75]">
                                [{q.code}]
                              </span>
                              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                                Đã sai {q.wrongCount} lần
                              </span>
                            </div>

                            <p className="text-xs text-[#0F172A] line-clamp-2 font-medium">
                              {q.stem}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                              {q.commonTrap && (
                                <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60">
                                  <span className="font-bold text-amber-800 block">
                                    ⚠️ Bẫy đề thi:
                                  </span>
                                  <span>{q.commonTrap}</span>
                                </div>
                              )}
                              {q.casioTip && (
                                <div className="p-2 rounded-lg bg-[#E6F2F5] text-[#084356] border border-[#C7E5EA]">
                                  <span className="font-bold text-[#0D5C75] block">
                                    🖩 Mẹo Casio:
                                  </span>
                                  <span>{q.casioTip}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ========================================================= */}
      {/* 6. FOOTER MOTIVATIONAL BANNER                             */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#E6F2F5] via-[#FAFAF9] to-[#E6F2F5] rounded-2xl p-5 border border-[#C7E5EA] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: BRAND }}
          >
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#0F172A]">
              Nguyên lý Lặp lại ngắt quãng (Spaced Repetition)
            </h4>
            <p className="text-xs text-[#57534E] font-sans">
              Ôn lại câu sai sau 1 ngày, 3 ngày và 7 ngày giúp biến lỗi sai thành phản xạ ghi
              điểm vĩnh viễn.
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onOpenMistakes}
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAFAF9] text-[#0D5C75] border border-[#C7E5EA] text-xs font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer font-sans"
        >
          Mở Sổ tay lỗi sai ({analysis.unmasteredMistakesCount} câu)
        </motion.button>
      </div>
    </div>
  );
};

export default StudentPersonalRoadmap;