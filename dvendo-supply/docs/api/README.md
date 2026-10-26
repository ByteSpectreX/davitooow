# Application API

Base: same-origin `/api/v1`. Machine-readable contract: [OpenAPI](../../contracts/openapi.json). This API is separate from [DITO's upstream routes](../dito/README.md).

| Implemented route | Purpose | Authentication |
| --- | --- | --- |
| `GET /health` | Process/application foundation status | Public; no account details |
| `GET /capabilities` | Accurately report unfinished integrations | Public; no account details |

Other `/api` paths return HTTP 404 with `{"error":{"code":"NOT_FOUND","message":"This API route is not implemented."}}`. Unsupported methods on these two routes return HTTP 405 and `Allow: GET`. Responses use JSON and `Cache-Control: no-store`.

The frontend remains a standalone synthetic preview and does not call this API. There are no functional login, SIM, wallet, plan or order endpoints. Their proposed design is [documented separately](planned.md). The historical DITO dashboard's `/api/...` wrappers in the imported research inventory are **not routes provided by this new project**.
