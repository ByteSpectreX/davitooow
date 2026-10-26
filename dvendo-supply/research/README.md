# Research and evidence

## Important references

| Record | Purpose |
| --- | --- |
| [Upstream endpoint inventory](dito/endpoints.json) | 33 historically discovered DITO routes |
| [Source registry](dito/sources.md) | Original implementation locations and public bundle sources |
| [Original verification ledger](dito/verification-ledger.json) | Historical feature/effect/verification limits |
| [Selected historical findings](baseline/README.md) | Owner requirements, corrections and latest UI/hosting conclusions |
| [Full historical blueprint](baseline/role-blueprint.md) | Detailed planning reference; new rules are consolidated in the product guide |
| [Import manifest](import-manifest.json) | Original and imported file hashes, paths and transformations |
| [New findings](findings/README.md) | Results established in this clean project |

The provenance registry records old source paths for traceability; it does not require those files at runtime. Raw account responses, credentials, mobile numbers, captures and screenshots are excluded. The old repository remains the full historical archive. No vendor bundles, APK archives or dependency directories are imported.

## Evidence levels

`implemented` means code exists in the stated project/version. `code-observed` means a source references the behavior. `mock-tested` means synthetic/offline validation. `user-reported` preserves the owner's observation. `live-verified` needs a dated sanitized evidence file and an exact stage; it is never inferred from mock tests or UI fixtures.

New findings are recorded before final handoff. From the project root:

```sh
node scripts/record-finding.mjs <<'JSON'
{
  "title": "Concrete observation",
  "category": "implementation",
  "outcome": "observed",
  "evidenceLevel": "implemented",
  "summary": "What was established and what remains unverified.",
  "evidence": [{"type":"file","location":"apps/api/src/worker.mjs"}],
  "endpointIds": [],
  "nextSteps": ["Next useful verification."]
}
JSON
```

Allowed categories: api, behavior, implementation, test, limitation, correction, workflow. Outcomes: observed, passed, failed, uncertain. Evidence references use file, url, test or user-report types, with location and optional description. File locations must be safe project-relative files; no secret files. The recorder stores sanitized fields and SHA-256 evidence hashes. Its redactor is secondary protection; never supply raw private data.

Live verification additionally requires `verifiedStage`: query, quote, order-created, gateway-opened, payment-completed or load-delivered. A quote or payment reference is not delivery proof. Identical findings against unchanged source are deduplicated. The baseline archive retains historical IDs independently; it is not rehashed into new claims.

`npm test` records offline results here automatically and fails if no tests execute. The fresh project uses its own recorder and does not depend on protected native hooks or the old repository's tools.
