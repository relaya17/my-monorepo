// routes.ts
const ROUTES = {
  HOME: "/",
  LANDING: "/landing",
  LANDING_INSIGHTS: "/insights",
  LANDING_TECHNICIAN: "/landing/technician",
  LANDING_RESIDENT: "/landing/resident",
  REGISTER: "/register",
  LOGIN: "/login",
  RESIDENT_FORM: "/resident-form",
  EMPLOYEE_MANAGEMENT: "/employee-management",
  NEW_RESIDENT_APPROVAL: "/new-resident-approval",
  REPAIR_TRACKING: "/repair-tracking",
  GARDENING: "/gardening",
  FOR_RENT: "/for-rent",
  FOR_SALE: "/for-sale",

  THANK_YOU: "/thank-you",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_AND_CONDITIONS: "/terms-and-conditions",
  ACCESSIBILITY: "/accessibility",
  SECURITY_POLICY: "/security-policy",
  CREATE_ADMIN_PASSWORD: "/create-admin-password",
  USER_DETAILS: "/user-details/:id",
  USERS_LIST: "/users-list",
  USER_MANAGEMENT: "/user-management",
  SIGN_UP: "/sign-up",
  CHECK_OUT: "/check-out",
  ADMIN_DASHBOARD: "/admin-dashboard",
  ADMIN_LOGIN: "/admin-login",
  SELECT_BUILDING: "/select-building",
  CHANGE_PASSWORD: "/change-password",
  USER_LOGIN: "/user-login",
  FORGOT_PASSWORD: "/forgot-password",
  USER_DASHBOARD: "/user-dashboard",
  RECEIPT: "/receipt",
  VOTING: "/voting",
  RESIDENT_HOME: "/resident-home",
  REPORT_FAULT: "/report-fault",
  COMMUNITY_WALL: "/community-wall",
  AI_DASHBOARD: "/ai-dashboard",
  PAYMENT_MANAGEMENT: "/payment-management",
  APARTMENT_MANAGEMENT: "/apartments",
  REPORTS_DASHBOARD: "/reports-dashboard",
  MAINTENANCE_MANAGEMENT: "/maintenance",
  SYSTEM_SETTINGS: "/settings",
  CONTRACTS_AND_LETTERS: "/contracts-letters",
  SAFE_ZONE: "/safe-zone",
  B2B_REGISTER: "/enterprise-register",
  /** Friendly URL for SEO: vantera.co.il/contractors-join */
  CONTRACTORS_JOIN: "/contractors-join",
  /** Friendly URL for SEO: vantera.co.il/companies-management */
  COMPANIES_MANAGEMENT: "/companies-management",
  SALES_TOOLKIT: "/sales-toolkit",
  /** CEO: מעקב הורדות אפליקציה לפי בניין */
  RESIDENT_ADOPTION: "/resident-adoption",
  /** אדמין: הזמנת דיירים ושליחת מייל onboarding */
  RESIDENT_INVITE: "/resident-invite",
  /** CEO: דשבורד מאוחד */
  SUPER_ADMIN_DASHBOARD: "/ceo",
  /** בלוג שיווקי – מאמרים לסמכות דומיין */
  BLOG: "/blog",
  /** מאמר בודד */
  BLOG_ARTICLE: "/blog/:slug",
  /** דף נחיתה צרפתי – vantera.fr/fr */
  LANDING_FR: "/fr",
  /** דפים משפטיים צרפתיים (CNIL, Loi Élan) */
  MENTIONS_LEGALES: "/mentions-legales",
  POLITIQUE_CONFIDENTIALITE: "/politique-confidentialite",
  CGU: "/cgu",
  /** דף חוקים ומדיניות לפי מדינה – נראה מלכותי */
  LEGAL: "/legal",
  LEGAL_COUNTRY: "/legal/:country",
};

export default ROUTES;
