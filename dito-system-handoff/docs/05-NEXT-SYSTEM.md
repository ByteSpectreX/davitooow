# Building the next system

Use this snapshot as a reproducible reference and research baseline. Keep its original evidence separate from the new system's updated implementation and test results.

## Suggested sequence

| Step | Build or verify | Exit evidence |
| --- | --- | --- |
| 1 | Establish server-held auth and ordinary account reads | Sanitized login/read result with date, endpoint, result codes, and response schema |
| 2 | Port the signer and identifier mapping | Deterministic parity tests plus one authorized query; no secrets in fixtures |
| 3 | Define promo-catalog scope explicitly | Category tree, pagination metadata, completed counts, channel and eligibility distinctions |
| 4 | Add nested categories and correct `pageInfo.total` support | Mock cases and a dated account query showing complete traversal within that scope |
| 5 | Investigate recipient data promos / Just For You | Confirmed runtime prefix, validation schema, eligible recipient and offer metadata |
| 6 | Implement durable regular-load state | Atomic quote consumption, immutable confirmed details, recovery, duplicate protection across processes |
| 7 | Verify one selected gateway flow | Separately confirmed recipient/amount/method; payment reference, provider result, DITO transaction status, and load-credit observation recorded separately |
| 8 | Broaden accounts/channels/gateways | Repeatable evidence per addition, not inferred from a generic catalog listing |

## Decisions before production

- Choose a durable database/coordinator for payment attempts. The reference's in-memory Map and Worker KV guard are not a multi-instance payment architecture.
- Retain pending references and state transitions through restarts. Distinguish quote creation, submission, gateway authorization, settlement, and delivered load.
- Do not retry ambiguous payment submissions without supported upstream idempotency or reconciliation. A new local UUID alone does not make an upstream charge idempotent.
- Keep payer account and recipient distinct. Preserve the exact reviewed recipient, amount, total, method, and quote expiry in the confirmation record.
- Treat a payment reference as correlation data, not successful fulfillment. Define how the system reconciles status and verifies the recipient's load credit.
- Keep credentials and provider payloads in a server-side secret/session boundary; choose retention, encryption, access controls, and deletion deliberately. Default remembered-password behavior should be reviewed rather than inherited blindly.
- Review source comments and response logging before deployment. Current snapshots contain protocol constants, synthetic fixture credentials, and historical assumptions; none should be interpreted as a supported upstream contract.
- Audit the pinned dependencies and configure private local access / proper production TLS and cookies. Do not deploy placeholder KV bindings.

## Open research questions

| Question | Known lead | Evidence still needed |
| --- | --- | --- |
| Long Expiry for this account | Public prepaid FAQ, alternate catalogs, recipient flow | Actual public offer ID, discovery channel, and eligible recipient result |
| Personalized offers | `qryCampInfo`, `qryMarketContactDetail` | Runtime `urlPrefix`, supported session/auth context, sanitized response |
| Recipient data promos | `order/check-for-guest`, returned category/reference | Full validated schema and flow; changing own-account payment fields is not sufficient |
| Complete category traversal | `subProdCatgList`, `isMCCM`, recommendation trees | Recursion semantics, dispatch rules, pagination, source-scoped completeness |
| Linked accounts | Android resources and previous notes | Authorized list/switch capture with identifiers removed from exported notes |
| Original unknown load attempts | Owner's UI report | Provider/DITO history; raw responses and old references were not retained here |

## Keep the research useful

For each experiment, use [the template](./EXPERIMENT-TEMPLATE.md). Save only sanitized shapes and evidence needed to reproduce the conclusion. Record a failed or ambiguous test as such. Promote “implemented” to “live-verified” only for the exact tested behavior, account scope, and date; a successful quote should not promote payment or delivery claims.

When creating a new release, retain its commit/revision, dependency lockfile, test output, source hashes, and verification ledger. Re-run the checks after intentional edits; do not overwrite the original snapshot's evidence to make it look current.
