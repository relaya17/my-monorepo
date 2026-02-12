# סטטוס יישום – אימות מול תיעוד

**מטרה:** רשימת צ'ק שבודקת שמה שמתועד ב-docs אכן מיושם בקוד. מעודכן: פברואר 2026.

---

## מפת דפים ורקעים

### הדף הראשי (Home) – `/`
| פריט | קובץ |
|------|------|
| קומפוננטה | `apps/web/src/pages/Home.tsx` |
| עיצוב + רקע | `apps/web/src/pages/Home.css` |
| **רקע הדף** | `.home-wrapper` → `background-color: #0a0a0b` (שורה 7)<br>`.home-bg-video` → וידאו full-screen (שורות 12–26)<br>`.home-bg-overlay` → `background: rgba(0, 0, 0, 0.45)` (שורה 51) |

### דף נחיתה (Landing) – `/landing`
| פריט | קובץ |
|------|------|
| קומפוננטה | `apps/web/src/pages/Landing.tsx` |
| עיצוב + רקע | `apps/web/src/pages/Landing.css` |
| **רקע הדף** | `background: #0A0E17` (שורה 10)<br>`.landing-page-bg-video` + `.landing-page-bg-overlay` (שורות 16–35) |

### דף נחיתה צרפתי – `/fr`
| פריט | קובץ |
|------|------|
| קומפוננטה | `apps/web/src/pages/LandingFrWrapper.tsx` (עוטף Landing) |
| עיצוב | `Landing.css` (משותף) |

### Legal Hub – `/legal/:country`
| פריט | קובץ |
|------|------|
| קומפוננטה | `apps/web/src/pages/LegalHubPage.tsx` |
| עיצוב + רקע | `apps/web/src/pages/LegalHubPage.css` |
| **רקע הדף** | `.legal-hub-page` → `background: #0A0E17` (שורה 7–8)<br>`.legal-hub-bg` → `radial-gradient(...)` (שורות 13–22) |

### דפי מדיניות (Privacy, Terms, Accessibility, Security)
| פריט | קובץ |
|------|------|
| קומפוננטות | `apps/web/src/pages/seqerty/PrivacyPolicy.tsx`, `TermsAndConditions.tsx`, `Accessibility.tsx`, `SecurityPolicy.tsx` |
| עיצוב | אין CSS ייעודי – משתמשים ב-Bootstrap (`container`) ובמשתני גלובליים |
| **רקע הדף** | `apps/web/src/index.css` – `body`, `--bg-primary: #ffffff` (שורות 46, 100, 155) |

### משתנים גלובליים לרקע
| משתנה | קובץ | שורה |
|--------|------|------|
| `--bg-primary` | `apps/web/src/index.css` | 46 |
| `--bg-secondary` | `apps/web/src/index.css` | 47 |
| `--bg-card`, `--bg-navbar` | `apps/web/src/index.css` | 48–49 |
| `body { background-color: var(--bg-primary) }` | `apps/web/src/index.css` | 100, 155 |

### טבלת נתיבים → רכיבים
| נתיב | קובץ קומפוננטה | קובץ CSS לרקע |
|------|-----------------|----------------|
| `/` | `Home.tsx` | `Home.css` |
| `/landing` | `Landing.tsx` | `Landing.css` |
| `/fr` | `LandingFrWrapper.tsx` → `Landing` | `Landing.css` |
| `/legal/:country` | `LegalHubPage.tsx` | `LegalHubPage.css` |
| `/privacy-policy`, `/terms-and-conditions`, `/accessibility`, `/security-policy` | `seqerty/*.tsx` | `index.css` (גלובלי) |
| `/mentions-legales`, `/politique-confidentialite`, `/cgu` | `seqerty/*.tsx` | `index.css` |

### קבצי ניתוב (Routing)
| קובץ | תפקיד |
|------|--------|
| `apps/web/src/routs/routes.ts` | הגדרת כל הנתיבים (ROUTES.HOME, ROUTES.LANDING, וכו') |
| `apps/web/src/routs/AppRoutes.tsx` | חיווט Route → קומפוננטה (ממפה נתיב לדף) |

---

## 1. Legal Hub & מדיניות

| טענה | מיקום | סטטוס |
|------|--------|--------|
| Legal Hub – IL/US/GB/FR עם קישורים למסמכים | LegalHubPage.tsx, COUNTRY_CONFIG | ✅ |
| FR: Mentions Légales, Politique, CGU, Accessibilité | links ב-COUNTRY_CONFIG | ✅ |
| FR: "חזרה" מוביל לדף הנחיתה הצרפתי /fr | legal-hub-back Link | 🔧 תוקן – היה LANDING, עודכן ל-LANDING_FR לFR |
| סנכרון שפה לפי אזור (IL→he, US/GB→en, FR→fr) | LegalHubPage useEffect, setLanguage, safeSetItem | ✅ |
| מדיניות פרטיות ישראל – חוק הגנת הפרטיות | translations.ts he.privacy_* | ✅ |
| מדיניות פרטיות US/UK – CCPA, UK GDPR | translations.ts en.privacy_* | ✅ |
| מדיניות צרפת – RGPD, CNIL, Loi Élan | PolitiqueConfidentialiteFR.tsx | ✅ |
| Cookie Banner CNIL – הסכמה, סירוב, העדפות | CookieBanner.tsx | ✅ |
| Cookie Banner מוצג בהקשר צרפתי (lang=fr, /fr, mentions) | CookieBanner isFrenchContext | ✅ |

---

## 2. דפים משפטיים לפי שפה

| דף | ישראל | US/GB | צרפת |
|-----|--------|-------|------|
| מדיניות פרטיות | PrivacyPolicy + he | PrivacyPolicy + en | PolitiqueConfidentialiteFR |
| תנאי שימוש | TermsAndConditions + he | TermsAndConditions + en | CGU |
| הנגשה | Accessibility + he | Accessibility + en (ADA) | Accessibility + fr |
| אבטחה | SecurityPolicy + he | SecurityPolicy + en | — (FR לא מקושר) |

**הערה:** FR מקושר ל-Accessibilité (Accessibility) – יוצג בצרפתית כי lang=fr.

---

## 3. פערים שנותרו (מתוך COMPLIANCE_CHECKLIST)

| פריט | סטטוס | הערה |
|------|--------|------|
| Data Retention Policy | ✅ | `docs/vantera/DATA_RETENTION_POLICY.md` |
| Right to be Forgotten | ✅ | `DELETE /api/user/account`, gdprDeletionService |
| 2FA / MFA | ⏳ | מתוכנן |
| Penetration Test | ⏳ | לבצע – OWASP ZAP או שירות חיצוני |

---

## 4. First Week Sprint – אימות

| # | משימה | אימות בקוד | סטטוס |
|---|--------|-------------|--------|
| 1–5 | env, BuildingStats, VisionLog, 409 כפילות | env.ts, publicRoutes, visionLogModel, maintenanceRoutes | ✅ |
| 6–8 | AI Peacekeeper, similarity, 409 | maintenanceRoutes, maintenanceModel | ✅ |
| 9–11 | Pulse, Anomaly Feed, Global Ledger | super-admin routes, SuperAdminDashboard | ✅ |
| 12–14 | CEO Checklist, צ'קליסט עלייה, VERIFICATION_CHECKLIST | CEOPreLaunchChecklistPage, CEO_VERIFICATION_CHECKLIST | ✅ |

---

## 5. Due Diligence – קבצים

| מסמך/קובץ | קיים? | הערה |
|-----------|-------|------|
| V_ONE_IP_DOCUMENTATION.md | ✅ | |
| MULTI_TENANT_SECURITY.md | ✅ | |
| HSLL_DATABASE_SCHEMA.md | ✅ | |
| TRUST_PRIVACY_STATEMENT.md | ✅ | |
| themeEngine.ts, ThemeContext.tsx | ✅ | DUE_DILIGENCE |
| COMPLIANCE_CHECKLIST.md | ✅ | |
| IMPLEMENTATION_STATUS.md | ✅ | מסמך זה |

---

## 6. Vision → Bot Flow (VISION_SATELLITE_BOT_FLOW)

| רכיב | מיקום | סטטוס |
|------|--------|--------|
| userStatusRoute | openTicketsCount, emergencyDetected, recentVisionAlerts, moneySaved | ✅ |
| voneContext | VOneExtendedContext, buildVOneSystemContext(extended) | ✅ |
| voneChatRoutes | extended context, hints ב-fallback, getOrSetCache ל-Building | ✅ |
| VOneWidget | fetch רק כש-isOpen, הצגת hints בפתיחה | ✅ |
| visionService.saveAnomalyToVisionLog | VisionLog + Peacekeeper + ticket | ✅ |
| visionService.processFrame | Stub – מחכה ל-CV provider | ⏳ |

---

## 7. שינויים שבוצעו במהלך האימות

| תאריך | תיקון |
|-------|--------|
| פברואר 2026 | Legal Hub FR – קישור "חזרה" עודכן מ-LANDING ל-LANDING_FR |
| פברואר 2026 | Vision/Bot – הזרמת openTicketsCount, emergencyDetected, recentVisionAlerts, moneySaved; עדכון VISION_SATELLITE_BOT_FLOW |
| פברואר 2026 | voneContext – 4 טסטים נוספים ל-extended context; PENDING_REQUESTS – Alert→Peacekeeper ✅; visionService JSDoc |
| פברואר 2026 | GDPR – Right to be Forgotten (DELETE /api/user/account), Data Retention Policy, gdprDeletionService |
| פברואר 2026 | ארגון תיעוד – כל המסמכים הועברו ל-`docs/vantera/` |
| פברואר 2026 | Revenue Share Ecosystem – RealEstateLead, V-One Intent (מכירה/השכרה), דשבורד Real Estate Opportunities |

---

*מסמך זה נועד לריצת אימות תקופתית: לעבור על כל שורה, לבדוק בקוד, ולעדכן סטטוס.*
