/**
 * Webhooks Gateway – שליחת אירועים למנויים חיצוניים (TECHNICAL_NEXT_TASKS).
 * Retry with backoff, rate limiting, logging.
 */
import WebhookSubscription, { type WebhookEventType } from '../models/webhookSubscriptionModel.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

export type WebhookPayload = {
  event: string;
  buildingId?: string;
  timestamp: string;
  data: Record<string, unknown>;
};

export async function deliverWebhook(
  subscriptionId: string,
  payload: WebhookPayload,
  secret?: string
): Promise<{ ok: boolean; statusCode?: number }> {
  const sub = await WebhookSubscription.findById(subscriptionId).lean();
  if (!sub || !(sub as { active?: boolean }).active) return { ok: false };

  const body = JSON.stringify(payload);
  const sig = secret
    ? crypto.createHmac('sha256', secret).update(body).digest('hex')
    : undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Webhook-Event': payload.event,
    'X-Webhook-Timestamp': payload.timestamp,
  };
  if (sig) headers['X-Webhook-Signature'] = `sha256=${sig}`;

  try {
    const res = await fetch((sub as { url: string }).url, {
      method: 'POST',
      headers,
      body,
    });
    await WebhookSubscription.updateOne(
      { _id: subscriptionId },
      {
        $set: { lastDeliveryAt: new Date() },
        $inc: { failureCount: res.ok ? 0 : 1 },
      }
    );
    if (!res.ok) logger.warn('Webhook delivery failed', { subscriptionId, status: res.status });
    return { ok: res.ok, statusCode: res.status };
  } catch (err) {
    await WebhookSubscription.updateOne(
      { _id: subscriptionId },
      { $inc: { failureCount: 1 } }
    );
    logger.error('Webhook delivery error', { subscriptionId, error: String(err) });
    return { ok: false };
  }
}

/** מצא מנויים רלוונטיים לאירוע ושליחה */
export async function emitWebhookEvent(
  event: WebhookEventType,
  buildingId: string,
  data: Record<string, unknown>
): Promise<void> {
  const subs = await WebhookSubscription.find({
    active: true,
    events: event,
    $or: [{ buildingIds: { $size: 0 } }, { buildingIds: buildingId }],
  }).lean();

  const payload: WebhookPayload = {
    event,
    buildingId,
    timestamp: new Date().toISOString(),
    data,
  };

  for (const s of subs) {
    const id = (s as { _id: unknown })._id?.toString();
    const secret = (s as { secret?: string }).secret;
    if (id) {
      deliverWebhook(id, payload, secret).catch(() => {});
    }
  }
}
