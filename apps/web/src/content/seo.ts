/**
 * SEO – כותרות ותיאורים לכל עמוד (Google, Open Graph).
 * מעודכן לפי האסטרטגיה: דף הבית, B2B, ספקים.
 */

export const SEO = {
  /** 1. דף הבית (עבור כולם) */
  home: {
    title: 'Vantera | ניהול נכסים בסטנדרט אחר - אבטחה ורווח בטכנולוגיית AI',
    description:
      'הפלטפורמה הראשונה בעולם שהופכת את ניהול הנכס למקור הכנסה. אבטחה לוויינית, ניטור AI וזירת ספקים ב-GPS בזמן אמת. גלו את הסטנדרט החדש.',
  },

  /** 2. עמוד חברות ניהול ואחזקה (B2B) */
  b2b: {
    title: 'ניהול נכסים חכם לחברות אחזקה | מקסום רווחים עם Vantera',
    description:
      'הפסיקו להוציא כסף על תפעול והתחילו להרוויח. הצטרפו ל-Vantera ותהנו ממודל Revenue Share על כל שירות בבניין, ניטור לווייני וניהול ספקים חכם.',
  },

  /** 3. עמוד הצטרפות ספקים (קבלנים) */
  contractors: {
    title: 'דרושים קבלנים ובעלי מקצוע לניהול נכסי יוקרה | Vantera Pro',
    description:
      'הגדילו את כמות הקריאות שלכם ללא עלויות שיווק. הצטרפו לנבחרת הספקים המורשים של Vantera, קבלו גישה ל-GPS Radar ותיהנו ממערכת תשלומים מובטחת.',
  },
} as const;

/** Schema.org SoftwareApplication – כוכבים ואייקון בתוצאות חיפוש */
export const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vantera',
  operatingSystem: 'iOS, Android, Web',
  applicationCategory: 'BusinessApplication',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '120',
  },
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'ILS',
  },
} as const;
