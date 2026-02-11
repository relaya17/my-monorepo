# HSLL Technical Specification & Roadmap

**Version:** 1.1 (merged)  
**Architecture:** Monorepo  
**Focus:** AI-Driven Property Management, Enterprise-Grade

---

## 1. Project Architecture (Monorepo Structure)

Single Source of Truth, zero code duplication.

| Path | Purpose | Status |
|------|---------|--------|
| **/packages/shared** | Type definitions, validation (Zod/Joi), shared utilities | ✅ `packages/shared` – `types/domain.ts` (Building, User, BuildingMetrics, MaintenanceTicket, Transaction). |
| **/apps/api** | Node.js/Express backend, multi-tenant | ✅ Express, Mongoose, `tenantMiddleware` + `multiTenancy` plugin, JWT, RBAC. |
| **/apps/web** | React for Residents, Committee, CEO Dashboard | ✅ React (Vite). |
| **/apps/landing-page** | Optional marketing site with live data | 🔲 Or use `apps/web` public routes. Public API: `GET /api/public/impact-metrics`. |

### Global configuration (Enterprise)

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Centralized Config** | Zod-validated config – .env (Stripe, Cloudinary, Redis, Mongo) before app starts | ✅ `config/env.ts` + Zod. |
| **Rate Limiting** | Global (100 req/15min), Auth (5/hr), Tenant (per building) | ✅ `rateLimiter.ts`: globalLimiter, loginLimiter, tenantLimiter. |
| **Sanitization** | Strip `$`, `.`, `__proto__` from body/query/params (NoSQL injection) | ✅ `sanitizationMiddleware.ts`. |
| **Tenant Context** | AsyncLocalStorage + `buildingId` for Mongoose plugin | ✅ `tenantMiddleware.ts` + `multiTenancy.ts`. |

---

## 2. Core Backend & Database Integrity

### Multi-Tenancy & Security

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Data isolation** | Every query scoped by `buildingId` | ✅ `tenantMiddleware.ts` + `multiTenancy.ts` (AsyncLocalStorage, pre hooks). |
| **Authentication** | JWT + RBAC: Resident, Committee, Technician, CEO | ✅ JWT in `utils/jwt.ts`; User + Admin table; `authMiddleware`, `verifySuperAdmin`. |
| **Public API** | Landing page – aggregated, non-sensitive | ✅ `publicRoutes.ts` – GET `/api/public/impact-metrics`, `/api/public/global-impact`. CORS via `LANDING_PAGE_ORIGIN`. |

### Database & logic integrity

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **One User model** | Roles: Resident, Committee, Tech; Admin table for CEO login | ⚠️ User + Admin table; JWT aligned. |
| **One Transaction model** | Unify Income (Dues) and Expenses for CEO reconciliation | ✅ `transactionModel.ts`, `transactionService.ts`; Payment + Maintenance. |
| **No-Delete Policy** | Soft deletes; CEO audit | ✅ `softDeletePlugin.ts` on Maintenance; CEO can query `isDeleted: true`. |
| **AI – Financial Health** | Monthly reconciliation (Income vs Expense) | ✅ `reconciliationService.ts`; GET `/api/super-admin/reconcile?buildingId=&month=YYYY-MM`. |
| **AI – Predictive Maintenance** | Patterns → "Replacement Suggestions" vs "Repair Tasks" | ✅ `maintenanceAiService`: patterns + predictive warnings; GET `/api/maintenance/patterns`, `/predictions`. |

---

## 3. Maintenance, Inventory & Tech Workflow

| Step | Flow | Status |
|------|------|--------|
| 1. Resident | Report via UI (Photo + Category) | ✅ Maintenance POST + attachments. |
| 2. AI | Duplicate check: same building + category | ✅ POST maintenance → 409 + `existingId` if open duplicate. 🔲 Optional: NLP/semantic >80%. |
| 3. Committee | Approve → TechnicianLink | ✅ POST `/maintenance/:id/send-technician`. |
| 4. Technician | Time-limited magic link; GPS + photo upload | ✅ `technicianAccessService.ts`, `techRoutes.ts` – GET/PATCH `/api/tech/work-order/:token`. |
| 5. Inventory | Auto-deduction on tech close | ✅ `inventoryService.consumeItem` + audit. |
| **Accessibility** | ARIA, high-contrast | 📄 `docs/ACCESSIBILITY.md`. |

### Voice-to-Insight (optional)

| Requirement | Status |
|-------------|--------|
| Whisper + LLM: voice → status, parts, alerts | 🔲 Add `voiceService.ts`, upload endpoint, pipeline. |
| PWA/offline for technicians | 🔲 Service Worker, local queue, sync when online. |

---

## 4. CEO Dashboard (Super-Admin)

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Global overview** | Financial alerts, inventory, contractor performance | ✅ GET `/api/super-admin/global-stats`, `/search`, `/reconcile`. |
| **Audit trail** | Every data-changing action → AuditLog | ✅ `logActivity` / `logActivityServer`; GET `/api/super-admin/activity-stream`. |
| **Global search** | User, building, transaction across cluster | ✅ GET `/api/super-admin/search?q=&limit=`; `buildingId: '*'` for global. |
| **Security alerts** | Suspicious behavior (e.g. edit after committee approval) | ✅ AuditReport PATCH blocks non–super-admin; SUSPICIOUS_BEHAVIOR in AuditLog. |

---

## 5. DevOps & Deployment

| Requirement | Status |
|-------------|--------|
| CI/CD (Render/Vercel/AWS) | 📄 `docs/DEPLOYMENT.md`; `render.yaml`, Netlify. |
| Monitoring (Winston, Slack/Discord) | ✅ Logger, `errorAlertMiddleware`. 🔲 Sentry/LogRocket optional. |
| MongoDB Atlas, backups, indexes on `buildingId` | ✅ Mongoose; multiTenancy; indexes. |

---

## 6. Pre-Launch Audit Checklist

| Category | Requirement | Check |
|----------|-------------|-------|
| Security | JWT, HTTPS, NoSQL sanitization | [x] |
| Integrity | Multi-tenancy on all tenant models | [x] |
| Performance | Redis caching (financial, AI dashboards) | [x] |
| Responsive | Mobile-first, iOS/Android | [ ] |
| Files | Uploads to Cloudinary only | [x] |
| Accessibility | WCAG (contrast, font sizes) | [ ] See `docs/ACCESSIBILITY.md` |

---

## 7. Key Files (Quick Reference)

| Concern | Location |
|---------|----------|
| Shared types | `packages/shared/src/types/domain.ts` |
| Config (Zod) | `apps/api/src/config/env.ts` |
| Tenant + RBAC | `apps/api/src/middleware/tenantMiddleware.ts`, `authMiddleware.ts`, `utils/multiTenancy.ts` |
| Rate limits | `apps/api/src/middleware/rateLimiter.ts` |
| Sanitization | `apps/api/src/middleware/sanitizationMiddleware.ts` |
| Public API (landing) | `apps/api/src/routes/publicRoutes.ts` |
| Audit | `apps/api/src/utils/auditLog.ts`, `models/auditLogModel.ts` |
| Maintenance + AI | `maintenanceModel.ts`, `maintenanceAiService.ts`, `maintenanceRoutes.ts` |
| Technician magic link | `technicianAccessService.ts`, `techRoutes.ts` |
| CEO / super-admin | `superAdminRoutes.ts`, `auditReportRoutes.ts` |
| BuildingStats (impact) | `buildingStatsModel.ts`, `buildingStatsService.ts` |
| Transaction & reconcile | `transactionModel.ts`, `transactionService.ts`, `reconciliationService.ts` |
| Soft delete | `utils/softDeletePlugin.ts` |
| Cloudinary | `cloudinaryUploadService.ts`, `fileRouter.ts` |

---

## 8. Roadmap Summary

- **Done:** Monorepo, multi-tenancy, JWT/RBAC, public impact API, AI predictive patterns, duplicate detection (by category), technician magic links, CEO activity stream & search, audit log, BuildingStats, transactions, reconciliation, Cloudinary, Redis cache, AuditReport + security alert, Zod config, rate limiting, sanitization.
- **Optional / next:** Semantic duplicate (NLP >80%), Voice-to-Insight (Whisper + LLM), PWA/offline for technicians, dedicated landing app, Sentry/LogRocket, full mobile & WCAG hardening.

Single reference for HSLL technical spec and current codebase mapping.
