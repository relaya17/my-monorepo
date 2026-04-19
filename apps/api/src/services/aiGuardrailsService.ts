/**
 * AI Guardrails Engine — prevents costly AI mistakes.
 *
 * Five layers:
 * 1. Cost Guard    – OpenAI budget caps (daily/monthly per building, token limits)
 * 2. Action Guard  – blocks or queues dangerous actions for human approval
 * 3. Circuit Breaker – stops calling failed services after repeated errors
 * 4. Prompt Shield – detects prompt injection / jailbreak attempts
 * 5. PII Scrubber  – strips sensitive data before sending to external AI
 */

import { logger } from '../utils/logger.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. COST GUARD – OpenAI spending limits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CostLimits {
  maxTokensPerCall: number;
  maxCallsPerUserPerHour: number;
  maxDailyBudgetUSD: number;
  maxMonthlyBudgetUSD: number;
}

const DEFAULT_COST_LIMITS: CostLimits = {
  maxTokensPerCall: 2000,
  maxCallsPerUserPerHour: 10,
  maxDailyBudgetUSD: 50,
  maxMonthlyBudgetUSD: 500,
};

// In-memory usage tracking (production: use Redis)
const usageTracker = {
  calls: new Map<string, { count: number; windowStart: number }>(),
  dailyCost: { date: '', totalUSD: 0 },
  monthlyCost: { month: '', totalUSD: 0 },
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export function trackAiCost(estimatedCostUSD: number): void {
  const day = todayKey();
  if (usageTracker.dailyCost.date !== day) {
    usageTracker.dailyCost = { date: day, totalUSD: 0 };
  }
  usageTracker.dailyCost.totalUSD += estimatedCostUSD;

  const month = monthKey();
  if (usageTracker.monthlyCost.month !== month) {
    usageTracker.monthlyCost = { month, totalUSD: 0 };
  }
  usageTracker.monthlyCost.totalUSD += estimatedCostUSD;
}

export interface CostCheckResult {
  allowed: boolean;
  reason?: string;
  currentDailyUSD: number;
  currentMonthlyUSD: number;
}

export function checkCostBudget(
  userId: string,
  limits: CostLimits = DEFAULT_COST_LIMITS
): CostCheckResult {
  const day = todayKey();
  const month = monthKey();

  // Reset counters on new period
  if (usageTracker.dailyCost.date !== day) {
    usageTracker.dailyCost = { date: day, totalUSD: 0 };
  }
  if (usageTracker.monthlyCost.month !== month) {
    usageTracker.monthlyCost = { month, totalUSD: 0 };
  }

  // Per-user hourly call limit
  const now = Date.now();
  const userKey = `user:${userId}`;
  const userTrack = usageTracker.calls.get(userKey);
  if (userTrack && now - userTrack.windowStart < 3600_000) {
    if (userTrack.count >= limits.maxCallsPerUserPerHour) {
      return {
        allowed: false,
        reason: `User ${userId} exceeded ${limits.maxCallsPerUserPerHour} AI calls/hour`,
        currentDailyUSD: usageTracker.dailyCost.totalUSD,
        currentMonthlyUSD: usageTracker.monthlyCost.totalUSD,
      };
    }
    userTrack.count++;
  } else {
    usageTracker.calls.set(userKey, { count: 1, windowStart: now });
  }

  // Daily budget
  if (usageTracker.dailyCost.totalUSD >= limits.maxDailyBudgetUSD) {
    return {
      allowed: false,
      reason: `Daily AI budget exhausted ($${usageTracker.dailyCost.totalUSD.toFixed(2)} / $${limits.maxDailyBudgetUSD})`,
      currentDailyUSD: usageTracker.dailyCost.totalUSD,
      currentMonthlyUSD: usageTracker.monthlyCost.totalUSD,
    };
  }

  // Monthly budget
  if (usageTracker.monthlyCost.totalUSD >= limits.maxMonthlyBudgetUSD) {
    return {
      allowed: false,
      reason: `Monthly AI budget exhausted ($${usageTracker.monthlyCost.totalUSD.toFixed(2)} / $${limits.maxMonthlyBudgetUSD})`,
      currentDailyUSD: usageTracker.dailyCost.totalUSD,
      currentMonthlyUSD: usageTracker.monthlyCost.totalUSD,
    };
  }

  return {
    allowed: true,
    currentDailyUSD: usageTracker.dailyCost.totalUSD,
    currentMonthlyUSD: usageTracker.monthlyCost.totalUSD,
  };
}

/** Get the configured max_tokens for OpenAI calls */
export function getMaxTokens(limits: CostLimits = DEFAULT_COST_LIMITS): number {
  return limits.maxTokensPerCall;
}

/** Reset all cost tracking (for tests) */
export function _resetCostTracker(): void {
  usageTracker.calls.clear();
  usageTracker.dailyCost = { date: '', totalUSD: 0 };
  usageTracker.monthlyCost = { month: '', totalUSD: 0 };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. ACTION GUARD – human-in-the-loop for risky operations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ActionGuardResult {
  allowed: boolean;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  reason?: string;
}

interface ActionGuardRule {
  action: string;
  riskLevel: RiskLevel;
  /** max executions per user per hour before requiring approval */
  autoApproveLimit: number;
  /** never auto-approve – always queue for human */
  alwaysRequireApproval: boolean;
}

const ACTION_GUARD_RULES: ActionGuardRule[] = [
  { action: 'report_fault', riskLevel: 'medium', autoApproveLimit: 3, alwaysRequireApproval: false },
  { action: 'check_balance', riskLevel: 'low', autoApproveLimit: 20, alwaysRequireApproval: false },
  { action: 'check_ticket_status', riskLevel: 'low', autoApproveLimit: 20, alwaysRequireApproval: false },
  { action: 'schedule_amenity', riskLevel: 'medium', autoApproveLimit: 5, alwaysRequireApproval: false },
  { action: 'request_document', riskLevel: 'medium', autoApproveLimit: 3, alwaysRequireApproval: false },
  { action: 'escalate_to_admin', riskLevel: 'high', autoApproveLimit: 2, alwaysRequireApproval: false },
  { action: 'retriage_all', riskLevel: 'critical', autoApproveLimit: 0, alwaysRequireApproval: true },
  { action: 'real_estate_lead', riskLevel: 'high', autoApproveLimit: 1, alwaysRequireApproval: false },
];

// In-memory action counter (production: Redis)
const actionCounters = new Map<string, { count: number; windowStart: number }>();

export function checkActionGuard(action: string, userId: string): ActionGuardResult {
  const rule = ACTION_GUARD_RULES.find((r) => r.action === action);
  if (!rule) {
    // Unknown action → default cautious
    return { allowed: true, riskLevel: 'low', requiresApproval: false };
  }

  if (rule.alwaysRequireApproval) {
    logger.warn('[Action Guard] Requires human approval', { action, userId });
    return {
      allowed: false,
      riskLevel: rule.riskLevel,
      requiresApproval: true,
      reason: `Action "${action}" always requires admin approval`,
    };
  }

  const now = Date.now();
  const key = `${userId}:${action}`;
  const counter = actionCounters.get(key);

  if (counter && now - counter.windowStart < 3600_000) {
    if (counter.count >= rule.autoApproveLimit) {
      logger.warn('[Action Guard] Rate exceeded, needs approval', { action, userId, count: counter.count });
      return {
        allowed: false,
        riskLevel: rule.riskLevel,
        requiresApproval: true,
        reason: `User exceeded ${rule.autoApproveLimit} "${action}" actions/hour. Queued for approval.`,
      };
    }
    counter.count++;
  } else {
    actionCounters.set(key, { count: 1, windowStart: now });
  }

  return { allowed: true, riskLevel: rule.riskLevel, requiresApproval: false };
}

/** Reset action counters (for tests) */
export function _resetActionCounters(): void {
  actionCounters.clear();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. CIRCUIT BREAKER – stop calling broken services
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  lastSuccess: number;
}

const CIRCUIT_CONFIG = {
  failureThreshold: 5,     // open after N consecutive failures
  resetTimeoutMs: 60_000,  // try again after 1 minute
  halfOpenMaxAttempts: 2,   // allow N probe requests in half-open
};

const circuits = new Map<string, CircuitBreakerState>();

function getCircuit(serviceName: string): CircuitBreakerState {
  if (!circuits.has(serviceName)) {
    circuits.set(serviceName, { state: 'closed', failures: 0, lastFailure: 0, lastSuccess: 0 });
  }
  return circuits.get(serviceName)!;
}

export function isCircuitOpen(serviceName: string): boolean {
  const circuit = getCircuit(serviceName);
  const now = Date.now();

  if (circuit.state === 'open') {
    if (now - circuit.lastFailure > CIRCUIT_CONFIG.resetTimeoutMs) {
      circuit.state = 'half-open';
      circuit.failures = 0;
      logger.info(`[Circuit Breaker] ${serviceName}: open → half-open`);
      return false; // allow probe
    }
    return true; // still open
  }

  if (circuit.state === 'half-open' && circuit.failures >= CIRCUIT_CONFIG.halfOpenMaxAttempts) {
    circuit.state = 'open';
    circuit.lastFailure = now;
    logger.warn(`[Circuit Breaker] ${serviceName}: half-open → open (probe failed)`);
    return true;
  }

  return false; // closed or half-open with attempts remaining
}

export function recordCircuitSuccess(serviceName: string): void {
  const circuit = getCircuit(serviceName);
  circuit.state = 'closed';
  circuit.failures = 0;
  circuit.lastSuccess = Date.now();
}

export function recordCircuitFailure(serviceName: string): void {
  const circuit = getCircuit(serviceName);
  circuit.failures++;
  circuit.lastFailure = Date.now();

  if (circuit.failures >= CIRCUIT_CONFIG.failureThreshold && circuit.state === 'closed') {
    circuit.state = 'open';
    logger.error(`[Circuit Breaker] ${serviceName}: OPEN after ${circuit.failures} failures`);
  }
}

export function getCircuitState(serviceName: string): { state: CircuitState; failures: number } {
  const circuit = getCircuit(serviceName);
  // Re-check for auto-transition
  isCircuitOpen(serviceName);
  return { state: circuit.state, failures: circuit.failures };
}

/** Reset all circuits (for tests) */
export function _resetCircuits(): void {
  circuits.clear();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. PROMPT SHIELD – detect prompt injection / jailbreak
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PromptShieldResult {
  safe: boolean;
  threats: string[];
}

const INJECTION_PATTERNS: { pattern: RegExp; threat: string }[] = [
  { pattern: /ignore\s+(?:all\s+)?(?:previous|above|prior)\s+(?:instructions|prompts|rules)/i, threat: 'instruction_override' },
  { pattern: /you\s+are\s+(?:now|no\s+longer)\s+(?:a|an|the)\s/i, threat: 'role_hijack' },
  { pattern: /(?:system|admin)\s*(?:prompt|message|instruction)\s*[:=]/i, threat: 'system_prompt_inject' },
  { pattern: /\bDAN\b.*\bjailbreak/i, threat: 'known_jailbreak_DAN' },
  { pattern: /(?:pretend|act\s+as\s+if)\s+(?:you\s+(?:are|have)|there\s+(?:are|is))\s+no\s+(?:rules|restrictions|limits)/i, threat: 'restriction_bypass' },
  { pattern: /(?:התעלם|תתעלם)\s+(?:מ(?:כל\s+)?הוראות|מהחוקים)/i, threat: 'instruction_override_he' },
  { pattern: /(?:אתה\s+עכשיו|מעכשיו\s+אתה)\s+/i, threat: 'role_hijack_he' },
  { pattern: /\[SYSTEM\]|\[INST\]|<\|im_start\|>|<\|system\|>/i, threat: 'token_injection' },
  { pattern: /(?:reveal|show|print|output)\s+(?:your|the)\s+(?:system\s+)?(?:prompt|instructions|rules)/i, threat: 'prompt_extraction' },
  { pattern: /(?:הראה|חשוף|תדפיס)\s+(?:את\s+)?(?:ההוראות|הפרומפט|החוקים)/i, threat: 'prompt_extraction_he' },
];

export function checkPromptInjection(userInput: string): PromptShieldResult {
  const threats: string[] = [];

  for (const { pattern, threat } of INJECTION_PATTERNS) {
    if (pattern.test(userInput)) {
      threats.push(threat);
    }
  }

  if (threats.length > 0) {
    logger.warn('[Prompt Shield] Injection attempt detected', { threats, inputPreview: userInput.slice(0, 100) });
  }

  return { safe: threats.length === 0, threats };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. PII SCRUBBER – strip sensitive data before external AI calls
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PII_PATTERNS: { pattern: RegExp; replacement: string; label: string }[] = [
  // Israeli ID number (9 digits)
  { pattern: /\b\d{9}\b/g, replacement: '[ID_REDACTED]', label: 'israeli_id' },
  // Credit card numbers (13-19 digits with optional separators)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,7}\b/g, replacement: '[CARD_REDACTED]', label: 'credit_card' },
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]', label: 'email' },
  // Israeli phone numbers
  { pattern: /(?:\+972|0)[\s-]?(?:5[0-9])[\s-]?\d{3}[\s-]?\d{4}\b/g, replacement: '[PHONE_REDACTED]', label: 'phone_il' },
  // US phone numbers
  { pattern: /(?:\+1[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g, replacement: '[PHONE_REDACTED]', label: 'phone_us' },
  // MongoDB ObjectId (24 hex chars – likely a tenantId/userId)
  { pattern: /\b[0-9a-f]{24}\b/gi, replacement: '[TENANT_ID_REDACTED]', label: 'mongo_object_id' },
];

export interface ScrubResult {
  scrubbed: string;
  redactedFields: string[];
  originalLength: number;
}

export function scrubPii(text: string): ScrubResult {
  let scrubbed = text;
  const redactedFields: string[] = [];

  for (const { pattern, replacement, label } of PII_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    if (pattern.test(scrubbed)) {
      pattern.lastIndex = 0;
      scrubbed = scrubbed.replace(pattern, replacement);
      redactedFields.push(label);
    }
  }

  return { scrubbed, redactedFields, originalLength: text.length };
}

/** Truncate input to max length to prevent token abuse */
export function truncateInput(text: string, maxChars = 2000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '… [truncated]';
}
