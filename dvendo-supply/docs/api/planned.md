# Planned authenticated API

Design only. None of these operations is implemented or included in the published OpenAPI contract yet. Exact payloads and the authentication provider are to be designed with the persistent model.

| Proposed operation | Scope and purpose |
| --- | --- |
| `GET /api/v1/me` | Server-derived membership and permissions |
| `GET /api/v1/sims` | Assigned SIMs; supplier sees authorized workspace fleet |
| `POST /api/v1/sims` | Submit a recipient for assignment; not provider validation by itself |
| `GET /api/v1/sims/{id}` | Shared record with role-appropriate fields |
| `POST /api/v1/sims/{id}/assignment` | Supplier-only assignment/transfer with audit |
| `GET /api/v1/sims/{id}/offers` | Recipient-eligible and supplier-enabled offers |
| `PUT /api/v1/sims/{id}/plan` | Versioned next-promo preference; no direct debit |
| `GET /api/v1/supplier/wallet` | Supplier-only observed balance and freshness |
| `GET /api/v1/supplier/forecast` | Supplier-only costs, missing coverage and reserve |
| `GET /api/v1/orders` | Scope-filtered supply attempts and verification states |
| `POST /api/v1/orders/{id}/reconcile` | Supplier-controlled query of an existing uncertain attempt, never a new purchase |

Private routes need real authentication, workspace membership and entity authorization before accessing records. Mutations require validation, same-origin/CSRF protection where cookie authentication is used, audit records, concurrency/version handling and appropriate rate limits. Never trust a requested role or manager ID as proof of permission. No general browser-facing raw DITO proxy.
