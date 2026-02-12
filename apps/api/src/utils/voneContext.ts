/**
 * V-One AI Context – system prompt per region (VISION_SATELLITE_BOT_FLOW)
 * When user comes from country: US, use HOA terms, Fahrenheit, dollars.
 * Extended context: open tickets, Vision alerts, emergency, money saved – for OpenAI Assistants.
 */
export interface VOneExtendedContext {
  openTicketsCount?: number;
  recentVisionAlerts?: { eventType: string; cameraId?: string; timestamp?: Date }[];
  emergencyDetected?: boolean;
  moneySaved?: number;
}

export function buildVOneSystemContext(options: {
  country?: string;
  timezone?: string;
  lang?: string;
  extended?: VOneExtendedContext;
}): string {
  const country = (options.country || 'IL').toUpperCase();
  const isUS = country === 'US';
  const ext = options.extended;

  const parts: string[] = [
    `User region: ${country}. Building timezone: ${options.timezone || 'Asia/Jerusalem'}.`,
    isUS
      ? 'Use HOA (Homeowners Association) terminology. State all prices in US dollars only. Use Fahrenheit for temperatures and PSI for water pressure.'
      : 'Use Israeli building/maintenance terminology. State prices in ILS (₪). Use Celsius for temperatures and bar for pressure.',
    'Support multi-lingual context: if user switches to Spanish (e.g. Miami), respond in Spanish without losing context.',
    'US addresses: recognize Zip Code format 12345 or 12345-6789.',
    'REVENUE SHARE: If user expresses intent to sell/rent or High Value phrases (הערכת שווי, מעבר דירה, חוזה שכירות, מחפש קונה, property valuation, lease contract) – tag as Real Estate lead. Acknowledge and inform that the property manager will contact them.',
  ];

  if (ext) {
    if (ext.openTicketsCount != null && ext.openTicketsCount > 0) {
      parts.push(`User has ${ext.openTicketsCount} open maintenance ticket(s). Mention if relevant.`);
    }
    if (ext.emergencyDetected) {
      parts.push('CRITICAL: Emergency detected in building (urgent plumbing/electrical). Advise residents to stay away from affected areas.');
    }
    if (ext.recentVisionAlerts?.length) {
      const alerts = ext.recentVisionAlerts.map((a) => `${a.eventType} (${a.cameraId || 'camera'})`).join('; ');
      parts.push(`Recent AI Vision alerts (unresolved): ${alerts}. If user asks about building status, mention that Vision AI detected issues and tickets were created.`);
    }
    if (ext.moneySaved != null && ext.moneySaved > 0) {
      parts.push(`Building saved ${ext.moneySaved} this period (AI impact). Mention when discussing value.`);
    }
  }

  return parts.join(' ');
}
