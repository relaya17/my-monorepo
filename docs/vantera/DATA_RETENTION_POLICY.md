# Data Retention Policy – מדיניות שמירת נתונים

**מסמך למשקיעים, ללקוחות ול-RGDP/GDPR. עודכן: פברואר 2026.**

---

## 1. עקרונות

- **מינימליזם:** שומרים רק what is strictly necessary לתפעול ולחובה חוקית
- **אנונימיזציה:** כאשר מחיקה מלאה אינה אפשרית (רישומי עסקים) – אנונימיזציה בלתי הפיכה
- **Right to be Forgotten:** משתמש יכול לבקש מחיקת חשבון – `DELETE /api/user/account`

---

## 2. תקופות שמירה לפי סוג נתון

| סוג נתון | תקופה | הערה |
|----------|--------|------|
| **נתוני משתמש (PII)** | עד בקשה למחיקה | שם, אימייל, דירה – נשמרים כל עוד החשבון פעיל |
| **מחיקת חשבון** | אנונימיזציה מיידית | `gdprDeletionService` – name→[Deleted], email→deleted_...@gdpr.deleted |
| **Refresh Tokens** | עד logout או 7 ימים | TTL – נמחקים בעת מחיקת חשבון |
| **תקלות (Maintenance)** | ללא הגבלה | רישומים עסקיים – reporter מזוהה כאנונימי לאחר מחיקה |
| **תשלומים (Payment)** | 7 שנים | דרישה חשבונאית/מס |
| **תנועות כסף (Transaction)** | 7 שנים | דרישה חשבונאית |
| **Audit Log** | 2 שנים | פעולות רגישות – לצורכי אבטחה |
| **Vision Log** | 90 יום | תיעוד מצלמות AI – לאחר מכן ארכוב או מחיקה |
| **Feedback תקלות** | 2 שנים | דירוגי טכנאים |

---

## 3. Right to be Forgotten (GDPR Art. 17)

**Endpoint:** `DELETE /api/user/account` (נדרש JWT של דייר)

**פעולות:**
1. אנונימיזציה: User – name, email, password, securityQuestions
2. מחיקת sessions: כל ה-RefreshTokens של המשתמש
3. רישומים שמפנים למשתמש (Maintenance, Payment, Voting) – נשארים; ה-User כבר anonymized

**מיקום:** `apps/api/src/services/gdprDeletionService.ts`, `apps/api/src/routes/userStatusRoute.ts`

---

## 4. ארכוב ומחיקה אוטומטית

| תהליך | תדירות | תיאור |
|-------|--------|--------|
| RefreshToken TTL | MongoDB TTL Index | תפוגה אוטומטית לפי `expiresAt` |
| VisionLog | 🔲 Roadmap | Cron – מחיקה/ארכוב אחרי 90 יום |
| AuditLog | 🔲 Roadmap | ארכוב אחרי 2 שנים |

---

## 5. קבצים רלוונטיים

| קובץ | תיאור |
|------|--------|
| `gdprDeletionService.ts` | אנונימיזציית משתמש ומחיקת tokens |
| `userStatusRoute.ts` | DELETE /api/user/account |
| `COMPLIANCE_CHECKLIST.md` | Data Retention, Right to be Forgotten |
| `TRUST_PRIVACY_STATEMENT.md` | Privacy by Design |

---

*מסמך זה משלים את COMPLIANCE_CHECKLIST ו-IMPLEMENTATION_STATUS.*
