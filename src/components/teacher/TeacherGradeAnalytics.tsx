/**
 * ============================================================================
 * FILE: TeacherGradeAnalytics.tsx — Vantrix AI
 * PHÂN HỆ: GIẢNG VIÊN & GIÁO VIÊN (TEACHER)
 * ĐƯỜNG DẪN: /src/components/teacher/TeacherGradeAnalytics.tsx
 * CHỨC NĂNG:
 *  - Phổ điểm lớp theo 4 mức: Xuất sắc / Giỏi / Khá-TB / Yếu
 *  - Tương tác Drill-down: Click xem danh sách học sinh theo từng nhóm điểm
 *  - Cảnh báo nhóm học sinh rủi ro (< 6.5 điểm) kèm danh sách tên học sinh
 *  - Xuất CSV bảng điểm chuẩn có BOM UTF-8 tiếng Việt
 * TYPOGRAPHY: Chuẩn Hàn lâm EdTech (Headings: font-serif; Body/UI: font-sans)
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudentSubmission, Classroom } from '../../types/quiz';
import {
  BarChart3,
  AlertTriangle,
  Download,
  Users,
  Award,
  Target,
  ChevronDown,
  ChevronUp,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

const TEACHER = {
  main: '#B45309',
  hover: '#92400E',
  tint: '#FEF3C7',
  border: '#FDE68A',
  deep: '#78350F',
} as const;

const BRAND = '#0D5C75';

export interface TeacherGradeAnalyticsProps {
  submissions: StudentSubmission[];
  selectedClass?: Classroom;
}

interface Tier {
  key: 'excellent' | 'good' | 'average' | 'weak';
  label: string;
  range: string;
  count: number;
  pct: number;
  color: string;
  textColor: string;
  students: StudentSubmission[];
}

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const TeacherGradeAnalytics: React.FC<TeacherGradeAnalyticsProps> = ({
  submissions,
  selectedClass,
}) => {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  const classSubmissions = useMemo(
    () =>
      submissions
        .filter((s) => !selectedClass || s.classId === selectedClass.id)
        .sort((a, b) => b.score - a.score),
    [submissions, selectedClass]
  );

  const total = classSubmissions.length;
  const hasData = total > 0;

  const scores = classSubmissions.map((s) => s.score);
  const avgScore = hasData
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    : '—';
  const highestScore = hasData ? Math.max(...scores).toFixed(1) : '—';

  // Tier categorization
  const excellentList = classSubmissions.filter((s) => s.score >= 9);
  const goodList = classSubmissions.filter((s) => s.score >= 7 && s.score < 9);
  const averageList = classSubmissions.filter((s) => s.score >= 5 && s.score < 7);
  const weakList = classSubmissions.filter((s) => s.score < 5);

  // At risk (< 6.5)
  const atRiskStudents = classSubmissions.filter((s) => s.score < 6.5);

  const passRate = hasData
    ? Math.round(((total - weakList.length) / total) * 100)
    : 0;

  const pct = (n: number) => (hasData ? Math.round((n / total) * 100) : 0);

  const tiers: Tier[] = [
    {
      key: 'excellent',
      label: 'Xuất sắc',
      range: '9.0 – 10.0 đ',
      count: excellentList.length,
      pct: pct(excellentList.length),
      color: '#10B981',
      textColor: 'text-emerald-700',
      students: excellentList,
    },
    {
      key: 'good',
      label: 'Giỏi',
      range: '7.0 – 8.9 đ',
      count: goodList.length,
      pct: pct(goodList.length),
      color: BRAND,
      textColor: 'text-[#0D5C75]',
      students: goodList,
    },
    {
      key: 'average',
      label: 'Khá & Trung bình',
      range: '5.0 – 6.9 đ',
      count: averageList.length,
      pct: pct(averageList.length),
      color: '#F59E0B',
      textColor: 'text-amber-700',
      students: averageList,
    },
    {
      key: 'weak',
      label: 'Yếu',
      range: '< 5.0 đ',
      count: weakList.length,
      pct: pct(weakList.length),
      color: '#EF4444',
      textColor: 'text-rose-700',
      students: weakList,
    },
  ];

  const handleExportCsv = () => {
    if (!hasData) return;

    const headers = [
      'STT',
      'Họ và tên',
      'Mã lớp',
      'Điểm số',
      'Số câu đúng',
      'Tổng số câu',
      'Thời gian làm (giây)',
      'Thời điểm nộp',
    ];

    const rows = classSubmissions.map((s, idx) => [
      idx + 1,
      escapeCsv(s.studentName),
      escapeCsv(s.classId),
      s.score.toFixed(1),
      s.correctCount,
      s.totalQuestions,
      s.timeSpentSeconds,
      escapeCsv(new Date(s.submittedAt).toISOString()),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `bang-diem-${selectedClass?.code || 'lop'}-${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E5E4] shadow-sm">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: TEACHER.main }} />
            <span>Phổ Điểm & Báo Cáo Chất Lượng Lớp Học</span>
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Phân tích phổ điểm và độ phân hóa năng lực học sinh lớp{' '}
            <strong className="text-[#0F172A] font-serif">
              {selectedClass?.name || 'toàn trường'}
            </strong>
            .
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleExportCsv}
          disabled={!hasData}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#E7E5E4] hover:bg-[#FAFAF9] text-[#57534E] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 text-[#57534E]" />
          <span>Xuất File Bảng Điểm CSV</span>
        </motion.button>
      </div>

      {/* Empty state */}
      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-dashed border-[#E7E5E4] p-12 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-[#A8A29E]" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#0F172A] mb-1">
            Chưa có bài nộp nào
          </h3>
          <p className="text-xs text-[#78716C] max-w-md mx-auto">
            Khi học sinh hoàn tất nộp bài thi, phổ điểm và báo cáo phân hóa năng lực sẽ tự động kết xuất tại đây.
          </p>
        </motion.div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Điểm Trung Bình Lớp',
                value: `${avgScore} / 10`,
                icon: Award,
                color: BRAND,
                tint: '#E6F2F5',
                meta: hasData ? 'Đạt chuẩn năng lực khá giỏi' : '',
              },
              {
                label: 'Điểm Cao Nhất',
                value: `${highestScore} đ`,
                icon: TrendingUp,
                color: TEACHER.main,
                tint: TEACHER.tint,
                meta: hasData ? 'Thủ khoa của lớp' : '',
              },
              {
                label: 'Tỉ Lệ Đạt Yêu Cầu',
                value: `${passRate}%`,
                icon: Target,
                color: '#10B981',
                tint: '#D1FAE5',
                meta: 'Học sinh đạt từ 5.0 trở lên',
              },
              {
                label: 'Cần Phụ Đạo (< 6.5)',
                value: `${atRiskStudents.length} em`,
                icon: AlertTriangle,
                color: '#EF4444',
                tint: '#FFE4E6',
                meta: 'Cần được kèm cặp thêm',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: i * 0.06, ease: 'easeOut' }}
                  className="bg-white p-5 rounded-3xl border border-[#E7E5E4] shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider">
                      {card.label}
                    </p>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: card.tint }}
                    >
                      <Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                  </div>
                  <h3
                    className="text-2xl font-serif font-black mt-1 tabular-nums"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </h3>
                  {card.meta && (
                    <p className="text-[11px] text-[#78716C] font-semibold mt-1">{card.meta}</p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Histogram with interactive drill-down */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0F172A]">
                  Biểu Đồ Phổ Điểm Lớp Học
                </h3>
                <p className="text-xs text-[#78716C]">
                  Nhấn vào thanh phổ điểm để xem chi tiết danh sách học sinh thuộc nhóm đó
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                Tổng {total} bài nộp
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {tiers.map((tier, i) => {
                const isExpanded = expandedTier === tier.key;
                return (
                  <div
                    key={tier.key}
                    className="p-3.5 rounded-2xl border border-stone-100 hover:border-stone-200 bg-stone-50/50 transition-all cursor-pointer"
                    onClick={() => setExpandedTier(isExpanded ? null : tier.key)}
                  >
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5 flex-wrap gap-1">
                      <span className="text-[#0F172A] flex items-center gap-2 font-serif">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-sm">
                          {tier.label}{' '}
                          <span className="font-normal font-sans text-xs text-[#78716C]">
                            ({tier.range})
                          </span>
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`${tier.textColor} font-mono font-bold text-xs`}>
                          {tier.count} HS ({tier.pct}%)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    <div className="h-3.5 w-full bg-[#E7E5E4] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tier.pct}%` }}
                        transition={{
                          duration: 0.7,
                          delay: 0.2 + i * 0.08,
                          ease: 'easeOut',
                        }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                    </div>

                    {/* Drill-down list */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-stone-200/60 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-stone-600" />
                            Danh sách học sinh nhóm {tier.label}:
                          </p>
                          {tier.students.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">Không có học sinh nào trong nhóm này.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {tier.students.map((st) => (
                                <div
                                  key={st.id}
                                  className="p-2 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs"
                                >
                                  <span className="font-serif font-bold text-stone-800 truncate mr-2">
                                    {st.studentName}
                                  </span>
                                  <span
                                    className="font-black px-1.5 py-0.5 rounded-md text-[11px] shrink-0"
                                    style={{
                                      backgroundColor: `${tier.color}15`,
                                      color: tier.color,
                                    }}
                                  >
                                    {st.score.toFixed(1)} đ
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* AI teaching advice & At-Risk Intervention */}
          {atRiskStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
              className="p-5 rounded-3xl bg-[#FEF3C7] border border-[#FDE68A]"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: TEACHER.main }}
                />
                <div className="space-y-2 flex-1">
                  <h4 className="font-serif font-bold text-sm" style={{ color: TEACHER.deep }}>
                    Gợi Ý Giảng Dạy & Kèm Cặp Riêng Từ AI
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: TEACHER.deep }}
                  >
                    Lớp đang có <strong>{atRiskStudents.length} học sinh</strong> ở mức{' '}
                    <strong>rủi ro (dưới 6.5 điểm)</strong>:{' '}
                    <span className="font-semibold underline">
                      {atRiskStudents.map((s) => s.studentName).join(', ')}
                    </span>
                    . Thầy cô nên tạo thêm 1 đề ôn tập củng cố qua tính năng <strong>"Soạn đề AI"</strong> với độ khó cơ bản để các em kịp bù đắp lỗ hổng kiến thức trước kỳ thi chính thức.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};