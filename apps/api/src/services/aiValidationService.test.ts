import { describe, it, expect } from 'vitest';
import { validateAiResponse, isResponseSafe, getActiveRules } from './aiValidationService.js';

const ctx = (overrides = {}) => ({
  buildingId: 'B1',
  userId: 'U1',
  userRole: 'resident',
  originalMessage: 'test',
  lang: 'he',
  ...overrides,
});

describe('AI Validation Layer', () => {
  it('approves safe responses', () => {
    const result = validateAiResponse('הכול תקין, אין בעיות', ctx());
    expect(result.approved).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.sanitizedResponse).toBe('הכול תקין, אין בעיות');
  });

  it('blocks financial promises (Hebrew)', () => {
    const result = validateAiResponse('אני מזכה לך 500 ש"ח לחשבונך', ctx());
    expect(result.approved).toBe(false);
    expect(result.violations[0].type).toBe('FINANCIAL_PROMISE');
    expect(result.sanitizedResponse).toContain('מנהל הבניין');
  });

  it('blocks financial promises (English)', () => {
    const result = validateAiResponse('I have credited your account with $200', ctx({ lang: 'en' }));
    expect(result.approved).toBe(false);
    expect(result.violations[0].ruleId).toBe('NO_FINANCIAL_PROMISE');
    expect(result.sanitizedResponse).toContain('admin approval');
  });

  it('blocks password reveal', () => {
    const result = validateAiResponse('your password is abc123', ctx({ lang: 'en' }));
    expect(result.approved).toBe(false);
    expect(result.violations[0].type).toBe('PII_EXPOSURE');
  });

  it('blocks admin impersonation', () => {
    const result = validateAiResponse("I've blocked your account permanently", ctx({ lang: 'en' }));
    expect(result.approved).toBe(false);
    expect(result.violations[0].type).toBe('UNAUTHORIZED_ACTION');
  });

  it('warns on emergency topics and appends disclaimer', () => {
    const result = validateAiResponse('יש שריפה בקומה 3, תישאר רגוע', ctx());
    expect(result.approved).toBe(true); // warn, not block
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].type).toBe('EMERGENCY_MISHANDLE');
    expect(result.sanitizedResponse).toContain('101');
  });

  it('warns on legal citations', () => {
    const result = validateAiResponse('according to law 123, you are entitled to refund', ctx({ lang: 'en' }));
    expect(result.approved).toBe(true);
    expect(result.violations.some((v) => v.type === 'HALLUCINATION_RISK')).toBe(true);
  });

  it('isResponseSafe returns boolean', () => {
    expect(isResponseSafe('hello world', ctx())).toBe(true);
    expect(isResponseSafe('אני מזכה לך 100 שקל', ctx())).toBe(false);
  });

  it('getActiveRules returns all rules', () => {
    const rules = getActiveRules();
    expect(rules.length).toBeGreaterThanOrEqual(5);
    expect(rules[0]).toHaveProperty('id');
    expect(rules[0]).toHaveProperty('type');
    expect(rules[0]).toHaveProperty('severity');
    expect(rules[0]).not.toHaveProperty('test'); // test function should not be exposed
  });

  it('handles English lang correctly for replacements', () => {
    const result = validateAiResponse('הסיסמה שלך היא 12345', ctx({ lang: 'en' }));
    expect(result.approved).toBe(false);
    expect(result.sanitizedResponse).toContain('Forgot Password');
  });
});
