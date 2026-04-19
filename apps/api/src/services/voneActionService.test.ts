import { describe, it, expect } from 'vitest';
import { detectIntent, type DetectedIntent } from './voneActionService.js';

describe('VOne Intent Detection', () => {
  const expectAction = (message: string, expected: string) => {
    const intent: DetectedIntent = detectIntent(message);
    expect(intent.action).toBe(expected);
    if (expected !== 'unknown') expect(intent.confidence).toBeGreaterThan(0);
  };

  it('detects fault reports (Hebrew)', () => {
    expectAction('יש לי תקלה במעלית', 'report_fault');
  });

  it('detects fault reports (English)', () => {
    expectAction('The elevator is broken again', 'report_fault');
  });

  it('detects balance check (Hebrew)', () => {
    expectAction('כמה אני חייב?', 'check_balance');
  });

  it('detects balance check (English)', () => {
    expectAction('What is my account balance?', 'check_balance');
  });

  it('detects ticket status (Hebrew)', () => {
    expectAction('מה הסטטוס של הטיפול?', 'check_ticket_status');
  });

  it('detects ticket status (English)', () => {
    expectAction("What's happening with my ticket?", 'check_ticket_status');
  });

  it('detects amenity booking (Hebrew)', () => {
    expectAction('רוצה להזמין חדר כושר', 'schedule_amenity');
  });

  it('detects amenity booking (English)', () => {
    expectAction('Can I book the gym for tomorrow?', 'schedule_amenity');
  });

  it('detects document request (Hebrew)', () => {
    expectAction('אני צריך אישור תושב', 'request_document');
  });

  it('detects escalation (Hebrew)', () => {
    expectAction('אני רוצה לדבר עם מנהל', 'escalate_to_admin');
  });

  it('detects escalation (English)', () => {
    expectAction('I want to speak to the manager', 'escalate_to_admin');
  });

  it('returns unknown for unrelated messages', () => {
    expectAction('מה מזג האוויר היום?', 'unknown');
  });

  it('returns unknown for empty message', () => {
    expectAction('', 'unknown');
  });
});
