/**
 * Theme Engine – White-Label branding.
 * Swap logo, colors in 5 minutes. CSS variables: --brand-primary, --brand-secondary, --brand-logo.
 */
export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
}

const DEFAULTS = {
  primaryColor: '#007AFF',
  secondaryColor: '#5856D6',
};

export function applyBranding(branding?: TenantBranding | null): void {
  const root = document.documentElement;
  if (!branding) {
    root.style.setProperty('--brand-primary', DEFAULTS.primaryColor);
    root.style.setProperty('--brand-secondary', DEFAULTS.secondaryColor);
    root.style.setProperty('--brand-logo', 'none');
    return;
  }
  root.style.setProperty('--brand-primary', branding.primaryColor ?? DEFAULTS.primaryColor);
  root.style.setProperty('--brand-secondary', branding.secondaryColor ?? DEFAULTS.secondaryColor);
  root.style.setProperty('--brand-logo', branding.logoUrl ? `url(${branding.logoUrl})` : 'none');
}
