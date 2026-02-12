/**
 * V-One AI Context – system prompt per region
 * When user comes from country: US, use HOA terms, Fahrenheit, dollars.
 * All dates in DB are UTC; convert only in UI.
 */
export function buildVOneSystemContext(options: {
  country?: string;
  timezone?: string;
  lang?: string;
}): string {
  const country = (options.country || 'IL').toUpperCase();
  const isUS = country === 'US';

  const parts: string[] = [
    `User region: ${country}. Building timezone: ${options.timezone || 'Asia/Jerusalem'}.`,
    isUS
      ? 'Use HOA (Homeowners Association) terminology. State all prices in US dollars only. Use Fahrenheit for temperatures and PSI for water pressure.'
      : 'Use Israeli building/maintenance terminology. State prices in ILS (₪). Use Celsius for temperatures and bar for pressure.',
    'Support multi-lingual context: if user switches to Spanish (e.g. Miami), respond in Spanish without losing context.',
    'US addresses: recognize Zip Code format 12345 or 12345-6789.',
  ];

  return parts.join(' ');
}
