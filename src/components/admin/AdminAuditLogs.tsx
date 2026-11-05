/**
 * ============================================================================
 * FILE: AdminAuditLogs.tsx — Vantrix AI
 * PHÂN HỆ: QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) — BẢO MẬT & KIỂM TOÁN
 * ĐƯỜNG DẪN: /src/components/admin/AdminAuditLogs.tsx
 * CHỨC NĂNG:
 *  - Ghi nhận lịch sử thao tác nhạy cảm của Admin & Giáo viên
 *  - Lọc theo danh mục (Người dùng / Đề thi / Hệ thống / AI) + mức độ
 *  - Tìm kiếm toàn văn
 *  - Xuất CSV báo cáo an toàn (escape đầy đủ, chống CSV injection)
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { AuditLog } from '../../types/admin';
import {
  Shield,
  Search,
  Download,
  AlertTriangle,
  Info,
  Clock,
  User,
  FileText,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

const ADMIN = {
  main: '#6D28D9',
  hover: '#5B21B6',
  tint: '#F3E8FF',
  border: '#DDD6FE',
  deep: '#4C1D95',
} as const;

type CategoryFilter = 'all' | 'user' | 'exam' | 'system' | 'ai';
type SeverityFilter = 'all' | 'info' | 'warning' | 'critical';

interface AdminAuditLogsProps {
  auditLogs: AuditLog[];
}

/** Escape value theo chuẩn RFC 4180 — bọc nháy kép + nhân đôi `"` bên trong. */
function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const formatTimestamp = (ts: number): string => {
  try {
    return new Date(ts).toLocaleString('vi-VN');
  } catch {
    return new Date(ts).toISOString();
  }
};

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.adminEmail.toLowerCase().includes(q) ||
        log.adminName.toLowerCase().includes(q);

      const matchCategory = categoryFilter === 'all' || log.category === categoryFilter;
      const matchSeverity = severityFilter === 'all' || log.severity === severityFilter;

      return matchSearch && matchCategory && matchSeverity;
    });
  }, [auditLogs, searchQuery, categoryFilter, severityFilter]);

  const hasAnyLog = auditLogs.length > 0;
  const hasResults = filteredLogs.length > 0;

  const handleExportCsv = () => {
    if (!hasResults) return;

    const headers = [
      'Mã Log',
      'Thời Gian',
      'Người Thực Hiện',
      'Email',
      'Hành Động',
      'Đối Tượng',
      'Chi Tiết',
      'Mức Độ',
      'Danh Mục',
    ];

    const rows = filteredLogs.map((l) => [
      escapeCsv(l.id),
      escapeCsv(formatTimestamp(l.timestamp)),
      escapeCsv(l.adminName),
      escapeCsv(l.adminEmail),
      escapeCsv(l.action),
      escapeCsv(l.target),
      escapeCsv(l.details),
      l.severity.toUpperCase(),
      l.category.toUpperCase(),
    ]);

    // \uFEFF = BOM — Excel nhận diện UTF-8 tiếng Việt
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nhat_Ky_Kiem_Toan_Vantrix_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Tránh bug Firefox: revoke quá sớm sẽ huỷ download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: ADMIN.tint, border: `1px solid ${ADMIN.border}` }}
          >
            <Shield className="w-6 h-6" style={{ color: ADMIN.main }} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2 flex-wrap">
              <span>Nhật ký Kiểm toán & An toàn Hệ thống</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold tabular-nums"
                style={{ backgroundColor: ADMIN.tint, color: ADMIN.main }}
              >
                {auditLogs.length} bản ghi
              </span>
            </h2>
            <p className="text-xs text-[#78716C]">
              Ghi nhận minh bạch mọi tác vụ quản trị, thay đổi quyền hạn và điều chỉnh đề thi
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleExportCsv}
          disabled={!hasResults}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#FAFAF9] text-[#57534E] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Nhật ký CSV</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo hành động, email, đối tượng tác động..."
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 transition-all"
            style={{ ['--tw-ring-color' as string]: `${ADMIN.main}33` }}
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category filter */}
          <div className="flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-xl text-xs">
            <span className="text-[11px] font-bold text-[#78716C] px-2">Danh mục:</span>
            {(['all', 'user', 'exam', 'system', 'ai'] as const).map((cat) => {
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive ? 'bg-white shadow-sm' : 'text-[#57534E] hover:text-[#0F172A]'
                  }`}
                  style={isActive ? { color: ADMIN.main } : undefined}
                >
                  {cat === 'all'
                    ? 'Tất cả'
                    : cat === 'user'
                    ? 'Người dùng'
                    : cat === 'exam'
                    ? 'Đề thi'
                    : cat === 'ai'
                    ? 'AI'
                    : 'Hệ thống'}
                </button>
              );
            })}
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-xl text-xs">
            <span className="text-[11px] font-bold text-[#78716C] px-2">Mức độ:</span>
            {(['all', 'info', 'warning', 'critical'] as const).map((sev) => {
              const isActive = severityFilter === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive ? 'bg-white shadow-sm' : 'text-[#57534E] hover:text-[#0F172A]'
                  }`}
                  style={isActive ? { color: ADMIN.main } : undefined}
                >
                  {sev === 'all'
                    ? 'Tất cả'
                    : sev === 'info'
                    ? 'Thông tin'
                    : sev === 'warning'
                    ? 'Cảnh báo'
                    : 'Nghiêm trọng'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
        className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[#57534E] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Admin thực hiện</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng</th>
                <th className="py-3 px-4">Chi tiết thao tác</th>
                <th className="py-3 px-4 text-center">Mức độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {!hasResults ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-6 h-6 text-[#A8A29E]" />
                    </div>
                    <p className="font-bold text-[#0F172A] text-sm">
                      {hasAnyLog
                        ? 'Không tìm thấy bản ghi phù hợp'
                        : 'Chưa có bản ghi kiểm toán nào'}
                    </p>
                    <p className="text-[11px] text-[#78716C] mt-1 max-w-md mx-auto">
                      {hasAnyLog
                        ? 'Thử xoá từ khóa hoặc chọn bộ lọc khác.'
                        : 'Các thao tác quản trị sẽ được tự động ghi nhận tại đây.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.15) }}
                    className="hover:bg-[#FAFAF9]/70 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-[#78716C] font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-[#0F172A]">{log.adminName}</p>
                      <p className="text-[10px] text-[#A8A29E] font-mono">{log.adminEmail}</p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-bold text-[#0F172A]">
                      <div className="flex items-center gap-1.5">
                        <CategoryIcon category={log.category} />
                        <span>{log.action}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#57534E] bg-[#F5F5F4] px-2 py-0.5 rounded-md font-mono text-[11px]">
                        {log.target}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#57534E] text-xs max-w-xs break-words">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <SeverityBadge severity={log.severity} />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================================
 * Sub-components
 * ============================================================================ */
const SeverityBadge: React.FC<{ severity: 'info' | 'warning' | 'critical' }> = ({
  severity,
}) => {
  if (severity === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
        <AlertTriangle className="w-3 h-3 text-rose-600" /> Nghiêm trọng
      </span>
    );
  }
  if (severity === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600" /> Cảnh báo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5F4] text-[#57534E] border border-[#E7E5E4]">
      <Info className="w-3 h-3 text-[#78716C]" /> Thông tin
    </span>
  );
};

const CategoryIcon: React.FC<{ category: AuditLog['category'] }> = ({ category }) => {
  if (category === 'user') {
    return <User className="w-3.5 h-3.5" style={{ color: '#0D5C75' }} />;
  }
  if (category === 'exam') {
    return <FileText className="w-3.5 h-3.5" style={{ color: '#10B981' }} />;
  }
  if (category === 'ai') {
    return <Sparkles className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />;
  }
  return <Settings className="w-3.5 h-3.5" style={{ color: ADMIN.main }} />;
};