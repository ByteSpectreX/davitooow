# Project map

| Area | Authoritative contents | Update rule |
| --- | --- | --- |
| [Product rules](03-product.md) | Approved responsibilities and unresolved choices | Record owner decisions before changing behavior |
| [API source](../apps/api/src/worker.mjs) | Actual API behavior | Implement and test; update the contract in the same change |
| [OpenAPI](../contracts/openapi.json) | Only implemented application routes | Never describe future routes as available |
| [Planned API](api/planned.md) | Proposed authenticated operations | Promote individually after implementation |
| [DITO inventory](../research/dito/endpoints.json) | Historical upstream route discoveries | Preserve provenance; supplement with dated evidence |
| [Live findings](../research/findings/README.md) | New results and unresolved observations | Record automatically as part of substantive work |
| [Preview sources](../apps/web/preview/README.md) | Editable synthetic UI and build assets | Build the generated public HTML after edits |
| [Import manifest](../research/import-manifest.json) | Original paths, SHA-256 and source identity | Historical provenance; do not relabel imports as new verification |

The application API and DITO API are separate contracts. Business users call our authorized API. A future backend-only adapter will sign DITO requests. The current starter has no such live adapter.

Add database migrations under `database/migrations/` when the persistent model is implemented. Add provider code under `packages/dito/` when verified integration work begins. Add fulfillment under `apps/api/src/fulfillment/` when durable coordination is implemented. These are intended locations, not existing features; avoid empty parallel implementations.
