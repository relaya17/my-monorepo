/**
 * Centralized env config validated with Zod (HSLL Enterprise).
 * App fails fast at startup if required vars are missing.
 */
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3008').transform(Number).pipe(z.number().min(1).max(65535)),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(1).optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().url().optional().or(z.literal('')),
  CORS_ORIGIN: z.string().optional(),
  LANDING_PAGE_ORIGIN: z.string().url().optional().or(z.literal('')),
  FRONTEND_URL: z.string().url().optional().or(z.literal('')),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PLATFORM_FEE_BPS: z.string().optional(),
  CLIENT_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  LOG_LEVEL: z.string().optional(),
  LOG_PATH: z.string().optional(),
  AI_CRON_ENABLED: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.union([z.string().email(), z.literal('')]).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const msg = parsed.error.flatten().fieldErrors;
  const lines = Object.entries(msg).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`);
  throw new Error(`Env validation failed:\n${lines.join('\n')}`);
}

const env = parsed.data;

if (env.NODE_ENV === 'production') {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32)
    throw new Error('In production JWT_SECRET must be set and at least 32 characters');
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  jwt: {
    secret: env.JWT_SECRET ?? 'default-secret-change-in-production',
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  redisUrl: env.REDIS_URL || undefined,
  corsOrigin: env.CORS_ORIGIN,
  landingPageOrigin: env.LANDING_PAGE_ORIGIN || undefined,
  frontendUrl: env.FRONTEND_URL || 'http://localhost:5173',
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    platformFeeBps: env.STRIPE_PLATFORM_FEE_BPS,
    clientUrl: env.CLIENT_URL,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  alerts: {
    slackWebhookUrl: env.SLACK_WEBHOOK_URL,
    discordWebhookUrl: env.DISCORD_WEBHOOK_URL,
  },
  log: { level: env.LOG_LEVEL, path: env.LOG_PATH },
  aiCronEnabled: env.AI_CRON_ENABLED !== 'false',
  openaiApiKey: env.OPENAI_API_KEY,
  resendApiKey: env.RESEND_API_KEY || undefined,
  emailFrom: env.EMAIL_FROM || 'Vantera <onboarding@vantera.co.il>',
} as const;

export type Config = typeof config;
