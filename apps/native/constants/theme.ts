/** Vantera design tokens — single source of truth for the native app. */

export const Colors = {
  primary: '#1E3A8A',      // brand blue
  primaryLight: '#3B82F6',
  primaryDark: '#1E2D6A',
  accent: '#10B981',       // green — success / positive
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#0A0E17',   // dark background
  surface: '#111827',
  surfaceAlt: '#1F2937',
  border: '#374151',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textDisabled: '#4B5563',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 30,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
