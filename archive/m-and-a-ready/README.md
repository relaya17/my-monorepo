# Vantera OS — M&A Ready Package

> **"We built the operating system for residential buildings — infrastructure that manages itself."**

This folder is the technical data room for due diligence. Every claim below is backed by a live file in this repository.

---

## Quick Stats (as of April 2026)

| Metric | Value |
|--------|-------|
| Codebase | TypeScript strict, 0% `any` in core |
| Architecture | TurboRepo monorepo (API + Web + Native + Packages) |
| Multi-tenancy | Per-request isolation via `x-building-id` header |
| AI Engine | V.One — proprietary context, not a ChatGPT wrapper |
| Security model | SHA-256 hash-chain ledger, GPS-fenced Magic Links |
| Revenue split | 70/20/10 Stripe Connect (automated) |
| Real-time | Socket.io — floor-level broadcast |

---

## Folder Contents

| File | Description |
|------|-------------|
| [`DUE_DILIGENCE_CHECKLIST.md`](./DUE_DILIGENCE_CHECKLIST.md) | Full technical checklist with source-code links |

---

## Existing Deep-Dive Documents

| Document | Location |
|----------|----------|
| Technical Specification | [`docs/vantera/TECHNICAL_SPECIFICATION.md`](../../docs/vantera/TECHNICAL_SPECIFICATION.md) |
| Master Technical Blueprint | [`docs/vantera/MASTER_TECHNICAL_BLUEPRINT.md`](../../docs/vantera/MASTER_TECHNICAL_BLUEPRINT.md) |
| IP Documentation (V.One) | [`docs/vantera/V_ONE_IP_DOCUMENTATION.md`](../../docs/vantera/V_ONE_IP_DOCUMENTATION.md) |
| Multi-Tenant Security | [`docs/vantera/MULTI_TENANT_SECURITY.md`](../../docs/vantera/MULTI_TENANT_SECURITY.md) |
| Database Schema | [`docs/vantera/HSLL_DATABASE_SCHEMA.md`](../../docs/vantera/HSLL_DATABASE_SCHEMA.md) |
| Stripe Connect & Webhooks | [`docs/vantera/STRIPE_CONNECT_AND_WEBHOOKS.md`](../../docs/vantera/STRIPE_CONNECT_AND_WEBHOOKS.md) |
| Security Policy | [`docs/vantera/SECURITY.md`](../../docs/vantera/SECURITY.md) |
| M&A Exit Strategy | [`docs/vantera/M_A_READY_EXIT_STRATEGY.md`](../../docs/vantera/M_A_READY_EXIT_STRATEGY.md) |
| Previous Due Diligence Kit | [`docs/vantera/DUE_DILIGENCE_KIT.md`](../../docs/vantera/DUE_DILIGENCE_KIT.md) |
| Investor Executive Summary | [`docs/vantera/INVESTOR_EXECUTIVE_SUMMARY.md`](../../docs/vantera/INVESTOR_EXECUTIVE_SUMMARY.md) |

---

## How to Navigate This Repo (for a Technical Auditor)

```
vantera/
├── apps/
│   ├── api/src/          ← Express + TypeScript backend (Node.js ESM)
│   │   ├── models/       ← Mongoose schemas (all multi-tenant)
│   │   ├── routes/       ← REST API endpoints
│   │   ├── services/     ← Business logic layer
│   │   └── middleware/   ← Auth, tenant isolation, rate limiting
│   └── web/src/          ← React 18 + Vite + Redux Toolkit frontend
│       ├── pages/        ← Page components
│       ├── components/   ← Shared UI components
│       └── redux/        ← State management slices
├── packages/
│   ├── shared/           ← Shared types between API and Web
│   ├── config/           ← ESLint, TypeScript base configs
│   └── i18n/             ← Internationalization strings
├── docs/vantera/         ← Full product & technical documentation
└── archive/m-and-a-ready/← This folder — investor data room
```

---

*Last updated: April 2026 — Vantera OS v3.1*
