# DITO system handoff

**Prepared: 2026-10-25 UTC.** A portable implementation snapshot and research record for building the next system. You can move this entire folder into a different project: its implementation files, tests, local documentation links, and API collection are included.

This package is complete as a handoff of the code and evidence available so far. It is **not a claim that every discovered API or a real payment has been verified**. Read the verification record before treating a feature as working against DITO.

## Start here

| Read | Purpose |
| --- | --- |
| [Setup and commands](./docs/01-SETUP.md) | Run the reference app, install dependencies, and run offline tests |
| [API connection](./docs/02-API-CONNECTION.md) | Base URLs, signing, credential encryption, headers, cookies, identifiers, and error handling |
| [Implementation walkthrough](./docs/03-IMPLEMENTATION.md) | How login, account queries, promos, and recipient load checkout fit together |
| [Verification record](./docs/04-VERIFICATION.md) | What is implemented, mock-tested, user-reported, or still unverified |
| [Next-system plan](./docs/05-NEXT-SYSTEM.md) | Known gaps, migration decisions, and the next useful experiments |
| [Experiment template](./docs/EXPERIMENT-TEMPLATE.md) | Record each test and promote a claim only when evidence supports it |
| [Automatic findings workflow](./docs/06-AUTOMATIC-FINDINGS.md) | Persistent recording instructions, automatic test notes, and native hook setup/status |
| [Live findings journal](./findings/README.md) | New observations and results added after the original export |

## Included reference material

| Location | Contents |
| --- | --- |
| [Reference application](./reference/dito-login-test/README.md) | Node backend, Worker alternative, browser UI/PWA, pinned dependency manifests, and tests |
| [API inventory](./reference/expantor/api-catalog.json) | 33 upstream endpoints, request examples/known fields, effects, implementation mapping, and evidence references |
| [Postman collection](./reference/expantor/collections/dito-dashboard.postman_collection.json) | Nine dashboard query requests; no login, OTP send, or payment submission |
| [Original study notebook](./reference/expantor/README.md) | Dated findings and checkout corrections, retained as historical notes |
| [Evidence sources](./reference/expantor/sources.md) | Local implementation references, official bundle URLs, and inspected bundle hashes |
| [Browser extension](./reference/tools/dito-login-listener/README.md) | Earlier account/alias lookup implementation |
| [APK analysis](./reference/analysis/APK_STATIC_ANALYSIS_REPORT.md) | Historical Android analysis; core app code was protected by SecNeo |
| [Capture plan](./reference/analysis/API_CAPTURE_PLAN.md) | Historical procedure, with local machine IP addresses removed |

## Evidence and integrity

- [Verification ledger](./evidence/VERIFICATION-LEDGER.json): machine-readable claims and open questions.
- [Validation run](./evidence/VALIDATION.json) and [test output](./evidence/TEST-OUTPUT.txt): checks run on the exported snapshot, including their environment and limits.
- [Snapshot origin](./evidence/SNAPSHOT-ORIGIN.json): source revision, original file paths, and any redaction applied.
- [File manifest](./SNAPSHOT-MANIFEST.json): checksums for the handoff files; live findings are validated separately so new notes do not change the original reference evidence.
- Run `node tools/verify-handoff.mjs` from this folder to check hashes, portable documentation links, and the API/collection inventory. After intentionally editing this handoff, the original checksums will differ; retain the original as evidence and create a new dated snapshot.

## Current bottom line for the next builder

The reference implements account login, data queries, scoped web promo browsing, and an experimental recipient load checkout. The automated suite exercises 32 mocked/local cases. A user reported checkout attempts with unavailable handoffs; subsequent corrections are included, but a successful end-to-end real purchase is not established. Long Expiry, complete cross-channel catalogs, linked-account switching, and Cloudflare load checkout remain unverified or unsupported.

No real account passwords, OTPs, tokens, session cookies, raw traffic captures, or account screenshots are included. Public protocol constants in source and deliberately synthetic test credentials remain because the implementation needs them. Dependencies are installed from the lockfile; their installed directories are not bundled.
