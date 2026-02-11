/**
 * Sends alert to Slack/Discord on 5xx so the team is notified.
 */
import type { Request, Response, NextFunction } from 'express';

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

function sendAlert(message: string, meta: Record<string, unknown>): void {
  const text = `[5xx Alert] ${message} ${JSON.stringify(meta)}`;
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

export function errorAlertMiddleware(err: Error, _req: Request, _res: Response, next: NextFunction): void {
  const status = (err as Error & { status?: number }).status;
  if ((status !== undefined && status >= 500) || (status === undefined && err.message)) {
    sendAlert(err.message, { stack: err.stack, name: err.name });
  }
  next(err);
}
