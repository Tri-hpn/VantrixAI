/**
 * ============================================================================
 * FILE: TeacherLeaderboard.tsx — Vantrix AI
 * PHÂN HỆ: GIẢNG VIÊN & GIÁO VIÊN (TEACHER)
 * ĐƯỜNG DẪN: /src/components/teacher/TeacherLeaderboard.tsx
 * CHỨC NĂNG:
 *  - Bảng xếp hạng học sinh (Vàng / Bạc / Đồng)
 *  - Tìm kiếm theo tên + empty states
 *  - Sort: điểm desc → thời gian làm asc → thời gian nộp asc
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudentSubmission, Classroom } from '../../types/quiz';
import { Trophy, Search, Clock, Users, Medal, X } from 'lucide-react';

const TEACHER = {
  main: '#B45309',
  tint: '#FEF3C7',
  border: '#FDE68A',
  deep: '#78350F',
} as const;

const BRAND = '#0D5C75';

export interface TeacherLeaderboardProps {
  submissions: StudentSubmission[];
  selectedClass?: Classroom;
}

const formatTime = (seconds: number): string => {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}p ${s}s`;
};

const formatSubmittedAt = (ts: number): string => {
  const d = new Date(ts);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString('vi-VN');
  return `${time} • ${date}`;
};

const rankMedal = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

export const TeacherLeaderboard: React.FC<TeacherLeaderboardProps> = ({
  submissions,
  selectedClass,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const classSubmissions = useMemo(
    () =>
      submissions
        .filter((s) => !selectedClass || s.classId === selectedClass.id)
        .sort((a, b) => {
          // Điểm cao hơn đứng trước
          if (b.score !== a.score) return b.score - a.score;
          // Cùng điểm → ai làm nhanh hơn đứng trước
          if (a.timeSpentSeconds !== b.timeSpentSeconds) {
            return a.timeSpentSeconds - b.timeSpentSeconds;
          }
          // Cùng thời gian làm → ai nộp sớm hơn đứng trước
          return a.submittedAt - b.submittedAt;
        }),
    [submissions, selectedClass]
  );

  const filtered = useMemo(
    () =>
      classSubmissions.filter((s) =>
        s.studentName.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [classSubmissions, searchQuery]
  );

  const hasAny = classSubmissions.length > 0;
  const hasResults = filtered.length > 0;
  const showPodium = filtered.length >= 3;
  const podium = filtered.slice(0, 3);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E7E5E4] shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>
              Bảng Xếp Hạng & Tiến Độ Nộp Bài ({classSubmissions.length} Bài)
            </span>
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Theo dõi điểm số và xếp hạng học sinh lớp{' '}
            <strong className="text-[#0F172A]">
              {selectedClass?.name || 'toàn trường'}
            </strong>
            .
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="pl-9 pr-9 py-2 rounded-xl border border-[#E7E5E4] text-xs w-full bg-white focus:outline-none focus:ring-2 transition-all"
            style={{ ['--tw-ring-color' as string]: `${TEACHER.main}33` }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] cursor-pointer"
              aria-label="Xoá tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty state — lớp chưa có bài nào */}
      {!hasAny && (
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
            Bảng xếp hạng sẽ xuất hiện khi học sinh nộp bài thi đầu tiên.
          </p>
        </motion.div>
      )}

      {/* Empty state — search không match */}
      {hasAny && !hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-dashed border-[#E7E5E4] p-10 text-center"
        >
          <Search className="w-10 h-10 text-[#D6D3D1] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0F172A] mb-1">
            Không tìm thấy học sinh phù hợp
          </h3>
          <p className="text-xs text-[#78716C]">
            Không có kết quả cho từ khóa "<strong>{searchQuery}</strong>".
          </p>
        </motion.div>
      )}

      {/* Podium — chỉ khi có >= 3 kết quả */}
      <AnimatePresence>
        {hasResults && showPodium && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
          >
            {/* Rank 2 */}
            <PodiumCard
              submission={podium[1]}
              rank={2}
              accent={{ bg: '#F5F5F4', ring: '#D6D3D1', text: '#57534E' }}
              className="order-2 sm:order-1"
            />

            {/* Rank 1 */}
            <PodiumCard
              submission={podium[0]}
              rank={1}
              accent={{ bg: TEACHER.tint, ring: TEACHER.main, text: TEACHER.deep }}
              className="order-1 sm:order-2 sm:-mt-2"
              isChampion
            />

            {/* Rank 3 */}
            <PodiumCard
              submission={podium[2]}
              rank={3}
              accent={{ bg: '#FEF3C7', ring: '#FCD34D', text: '#78350F' }}
              className="order-3"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full table */}
      {hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-[#E7E5E4] overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF9] text-[#57534E] font-bold border-b border-[#E7E5E4]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Hạng</th>
                  <th className="py-3 px-4">Tên học sinh</th>
                  <th className="py-3 px-4 text-center">Điểm số</th>
                  <th className="py-3 px-4 text-center">Số câu đúng</th>
                  <th className="py-3 px-4 text-center">Thời gian làm</th>
                  <th className="py-3 px-4 text-right">Nộp lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F4] font-medium text-[#0F172A]">
                {filtered.map((sub, idx) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.15) }}
                    className="hover:bg-[#FAFAF9]/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black ${
                          idx === 0
                            ? 'bg-[#FEF3C7] text-[#78350F]'
                            : idx === 1
                            ? 'bg-[#F5F5F4] text-[#57534E]'
                            : idx === 2
                            ? 'bg-[#FEF3C7] text-[#78350F]'
                            : 'bg-white border border-[#E7E5E4] text-[#78716C]'
                        }`}
                      >
                        {rankMedal(idx + 1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      {sub.studentName}
                    </td>
                    <td
                      className="py-3.5 px-4 text-center font-black text-sm tabular-nums"
                      style={{ color: BRAND }}
                    >
                      {sub.score.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#57534E] font-semibold tabular-nums">
                      {sub.correctCount} / {sub.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#78716C] font-mono">
                      {formatTime(sub.timeSpentSeconds)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#A8A29E] text-[11px]">
                      {formatSubmittedAt(sub.submittedAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Hint khi < 3 bài — không đủ hiển thị podium */}
      {hasResults && !showPodium && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-xs text-[#78716C]">
          <Medal className="w-4 h-4 shrink-0" style={{ color: TEACHER.main }} />
          <span>
            Cần ít nhất <strong>3 bài nộp</strong> để hiển thị bục vinh danh. Hiện có{' '}
            <strong>{filtered.length}</strong> bài.
          </span>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * PodiumCard — sub-component
 * ============================================================================ */
interface PodiumCardProps {
  submission: StudentSubmission;
  rank: 1 | 2 | 3;
  accent: { bg: string; ring: string; text: string };
  className?: string;
  isChampion?: boolean;
}

const PodiumCard: React.FC<PodiumCardProps> = ({
  submission,
  rank,
  accent,
  className = '',
  isChampion = false,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-3xl border-2 p-5 sm:p-6 text-center shadow-sm bg-white ${className}`}
      style={{
        borderColor: accent.ring,
        background: isChampion
          ? `linear-gradient(180deg, ${accent.bg} 0%, #FFFFFF 100%)`
          : '#FFFFFF',
      }}
    >
      <div
        className="rounded-full font-black flex items-center justify-center mx-auto mb-2 border-2"
        style={{
          width: isChampion ? 48 : 40,
          height: isChampion ? 48 : 40,
          backgroundColor: accent.bg,
          borderColor: accent.ring,
          color: accent.text,
          fontSize: isChampion ? 16 : 14,
        }}
      >
        {rankMedal(rank)} {rank}
      </div>
      <h4
        className={`font-bold truncate ${
          isChampion ? 'text-base font-black' : 'text-sm'
        } text-[#0F172A]`}
      >
        {submission.studentName}
      </h4>
      <p
        className={`my-1 tabular-nums ${isChampion ? 'text-3xl' : 'text-2xl'} font-black`}
        style={{ color: accent.text }}
      >
        {submission.score.toFixed(1)} đ
      </p>
      {isChampion && (
        <p className="text-xs font-bold" style={{ color: accent.text }}>
          Thủ Khoa Lớp
        </p>
      )}
      <p
        className={`${
          isChampion ? 'text-[11px] mt-1' : 'text-[11px]'
        } text-[#78716C]`}
      >
        {submission.correctCount}/{submission.totalQuestions} câu •{' '}
        {formatTime(submission.timeSpentSeconds)}
      </p>
    </motion.div>
  );
};