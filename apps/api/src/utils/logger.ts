/**
 * Structured logging and 5xx alerting. See TECHNICAL_SPECIFICATION §10.1, §10.2.
 */
import winston from 'winston';
import Transport from 'winston-transport';

const { combine, timestamp, json, errors } = winston.format;

const logLevel = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const baseFormat = combine(
  errors({ stack: true }),
  timestamp({ format: 'iso' }),
  json()
);

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

function sendAlert(message: string, meta: Record<string, unknown>): void {
  const text = `[error] ${message} ${JSON.stringify(meta)}`;
  if (slackWebhook) {
    fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).catch(() => {});
  }
  if (discordWebhook) {
    fetch(discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.slice(0, 2000) }),
    }).catch(() => {});
  }
}

class AlertTransport extends Transport {
  log(info: { level?: string; message?: string; [k: string]: unknown }, callback: () => void) {
    if (info.level === 'error') {
      const meta = { ...info };
      delete meta.level;
      delete meta.message;
      sendAlert(String(info.message ?? ''), meta);
    }
    setImmediate(() => this.emit('logged', info));
    callback();
  }
}

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp: ts, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${ts} [${level}] ${message}${metaStr}`;
      })
    ),
  }),
  new AlertTransport(),
];

if (process.env.NODE_ENV === 'production' && process.env.LOG_PATH) {
  transports.push(
    new winston.transports.File({ filename: process.env.LOG_PATH, format: baseFormat })
  );
}

export const logger = winston.createLogger({
  level: logLevel,
  format: baseFormat,
  defaultMeta: { service: 'api' },
  transports,
});

export function logRequestError(
  statusCode: number,
  path: string,
  message: string,
  reqId?: string,
  buildingId?: string
): void {
  logger.error(message, { path, statusCode, reqId, buildingId });
}
