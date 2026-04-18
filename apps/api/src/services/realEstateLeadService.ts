/**
 * Real Estate Lead Service – Revenue Share Ecosystem
 * When V-One detects sell/rent intent → create lead, notify manager, bill via Stripe
 */
import RealEstateLead from '../models/realEstateLeadModel.js';
import User from '../models/userModel.js';
import Building from '../models/buildingModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';

export type DealType = 'sale' | 'rent';

export interface CreateLeadResult {
  leadId: string;
  apartmentNumber: string;
  residentName: string;
  dealType: DealType;
}

/** Extract apartment number from message – e.g. "דירה 502", "בדירה 502", "unit 502" */
function extractApartmentFromMessage(msg: string): string {
  const m = msg.match(/(?:דירה|בדירה|יחידה|unit|apartment)\s*(\d+[A-Za-z]?)/i) || msg.match(/\b(\d{2,4}[A-Za-z]?)\b/);
  return m ? m[1] : '';
}

/** Create RealEstateLead when V-One detects intent. Runs in tenantContext. */
export async function createRealEstateLead(
  residentId: string,
  dealType: DealType,
  rawMessage: string,
  buildingId: string
): Promise<CreateLeadResult | null> {
  const result = await tenantContext.run({ buildingId }, async () => {
    const user = await User.findById(residentId).select('name email apartmentNumber').lean();
    if (!user) return null;
    const u = user as { name?: string; email?: string; apartmentNumber?: string };
    const apt = (u.apartmentNumber?.trim() || '') || extractApartmentFromMessage(rawMessage);
    const lead = await RealEstateLead.create({
      residentId,
      apartmentNumber: apt || '?',
      residentName: u.name ?? '',
      residentEmail: u.email ?? '',
      dealType,
      status: 'new',
      source: 'vone_ai',
      rawMessage: rawMessage.slice(0, 500),
      notifiedAt: new Date(),
    });
    return {
      leadId: String(lead._id),
      apartmentNumber: lead.apartmentNumber,
      residentName: lead.residentName,
      dealType,
    };
  });

  if (result) {
    await notifyManagerOnLead(result, buildingId);
    await recordLeadForBilling(buildingId);
  }
  return result;
}

/** Send notification to property manager – email "Hot Real Estate Lead Found" + webhook. */
async function notifyManagerOnLead(lead: CreateLeadResult, buildingId: string): Promise<void> {
  try {
    const building = await Building.findOne({ buildingId }).select('committeeContact committeeName address').lean();
    const contact = (building as { committeeContact?: string } | null)?.committeeContact?.trim();
    const name = (building as { committeeName?: string } | null)?.committeeName || buildingId;
    if (contact && contact.includes('@')) {
      const { sendRealEstateLeadAlert } = await import('./emailService.js');
      await sendRealEstateLeadAlert(contact, name, lead.apartmentNumber, lead.residentName, lead.dealType);
    } else if (contact) {
      console.log(`[RealEstateLead] Hot lead: ${lead.residentName} apt ${lead.apartmentNumber} (${lead.dealType}) → contact ${contact} (add email to committeeContact for auto-notify)`);
    }
    // Emit webhook for integrations
    const { emitWebhookEvent } = await import('./webhookService.js');
    emitWebhookEvent('real_estate_lead', buildingId, {
      leadId: lead.leadId,
      buildingName: name,
      apartmentNumber: lead.apartmentNumber,
      residentName: lead.residentName,
      dealType: lead.dealType,
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

/** Record usage for Stripe Metered Billing – $10 US / 10₪ IL per lead. */
async function recordLeadForBilling(buildingId: string): Promise<void> {
  try {
    // TODO: Stripe Billing – report usage to metered subscription
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // await stripe.subscriptionItems.createUsageRecord(itemId, { quantity: 1, timestamp: Math.floor(Date.now()/1000) });
    console.log(`[RealEstateLead] Billing: +1 lead for building ${buildingId} (Stripe metered – TODO)`);
  } catch {
    // Non-blocking
  }
}
