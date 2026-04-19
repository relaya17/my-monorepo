/**
 * Unit system – Metric vs Imperial
 */
export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface UnitsConfig {
  system: UnitSystem;
  temperature: 'celsius' | 'fahrenheit';
  pressure: 'bar' | 'psi';
}

export const UNITS: Record<UnitSystem, UnitsConfig> = {
  METRIC: {
    system: 'METRIC',
    temperature: 'celsius',
    pressure: 'bar',
  },
  IMPERIAL: {
    system: 'IMPERIAL',
    temperature: 'fahrenheit',
    pressure: 'psi',
  },
};

export function getUnitsForCountry(country: string): UnitSystem {
  if (country === 'US') return 'IMPERIAL';
  return 'METRIC';
}
