/**
 * מבנה נתונים ל-Backend – ניהול נכסים (API, App, Landing – מקור אמת יחיד).
 */

export interface Building {
  id: string;
  address: string;
  apartments: string[];
}

/** מדדי השפעה גלובליים לדף הנחיתה (ללא מידע מזהה). */
export interface BuildingMetrics {
  totalMoneySaved: number;
  preventedFailures: number;
  residentHappiness: number;
  transparencyScore: 'AAA' | 'AA' | 'A';
}

/** תגובת ה-API הציבורי GET /api/public/impact-metrics */
export interface GlobalImpactResponse {
  totalMoneySaved: number;
  totalPreventedFailures: number;
  averageHappiness: number;
  transparencyScore?: 'AAA' | 'AA' | 'A';
}

/** HSLL Enterprise: single User model roles (Resident, Committee, Tech, SuperAdmin). */
export type UserRole = 'resident' | 'tenant' | 'committee' | 'technician' | 'tech' | 'admin' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  buildingId: string;
}

export type MaintenancePriority = 'low' | 'urgent' | 'critical';

export type MaintenanceStatus = 'open' | 'in_progress' | 'closed';

export type MaintenanceCategory = 'Plumbing' | 'Electricity' | 'Elevator' | 'General';

export interface MaintenanceTicket {
  id: string;
  buildingId: string;
  description: string;
  category?: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  /** עדיפות AI 1–10 (לדאשבורד/שלום). */
  aiPriority?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ה"מוח" המרכזי – אירוע מאוחד מכל המקורות (מצלמה, לוויין, דייר, חיישן).
 * Master Architecture: כל אירוע עובר דרך ה-AI Peacekeeper לפני הפיכה לתקלה.
 */
export type HSLL_EventSource = 'AI_VISION' | 'SATELLITE' | 'RESIDENT_REPORT' | 'IOT_SENSOR';

export type HSLL_EventStatus = 'Detected' | 'Verified' | 'In_Repair' | 'Resolved';

export interface HSLL_EventEvidence {
  imageUrl?: string;
  voiceNoteUrl?: string;
  description: string;
}

export interface HSLL_EventFinancialImpact {
  potentialLoss: number;
  moneySaved: number;
}

export interface HSLL_Event {
  id: string;
  buildingId: string;
  type: HSLL_EventSource;
  severity: 1 | 2 | 3 | 4 | 5;
  evidence: HSLL_EventEvidence;
  financialImpact: HSLL_EventFinancialImpact;
  status: HSLL_EventStatus;
  maintenanceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Unified transaction: Income (Dues) or Expense (Maintenance/Inventory) for CEO reconciliation. */
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  buildingId: string;
  type: TransactionType;
  amount: number;
  category?: string;
  description?: string;
  relatedMaintenanceId?: string;
  relatedPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}
