/**
 * Unit tests for V-One AI Context – Core IP validation.
 */
import { describe, it, expect } from 'vitest';
import { buildVOneSystemContext } from './voneContext';

describe('buildVOneSystemContext', () => {
  it('includes region and timezone for IL', () => {
    const ctx = buildVOneSystemContext({ country: 'IL' });
    expect(ctx).toContain('User region: IL');
    expect(ctx).toContain('Asia/Jerusalem');
    expect(ctx).toContain('ILS');
    expect(ctx).toContain('Celsius');
  });

  it('uses HOA and Fahrenheit for US', () => {
    const ctx = buildVOneSystemContext({ country: 'US' });
    expect(ctx).toContain('User region: US');
    expect(ctx).toContain('HOA');
    expect(ctx).toContain('Fahrenheit');
    expect(ctx).toContain('US dollars');
  });

  it('defaults to IL when country is empty', () => {
    const ctx = buildVOneSystemContext({});
    expect(ctx).toContain('IL');
  });

  it('accepts custom timezone', () => {
    const ctx = buildVOneSystemContext({ country: 'IL', timezone: 'America/New_York' });
    expect(ctx).toContain('America/New_York');
  });

  it('includes extended context when openTicketsCount > 0', () => {
    const ctx = buildVOneSystemContext({ country: 'IL', extended: { openTicketsCount: 2 } });
    expect(ctx).toContain('2 open maintenance ticket');
  });

  it('includes emergency warning when emergencyDetected', () => {
    const ctx = buildVOneSystemContext({ country: 'IL', extended: { emergencyDetected: true } });
    expect(ctx).toContain('Emergency detected');
    expect(ctx).toContain('CRITICAL');
  });

  it('includes recent Vision alerts when present', () => {
    const ctx = buildVOneSystemContext({
      country: 'IL',
      extended: { recentVisionAlerts: [{ eventType: 'FLOOD_DETECTION', cameraId: 'B2' }] },
    });
    expect(ctx).toContain('Vision alerts');
    expect(ctx).toContain('FLOOD_DETECTION');
  });

  it('includes money saved when > 0', () => {
    const ctx = buildVOneSystemContext({ country: 'IL', extended: { moneySaved: 1500 } });
    expect(ctx).toContain('1500');
    expect(ctx).toContain('saved');
  });
});
