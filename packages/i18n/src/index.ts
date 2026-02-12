/**
 * @vantera/i18n – Translation keys. Load JSON at runtime in app.
 */
export type LangCode = 'he' | 'en' | 'es' | 'ar' | 'ru' | 'fr';

export const RTL_LANGS: LangCode[] = ['he', 'ar'];

/** Translation keys – ensure these exist in locales/*.json */
export type I18nKey =
  | 'leak_detected'
  | 'fault_reported'
  | 'report_fault'
  | 'fault_category'
  | 'fault_priority'
  | 'submit_report'
  | 'report_success'
  | 'login_required'
  | 'login_to_report'
  | 'back'
  | 'plumbing'
  | 'electrical'
  | 'elevator'
  | 'cleaning'
  | 'security'
  | 'other'
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'dishwasher'
  | 'garbage_disposal'
  | 'vone_report_reply';
