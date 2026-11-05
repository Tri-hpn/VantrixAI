/**
 * ============================================================================
 * FILE: mockClassrooms.ts — Vantrix AI
 * PHÂN HỆ: DATA — DỮ LIỆU MẪU LỚP HỌC & BÀI NỘP
 * ============================================================================
 */

import type { Classroom, StudentSubmission } from '../types/quiz';

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'class-tieuhoc-4a',
    code: 'TOAN4-A',
    name: 'Lớp 4A - Bồi Dưỡng Toán Tuổi Thơ & Violympic',
    educationLevel: 'tieuhoc',
    educationLevelLabel: 'Cấp 1 - Tiểu học',
    subject: 'toan',
    grade: 'Khối 4 - 5',
    teacherName: 'Cô Nguyễn Thu Hà',
    teacherEmail: 'ha.nguyen@tieuhoc.edu.vn',
    description: 'Lớp rèn luyện tư duy tính nhanh, giải toán có lời văn và đố vui hình học cho học sinh tiểu học.',
    createdAt: Date.now() - 5 * 86400000,
    students: [
      { id: 'hs-th-1', name: 'Trần Gia Bảo', email: 'bao.tg@tieuhoc.edu.vn', joinedAt: Date.now() - 4 * 86400000, completedExamsCount: 2, averageScore: 9.5 },
      { id: 'hs-th-2', name: 'Nguyễn Ngọc Ánh', email: 'anh.nn@tieuhoc.edu.vn', joinedAt: Date.now() - 3 * 86400000, completedExamsCount: 2, averageScore: 9.0 },
    ],
    assignedExamIds: ['tieuhoc-toan-lop5-2025'],
  },
  {
    id: 'class-thcs-9a1',
    code: 'THCS-9A1',
    name: 'Lớp 9A1 - Ôn Thi Vào Lớp 10 Chuyên',
    educationLevel: 'thcs',
    educationLevelLabel: 'Cấp 2 - THCS',
    subject: 'toan',
    grade: 'Khối 9',
    teacherName: 'Thầy Lê Quang Minh',
    teacherEmail: 'minh.lq@thcs.edu.vn',
    description: 'Chuyên đề giải toán căn thức, bất đẳng thức Cô-si, hệ thức Vi-ét và hình học đường tròn thi tuyển sinh 10.',
    createdAt: Date.now() - 10 * 86400000,
    students: [
      { id: 'hs-c2-1', name: 'Vũ Đức Trọng', email: 'trong.vd@thcs.edu.vn', joinedAt: Date.now() - 8 * 86400000, completedExamsCount: 3, averageScore: 8.7 },
      { id: 'hs-c2-2', name: 'Lê Minh Thảo', email: 'thao.lm@thcs.edu.vn', joinedAt: Date.now() - 7 * 86400000, completedExamsCount: 3, averageScore: 9.2 },
    ],
    assignedExamIds: ['thcs-toan-lop9-2025'],
  },
  {
    id: 'class-12a1',
    code: 'TOAN12-A1',
    name: 'Lớp 12A1 - Chuyên Toán & Luyện Thi THPT',
    educationLevel: 'thpt',
    educationLevelLabel: 'Cấp 3 - THPT',
    subject: 'toan',
    grade: 'Khối 12',
    teacherName: 'Thầy Trần Văn Trí',
    teacherEmail: 'vantritran518@gmail.com',
    description: 'Lớp ôn luyện chuyên sâu mục tiêu 9.0+ Toán THPT Quốc Gia và ĐGNL 2025. Kiểm tra định kỳ vào thứ 5 hàng tuần.',
    createdAt: Date.now() - 7 * 86400000,
    students: [
      { id: 'hs-1', name: 'Nguyễn Hoàng Nam', email: 'nam.nh@student.edu.vn', joinedAt: Date.now() - 6 * 86400000, completedExamsCount: 4, averageScore: 9.2 },
      { id: 'hs-2', name: 'Trần Thị Mai Linh', email: 'linh.ttm@student.edu.vn', joinedAt: Date.now() - 6 * 86400000, completedExamsCount: 4, averageScore: 8.8 },
    ],
    assignedExamIds: ['thpt-toan-2025-101'],
  },
  {
    id: 'class-daihoc-k23',
    code: 'DH-GIAITICH',
    name: 'Học Phần: Giải Tích 1 & Đại Số Tuyến Tính K23',
    educationLevel: 'daihoc',
    educationLevelLabel: 'Đại học & Chứng chỉ',
    subject: 'toan',
    grade: 'Đại học Năm 1 - 2',
    teacherName: 'TS. Phan Thanh Tùng',
    teacherEmail: 'tung.pt@bachkhoa.edu.vn',
    description: 'Kho bài tập trắc nghiệm giải tích hàm nhiều biến, không gian vectơ và chuỗi Fourier dành cho sinh viên.',
    createdAt: Date.now() - 14 * 86400000,
    students: [
      { id: 'sv-1', name: 'Hoàng Anh Quân (K23 Bách Khoa)', email: 'quan.ha@student.edu.vn', joinedAt: Date.now() - 12 * 86400000, completedExamsCount: 3, averageScore: 8.5 },
    ],
    assignedExamIds: ['daihoc-giaitich-2025', 'daihoc-triethoc-2025', 'dgnl-hcm-2025'],
  },
];

export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    classId: 'class-12a1',
    examId: 'thpt-toan-2025-101',
    studentId: 'hs-1',
    studentName: 'Nguyễn Hoàng Nam',
    score: 9.0,
    totalQuestions: 20,
    correctCount: 18,
    submittedAt: Date.now() - 86400000,
    timeSpentSeconds: 2450,
    userAnswers: {},
    examTitle: 'Đề Thi Thử Tốt Nghiệp THPT 2025 - Môn Toán',
  },
  {
    id: 'sub-2',
    classId: 'class-thcs-9a1',
    examId: 'thcs-toan-lop9-2025',
    studentId: 'hs-c2-2',
    studentName: 'Lê Minh Thảo',
    score: 9.2,
    totalQuestions: 6,
    correctCount: 5,
    submittedAt: Date.now() - 86400000 * 2,
    timeSpentSeconds: 1540,
    userAnswers: {},
    examTitle: 'Đề Khảo Sát & Ôn Thi Vào Lớp 10 THPT - Môn Toán 9',
  },
  {
    id: 'sub-3',
    classId: 'class-tieuhoc-4a',
    examId: 'tieuhoc-toan-lop5-2025',
    studentId: 'hs-th-1',
    studentName: 'Trần Gia Bảo',
    score: 10.0,
    totalQuestions: 6,
    correctCount: 6,
    submittedAt: Date.now() - 86400000 * 3,
    timeSpentSeconds: 1100,
    userAnswers: {},
    examTitle: 'Đề Thi Thử Toán Tuổi Thơ & Violympic Lớp 5',
  },
];