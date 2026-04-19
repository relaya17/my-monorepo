/**
 * Unit tests for env config validation (Zod schema).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Prevent dotenv from loading .env file during tests
vi.mock('dotenv', () => ({ default: { config: () => ({}) }, config: () => ({}) }));

describe('env config validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Remove values that dotenv would have loaded before mock was applied
    delete process.env.MONGO_URI;
    delete process.env.JWT_SECRET;
    delete process.env.PORT;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('loads successfully with minimal required env vars', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3008';

    const { config } = await import('./env.js');
    expect(config.mongoUri).toBe('mongodb://localhost:27017/test_db');
    expect(config.port).toBe(3008);
    expect(config.nodeEnv).toBe('development');
  });

  it('defaults PORT to 3008 when not set', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    delete process.env.PORT;

    const { config } = await import('./env.js');
    expect(config.port).toBe(3008);
  });

  it('defaults NODE_ENV to development', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    delete process.env.NODE_ENV;

    const { config } = await import('./env.js');
    expect(config.nodeEnv).toBe('development');
  });

  it('throws when MONGO_URI is missing', async () => {
    delete process.env.MONGO_URI;
    process.env.NODE_ENV = 'development';

    await expect(import('./env.js')).rejects.toThrow();
  });

  it('throws in production when JWT_SECRET is too short', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/prod';
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'short';

    await expect(import('./env.js')).rejects.toThrow(/JWT_SECRET/);
  });

  it('passes in production with valid JWT_SECRET (32+ chars)', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/prod';
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'a'.repeat(32);

    const { config } = await import('./env.js');
    expect(config.jwt.secret).toBe('a'.repeat(32));
  });

  it('parses optional Stripe config', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

    const { config } = await import('./env.js');
    expect(config.stripe.secretKey).toBe('sk_test_123');
    expect(config.stripe.webhookSecret).toBe('whsec_123');
  });

  it('uses fallback JWT secret in dev when not set', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;

    const { config } = await import('./env.js');
    expect(config.jwt.secret).toBe('default-secret-change-in-production');
  });
});
