# הפרדת נתונים: דף נחיתה מול אפליקציה

## עקרון

- **Public (דף נחיתה):** מספרים כלליים בלבד – "כמה כסף המערכת חסכה לכלל הבניינים", "כמה תקלות נמנעו". בלי שמות דיירים, בניינים או נתונים מזהים.
- **Private (Web App):** כל הנתונים הרגישים – דאשבורד מנכ"לית, דיירים, תשלומים, תקלות לפי בניין – דורשים אימות ו־tenant context.

## Public Endpoints (ללא אימות)

| Endpoint | תיאור |
|----------|--------|
| `GET /api/public-stats` | מדדי השפעה גלובליים (חיסכון, תקלות נמנעו, ציון) – **alias** לאותם נתונים. |
| `GET /api/public/impact-metrics` | אותו מידע – מקור ראשי לדף הנחיתה. |
| `GET /api/public/global-impact` | alias זהה. |
| `GET /api/public/stats` | alias זהה. |
| `POST /api/public/demo-request` | ליד Enterprise Demo – body: contactName, companyName, buildingCount, phone. נשמר ב-Lead (CRM). ללא אימות. |

**מקור נתונים:** טבלת `BuildingStats` בלבד. אגרגציה גלובלית (`$group`), ללא חשיפת `buildingId` או PII.

**טיפוס תגובה:** תואם ל־`GlobalImpactResponse` ב־`packages/shared` (מקור אמת יחיד לטיפוס בצד הלקוח).

## Private (תחת Tenant)

כל השאר תחת `/api` עובר דרך `tenantMiddleware` ו־multi-tenancy plugin – ראה [MULTI_TENANT_SECURITY.md](MULTI_TENANT_SECURITY.md).
