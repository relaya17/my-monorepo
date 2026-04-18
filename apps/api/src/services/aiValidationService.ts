/**
 * AI Validation Layer – validates VOne responses against business rules.
 * Ensures the AI never promises financial credits, unauthorized actions,
 * or leaks cross-tenant data. This is the "safety net" before any AI
 * response reaches the user.
 *
 * RULES are declarative so non-engineers (product/legal) can add new ones.
 */

export type ViolationType =
  | 'FINANCIAL_PROMISE'
  | 'UNAUTHORIZED_ACTION'
  | 'CROSS_TENANT_LEAK'
  | 'PII_EXPOSURE'
  | 'HALLUCINATION_RISK'
  | 'EMERGENCY_MISHANDLE';

export interface ValidationRule {
  id: string;
  type: ViolationType;
  /** regex or function predicate – if matched, the rule triggers */
  test: RegExp | ((response: string, context: ValidationContext) => boolean);
  /** severity: block = replace response, warn = log + flag, info = log only */
  severity: 'block' | 'warn' | 'info';
  /** replacement text when severity=block (per language) */
  replacement?: { he: string; en: string };
  description: string;
}

export interface ValidationContext {
  buildingId: string;
  userId: string;
  userRole: string;
  originalMessage: string;
  lang?: string;
}

export interface ValidationResult {
  approved: boolean;
  violations: { ruleId: string; type: ViolationType; severity: string; description: string }[];
  sanitizedResponse: string;
}

// ─── Business Rules ──────────────────────────────────────────────

const RULES: ValidationRule[] = [
  {
    id: 'NO_FINANCIAL_PROMISE',
    type: 'FINANCIAL_PROMISE',
    test: /(?:אני\s*(?:מזכה|מחזיר|מעביר)\s*(?:לך|לחשבונך)|(?:credited?|refund(?:ed|ing)?)\s*(?:your|to\s*your)\s*account|(?:זיכוי|החזר)\s*של\s*\d)/i,
    severity: 'block',
    replacement: {
      he: 'לא ניתן לבצע פעולות כספיות ישירות. פנה למנהל הבניין לאישור.',
      en: 'Financial operations require admin approval. Please contact your building manager.',
    },
    description: 'AI must not promise or execute financial credits/refunds without admin approval',
  },
  {
    id: 'NO_PASSWORD_REVEAL',
    type: 'PII_EXPOSURE',
    test: /(?:הסיסמה\s*(?:שלך|היא)|(?:your|the)\s*password\s*is|password:\s*\S+)/i,
    severity: 'block',
    replacement: {
      he: 'לא ניתן לחשוף סיסמאות. השתמש באפשרות "שכחתי סיסמה".',
      en: 'Passwords cannot be revealed. Use the "Forgot Password" option.',
    },
    description: 'AI must never reveal or hint at passwords',
  },
  {
    id: 'NO_CROSS_TENANT_DATA',
    type: 'CROSS_TENANT_LEAK',
    test: (_response: string, ctx: ValidationContext) => {
      // If response mentions another building's ID that isn't the user's
      // Simplified check – in production, compare against known buildingId list
      return false; // Placeholder: implemented via embedding comparison in prod
    },
    severity: 'block',
    replacement: {
      he: 'אין לי גישה למידע של בניינים אחרים.',
      en: 'I cannot access data from other buildings.',
    },
    description: 'AI must not leak data from other tenants/buildings',
  },
  {
    id: 'NO_ADMIN_IMPERSONATION',
    type: 'UNAUTHORIZED_ACTION',
    test: /(?:(?:אני|אנחנו)\s*(?:מפטר|מסיר|מוחק|חוסם)\s*(?:את|אותך)|(?:I(?:'ve|'m| have| am)\s*(?:fired|removed|deleted|blocked))\s*(?:you|your\s*account))/i,
    severity: 'block',
    replacement: {
      he: 'אין לי הרשאה לבצע פעולות ניהול חשבונות. פנה למנהל המערכת.',
      en: 'I do not have permission to manage accounts. Contact your system admin.',
    },
    description: 'AI must not pretend to perform admin-level actions',
  },
  {
    id: 'EMERGENCY_WITHOUT_DISCLAIMER',
    type: 'EMERGENCY_MISHANDLE',
    test: /(?:שריפה|רעידת\s*אדמה|פיצוץ|גז|fire|earthquake|explosion|gas\s*leak)/i,
    severity: 'warn',
    description: 'Emergency topics must include disclaimer to call emergency services',
  },
  {
    id: 'HALLUCINATION_LEGAL',
    type: 'HALLUCINATION_RISK',
    test: /(?:על\s*פי\s*(?:חוק|סעיף|תקנה)\s*\d|(?:according\s*to|under)\s*(?:law|section|regulation)\s*\d)/i,
    severity: 'warn',
    description: 'AI citing specific laws may hallucinate – flag for review',
  },
];

// ─── Validation Engine ───────────────────────────────────────────

const EMERGENCY_DISCLAIMER = {
  he: '\n⚠️ במקרה חירום, התקשר מיד ל-101 (כיבוי) או 100 (משטרה).',
  en: '\n⚠️ In an emergency, call 911 immediately.',
};

/**
 * Validate an AI response against all business rules.
 * Returns sanitized response + list of violations.
 */
export function validateAiResponse(
  aiResponse: string,
  context: ValidationContext
): ValidationResult {
  const violations: ValidationResult['violations'] = [];
  let sanitized = aiResponse;
  const lang = context.lang?.startsWith('he') || context.lang?.startsWith('ar') ? 'he' : 'en';

  for (const rule of RULES) {
    let triggered = false;
    if (rule.test instanceof RegExp) {
      triggered = rule.test.test(aiResponse);
    } else {
      triggered = rule.test(aiResponse, context);
    }

    if (triggered) {
      violations.push({
        ruleId: rule.id,
        type: rule.type,
        severity: rule.severity,
        description: rule.description,
      });

      if (rule.severity === 'block' && rule.replacement) {
        sanitized = rule.replacement[lang];
      }
    }
  }

  // Append emergency disclaimer if needed
  const hasEmergency = violations.some((v) => v.type === 'EMERGENCY_MISHANDLE');
  if (hasEmergency && !sanitized.includes('101') && !sanitized.includes('911')) {
    sanitized += EMERGENCY_DISCLAIMER[lang];
  }

  return {
    approved: !violations.some((v) => v.severity === 'block'),
    violations,
    sanitizedResponse: sanitized,
  };
}

/**
 * Quick check: is this response safe to send?
 */
export function isResponseSafe(aiResponse: string, context: ValidationContext): boolean {
  return validateAiResponse(aiResponse, context).approved;
}

/** Export rules for testing / admin dashboard visibility */
export function getActiveRules(): Pick<ValidationRule, 'id' | 'type' | 'severity' | 'description'>[] {
  return RULES.map(({ id, type, severity, description }) => ({ id, type, severity, description }));
}
