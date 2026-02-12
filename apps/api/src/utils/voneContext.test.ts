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
});
