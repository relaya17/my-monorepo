/**
 * Shared domain types – single source of truth for API, Web, and Native.
 * All cross-app contracts live here; never use `any`.
 */

// ─── Generic API Response wrappers ────────────────────────────────

/** Standard success envelope returned by all API endpoints. */
export interface ApiResponse<T> {
  data: T;
  success: true;
  traceId?: string;
}

/** Standard error envelope returned when HTTP status >= 400. */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  fields?: Record<string, string[]>;
  traceId?: string;
}

/** Paginated list envelope. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Building ─────────────────────────────────────────────────────

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

// ─── User & Auth ──────────────────────────────────────────────────

/** HSLL Enterprise: single User model roles. */
export type UserRole = 'resident' | 'tenant' | 'committee' | 'technician' | 'tech' | 'admin' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  buildingId: string;
  phone?: string;
  apartmentNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokenPayload {
  sub: string;
  type: 'user' | 'admin';
  buildingId: string;
  email?: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role' | 'buildingId'>;
}

// ─── Maintenance ──────────────────────────────────────────────────

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type MaintenanceCategory = 'Plumbing' | 'Electricity' | 'Elevator' | 'General';

export interface MaintenanceTicket {
  /** Mongoose document ID (populated from _id). */
  _id: string;
  id: string;
  buildingId: string;
  title: string;
  description: string;
  location?: string;
  category?: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  /** AI priority score 1–10. */
  aiPriority?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Payments ─────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'stripe';

export interface Payment {
  id: string;
  buildingId: string;
  userId: string;
  amount: number;
  currency: 'ILS' | 'USD' | 'GBP';
  status: PaymentStatus;
  method?: PaymentMethod;
  description?: string;
  dueDate?: string;
  paidAt?: string;
  stripePaymentIntentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  payer: string;
  amount: number;
  currency: 'ILS' | 'USD' | 'GBP';
  chairmanName?: string;
  issuedAt: string;
  pdfUrl?: string;
}

// ─── Notifications ────────────────────────────────────────────────

export type NotificationType =
  | 'maintenance_update'
  | 'payment_due'
  | 'payment_received'
  | 'new_announcement'
  | 'ai_alert'
  | 'vote_opened'
  | 'vote_closing'
  | 'system';

export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

export interface Notification {
  _id: string;
  id: string;
  buildingId: string;
  userId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  read: boolean;
  readAt?: string;
  sentAt: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

// ─── HSLL Events ──────────────────────────────────────────────────

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

// ─── Transactions ─────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Transaction {
  _id: string;
  id: string;
  buildingId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency?: 'ILS' | 'USD' | 'GBP';
  category?: string;
  description?: string;
  relatedMaintenanceId?: string;
  relatedPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Contractors & Vendors ────────────────────────────────────────

export type ContractorStatus = 'active' | 'pending' | 'blocked';

export interface Contractor {
  id: string;
  buildingId: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  specialty: string;
  status: ContractorStatus;
  rating?: number;
  createdAt?: string;
}

// ─── Voting ───────────────────────────────────────────────────────

export type VoteStatus = 'Open' | 'Closed' | 'Expired' | 'Rejected';

export interface VoteOption {
  label: string;
  description?: string;
}

export interface Vote {
  id: string;
  buildingId: string;
  title: string;
  description?: string;
  options: VoteOption[];
  status: VoteStatus;
  requiredQuorum: number;
  deadline: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
