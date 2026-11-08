/**
 * ============================================================================
 * FILE: admin.ts — Vantrix AI
 * PHÂN HỆ: TYPES — ĐỊNH NGHĨA KIỂU DỮ LIỆU QUẢN TRỊ
 * ============================================================================
 */

import type { EducationLevel, UserRole } from './quiz';

export interface UserPermissions {
  canCreateExam?: boolean;
  canPublishPublic?: boolean;
  canManageClasses?: boolean;
  canGradeSubmissions?: boolean;
  canAccessAiUnlimited?: boolean;
  canModerateUsers?: boolean;
  canExportPdf?: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  educationLevel: EducationLevel;
  gradeOrClass: string;
  schoolOrOrg: string;
  status: 'active' | 'suspended' | 'pending';
  joinedAt: number;
  lastLoginAt: number;
  examsTakenCount: number;
  classesCount: number;
  averageScore?: number;
  notes?: string;
  permissions?: UserPermissions;
}

export interface BroadcastAnnouncement {
  enabled: boolean;
  message: string;
  linkText?: string;
  linkUrl?: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  targetAudience: 'all' | 'students' | 'teachers';
  updatedAt: number;
}

export interface AiToolProvider {
  id: string;
  name: string;
  provider: 'google_gemini' | 'openai' | 'anthropic' | 'deepseek' | 'custom';
  modelId: string;
  status: 'active' | 'ready' | 'deprecated';
  apiKeyMasked?: string;
  customEndpoint?: string;
  maxTokens?: number;
  isDefault?: boolean;
  description?: string;
}

export interface SystemSettings {
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  announcement: BroadcastAnnouncement;
  allowedLevels: {
    tieuhoc: boolean;
    thcs: boolean;
    thpt: boolean;
    daihoc: boolean;
  };
  aiConfig: {
    model: string;
    maxQuestionsPerGenerate: number;
    allowStudentFileParse: boolean;
    enableExplainStepByStep: boolean;
    temperature: number;
    activeProvider?: string;
    availableTools?: AiToolProvider[];
  };
  security: {
    antiCheatShuffleDefault: boolean;
    enforceFullScreenOnExam: boolean;
    watermarkPdfExport: boolean;
    watermarkCustomText: string;
    allowPublicRegistrations: boolean;
  };
  topBarConfig?: {
    hotline: string;
    hotlineHours: string;
    standardsText: string;
    aiEngineName: string;
    aiEngineStatus: string;
  };
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical' | 'error';
  category: 'user' | 'exam' | 'system' | 'ai';
}

export interface SystemMetric {
  totalUsers: number;
  activeUsersToday: number;
  totalExams: number;
  totalSubmissions: number;
  aiQueriesToday: number;
  serverUptimePercentage: number;
  storageUsedMb: number;
  storageLimitMb: number;
}