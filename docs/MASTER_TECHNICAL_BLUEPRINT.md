# HSLL – The Master Technical Blueprint

**מסמך זה מיועד להעברה לבינה מלאכותית (Claude, GPT-4o, Gemini 1.5 Pro) כדי לייצר קוד בתוך ה-Monorepo.**  
**Strict Mode:** אין לעגל פינות. כל פיצ'ר – מהלוויין ועד לקול הטכנאי – מיושם לפי ההנחיות להלן.

---

## System Role (הוראת תפקיד לבינה)

You are a **Senior Full-Stack Engineer and AI Specialist**. Your task is to architect and implement the **HSLL (High-End Smart Logistics & Living)** platform.

---

## Target Structure (מבנה יעד)

| Component | Stack |
|------------|--------|
| **Monorepo** | Turborepo or Nx |
| **apps/api** | NestJS (Node.js) + MongoDB, Multi-tenant |
| **apps/web-app** | Next.js + Tailwind CSS (CEO & Resident Dashboards) |
| **apps/landing-page** | Next.js (High-conversion, Live Data) |
| **packages/shared** | Shared TypeScript interfaces and Zod schemas |

---

## 1. The Core Infrastructure (Multi-Tenant)

- Build a **global middleware** in the API so that **100% data isolation** is enforced using `buildingId`.
- **All** database schemas must include a `buildingId` index.
- **RBAC** (Role-Based Access Control) for:
  - `SUPER_ADMIN` (CEO)
  - `BUILDING_MANAGER`
  - `TECHNICIAN`
  - `RESIDENT`

---

## 2. The AI Peacekeeper (Duplicate Detection Logic)

- **Location:** `apps/api/services/maintenance.service.ts` (or equivalent in current stack).
- **Logic:** Before saving a new ticket, compare the new ticket’s **description** with all **"Open"** tickets in the same `buildingId` using **semantic similarity** (e.g. OpenAI embeddings).
- **Threshold:** If similarity **> 0.85**, return a **DUPLICATE_ALERT** with the existing `ticketId` (do not create a duplicate).

---

## 3. Vision AI & Satellite Integration

### CCTV Bridge

- Create an **RTSP stream consumer** service.
- Capture **one frame every 60 seconds**.
- Run **lightweight Anomaly Detection** (OpenCV or AWS Rekognition) for:
  - Water on floor
  - Blocked exits
  - Unrecognized movement in engine rooms

### Satellite Hook

- Use **Google Earth Engine API** to fetch **quarterly** top-down imagery.
- Implement **Change Detection** alerts for:
  - Roof degradation
  - Solar panel efficiency (if applicable)

---

## 4. Technician "Magic Link" & Voice-AI

### Magic Link

- Generate a **JWT-signed URL** for technicians that **expires in 24 hours**.
- **No login required** – technician opens link and sees assigned work.

### Voice-to-Insight

- Integrate **OpenAI Whisper**.
- After technician records a **voice summary**, the AI must extract a **JSON** object:

```json
{
  "status": "resolved",
  "partsUsed": [],
  "followUpNeeded": false,
  "ceoAlert": "optional text for CEO dashboard"
}
```

### Offline Sync

- Use **Service Workers** in the web-app so that data can be captured in basements with **no connectivity**, and synced when back online.

---

## 5. CEO Strategic Dashboard (The Value Driver)

**Live Impact Route:** Aggregate data across **all buildings** and expose:

- `totalMoneySaved` (from prevented failures and inventory optimization)
- `anomalyHeatmap` (buildings with high failure rates)
- `transparencyScore` (real-time financial audit log)

---

## Current Monorepo State (מצב נוכחי – חשוב לבינה)

**Before generating code, align with the existing repo:**

| Aspect | Current state |
|--------|----------------|
| **Monorepo** | Turborepo, pnpm workspaces (`apps/*`, `packages/*`) |
| **apps/api** | **Express** (not NestJS). Multi-tenant: `tenantMiddleware` + `multiTenancy` Mongoose plugin. All tenant models use `buildingId`. |
| **apps/web** | **Vite + React** (not Next.js). Single app: CEO Dashboard, Resident, Committee, Technician flows. **Landing is a route** at `/landing` inside this app. |
| **apps/landing-page** | **Does not exist.** Landing lives in `apps/web` (e.g. `Landing.tsx`, `/landing`). |
| **packages/shared** | TypeScript types in `types/domain.ts`: Building, User, MaintenanceTicket, Transaction, **HSLL_Event**, GlobalImpactResponse. No Zod yet in shared. |
| **Public API** | `GET /api/public-stats`, `GET /api/public/impact-metrics` – aggregate from `BuildingStats` only. No auth. |
| **RBAC** | JWT + roles (admin/super-admin, user with buildingId). Roles: resident, committee, technician, admin. Map to SUPER_ADMIN / BUILDING_MANAGER / TECHNICIAN / RESIDENT as needed. |
| **Technician** | Magic-link flow exists: `technicianAccessService.ts`, `techRoutes.ts` – time-limited token, no login. |
| **Vision** | Stub: `apps/api/src/services/vision.ts` (TODO: RTSP, anomaly detection). See `docs/VISION_SATELLITE_SPEC.md`. |
| **AI Peacekeeper** | Duplicate check by category exists in maintenance flow. **Semantic similarity (embeddings) not yet implemented.** |

**Instruction to AI:**  
- If the task is to **add features** (Vision, Satellite, Voice, semantic duplicate): implement them in the **current** stack (Express, Vite/React) unless explicitly asked to migrate to NestJS/Next.js.  
- If the task is to **migrate** to NestJS and/or Next.js: do it in a separate, agreed plan and update this doc.

---

## Next Step: Database Schema Approval

Before implementing new features, the **CEO approves** the database structure. Use the following document:

- **[DATABASE_SCHEMA_APPROVAL.md](DATABASE_SCHEMA_APPROVAL.md)** – Core tables, fields, and indexes.

Once approved, the AI (or dev team) can create or alter collections accordingly and implement the Master Blueprint.

---

## Related Docs

| Doc | Purpose |
|-----|--------|
| [HSLL_SPEC.md](HSLL_SPEC.md) | Product & technical spec, roadmap, key files. |
| [VISION_SATELLITE_SPEC.md](VISION_SATELLITE_SPEC.md) | Vision pipeline, satellite hook, alert logic. |
| [DATA_SEPARATION.md](DATA_SEPARATION.md) | Public vs private API, landing vs app. |
| [MULTI_TENANT_SECURITY.md](MULTI_TENANT_SECURITY.md) | How tenant isolation is enforced. |

---

*זהו הקוד הגנטי של האפליקציה. כל פיתוח מתבסס על המסמך הזה.*
