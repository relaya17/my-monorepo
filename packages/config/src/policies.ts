/**
 * Legal policy metadata – Privacy Policy & Terms of Service.
 * Single source of truth consumed by web, native, and API (for email footers).
 *
 * IMPORTANT: Update `effectiveDate` and bump `version` whenever policies change.
 */

export interface PolicyMeta {
  version: string;
  effectiveDate: string;
  /** ISO 639-1 language code */
  lang: 'he' | 'en';
}

// ─── Terms of Service ─────────────────────────────────────────────

export const TERMS_OF_SERVICE: PolicyMeta = {
  version: '1.2',
  effectiveDate: '2025-01-01',
  lang: 'he',
};

export const TERMS_OF_SERVICE_EN: PolicyMeta = {
  version: '1.2',
  effectiveDate: '2025-01-01',
  lang: 'en',
};

// ─── Privacy Policy ───────────────────────────────────────────────

export const PRIVACY_POLICY: PolicyMeta = {
  version: '1.1',
  effectiveDate: '2025-01-01',
  lang: 'he',
};

export const PRIVACY_POLICY_EN: PolicyMeta = {
  version: '1.1',
  effectiveDate: '2025-01-01',
  lang: 'en',
};

// ─── Data Retention ───────────────────────────────────────────────

/** Retention periods in days (GDPR Article 5(1)(e)). */
export const DATA_RETENTION_DAYS = {
  /** Active user PII (name, email, phone) */
  USER_PII: 365 * 3, // 3 years after last activity
  /** Audit logs – must be kept for legal accountability */
  AUDIT_LOGS: 365 * 7, // 7 years
  /** AI-generated events and vision logs */
  AI_VISION_LOGS: 90,
  /** Payment records – tax obligation */
  PAYMENT_RECORDS: 365 * 7,
  /** Maintenance tickets */
  MAINTENANCE_TICKETS: 365 * 5,
  /** Refresh tokens */
  REFRESH_TOKENS: 30,
} as const;

// ─── Cookie categories ────────────────────────────────────────────

export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookieDefinition {
  name: string;
  category: CookieCategory;
  purpose: string;
  expiresInDays: number;
}

export const COOKIE_DEFINITIONS: CookieDefinition[] = [
  {
    name: 'authToken',
    category: 'necessary',
    purpose: 'Stores the JWT access token for authenticated sessions',
    expiresInDays: 1,
  },
  {
    name: 'refreshToken',
    category: 'necessary',
    purpose: 'Stores the refresh token to renew access tokens',
    expiresInDays: 7,
  },
  {
    name: 'buildingId',
    category: 'necessary',
    purpose: 'Remembers the selected building context across sessions',
    expiresInDays: 365,
  },
  {
    name: 'cookie_consent',
    category: 'necessary',
    purpose: 'Stores the user\'s cookie consent preferences',
    expiresInDays: 365,
  },
  {
    name: 'language',
    category: 'necessary',
    purpose: 'Stores the user\'s preferred interface language',
    expiresInDays: 365,
  },
  {
    name: '_ga',
    category: 'analytics',
    purpose: 'Google Analytics – anonymous usage statistics',
    expiresInDays: 730,
  },
  {
    name: '_gid',
    category: 'analytics',
    purpose: 'Google Analytics – distinguishes unique users (session)',
    expiresInDays: 1,
  },
];

// ─── Contact / DPO ────────────────────────────────────────────────

export const DATA_PROTECTION_CONTACT = {
  email: 'privacy@vantera.co.il',
  address: 'ישראל',
} as const;

export const LEGAL_CONTACT = {
  email: 'legal@vantera.co.il',
} as const;
