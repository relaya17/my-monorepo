# HSLL – Master Database Schema (MongoDB / Mongoose)

**ארכיטקטורה:** Multi-tenant, NoSQL. כל אוסף tenant כולל `buildingId` כפילטר ראשוני.  
**הנחיות CTO לבינה:** ראה סעיף "הערות CTO" בסוף המסמך.

---

## 1. Buildings (The Root Tenant)

```ts
const BuildingSchema = {
  _id: ObjectId,
  name: String,
  address: {
    street: String,
    city: String,
    coordinates: { lat: Number, lng: Number }
  },
  settings: {
    aiVisionEnabled: Boolean,
    satelliteFreq: "weekly" | "monthly",
    budgetLimit: Number
  },
  stats: {
    totalMoneySaved: { type: Number, default: 0 },
    preventedFailures: { type: Number, default: 0 }
  }
};
```

**Indexes:** `_id`, `buildingId` (אם משתמשים ב-buildingId כמזהה tenant).  
**מיפוי נוכחי:** `apps/api/src/models/buildingModel.ts` – כרגע יש `address` (string), `buildingNumber`, `committeeName`. להרחבה: להוסיף `name`, `address` כאובייקט, `settings`, `stats`.

---

## 2. Maintenance Tickets (The Heart of the System)

```ts
const TicketSchema = {
  _id: ObjectId,
  buildingId: { type: ObjectId, ref: 'Building', index: true },
  reporterId: { type: ObjectId, ref: 'User' },
  source: "RESIDENT" | "AI_VISION" | "SATELLITE" | "IOT_SENSOR",
  category: "PLUMBING" | "ELECTRICAL" | "ELEVATOR" | "STRUCTURAL" | "CLEANING",
  description: String,
  aiAnalysis: {
    similarityHash: String,   // Used by Peacekeeper to find duplicates
    urgencyScore: { type: Number, min: 1, max: 10 },
    detectedAnomaly: String
  },
  status: "OPEN" | "IN_PROGRESS" | "VERIFIED" | "RESOLVED",
  evidence: {
    images: [String],        // Cloudinary URLs
    voiceNote: String,        // Technician voice recording URL
    aiFrameCapture: String    // Snapshot from CCTV
  },
  technicianReport: {
    summary: String,         // Extracted by Voice-to-Insight AI
    partsUsed: [{ name: String, cost: Number }],
    followUpRequired: Boolean
  },
  createdAt: Date,
  updatedAt: Date
};
```

**Indexes (חובה):**  
- `buildingId`  
- **Compound:** `(buildingId, createdAt)` – לביצועים בדאשבורד המנכ"לית.  
- `(buildingId, status)` – לסינון תקלות פתוחות.

**מיפוי נוכחי:** `maintenanceModel.ts` – יש `title`, `description`, `category`, `status`, `attachments`, `technicianNotes`, `partsReplaced`. חסר: `source`, `aiAnalysis` (כולל `similarityHash`), `evidence.voiceNote`, `evidence.aiFrameCapture`, `technicianReport` (summary, partsUsed עם cost, followUpRequired).

---

## 3. AI Vision Logs (For CEO Dashboard & Anomaly Detection)

```ts
const VisionLogSchema = {
  _id: ObjectId,
  buildingId: { type: ObjectId, ref: 'Building', index: true },
  cameraId: String,
  eventType: "FLOOD_DETECTION" | "OBSTRUCTION" | "UNAUTHORIZED_ENTRY",
  confidence: Number,   // AI confidence score 0-1
  resolved: { type: Boolean, default: false },
  timestamp: Date
};
```

**Indexes:** `buildingId`, `(buildingId, timestamp)`, `(buildingId, resolved)`.  
**מימוש:** `apps/api/src/models/visionLogModel.ts` (נוסף בהתאם למפרט).

---

## 4. Financial Ledger (For AAA Transparency Score)

```ts
const LedgerSchema = {
  _id: ObjectId,
  buildingId: { type: ObjectId, ref: 'Building', index: true },
  ticketId: { type: ObjectId, ref: 'Ticket' },
  amount: Number,
  type: "EXPENSE" | "SAVING",   // SAVING = Money saved by AI optimization
  description: String,
  date: Date
};
```

**Indexes (חובה):**  
- `buildingId`  
- **Compound:** `(buildingId, date)` או `(buildingId, createdAt)` – לדאשבורד ולדוחות שקיפות.

**מיפוי נוכחי:** `transactionModel.ts` – יש `type: income | expense`, `amount`, `relatedMaintenanceId`. ניתן למפות `expense` → Ledger `EXPENSE`, ולהוסיף `type: 'saving'` או אוסף נפרד Ledger ל־SAVING (כסף שנחסך בזכות AI).

---

## הערות CTO לבינה המלאכותית

1. **Multi-Tenancy**  
   "הקפידי שכל שאילתה (Query) ל-Tickets או ל-Ledger תכלול תמיד את ה-`buildingId` כפילטר ראשוני."  
   בקוד: שימוש ב-`tenantMiddleware` + `multiTenancyPlugin` – אין לבצע find/aggregate בלי הקשר tenant.

2. **Indexing**  
   "צרי אינדקסים משולבים (Compound Indexes) על `buildingId` ו-`createdAt` לביצועים מהירים בדאשבורד המנכ"לית."  
   רלוונטי: Maintenance/Ticket, Transaction/Ledger, VisionLog.

3. **AI Peacekeeper**  
   "השתמשי ב-`similarityHash` כדי להשוות תיאורי תקלות חדשים מול תקלות קיימות **ב-30 הימים האחרונים בלבד**."  
   לוגיקה: לפני שמירת ticket חדש – חישוב hash/embedding לתיאור, שאילתה על tickets עם `buildingId` + `status: OPEN` + `createdAt >= now - 30d`, השוואת similarity. אם > threshold (למשל 0.85) – להחזיר `DUPLICATE_ALERT` עם `existingTicketId`.

---

## סיכום מיפוי אוספים

| Target (Schema) | Current model | פעולה |
|-----------------|---------------|--------|
| Building | buildingModel.ts | הרחבה: address object, settings, stats |
| Ticket | maintenanceModel.ts | הרחבה: source, aiAnalysis, evidence.voiceNote/aiFrameCapture, technicianReport |
| VisionLog | — | יצירת visionLogModel.ts |
| Ledger | transactionModel.ts | הרחבה: type כולל SAVING, או אוסף נפרד Ledger |

*מסמך זה הוא המקור האמת למבנה ה-DB. שינויים רק באישור המנכ"לית.*
