/**
 * ============================================================================
 * FILE: MathText.tsx — Vantrix AI
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — Bộ Hiển Thị Công Thức Toán - Lý - Hóa
 * ĐƯỜNG DẪN: /src/components/common/MathText.tsx
 * CHỨC NĂNG:
 *  - Xử lý các ký tự toán học đặc biệt (≤, ≥, ≠, ·, →)
 *  - Định dạng chuẩn typography khoa học cho các câu hỏi khảo thí toàn cấp
 * ============================================================================
 */

import React from 'react';

export interface MathTextProps {
  text?: string | null;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text || typeof text !== 'string') return null;

  // Chuyển đổi các ký hiệu toán học thô sang ký hiệu typography chuẩn
  const formatted = text
    .replace(/<=\s*/g, '≤ ')
    .replace(/>=\s*/g, '≥ ')
    .replace(/!=\s*/g, '≠ ')
    .replace(/\s*\*+\s*/g, ' · ') // Dấu nhân
    .replace(/->\s*/g, ' → ')
    .replace(/<-\s*/g, ' ← ')
    .replace(/\+-\s*/g, ' ± ');

  return (
    <span className={`inline-block leading-relaxed ${className}`}>
      {formatted}
    </span>
  );
};