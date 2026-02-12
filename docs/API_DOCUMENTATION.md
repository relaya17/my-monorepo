# Vantera API Documentation

**Base URL:** `/api` (prefix for all endpoints unless noted)

**Authentication:** Most endpoints require `Authorization: Bearer <access-token>` (JWT) and `x-building-id` header (tenant context).

**Purpose:** Due Diligence – source of truth for technical acquirers. Code organized like a book.

---

## Quick Reference

| Domain | Prefix | Auth |
|--------|--------|------|
| Public | `/api/public`, `/api/public-stats` | None |
| Auth | `/api/signup`, `/api/login`, `/api/admin` | — |
| Maintenance | `/api/maintenance` | JWT + building |
| V-One AI | `/api/vone`, `/api/feedback`, `/api/user` | JWT |
| Super-Admin (CEO) | `/api/super-admin` | Super-admin JWT |
| Webhooks | `/api/super-admin/webhooks` | Super-admin |
| Stripe | `/api/stripe` | Varies |
| Tech (Magic Link) | `/api/tech` | Token in URL |

---

## 1. Public (No Auth)

### GET /api/public-stats
### GET /api/public/impact-metrics
### GET /api/public/global-impact
### GET /api/public/stats

Global impact metrics for landing page.

**Response:**
```json
{
  "totalMoneySaved": 125000,
  "totalPreventedFailures": 42,
  "averageHappiness": 89,
  "transparencyScore": "AAA"
}
```

### POST /api/public/demo-request

Demo/Lead capture. Saves to Lead collection.

**Body:**
```json
{
  "contactName": "Jane Doe",
  "companyName": "Acme Properties",
  "buildingCount": 5,
  "phone": "+1234567890",
  "source": "landing_demo"
}
```

---

## 2. Authentication

### POST /api/signup

Register new user (resident). Requires `x-building-id`.

**Body:** `{ "email", "password", "name", "apartment?", ... }`

### POST /api/login

User login. Returns `accessToken`, `refreshToken`.

**Body:** `{ "email", "password" }`  
**Headers:** `x-building-id`

### POST /api/admin/login

Admin login. Returns JWT.

**Body:** `{ "username", "password" }`

### POST /api/auth/refresh

Refresh access token.

**Body:** `{ "refreshToken" }` or header `x-refresh-token`

### POST /api/forgot-password/questions

Get security questions by email (for password reset).

### POST /api/forgot-password/reset

Reset password after answering security questions.

---

## 3. Maintenance (AI Peacekeeper, Predictive)

**Headers:** `Authorization: Bearer <token>`, `x-building-id`

### GET /api/maintenance

List maintenance tickets (tenant-scoped).

### GET /api/maintenance/patterns

Pattern analysis – recurrent issues by category (closed tickets).

### GET /api/maintenance/predictions

Predictive warnings – failures likely in next 30 days.

### GET /api/maintenance/:id

Single ticket details.

### POST /api/maintenance

Create ticket. **AI Peacekeeper:** Returns 409 if duplicate (same similarityHash or same category) in last 30 days.

**Body:** `{ "title", "description", "category", "priority?", "reporterId?" }`  
**Response 409:** `{ "error", "duplicateAlert": true, "existingId" }`

### POST /api/maintenance/:id/send-technician

Generate Magic Link for technician. Sends SMS.

**Body:** `{ "phoneNumber" }`  
**Response:** `{ "link", "message" }`

---

## 4. V-One AI

### POST /api/vone/chat

V-One conversational AI. Keywords + optional OpenAI Assistants.

**Headers:** `Authorization`, `x-building-id`  
**Body:** `{ "message", "lang?" }`  
**Response:** `{ "reply", "action?" }` — action: `report`, `account`, or null

### POST /api/feedback

Post-repair feedback (sentiment, rating). V-One Quality Control.

**Body:** `{ "maintenanceId", "rating", "comment?", "sentimentScore?" }`

### GET /api/user/status

User status for V-One personalization (notAtHome, awayUntil, etc.).

---

## 5. Super-Admin (CEO Dashboard)

**Auth:** Super-admin JWT (`Admin.role === 'super-admin'`)

### GET /api/super-admin/activity-stream

Activity feed across buildings.

### GET /api/super-admin/global-stats

Aggregate stats: money saved, prevented failures, buildings.

### GET /api/super-admin/vision-logs

VisionLog (anomaly detection) – with thumbnails.

### GET /api/super-admin/search

Global search across buildings.

### GET /api/super-admin/reconcile

Reconciliation data.

### GET /api/super-admin/global-ledger

Global financial ledger – movements per building.

### GET /api/super-admin/vendor-alerts

Vendors below 4.2 rating (Transparency Ledger).

### GET /api/super-admin/resident-adoption

Resident adoption per building (app download count).

---

## 6. Webhooks (Super-Admin)

### POST /api/super-admin/webhooks/subscribe

Subscribe to webhook events (e.g. `maintenance.created`, `payment.completed`).

**Body:** `{ "url", "events" }`

### GET /api/super-admin/webhooks/list

List active subscriptions.

---

## 7. Vendors (Scores & Alerts)

**Auth:** JWT (admin/CEO)

### GET /api/vendors/scores

Average score per vendor (building-scoped).

### GET /api/vendors/alerts

Vendors with score < 4.2.

---

## 8. Residents & Users

### GET /api/residents

List residents (building-scoped).

### POST /api/residents

Create resident.

### POST /api/residents/invite-bulk

Bulk invite – send welcome emails. **Headers:** Admin JWT, `x-building-id`.

**Body:** `{ "residents": [{ "name", "email", "apartment" }] }`

### GET /api/users

List users (building-scoped).

---

## 9. Payments & Transactions

### POST /api/payments

Create payment.

### GET /api/payments

List payments.

### GET /api/receipt/:id

Generate receipt.

### GET /api/transactions

List transactions (ledger). **Auth:** JWT.

---

## 10. Buildings & Apartments

### GET /api/buildings

List buildings (for building selector). Each item includes optional `branding` (logoUrl, primaryColor, secondaryColor, customDomain) for White-Label Theme Engine.

### GET /api/buildings/branding?buildingId=xxx

White-Label Theme Engine. Returns branding for given building. No auth required (buildingId in query).

**Response:** `{ "buildingId", "branding": { "logoUrl", "primaryColor", "secondaryColor", "customDomain" } }`

### GET /api/apartments/for-sale
### POST /api/apartments/for-sale
### GET /api/apartments/for-rent
### POST /api/apartments/for-rent

Apartment listings.

---

## 11. Health & Monitoring

### GET /api/health

Health check – MongoDB, memory.

### GET /api/health/detailed

Detailed health (DB stats, uptime).

### GET /api/ready

Readiness probe.

---

## 12. Tech Routes (Magic Link – No Auth)

### GET /api/tech/work-order/:token

Technician Magic Link – view work order by token (no login).

### PATCH /api/tech/work-order/:token

Technician update work order (voice summary, parts used).

---

## 13. Stripe

### POST /api/stripe/connect/onboard

Create/link Connect account – return onboarding URL.

### POST /api/stripe/connect/login

Login link for existing Connect Express account.

### GET /api/stripe/connect/status?buildingId=xxx

Connect account status.

### POST /api/stripe/checkout-session

Create checkout session.

**Webhook:** `POST /api/webhooks/stripe` (raw body, Stripe signature verified)

---

## 14. Other

- **Blog:** `GET/POST /api/blog`, `PUT /api/blog/:id`, `POST /api/blog/:id/comments`
- **Files:** `POST /api/files/upload`, `GET /api/files/files`
- **Vote:** `GET/POST /api/vote`, `POST /api/vote/:id/vote`, `POST /api/vote/:id/close`
- **Audit Reports:** `GET/POST /api/audit-reports`, `GET/PATCH /api/audit-reports/:id`
- **AI Analytics:** `GET /api/ai-analytics/insights/:buildingId`, `/financial-analysis`, etc.
- **AI Notifications:** `GET /api/ai-notifications/smart-notifications`, `/realtime-alerts`

---

## Rate Limits

- **Global:** 100 req / 15 min per IP
- **Login:** 5 attempts / 15 min
- **Tenant:** Per-building limits via `tenantLimiter`

---

## Multi-Tenant

All `/api/*` (except `/api/public`, `/api/webhooks/stripe`, `/api/tech`) pass through `tenantMiddleware`.  
Header **`x-building-id`** is required. JWT `buildingId` must match (prevents tenant hopping).

See: `docs/MULTI_TENANT_SECURITY.md`
