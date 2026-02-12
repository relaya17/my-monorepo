# Compliance Checklist – התאמה לשווקים בינלאומיים

**מסמך למשקיעים וללקוחות:** תיעוד עמידה בתקני אבטחה ופרטיות.

---

## 1. GDPR (אירופה)

| פריט | סטטוס | תיעוד |
|------|-------|-------|
| מדיניות פרטיות | ✅ | `PolitiqueConfidentialiteFR.tsx` (צרפת), דפי Privacy |
| Cookie Banner (CNIL) | ✅ | `CookieBanner.tsx` – הסכמה, סירוב, העדפות |
| Legal Hub | ✅ | `LegalHubPage.tsx` – FR/IL/US/GB |
| Data Retention Policy | ✅ | `docs/vantera/DATA_RETENTION_POLICY.md` – תקופות, Right to be Forgotten |
| Right to be Forgotten | ✅ | `DELETE /api/user/account` – gdprDeletionService, אנונימיזציה |

---

## 2. SOC2 (ארה"ב – אבטחת מידע)

| פריט | סטטוס | תיעוד |
|------|-------|-------|
| הצפנה AES-256 | 🏗 | `TRUST_PRIVACY_STATEMENT.md` |
| Audit Logs | ✅ | `AuditLog` model – רישום פעולות רגישות |
| Data Isolation (Multi-Tenant) | ✅ | `MULTI_TENANT_SECURITY.md`, `multiTenancyPlugin` |
| 2FA / MFA | ⏳ | מתוכנן |
| Penetration Test | ⏳ | **לבצע** – OWASP ZAP או שירות חיצוני |

---

## 3. Penetration Test

**הנחיה לטכנאי:**

1. הרץ OWASP ZAP או בדיקה חיצונית על:
   - `/api/*` – endpoints ציבוריים ומוגנים
   - דפי login, reset password
   - Webhooks (חתימה, replay)

2. ודא:
   - אין SQL Injection
   - אין XSS ב-input fields
   - Headers אבטחה (CSP, HSTS)
   - Rate limiting על endpoints רגישים

3. תעד תוצאות:
   - טבלה: Finding | Severity | Status
   - אם נמצאו findings – לתקן ולתעד

---

## 4. קבצים רלוונטיים

| קובץ | תיאור |
|------|-------|
| `DATA_RETENTION_POLICY.md` | שמירת נתונים, Right to be Forgotten |
| `TRUST_PRIVACY_STATEMENT.md` | אמון, פרטיות, Privacy by Design |
| `apps/web/src/components/CookieBanner.tsx` | CNIL compliant |
| `apps/web/src/pages/seqerty/PolitiqueConfidentialiteFR.tsx` | RGPD/CNIL |
| `docs/vantera/MULTI_TENANT_SECURITY.md` | בידוד נתונים בין tenants |
