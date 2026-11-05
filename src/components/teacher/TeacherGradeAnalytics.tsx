/**
 * ============================================================================
 * FILE: TeacherGradeAnalytics.tsx — Vantrix AI
 * PHÂN HỆ: GIẢNG VIÊN & GIÁO VIÊN (TEACHER)
 * ĐƯỜNG DẪN: /src/components/teacher/TeacherGradeAnalytics.tsx
 * CHỨC NĂNG:
 *  - Phổ điểm lớp theo 4 mức: Xuất sắc / Giỏi / Khá-TB / Yếu
 *  - Cảnh báo nhóm học sinh rủi ro (< 6.5 điểm) để kèm cặp
 *  - Xuất CSV bảng điểm chuẩn (escape đầy đủ, chống CSV injection)
 * ============================================================================
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { StudentSubmission, Classroom } from '../../types/quiz';
import {
  BarChart3,
  AlertTriangle,
  Download,
  TrendingDown,
  Users,
  Award,
  Target,
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
}

/** Escape value cho CSV — bọc nháy kép + nhân đôi `"` bên trong (RFC 4180). */
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
  const lowestScore = hasData ? Math.min(...scores).toFixed(1) : '—';

  // Tier count — 4 mức (level 4 = Yếu < 5.0, rõ ràng, KHÔNG gộp với "rủi ro < 6.5")
  const excellentCount = classSubmissions.filter((s) => s.score >= 9).length;
  const goodCount = classSubmissions.filter((s) => s.score >= 7 && s.score < 9).length;
  const averageCount = classSubmissions.filter((s) => s.score >= 5 && s.score < 7).length;
  const weakCount = classSubmissions.filter((s) => s.score < 5).length;

  // Nhóm rủi ro (< 6.5) — broader than Yếu, dùng cho header card "Cần phụ đạo"
  const atRiskStudents = classSubmissions.filter((s) => s.score < 6.5);

  const passRate = hasData
    ? Math.round(((total - weakCount) / total) * 100)
    : 0;

  const pct = (n: number) => (hasData ? Math.round((n / total) * 100) : 0);

  const tiers: Tier[] = [
    {
      key: 'excellent',
      label: 'Xuất sắc',
      range: '9.0 – 10.0 đ',
      count: excellentCount,
      pct: pct(excellentCount),
      color: '#10B981',
      textColor: 'text-emerald-700',
    },
    {
      key: 'good',
      label: 'Giỏi',
      range: '7.0 – 8.9 đ',
      count: goodCount,
      pct: pct(goodCount),
      color: BRAND,
      textColor: 'text-[#0D5C75]',
    },
    {
      key: 'average',
      label: 'Khá & Trung bình',
      range: '5.0 – 6.9 đ',
      count: averageCount,
      pct: pct(averageCount),
      color: '#F59E0B',
      textColor: 'text-amber-700',
    },
    {
      key: 'weak',
      label: 'Yếu',
      range: '< 5.0 đ',
      count: weakCount,
      pct: pct(weakCount),
      color: '#EF4444',
      textColor: 'text-rose-700',
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

    // \uFEFF = BOM để Excel nhận diện UTF-8 tiếng Việt
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
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: TEACHER.main }} />
            <span>Phổ Điểm & Báo Cáo Chất Lượng Lớp Học</span>
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Phân tích phổ điểm và độ phân hóa năng lực học sinh lớp{' '}
            <strong className="text-[#0F172A]">
              {selectedClass?.name || 'toàn trường'}
            </strong>
            .
          </p>
        </div>

        <motion.button
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
          <h3 className="text-base font-bold text-[#0F172A] mb-1">
            Chưa có bài nộp nào
          </h3>
          <p className="text-xs text-[#78716C] max-w-md mx-auto">
            Khi học sinh nộp bài, phổ điểm và phân tích năng lực sẽ hiển thị tại đây.
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
                icon: TrendingDown, // Sẽ đảo rotate 180 cho mũi tên lên
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
                    className="text-2xl font-black mt-1 tabular-nums"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </h3>
                  {card.meta && (
                    <p className="text-[11px] text-[#78716C] font-bold mt-1">{card.meta}</p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Histogram */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h3 className="font-bold text-sm text-[#0F172A]">
                Biểu Đồ Phổ Điểm Lớp Học
              </h3>
              <span className="text-[11px] text-[#A8A29E] font-medium">
                Tổng {total} bài nộp
              </span>
            </div>

            <div className="space-y-4">
              {tiers.map((tier, i) => (
                <div key={tier.key}>
                  <div className="flex justify-between text-xs font-bold mb-1 flex-wrap gap-1">
                    <span className="text-[#0F172A] flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span>
                        {tier.label}{' '}
                        <span className="font-normal text-[#A8A29E]">({tier.range})</span>
                      </span>
                    </span>
                    <span className={`${tier.textColor} tabular-nums`}>
                      {tier.count} HS ({tier.pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#F5F5F4] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tier.pct}%` }}
                      transition={{
                        duration: 0.7,
                        delay: 0.3 + i * 0.08,
                        ease: 'easeOut',
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[#F5F5F4] flex flex-wrap items-center gap-4 text-[11px] text-[#78716C]">
              <span>
                Điểm cao nhất: <strong className="text-[#0F172A]">{highestScore}</strong>
              </span>
              <span>•</span>
              <span>
                Điểm thấp nhất: <strong className="text-[#0F172A]">{lowestScore}</strong>
              </span>
              <span>•</span>
              <span>
                Trung bình: <strong className="text-[#0F172A]">{avgScore}</strong>
              </span>
            </div>
          </motion.div>

          {/* AI teaching advice */}
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
                <div>
                  <h4 className="font-bold text-sm" style={{ color: TEACHER.deep }}>
                    Gợi Ý Giảng Dạy & Kèm Cặp Từ AI
                  </h4>
                  <p
                    className="text-xs leading-relaxed mt-1"
                    style={{ color: TEACHER.deep }}
                  >
                    Lớp có <strong>{atRiskStudents.length} học sinh</strong> đang ở mức{' '}
                    <strong>rủi ro (dưới 6.5 điểm)</strong>. Thầy cô có thể dùng chức năng{' '}
                    <strong>"Soạn đề AI"</strong> để tạo thêm 1 đề ôn tập củng cố riêng cho nhóm này,
                    tập trung vào các chuyên đề có tỷ lệ sai cao.
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