/**
 * Shared validation helpers (no duplication across login, signup, forgot-password).
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export interface PasswordValidation {
  isValid: boolean;
  message: string;
}

export function validatePassword(password: string): PasswordValidation {
  if (password.length < 6) {
    return { isValid: false, message: 'הסיסמה חייבת להיות לפחות 6 תווים' };
  }
  if (password.length > 50) {
    return { isValid: false, message: 'הסיסמה לא יכולה להיות יותר מ-50 תווים' };
  }
  return { isValid: true, message: '' };
}

export interface NameValidation {
  isValid: boolean;
  message: string;
}

export function validateName(name: string): NameValidation {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'השם חייב להיות לפחות 2 תווים' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, message: 'השם לא יכול להיות יותר מ-50 תווים' };
  }
  return { isValid: true, message: '' };
}
