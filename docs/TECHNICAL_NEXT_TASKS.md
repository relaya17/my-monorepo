# Vantera — Next Technical Tasks

**For the development team. Prioritized by CTO for Q1 2026.**

---

## 1. Webhooks Gateway (API Economy)

**Goal:** Allow external service providers (Insurance, Maintenance, Municipalities) to **subscribe to building health events** safely.

### Requirements

- **Implement a Webhooks Gateway** in the API (e.g. under `apps/api`).
- **Events:** Building health / pulse changes, anomaly alerts, maintenance status, ledger milestones — whatever is needed for:
  - Insurers (risk / maintenance data)
  - Maintenance vendors (jobs, completion)
  - Municipalities (hazards, crisis status)
- **Security:**
  - Authentication (API key or signed payloads).
  - Per-tenant / per-building scoping so a subscriber only receives events they are allowed to see.
  - Rate limiting and retry policy for failed deliveries.
- **Delivery:** Retry with backoff; optional dead-letter or log for failed webhooks.
- **Documentation:** Public (or partner) doc for subscription, payload schema, and verification (e.g. signing).

### Success Criteria

- External system can register a webhook URL and receive building health events for authorized buildings.
- No leakage of data across tenants/buildings.
- Failures are logged and optionally retried.

---

## 2. Onboarding Automation — Join in &lt;60 Seconds

**Goal:** A resident can **join Vantera in under 60 seconds**: enter details → pay $3 → access feed.

### Requirements

- **Flow:** Minimal form (e.g. building/unit, name, contact) → payment ($3/month) → immediate access to the resident feed for that building.
- **Technical:**
  - Integrate payment (e.g. Stripe) so that successful payment triggers creation/activation of resident and session.
  - No unnecessary steps; optional email verification can be async (don’t block feed access if already validated by building/admin or payment).
- **Metrics:** Measure time from “start” to “first feed view”; target &lt;60s p95.

### Success Criteria

- New resident completes sign-up + payment and sees their building feed in under 60 seconds in normal conditions.
- Documented flow and any env/config needed for payment.

---

## References

- Strategy & roadmap: [VANTERA_2026_STRATEGY_AND_ROADMAP.md](VANTERA_2026_STRATEGY_AND_ROADMAP.md)
- Automation: [README_AUTOMATION.md](../README_AUTOMATION.md)
- Multi-tenant security: [MULTI_TENANT_SECURITY.md](MULTI_TENANT_SECURITY.md)
