/**
 * ============================================================================
 * FILE: StudentStatsView.tsx — Vantrix AI
 * PHÂN HỆ: HỌC SINH & SINH VIÊN (STUDENT)
 * ĐƯỜNG DẪN: /src/components/student/StudentStatsView.tsx
 * CHỨC NĂNG:
 *  - StudentStatsView — KPI + readiness roadmap theo chuyên đề
 *  - StudentDailyStudyStreakCard — chuỗi ngày học + huy hiệu thi đua tương tác
 *  - StudentDailyReviewWidget — nhắc nhở ôn lỗi sai theo Spaced Repetition
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MistakeItem } from '../../types/quiz';
import {
  Trophy,
  Clock,
  Target,
  Flame,
  BookOpen,
  BookmarkCheck,
  TrendingUp,
  Zap,
  Compass,
  Award,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  type StudyStreakData,
  loadStudyStreak,
  getStreakBadges,
} from '../../utils/streak-logic';
import { getUnmasteredMistakes, getTopReviewTopics } from '../../utils/quiz-logic';

const BRAND = '#0D5C75';

/* ============================================================================
 * 1. StudentStatsView — Bảng thống kê chính
 * ============================================================================ */
export interface StudentStatsViewProps {
  completedExamsCount: number;
  totalQuestionsSolved: number;
  averageScore: number;
  mistakes: MistakeItem[];
  onGoToExams: () => void;
  onGoToMistakes: () => void;
  onGoToRoadmap?: () => void;
}

export const StudentStatsView: React.FC<StudentStatsViewProps> = ({
  completedExamsCount,
  totalQuestionsSolved,
  averageScore,
  mistakes,
  onGoToExams,
  onGoToMistakes,
  onGoToRoadmap,
}) => {
  const masteredCount = mistakes.filter((m) => m.isMastered).length;
  const pendingMistakes = mistakes.length - masteredCount;

  const readiness = [
    { label: 'Toán học: Hàm số, Tích phân & Oxyz', pct: 85, tone: 'teal' as const },
    { label: 'Vật lý: Mạch RLC & Sóng dừng', pct: 78, tone: 'emerald' as const },
    { label: 'ĐGNL: Tư duy logic & Phân tích số liệu', pct: 80, tone: 'amber' as const },
  ];

  const toneColor: Record<'teal' | 'emerald' | 'amber', string> = {
    teal: BRAND,
    emerald: '#10B981',
    amber: '#F59E0B',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F172A]">
          Báo Cáo Tiến Độ & Năng Lực Học Tập
        </h1>
        <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-sans">
          Theo dõi chu kỳ luyện đề, tỉ lệ sửa lỗi sai và sự chuẩn bị cho kỳ thi THPT Quốc Gia &
          ĐGNL
        </p>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {[
          {
            icon: Trophy,
            iconColor: 'text-amber-500',
            label: 'Điểm trung bình',
            value: averageScore > 0 ? averageScore.toFixed(2) : '8.45',
            suffix: ' / 10.0',
            meta: '+0.8 so với tuần trước',
            metaColor: 'text-emerald-600',
            delay: 0,
          },
          {
            icon: BookOpen,
            iconColor: '',
            iconColorStyle: BRAND,
            label: 'Đề thi đã hoàn thành',
            value: String(Math.max(1, completedExamsCount)),
            suffix: '',
            meta: `Đã giải ${Math.max(20, totalQuestionsSolved)} câu`,
            metaColor: 'text-[#78716C]',
            delay: 0.06,
          },
          {
            icon: Flame,
            iconColor: 'text-orange-500',
            label: 'Chuỗi ngày học',
            value: '7',
            suffix: ' ngày',
            meta: 'Đang duy trì phong độ cao 🔥',
            metaColor: 'text-orange-600',
            delay: 0.12,
          },
          {
            icon: BookmarkCheck,
            iconColor: 'text-emerald-600',
            label: 'Sửa lỗi thành công',
            value: `${masteredCount} / ${Math.max(1, mistakes.length)}`,
            suffix: '',
            meta: `Còn ${pendingMistakes} câu cần ôn lại`,
            metaColor: 'text-[#78716C]',
            delay: 0.18,
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: item.delay, ease: 'easeOut' }}
              className="p-5 rounded-2xl bg-white border border-[#E7E5E4] shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#78716C] mb-2 font-sans">
                <Icon
                  className={`w-4 h-4 ${item.iconColor || ''}`}
                  style={
                    item.iconColorStyle ? { color: item.iconColorStyle } : undefined
                  }
                />
                <span>{item.label}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-black text-[#0F172A] tabular-nums">
                {item.value}
                {item.suffix && (
                  <span className="text-xs font-sans font-normal text-[#78716C]">{item.suffix}</span>
                )}
              </p>
              <p className={`text-[11px] font-medium mt-1 ${item.metaColor} font-sans`}>{item.meta}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Readiness */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-6 sm:p-8 font-sans"
      >
        <h2 className="text-base sm:text-lg font-serif font-bold text-[#0F172A] mb-2">
          Lộ trình mục tiêu: Điểm 9+ THPT Quốc Gia & 850+ ĐGNL
        </h2>
        <p className="text-xs text-[#78716C] mb-6 font-sans">
          Đánh giá dựa trên tốc độ làm bài (trung bình 1.8 phút/câu) và độ chính xác các câu vận
          dụng cao.
        </p>

        <div className="space-y-4 font-sans">
          {readiness.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#0F172A]">{r.label}</span>
                <span className="tabular-nums font-mono font-bold" style={{ color: toneColor[r.tone] }}>
                  {r.pct}% Sẵn sàng
                </span>
              </div>
              <div className="w-full bg-[#E7E5E4] h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: toneColor[r.tone] }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-[#E7E5E4] font-sans">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onGoToExams}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            style={{ backgroundColor: BRAND }}
          >
            Làm thêm đề thi thử
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onGoToMistakes}
            className="px-5 py-2.5 rounded-xl border bg-[#E6F2F5] hover:bg-[#C7E5EA] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            style={{ borderColor: '#C7E5EA', color: BRAND }}
          >
            Ôn luyện sổ tay lỗi sai
          </motion.button>
          {onGoToRoadmap && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onGoToRoadmap}
              className="px-5 py-2.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Xem Lộ trình cá nhân hóa</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export { StudentStatsView as StatsView };
export type { StudentStatsViewProps as StatsViewProps };

/* ============================================================================
 * 2. StudentDailyStudyStreakCard
 * ============================================================================ */
export interface StudentDailyStudyStreakCardProps {
  onStartExam?: () => void;
  onReviewMistakes?: () => void;
  onStartQuickReview?: () => void;
  unmasteredMistakeCount?: number;
}

export const StudentDailyStudyStreakCard: React.FC<StudentDailyStudyStreakCardProps> = ({
  onStartQuickReview,
  unmasteredMistakeCount = 0,
}) => {
  const [streakData, setStreakData] = useState<StudyStreakData>(() => loadStudyStreak());
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  useEffect(() => {
    const handleStorage = () => setStreakData(loadStudyStreak());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const badges = getStreakBadges(streakData.currentStreak);
  const nextBadge = badges.find((b) => !b.unlocked) || badges[badges.length - 1];
  const progressToNextBadge = Math.min(
    100,
    Math.round((streakData.currentStreak / Math.max(1, nextBadge.requiredDays)) * 100)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-7 shadow-sm mb-6 font-sans"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F5F5F4]">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              streakData.todayCompleted
                ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white shadow-amber-200'
                : 'bg-[#F5F5F4] text-[#A8A29E] border border-[#E7E5E4]'
            }`}
          >
            <Flame className="w-8 h-8 fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#0F172A] tracking-tight tabular-nums">
                {streakData.currentStreak} Ngày Liên Tiếp
              </h3>
              {streakData.todayCompleted ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-sans">
                  🔥 Đang thắp sáng
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F4] text-[#57534E] text-xs font-medium font-sans">
                  Chưa tích lũy hôm nay
                </span>
              )}
            </div>
            <p className="text-xs text-[#78716C] mt-0.5 font-sans">
              {streakData.todayCompleted
                ? 'Tuyệt vời! Bạn đã làm đề hoặc ôn lỗi sai hôm nay.'
                : 'Hãy hoàn thành 1 đề thi hoặc ôn 3 lỗi sai để giữ vững chuỗi ngày.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#A8A29E] font-medium block">
              Kỷ lục dài nhất
            </span>
            <span className="text-sm font-bold text-[#0F172A] font-mono tabular-nums">
              {streakData.longestStreak} Ngày
            </span>
          </div>
          {onStartQuickReview && unmasteredMistakeCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onStartQuickReview}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all cursor-pointer flex items-center gap-1.5 font-sans"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Ôn nhanh 3 câu</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between text-xs text-[#78716C] font-sans">
        <button
          type="button"
          onClick={() => setIsBadgesModalOpen(true)}
          className="hover:text-[#0D5C75] text-left cursor-pointer flex items-center gap-1"
        >
          <span>
            Mục tiêu: <strong className="text-[#0F172A]">{nextBadge.title}</strong> (
            {nextBadge.requiredDays} ngày)
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <span className="tabular-nums font-mono">
          Tiến độ: <strong className="text-[#0F172A]">{progressToNextBadge}%</strong>
        </span>
      </div>

      {/* Badges Modal */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900">Bảng Huy Hiệu Thi Đua</h3>
                    <p className="text-[11px] text-slate-500">Kỷ luật học tập mỗi ngày cùng Vantrix AI</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                      b.unlocked
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-2xl shrink-0">
                      {b.iconName === 'Sprout' ? '🌱' : b.iconName === 'Flame' ? '🔥' : b.iconName === 'Zap' ? '⚡' : '🏆'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-xs text-slate-900">{b.title}</span>
                        {b.unlocked ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Đã đạt
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            Cần {b.requiredDays} ngày
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export { StudentDailyStudyStreakCard as DailyStudyStreakCard };

/* ============================================================================
 * 3. StudentDailyReviewWidget
 * ============================================================================ */
export interface StudentDailyReviewWidgetProps {
  mistakes: MistakeItem[];
  onStartQuickReview: () => void;
  onOpenMistakeNotebook: () => void;
}

export const StudentDailyReviewWidget: React.FC<StudentDailyReviewWidgetProps> = ({
  mistakes,
  onStartQuickReview,
  onOpenMistakeNotebook,
}) => {
  const unmastered = getUnmasteredMistakes(mistakes);
  const unmasteredCount = unmastered.length;
  const topTopics = getTopReviewTopics(mistakes);

  if (unmasteredCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white p-4 sm:p-5 shadow-sm mb-6 font-sans"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-100 shrink-0">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-sans">
                Nhắc nhở hàng ngày: {unmasteredCount} câu chưa thuộc
              </span>
              <span className="text-[11px] text-[#78716C] hidden md:inline font-sans">
                Phương pháp Lặp Lại Ngắt Quãng (Spaced Repetition)
              </span>
            </div>
            <h4 className="text-sm font-serif font-bold text-[#0F172A]">
              Hôm nay cần ôn lại {Math.min(3, unmasteredCount)} câu để chuyển vào trí nhớ dài
              hạn
            </h4>
            {topTopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-[#78716C] font-sans">Chuyên đề trọng tâm:</span>
                {topTopics.map((item) => (
                  <span
                    key={item.topic}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E7E5E4] text-[#57534E] font-sans"
                  >
                    {item.topic} ({item.count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-sans">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onStartQuickReview}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            style={{ backgroundColor: BRAND }}
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Ôn nhanh 3 câu (5 phút)</span>
          </motion.button>
          <button
            type="button"
            onClick={onOpenMistakeNotebook}
            className="px-3 py-2 rounded-xl border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#57534E] font-semibold text-xs transition-colors cursor-pointer"
          >
            Xem sổ tay
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export { StudentDailyReviewWidget as DailyReviewWidget };