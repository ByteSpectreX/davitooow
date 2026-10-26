# Architecture

Target hosting: Cloudflare. Existing source assets have been selected for a new project; no existing production account IDs, secrets, database IDs or deployment bindings were inherited.

| Component | Target responsibility | Current status |
| --- | --- | --- |
| Web UI | Supplier and manager workflows | Portable synthetic preview |
| Worker API | Authentication, authorization, validation and app operations | Health/capabilities only |
| D1 | Users, assignments, plans, monitoring snapshots, audit and reporting | Planned; no database provisioned |
| Durable Object per supplier wallet | Authoritative attempt/reservation coordination and next renewal alarm | Planned; no spending executor |
| DITO adapter | Backend-only signing, account connection and recipient provider operations | Research inventory only |

## Boundaries

The browser never receives DITO tokens or passwords. App authentication is independent from supplier DITO login. Before private routes exist, select and implement an identity provider/session strategy, verify credentials cryptographically, and derive memberships server-side. A role in a browser request or a preview dropdown is never authorization.

Use integer minor units and currency for monetary records. Keep provider units explicit; do not infer their multiplier. Persist UTC instants and show an explicit business timezone, initially Asia/Manila. Preserve supplier payer and recipient identities separately.

## Financial coordination

Use one coordinator per supplier wallet so concurrent renewals share spending limits and reservations. Persist intent before external I/O. Model a renewal-cycle uniqueness key, immutable accepted details, upstream reference and reconciliation state. Keep authoritative attempt/reservation state together; D1 reporting projections are not an independent spending authority.

Durable Object alarms execute at least once and can retry. This does not make an upstream charge exactly once. A timeout after submission becomes unknown; later execution reconciles the existing attempt rather than issuing another purchase. Retries require supported provider idempotency or evidence that resubmission is safe. Track any lag between coordinator state and reporting projections.

## Current boundary

There is no private data, scheduler, durable store or provider connector in this starter. Unknown API routes return JSON 404. The preview intentionally blocks API connections through CSP. Wiring it to a live backend is a later implementation step, with UI authentication and durable behavior replacing demo state.

Platform references: [Workers assets](https://developers.cloudflare.com/workers/static-assets/), [D1](https://developers.cloudflare.com/d1/), [Durable Object alarms](https://developers.cloudflare.com/durable-objects/api/alarms/), [Worker practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/). Platform documentation was checked on 2026-10-26; recheck when implementing.
