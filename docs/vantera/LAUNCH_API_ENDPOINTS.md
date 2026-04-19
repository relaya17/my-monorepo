# API Endpoints להשקה – LAUNCH_STRATEGY

## 1. Bulk Resident Invite (Onboarding Email)

**`POST /api/residents/invite-bulk`**

שולח מייל welcome לכל דייר ברשימה. דורש הרשאת אדמין.

**Headers:**
- `Authorization: Bearer <access-token>` (JWT מאדמין)
- `x-building-id`: מזהה הבניין (או `buildingId` ב-body)

**Body:**
```json
{
  "residents": [
    { "name": "ישראל ישראלי", "email": "israel@example.com", "apartment": "12" },
    { "name": "משה כהן", "email": "moshe@example.com", "apartment": "5" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 מיילים נשלחו בהצלחה",
  "sent": 2,
  "total": 2,
  "failed": 0
}
```

**Env:** `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL` (ללינק באפליקציה)

---

## 2. Resident Adoption Dashboard

**`GET /api/super-admin/resident-adoption`**

מחזיר כמה דיירים (משתמשים עם role=tenant) נרשמו בכל בניין. דורש super-admin.

**Headers:**
- `Authorization: Bearer <super-admin-token>`

**Response:**
```json
{
  "items": [
    { "buildingId": "default", "buildingName": "בניין דוגמה", "appDownloadedCount": 42 },
    { "buildingId": "tel-aviv-1", "buildingName": "רחוב הרצל 10", "appDownloadedCount": 18 }
  ],
  "total": 60
}
```

**Frontend:** יש להוסיף מסך ב-CEO/Super-Admin Dashboard שמציג את הנתונים.
