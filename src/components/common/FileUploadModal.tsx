/**
 * ============================================================================
 * FILE: FileUploadModal.tsx — Vantrix AI
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — TẢI LÊN & SỐ HÓA ĐỀ THI
 * ĐƯỜNG DẪN: /src/components/common/FileUploadModal.tsx
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exam, Question, SubjectType, Classroom, UserRole } from '../../types/quiz';
import {
  Upload, FileText, Sparkles, CheckCircle2, AlertCircle, X, FileUp,
  Loader2, Users, User, SlidersHorizontal, Bot, Key, Check,
} from 'lucide-react';
import { MathText } from './MathText';
import {
  parseExamText, applyAnswerKeyFile, splitExamQuestionsBalanced,
  type ExamSplitResult, type ParseResult,
} from '../../utils/exam-file-parser';

const BRAND = '#0D5C75';
const BRAND_HOVER = '#084356';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToPersonal: (exam: Exam) => void;
  onSaveAndAssignToClass: (exam: Exam, classId: string) => void;
  classrooms: Classroom[];
  currentRole: UserRole;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen, onClose, onSaveToPersonal, onSaveAndAssignToClass, classrooms, currentRole,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [subjectHint, setSubjectHint] = useState<SubjectType>('toan');
  const [examTitle, setExamTitle] = useState<string>('Đề Kiểm Tra Định Kỳ 2025');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [targetDestination, setTargetDestination] = useState<'personal' | 'class'>('personal');
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extractedQuestions, setExtractedQuestions] = useState<Question[] | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<ParseResult | null>(null);

  const [answerKeyText, setAnswerKeyText] = useState<string>('');
  const [isKeyApplied, setIsKeyApplied] = useState<boolean>(false);

  const [isAiSolving, setIsAiSolving] = useState<boolean>(false);
  const [aiSolvedSuccess, setAiSolvedSuccess] = useState<boolean>(false);

  const [isSplitEnabled, setIsSplitEnabled] = useState<boolean>(false);
  const [numSplitSets, setNumSplitSets] = useState<number>(3);
  const [activeSplitTab, setActiveSplitTab] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);
    setExamTitle(selected.name.replace(/\.[^/.]+$/, ''));
    if (selected.type.includes('text') || selected.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => setRawText((event.target?.result as string) || '');
      reader.readAsText(selected);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => setFileBase64((event.target?.result as string) || '');
      reader.readAsDataURL(selected);
    }
  };

  const handleLoadSample = (type: 'format1_hdt' | 'format2_bangdapan' | 'format3_chuadapan') => {
    setErrorMsg(null);
    setDetectedFormat(null);
    setIsKeyApplied(false);
    setAiSolvedSuccess(false);
    setSubjectHint('toan');
    if (type === 'format1_hdt') {
      setExamTitle('Đề Toán Khóa H - Đ - T1, T2, T3');
      setRawText(`H: Trong không gian Oxyz, cho mặt phẳng (P): 3x - 2y + 5z - 1 = 0. Vectơ nào sau đây là một vectơ pháp tuyến của (P)?\nĐ: n = (3; -2; 5)\nT1: n = (3; 2; 5)\nT2: n = (3; -2; -1)\nT3: n = (-3; -2; 5)\n\nH: Giá trị của tích phân từ 0 đến 1 của f(x) = e^(2x) dx bằng:\nĐ: (e^2 - 1) / 2\nT1: e^2 - 1\nT2: (e^2 + 1) / 2\nT3: 2 * (e^2 - 1)`);
    } else if (type === 'format2_bangdapan') {
      setExamTitle('Đề Toán 6 Câu Kèm Bảng Đáp Án');
      setRawText(`Câu 1: Hàm số y = x^4 - 2x^2 + 1 có bao nhiêu điểm cực trị?\nA. 1\nB. 2\nC. 3\nD. 0\n\nCâu 2: Họ nguyên hàm của hàm số f(x) = cos(2x) là:\nA. (1/2) sin(2x) + C\nB. - (1/2) sin(2x) + C\nC. 2 sin(2x) + C\nD. sin(2x) + C\n\nBẢNG ĐÁP ÁN ĐÚNG:\n1. B   2. A`);
    } else {
      setExamTitle('Đề Toán Chưa Có Đáp Án (AI Giải)');
      setRawText(`Câu 1: Cho hàm số f(x) có đạo hàm f'(x) = x*(x - 1)^2*(x + 2). Số điểm cực trị của hàm số là:\nA. 2\nB. 1\nC. 3\nD. 4\n\nCâu 2: Cho khối lăng trụ có diện tích đáy B = 10 và chiều cao h = 6. Thể tích khối lăng trụ bằng:\nA. 60\nB. 20\nC. 30\nD. 180`);
    }
  };

  const handleStartParsing = async () => {
    if (!rawText.trim() && !file) {
      setErrorMsg('Vui lòng chọn tệp hoặc dán nội dung đề thi.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    if (rawText.trim()) {
      const localParsed = parseExamText(rawText, { subjectHint });
      if (localParsed.questions.length > 0) {
        setDetectedFormat(localParsed);
        setExtractedQuestions(localParsed.questions);
        setIsProcessing(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/parse-exam-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file?.name || `${examTitle}.txt`,
          fileType: file?.type || 'text/plain',
          fileContentBase64: fileBase64,
          textContent: rawText,
          subjectHint,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || 'Không trích xuất được câu hỏi.');
      }
      setExtractedQuestions(data.questions);
      setDetectedFormat({
        questions: data.questions, formatDetected: 'format_standard',
        formatLabel: 'Đã số hóa thành công qua AI OCR', totalParsed: data.questions.length, hasAnswers: true,
      });
      if (data.title && !file) setExamTitle(data.title);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi xử lý tệp.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyKeyText = () => {
    if (!answerKeyText.trim() || !extractedQuestions) return;
    setExtractedQuestions(applyAnswerKeyFile(extractedQuestions, answerKeyText));
    setIsKeyApplied(true);
  };

  const handleAiSolveAnswers = async () => {
    if (!extractedQuestions || extractedQuestions.length === 0) return;
    setIsAiSolving(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai-solve-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: extractedQuestions }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setExtractedQuestions(data.questions);
        setAiSolvedSuccess(true);
        if (detectedFormat) setDetectedFormat({ ...detectedFormat, hasAnswers: true, formatLabel: 'Đã giải & xác định đáp án qua AI' });
      } else throw new Error(data.error || 'AI chưa thể giải đề này.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi gọi AI.');
    } finally {
      setIsAiSolving(false);
    }
  };

  const splitResults: ExamSplitResult[] = extractedQuestions && isSplitEnabled
    ? splitExamQuestionsBalanced(extractedQuestions, numSplitSets, examTitle) : [];

  const handleSaveExam = () => {
    if (!extractedQuestions || extractedQuestions.length === 0) return;

    if (isSplitEnabled && splitResults.length > 0) {
      splitResults.forEach((splitSet) => {
        const examObj: Exam = {
          id: `uploaded-split-${Date.now()}-${splitSet.setIndex}`,
          title: splitSet.setTitle,
          subtitle: `Bộ ${splitSet.setIndex}/${splitResults.length} • ${splitSet.totalQuestions} câu • Cân bằng độ khó`,
          subject: subjectHint,
          subjectLabel: subjectHint === 'toan' ? 'Toán học' : subjectHint === 'ly' ? 'Vật lý 12' : subjectHint === 'dgnl' ? 'ĐGNL ĐHQG' : 'IELTS',
          totalQuestions: splitSet.totalQuestions,
          durationMinutes: Math.round(durationMinutes / splitResults.length) || 15,
          year: '2025',
          difficultyLabel: 'Trung bình',
          description: `Bộ đề số hóa: ${splitSet.stats.nhan_biet} Nhận biết, ${splitSet.stats.thong_hieu} Thông hiểu, ${splitSet.stats.van_dung} Vận dụng.`,
          questions: splitSet.questions,
          scoringScale: subjectHint === 'dgnl' ? 'dgnl_1200' : 'thpt_10',
          educationLevel: 'thpt',
          educationLevelLabel: 'Cấp 3 (THPT)',
          tag: currentRole === 'teacher' ? 'Đề Phân Bộ GV' : 'Đề Phân Bộ HS',
          createdBy: currentRole === 'teacher' ? 'teacher' : 'user',
          authorName: currentRole === 'teacher' ? 'Thầy Trần Văn Trí' : 'Văn Trí',
          fileName: file?.name,
        };
        targetDestination === 'class' && selectedClassId ? onSaveAndAssignToClass(examObj, selectedClassId) : onSaveToPersonal(examObj);
      });
      alert(`🎉 Đã lưu thành công ${splitResults.length} bộ đề thi độc lập!`);
      onClose();
      return;
    }

    const newExam: Exam = {
      id: `uploaded-${Date.now()}`,
      title: examTitle.trim() || 'Đề Thi Số Hóa Mới',
      subtitle: `Tải lên bởi ${currentRole === 'teacher' ? 'Giáo viên' : 'Học sinh'} • ${extractedQuestions.length} câu`,
      subject: subjectHint,
      subjectLabel: subjectHint === 'toan' ? 'Toán học' : subjectHint === 'ly' ? 'Vật lý 12' : subjectHint === 'dgnl' ? 'ĐGNL ĐHQG' : 'IELTS',
      totalQuestions: extractedQuestions.length,
      durationMinutes,
      year: '2025',
      difficultyLabel: 'Khá khó',
      description: `Đề thi trích xuất từ: ${file?.name || 'Văn bản số hóa'}.`,
      questions: extractedQuestions,
      scoringScale: subjectHint === 'dgnl' ? 'dgnl_1200' : subjectHint === 'ielts' ? 'ielts_9' : 'thpt_10',
      educationLevel: 'thpt',
      educationLevelLabel: 'Cấp 3 (THPT)',
      tag: currentRole === 'teacher' ? 'Đề Giáo Viên' : 'Đề Tải Lên',
      createdBy: currentRole === 'teacher' ? 'teacher' : 'user',
      authorName: currentRole === 'teacher' ? 'Thầy Trần Văn Trí' : 'Văn Trí',
      fileName: file?.name,
    };

    targetDestination === 'class' && selectedClassId ? onSaveAndAssignToClass(newExam, selectedClassId) : onSaveToPersonal(newExam);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E7E5E4] flex items-center justify-between text-white" style={{ backgroundImage: `linear-gradient(135deg, #042F2E 0%, #0F172A 55%, ${BRAND} 100%)` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-teal-200 flex items-center justify-center shadow-md">
                <FileUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">Tải Lên & Số Hóa Đề Thi</h2>
                <p className="text-xs text-teal-100/80">Hỗ trợ Khóa H-Đ-T • Bảng đáp án • AI giải • Chia bộ cân bằng</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {!extractedQuestions ? (
              <>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">1. Thử Nhanh Các Định Dạng (1-Click):</label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button type="button" onClick={() => handleLoadSample('format1_hdt')} className="text-xs px-2.5 py-1 rounded-lg bg-[#E6F2F5] hover:bg-[#C7E5EA] text-[#0D5C75] font-bold border border-[#C7E5EA] transition-colors cursor-pointer">Dạng 1: Khóa H-Đ-T</button>
                      <button type="button" onClick={() => handleLoadSample('format2_bangdapan')} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors cursor-pointer">Dạng 2: Bảng Đáp Án</button>
                      <button type="button" onClick={() => handleLoadSample('format3_chuadapan')} className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 transition-colors cursor-pointer">Dạng 3: Chưa Có Đáp Án</button>
                    </div>
                  </div>

                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${file ? 'border-[#0D5C75] bg-[#E6F2F5]/40' : 'border-[#E7E5E4] hover:border-[#0D5C75]/50 hover:bg-[#FAFAF9]'}`}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt,image/*" className="hidden" />
                    <div className="w-10 h-10 rounded-2xl bg-[#E6F2F5] text-[#0D5C75] flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    {file ? (
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{file.name}</p>
                        <p className="text-xs text-[#78716C] mt-0.5">{(file.size / 1024).toFixed(1)} KB • Nhấn để đổi tệp khác</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-[#0F172A]">Kéo thả tệp vào đây, hoặc <span className="underline font-bold" style={{ color: BRAND }}>chọn từ máy</span></p>
                        <p className="text-[11px] text-[#78716C] mt-1">Hỗ trợ PDF, Word, TXT, Ảnh</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#57534E]">Hoặc dán nội dung đề thi:</label>
                    </div>
                    <textarea rows={7} value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Dán nội dung đề thi..." className="w-full p-3 rounded-xl border border-[#E7E5E4] text-xs font-mono bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:border-[#0D5C75] leading-relaxed" style={{ ['--tw-ring-color' as string]: `${BRAND}33` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E7E5E4]">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">Môn học</label>
                    <select value={subjectHint} onChange={(e) => setSubjectHint(e.target.value as SubjectType)} className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold bg-white focus:ring-2">
                      <option value="toan">Toán học THPT</option>
                      <option value="ly">Vật lý 12</option>
                      <option value="dgnl">ĐGNL ĐHQG</option>
                      <option value="ielts">IELTS Academic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">Thời gian</label>
                    <select value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))} className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold bg-white focus:ring-2">
                      <option value={15}>15 phút</option><option value={45}>45 phút</option>
                      <option value={60}>60 phút</option><option value={90}>90 phút</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">Nơi lưu</label>
                    <div className="flex gap-1 bg-[#F5F5F4] p-1 rounded-xl">
                      <button type="button" onClick={() => setTargetDestination('personal')} className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${targetDestination === 'personal' ? 'bg-white shadow-sm' : 'text-[#78716C]'}`} style={targetDestination === 'personal' ? { color: BRAND } : undefined}><User className="w-3 h-3" /><span>Cá nhân</span></button>
                      <button type="button" onClick={() => setTargetDestination('class')} className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${targetDestination === 'class' ? 'bg-white shadow-sm' : 'text-[#78716C]'}`} style={targetDestination === 'class' ? { color: BRAND } : undefined}><Users className="w-3 h-3" /><span>Giao lớp</span></button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Đã trích xuất {extractedQuestions.length} câu</span></span>
                      {detectedFormat && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E6F2F5] text-[#0D5C75] border border-[#C7E5EA]">{detectedFormat.formatLabel}</span>}
                    </div>
                    <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="text-base font-extrabold text-[#0F172A] w-full bg-transparent border-b border-transparent hover:border-[#D6D3D1] focus:border-[#0D5C75] focus:outline-none" />
                  </div>
                  <button type="button" onClick={() => { setExtractedQuestions(null); setDetectedFormat(null); setIsKeyApplied(false); setAiSolvedSuccess(false); }} className="text-xs font-bold underline cursor-pointer shrink-0" style={{ color: BRAND }}>Tải tệp khác</button>
                </div>

                {/* AI / Key Solver (Dạng 3) */}
                {detectedFormat?.formatDetected === 'format_no_key' && !isKeyApplied && !aiSolvedSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /><span className="text-xs font-bold text-amber-900">Tệp chưa có đáp án đúng. Chọn 1 trong 2 giải pháp:</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F172A]"><Key className="w-4 h-4 text-amber-600" /><span>Cách 1: Ghép tệp đáp án rời</span></div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Dán key: 1.C 2.A..." value={answerKeyText} onChange={(e) => setAnswerKeyText(e.target.value)} className="flex-1 text-xs p-1.5 rounded-lg border border-[#E7E5E4] font-mono" />
                          <button type="button" onClick={handleApplyKeyText} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer">Ghép</button>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#E6F2F5] to-[#FAFAF9] border border-[#C7E5EA] flex flex-col justify-between space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#0D5C75]"><Bot className="w-4 h-4" /><span>Cách 2: AI tự động giải</span></div>
                        <button type="button" disabled={isAiSolving} onClick={handleAiSolveAnswers} className="w-full py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50" style={{ backgroundColor: BRAND }}>
                          {isAiSolving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>AI đang giải...</span></> : <><Sparkles className="w-3.5 h-3.5" /><span>Nhờ AI giải & tìm đáp án</span></>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Split Question Sets */}
                <div className="p-4 rounded-2xl bg-[#E6F2F5]/60 border border-[#C7E5EA] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: BRAND }} /><div><h4 className="font-bold text-xs sm:text-sm text-[#0F172A]">Chia Bộ Đề Cân Bằng Độ Khó</h4><p className="text-[11px] text-[#78716C]">Chia đều câu hỏi, không trùng lặp, sắp xếp từ Dễ đến Khó</p></div></div>
                    <label className="flex items-center gap-2 cursor-pointer shrink-0"><input type="checkbox" checked={isSplitEnabled} onChange={(e) => setIsSplitEnabled(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: BRAND }} /><span className="text-xs font-bold text-[#0F172A]">Kích hoạt chia bộ</span></label>
                  </div>

                  {isSplitEnabled && (
                    <div className="space-y-4 pt-2 border-t border-[#C7E5EA]/60">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-[#57534E]">Số bộ:</span>
                          <div className="flex items-center gap-1">{[2, 3, 4, 5].map((n) => (<button key={n} type="button" onClick={() => { setNumSplitSets(n); setActiveSplitTab(0); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${numSplitSets === n ? 'text-white shadow-sm' : 'bg-white text-[#57534E] border border-[#E7E5E4]'}`} style={numSplitSets === n ? { backgroundColor: BRAND } : undefined}>{n} bộ</button>))}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                          {splitResults.map((s, idx) => (<button key={s.setIndex} type="button" onClick={() => setActiveSplitTab(idx)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeSplitTab === idx ? 'text-white shadow-sm' : 'bg-white text-[#57534E] border border-[#E7E5E4]'}`} style={activeSplitTab === idx ? { backgroundColor: BRAND } : undefined}>Bộ {s.setIndex} ({s.totalQuestions} câu)</button>))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase text-[#0F172A]">Danh Sách Câu Hỏi Xem Trước:</span></div>
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {(isSplitEnabled && splitResults[activeSplitTab] ? splitResults[activeSplitTab].questions : extractedQuestions).map((q, idx) => (
                      <div key={q.id || idx} className="p-3.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-2 text-xs">
                        <div className="flex items-center justify-between"><span className="font-bold" style={{ color: BRAND }}>{q.code}:</span><span className="px-2 py-0.5 rounded bg-white border border-[#E7E5E4] text-[11px] font-bold text-emerald-700">Đáp án: ({q.correctOption})</span></div>
                        <p className="text-[#0F172A] font-medium leading-relaxed"><MathText text={q.stem} /></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#57534E] hover:bg-[#F5F5F4] cursor-pointer">Đóng</button>
            {!extractedQuestions ? (
              <button type="button" disabled={isProcessing} onClick={handleStartParsing} className="px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50" style={{ backgroundColor: BRAND }}>
                {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Đang bóc tách...</span></> : <><Sparkles className="w-4 h-4" /><span>Bắt đầu số hóa</span></>}
              </button>
            ) : (
              <button type="button" onClick={handleSaveExam} className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSplitEnabled ? `Lưu ${numSplitSets} bộ đề` : targetDestination === 'class' ? 'Lưu & Giao lớp' : 'Lưu Thư viện'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};