/**
 * ============================================================================
 * FILE: streak-logic.ts — Vantrix AI
 * PHÂN HỆ: UTILITIES — STUDY STREAK ENGINE
 * ĐƯỜNG DẪN: /src/utils/streak-logic.ts
 * CHỨC NĂNG: Tính toán chuỗi ngày học, Heatmap 30 ngày và Huy hiệu
 * ============================================================================
 */

export interface DayActivity {
  dayLabel: string;
  dateStr: string;
  displayDate: string;
  isCompleted: boolean;
  activityType?: 'quiz' | 'mistake' | 'both';
  questionsSolved: number;
}

export interface HeatmapCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3;
}

export interface StreakBadge {
  id: string;
  title: string;
  requiredDays: number;
  unlocked: boolean;
  description: string;
  iconName: string;
  color: string;
}

export interface StudyStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  todayCompleted: boolean;
  weeklyActivity: DayActivity[];
  monthlyHeatmap: HeatmapCell[];
  freezeProtectionAvailable: boolean;
  totalQuizzesTaken: number;
  totalMistakesReviewed: number;
}

export const STORAGE_KEY_STREAK = 'vantrix_study_streak_v2';

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

const VI_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function generateWeeklyWindow(
  today: Date,
  activityDates: Record<string, { type: 'quiz' | 'mistake' | 'both'; count: number }>
): DayActivity[] {
  const result: DayActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);
    const dayIndex = d.getDay();
    const act = activityDates[dateKey];

    result.push({
      dayLabel: VI_DAYS[dayIndex],
      dateStr: dateKey,
      displayDate: formatDisplayDate(d),
      isCompleted: !!act && act.count > 0,
      activityType: act?.type,
      questionsSolved: act?.count || 0,
    });
  }
  return result;
}

export function generateMonthlyHeatmap(
  today: Date,
  activityDates: Record<string, { count: number }>
): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    const count = activityDates[key]?.count || 0;

    let level: 0 | 1 | 2 | 3 = 0;
    if (count >= 20) level = 3;
    else if (count >= 10) level = 2;
    else if (count > 0) level = 1;

    cells.push({ date: key, count, level });
  }
  return cells;
}

export function getInitialStreakData(baseDate = new Date()): StudyStreakData {
  const todayKey = formatDateKey(baseDate);
  const mockActivities: Record<string, { type: 'quiz' | 'mistake' | 'both'; count: number }> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const k = formatDateKey(d);
    if (i === 0) {
      mockActivities[k] = { type: 'both', count: 25 };
    } else {
      mockActivities[k] = {
        type: i % 2 === 0 ? 'quiz' : 'mistake',
        count: 15 + ((i * 7) % 20),
      };
    }
  }

  return {
    currentStreak: 7,
    longestStreak: 14,
    lastActivityDate: todayKey,
    todayCompleted: true,
    weeklyActivity: generateWeeklyWindow(baseDate, mockActivities),
    monthlyHeatmap: generateMonthlyHeatmap(baseDate, mockActivities),
    freezeProtectionAvailable: true,
    totalQuizzesTaken: 12,
    totalMistakesReviewed: 28,
  };
}

export function loadStudyStreak(baseDate = new Date()): StudyStreakData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STREAK);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.currentStreak === 'number') {
        const todayKey = formatDateKey(baseDate);
        parsed.todayCompleted = parsed.lastActivityDate === todayKey;
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return getInitialStreakData(baseDate);
}

export function recordStudyActivity(
  type: 'quiz' | 'mistake',
  count: number = 10,
  currentData: StudyStreakData = loadStudyStreak(),
  baseDate = new Date()
): StudyStreakData {
  const todayKey = formatDateKey(baseDate);
  const isAlreadyDoneToday = currentData.lastActivityDate === todayKey;

  let newCurrentStreak = currentData.currentStreak;

  if (!isAlreadyDoneToday) {
    const yesterday = new Date(baseDate);
    yesterday.setDate(baseDate.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    if (currentData.lastActivityDate === yesterdayKey) {
      newCurrentStreak += 1;
    } else {
      newCurrentStreak = 1;
    }
  }

  const newLongestStreak = Math.max(currentData.longestStreak, newCurrentStreak);

  const updatedWeekly = currentData.weeklyActivity.map((w) => {
    if (w.dateStr === todayKey) {
      return {
        ...w,
        isCompleted: true,
        activityType: w.activityType === 'quiz' && type === 'mistake' ? ('both' as const) : type,
        questionsSolved: w.questionsSolved + count,
      };
    }
    return w;
  });

  const updatedHeatmap = currentData.monthlyHeatmap.map((h) => {
    if (h.date === todayKey) {
      const newCount = h.count + count;
      let level: 0 | 1 | 2 | 3 = 1;
      if (newCount >= 20) level = 3;
      else if (newCount >= 10) level = 2;
      return { ...h, count: newCount, level };
    }
    return h;
  });

  const updated: StudyStreakData = {
    ...currentData,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: todayKey,
    todayCompleted: true,
    weeklyActivity: updatedWeekly,
    monthlyHeatmap: updatedHeatmap,
    totalQuizzesTaken: type === 'quiz' ? currentData.totalQuizzesTaken + 1 : currentData.totalQuizzesTaken,
    totalMistakesReviewed: type === 'mistake' ? currentData.totalMistakesReviewed + count : currentData.totalMistakesReviewed,
  };

  try {
    localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  return updated;
}

export function getStreakBadges(currentStreak: number): StreakBadge[] {
  return [
    {
      id: 'streak-3',
      title: 'Mầm Xanh Chăm Chỉ',
      requiredDays: 3,
      unlocked: currentStreak >= 3,
      description: 'Luyện tập 3 ngày liên tiếp không bỏ cuộc',
      iconName: 'Sprout',
      color: 'emerald',
    },
    {
      id: 'streak-7',
      title: 'Chiến Binh Kỷ Luật',
      requiredDays: 7,
      unlocked: currentStreak >= 7,
      description: 'Duy trì chuỗi học 1 tuần trọn vẹn (7 ngày)',
      iconName: 'Flame',
      color: 'amber',
    },
    {
      id: 'streak-14',
      title: 'Ngọn Lửa Bền Bỉ',
      requiredDays: 14,
      unlocked: currentStreak >= 14,
      description: 'Chinh phục 14 ngày rèn luyện liên tục',
      iconName: 'Zap',
      color: 'indigo',
    },
    {
      id: 'streak-30',
      title: 'Thủ Khoa Đẳng Cấp',
      requiredDays: 30,
      unlocked: currentStreak >= 30,
      description: 'Học tập 30 ngày liên tục không gián đoạn',
      iconName: 'Crown',
      color: 'purple',
    },
  ];
}