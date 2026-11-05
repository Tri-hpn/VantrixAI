import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateKey,
  formatDisplayDate,
  getInitialStreakData,
  recordStudyActivity,
  getStreakBadges,
  StudyStreakData,
} from './streak-logic';

test('formatDateKey formats date properly as YYYY-MM-DD', () => {
  const d = new Date(2025, 9, 28); // 28 Oct 2025
  assert.equal(formatDateKey(d), '2025-10-28');
});

test('formatDisplayDate formats date properly as DD/MM', () => {
  const d = new Date(2025, 9, 28);
  assert.equal(formatDisplayDate(d), '28/10');
});

test('getInitialStreakData creates valid 7-day streak with weekly and heatmap cells', () => {
  const data = getInitialStreakData(new Date('2025-10-28T12:00:00Z'));
  assert.equal(data.currentStreak, 7);
  assert.equal(data.weeklyActivity.length, 7);
  assert.equal(data.monthlyHeatmap.length, 28);
  assert.equal(data.todayCompleted, true);
  assert.equal(data.freezeProtectionAvailable, true);
});

test('recordStudyActivity increments streak when completed on the next consecutive day', () => {
  const day1 = new Date('2025-10-28T10:00:00Z');
  const initial = getInitialStreakData(day1);

  // Advance 1 day
  const day2 = new Date('2025-10-29T10:00:00Z');
  const updated = recordStudyActivity('quiz', 20, initial, day2);

  assert.equal(updated.currentStreak, 8);
  assert.equal(updated.lastActivityDate, '2025-10-29');
  assert.equal(updated.todayCompleted, true);
  assert.equal(updated.totalQuizzesTaken, initial.totalQuizzesTaken + 1);
});

test('recordStudyActivity updates count without increasing streak if already done today', () => {
  const day1 = new Date('2025-10-28T10:00:00Z');
  const initial = getInitialStreakData(day1);

  const updatedAgainSameDay = recordStudyActivity('mistake', 5, initial, day1);
  assert.equal(updatedAgainSameDay.currentStreak, initial.currentStreak);
  assert.equal(updatedAgainSameDay.totalMistakesReviewed, initial.totalMistakesReviewed + 5);
});

test('getStreakBadges unlocks badges based on threshold', () => {
  const badges7 = getStreakBadges(7);
  assert.equal(badges7.find((b) => b.id === 'streak-3')?.unlocked, true);
  assert.equal(badges7.find((b) => b.id === 'streak-7')?.unlocked, true);
  assert.equal(badges7.find((b) => b.id === 'streak-14')?.unlocked, false);
  assert.equal(badges7.find((b) => b.id === 'streak-30')?.unlocked, false);

  const badges15 = getStreakBadges(15);
  assert.equal(badges15.find((b) => b.id === 'streak-14')?.unlocked, true);
});
