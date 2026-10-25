# Expantor — DITO API study

An API collection and notebook for studying account data, promo discovery, Buy Load, and Buy Data for an authorized DITO account.

## Contents

| File | Purpose |
| --- | --- |
| [API catalog](./api-catalog.json) | Structured endpoint inventory, request examples, effects, and evidence references |
| [Dashboard request collection](./collections/dito-dashboard.postman_collection.json) | Importable Postman v2.1 collection for existing dashboard query routes |
| [Sources](./sources.md) | Local code references, public bundle URLs, retrieval date, and SHA-256 fingerprints |
| [2026-10-24 study notes](./notes/2026-10-24.md) | Findings, corrections, current limits, and next experiments |
| [Buy Load implementation](./notes/2026-10-24-load-purchase.md) | Recipient checkout flow, query/submission boundaries, test coverage, and remaining verification |
| [Note template](./notes/TEMPLATE.md) | A consistent record for each future experiment |

## Evidence labels

- **implemented**: the local project constructs this request. Earlier project comments may describe captured behavior; those comments are not a new account verification.
- **code-observed**: the request or route is present in DITO's official frontend code. Its current server behavior and account eligibility still need verification.
- **account-verified**: a dated, sanitized experiment confirms the result for an authorized account. No endpoint is assigned this label in this initial notebook.

Hypotheses belong in the notes until evidence supports them. A missing promo in one catalog does not establish that the account is ineligible across all channels.

## Using the collection

1. Start the dashboard using the [project instructions](../dito-login-test/README.md).
2. Import [the collection](./collections/dito-dashboard.postman_collection.json) into Postman.
3. Set `baseUrl` to `http://localhost:5174`, or your private Codespaces forwarded origin. Do not append `/api`.
4. Authenticated requests need an existing `dito_session` cookie in that client's cookie jar. A browser login does not automatically sign Postman in. This collection does not establish authentication; when using the signed-in dashboard, its browser requests already carry the cookie.
5. Replace the category placeholder using a code returned by **Promo categories**. The example list request fetches one page; the dashboard's fetcher handles pagination separately.
6. Set the history date variables before making history queries. HTTP success alone does not establish application-level success: inspect the response body too.

The collection contains query operations, including POST queries. Login, OTP sending, purchases, payment submission, and logout are documented in the catalog but excluded from the runnable collection. Existing sessions may silently reauthenticate when the dashboard's **Stay signed in** feature is enabled; a query is therefore not guaranteed to involve only upstream reads.

## Request conventions

- `{{...}}` values are placeholders, never real account data. The inventory is documentation, not an OpenAPI specification or a direct upstream client.
- The main upstream base is `https://my.dito.ph/ecare/webs/`. The catalog records full paths from the origin to distinguish common and marketing services.
- Local `/api/...` routes are dashboard wrappers. They are different from DITO's upstream endpoints.
- The project supplies DITO-specific signing headers through its backend. Importing a raw upstream URL into Postman does not reproduce that behavior. See [the implemented request signer](../dito-login-test/src/worker.mjs).
- Marketing URLs can include a runtime `urlPrefix`. The origin and prefix accepted for a web session have not been established.

Use only your own account or an explicitly authorized recipient. Record response shapes, result codes, counts, and public catalog labels; redact personal data and credentials. A study request does not authorize a purchase. Any purchase experiment needs the exact recipient, offer, price, payment method, and explicit confirmation first.
