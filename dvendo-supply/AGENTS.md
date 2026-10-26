# Working agreement

Read [the project map](docs/01-project-map.md), [product rules](docs/03-product.md), [evidence status](research/README.md) and [live findings](research/findings/README.md) before substantive work.

- Record meaningful decisions, corrections, failures and results using `node scripts/record-finding.mjs` with sanitized structured JSON on stdin. The schema and example are in [the evidence guide](research/README.md). Tests record results automatically through `npm test`.
- Keep imported historical source evidence intact. Add current evidence to the journal. An imported implementation or mock pass is never proof of a live payment or recipient delivery.
- Keep the documented API contract aligned with implemented routes. Proposed routes stay in the design guide until implemented and tested.
- Enforce server-side manager scope before adding private API operations. UI role selection is a demo feature, not authentication.
- Store payer account and recipient SIM separately. Persist financial intent before submission, coordinate by supplier wallet and reconcile unknown results before any retry.
- No credentials, OTPs, cookies, tokens, raw account responses or real mobile numbers in source, notes or logs. No provider request from the browser.
- Documentation, coding and query authorization do not authorize OTPs, purchases, ambiguous payment retries, deployment or credential export.
- Run `npm test`, `npm run build` and `npm run verify` as appropriate. For Worker changes, additionally run the Cloudflare dry run after installing tooling. Keep staging separate from existing production resources.
