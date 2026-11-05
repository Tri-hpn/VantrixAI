/**
 * ============================================================================
 * FILE: Footer (Chân Trang Hệ Thống Khảo Thí & Luyện Thi)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: DÙNG CHUNG (COMMON) — CHÂN TRANG ĐẦY ĐỦ THÔNG TIN
 * ĐƯỜNG DẪN: /src/components/common/Footer.tsx
 * CHỨC NĂNG CHÍNH:
 *  - Liên kết nhanh đến ngân hàng đề 4 cấp học
 *  - Cam kết bảo mật, chuẩn ma trận đề Bộ GD&ĐT
 *  - Liên hệ: 0865542505 — 68 Nguyễn Chí Thanh, Hà Nội
 *  - Bản đồ Google Maps nhúng
 *  - Bản quyền: © 2026 Vantrix AI. Built by Tran Van Tri.
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  ExternalLink,
  BookOpen,
  Award,
  Navigation,
} from 'lucide-react';

interface FooterProps {
  onSelectLevel?: (level: any) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' as const },
  }),
};

const FooterLink: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left w-full"
  >
    <BookOpen className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors shrink-0" />
    <span className="group-hover:translate-x-0.5 transition-transform">{children}</span>
  </button>
);

export const Footer: React.FC<FooterProps> = ({
  onSelectLevel,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <footer className="bg-[#0B1120] text-slate-400 text-xs border-t border-slate-800 pb-20 md:pb-8 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Col 1: Brand & Author */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            custom={0}
            className="lg:col-span-4 space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D5C75] to-[#042F2E] flex items-center justify-center text-white shadow-sm shadow-teal-900/40 border border-teal-700/40">
                <Brain className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-white tracking-tight">Vantrix AI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    v2.5 Pro
                  </span>
                </div>
                <p className="text-[11px] text-teal-400 font-medium">
                  Hệ Thống Khảo Thí & Ôn Thi Thông Minh
                </p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs">
              Nền tảng khảo thí, quản lý lớp học và luyện thi thông minh toàn diện từ Tiểu học,
              THCS, THPT đến Đại học & Khảo thí đánh giá năng lực quốc gia.
            </p>

            {/* Author Attribution */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-900/60 border border-teal-700/60 flex items-center justify-center text-teal-300 font-black text-xs shrink-0">
                VT
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Tác giả & Nhà phát triển
                </p>
                <p className="text-xs font-bold text-white truncate">Tran Van Tri (Trần Văn Trí)</p>
                <a
                  href="mailto:vantritran518@gmail.com"
                  className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors block truncate"
                >
                  vantritran518@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">
                Bám sát chương trình GDPT 2018 & Đề án tuyển sinh ĐHQG / Bách Khoa
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center gap-1 text-[11px] text-teal-400 font-semibold bg-teal-950/60 border border-teal-800/80 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Gemini 2.5</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                <Award className="w-3.5 h-3.5" />
                <span>PDF A4 Chuẩn Bộ</span>
              </div>
            </div>
          </motion.div>

          {/* Col 2: Khảo thí phổ thông */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            custom={1}
            className="lg:col-span-2 space-y-3"
          >
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Khảo Thí Phổ Thông
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <FooterLink onClick={() => onSelectLevel?.('tieuhoc')}>
                  Tiểu học: Toán Tuổi Thơ, IOE
                </FooterLink>
              </li>
              <li>
                <FooterLink onClick={() => onSelectLevel?.('tieuhoc')}>
                  Violympic Toán & Tiếng Việt
                </FooterLink>
              </li>
              <li>
                <FooterLink onClick={() => onSelectLevel?.('thcs')}>
                  THCS: Ôn thi vào 10 chuyên
                </FooterLink>
              </li>
              <li>
                <FooterLink onClick={() => onSelectLevel?.('thcs')}>
                  KHTN (Lý, Hóa, Sinh) & Toán 9
                </FooterLink>
              </li>
            </ul>
          </motion.div>

          {/* Col 3: THPT & ĐH */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            custom={2}
            className="lg:col-span-2 space-y-3"
          >
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              THPT & Đại Học
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <FooterLink onClick={() => onSelectLevel?.('thpt')}>
                  Tốt nghiệp THPT 2025 (Cấu trúc mới)
                </FooterLink>
              </li>
              <li>
                <FooterLink onClick={() => onSelectLevel?.('thpt')}>
                  ĐGNL ĐHQG Hà Nội (HSA) & HCM
                </FooterLink>
              </li>
              <li>
                <FooterLink onClick={() => onSelectLevel?.('thpt')}>
                  Đánh giá tư duy TSA Bách Khoa
                </FooterLink>
              </li>
              <li>
                <FooterLink onClick={() => onSelectLevel?.('daihoc')}>
                  ĐH: Giải tích, Đại số, Triết học
                </FooterLink>
              </li>
            </ul>
          </motion.div>

          {/* Col 4: Liên hệ & Bản đồ */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            custom={3}
            className="lg:col-span-4 space-y-4"
          >
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Liên Hệ & Trụ Sở</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/70 border border-emerald-800/70 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Hotline / Zalo hỗ trợ:
                  </span>
                  <a
                    href="tel:0865542505"
                    className="text-white font-extrabold hover:text-emerald-400 transition-colors text-sm tracking-wide"
                  >
                    0865542505
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-950/70 border border-indigo-800/70 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Hòm thư Gmail:</span>
                  <a
                    href="mailto:vantritran518@gmail.com"
                    className="text-white hover:text-indigo-300 transition-colors font-bold text-xs tracking-wide"
                  >
                    vantritran518@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-950/70 border border-teal-800/70 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Địa chỉ trụ sở:</span>
                  <p className="text-slate-200 font-semibold leading-snug">
                    68 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-teal-400" />
                  Định vị bản đồ trụ sở:
                </span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=68+Nguy%E1%BB%85n+Ch%C3%AD+Thanh,+H%C3%A0+N%E1%BB%99i"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1 transition-colors text-[10px]"
                >
                  <span>Mở Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-md bg-slate-900 group">
                <iframe
                  title="Định vị bản đồ 68 Nguyễn Chí Thanh"
                  src="https://maps.google.com/maps?q=68%20Nguy%E1%BB%85n%20Ch%C3%AD%20Thanh%2C%20H%C3%A0%20N%E1%BB%99i&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-32 border-0 filter contrast-105 group-hover:contrast-110 transition-all"
                  loading="lazy"
                  allowFullScreen
                />
                <div className="px-3 py-1.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 truncate font-medium">
                    📍 68 Nguyễn Chí Thanh, Đống Đa, Hà Nội
                  </span>
                  <span className="text-emerald-400 font-bold shrink-0">
                    08:00 - 22:00
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar — Copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-bold text-white text-sm tracking-tight text-center md:text-left">
            © 2026 Vantrix AI. Designed & Developed by Tran Van Tri.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Chính sách bảo mật
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Điều khoản dịch vụ
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Uptime 99.98%
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};