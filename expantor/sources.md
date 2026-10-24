# Evidence sources

Reviewed on **2026-10-24 UTC**. The public JavaScript bundles inspected carry a build banner dated 2026-10-22. Hashed asset names can change with deployments. Fingerprints identify the inspected bytes; full vendor bundles are not copied into this notebook.

## Project sources

| ID | Source | What it establishes |
| --- | --- | --- |
| P1 | [Worker API](../dito-login-test/src/worker.mjs) | Implemented upstream calls, signing, login, session handling, catalog root, and payment request construction |
| P2 | [Node dashboard backend](../dito-login-test/proxy-server.js) | Local equivalents and purchase recipient fixed to the selected signed-in account |
| P3 | [Dashboard frontend](../dito-login-test/public/app.js) | UI behavior, category loading, filtering, and purchase confirmation |
| P4 | [Promo pagination helper](../dito-login-test/public/promo-catalog.mjs) | Page traversal, deduplication, repeated-page detection, and 100-page limit |
| P5 | [Decoded Android loader](../analysis/apktool-decoded-2.12.05/smali/com/secneo/apkwrapper/H.smali) | SecNeo wrapper and native loading of the actual application |
| P6 | [Earlier APK report](../analysis/APK_STATIC_ANALYSIS_REPORT.md) | Older APK analysis and limitations; not a substitute for inspection of the newer APK |
| P7 | [Browser extension](../tools/dito-login-listener/listener.js) | Additional profile/alias lookup references |
| P8 | [Load purchase service](../dito-login-test/src/load-purchase.mjs) | Recipient checks, fee quote, validation, single-use local checkout, gateway parsing, and transaction status |
| P9 | [Load purchase tests](../dito-login-test/tests/load-purchase.test.mjs) | Mocked request and HTTP-handler validation; no real purchase |

Existing [capture inspection scripts](../analysis/captures/) reference local capture files, but those capture files were not available during this review. The notebook therefore does not treat those scripts as newly observed network responses.

## Official frontend sources

| ID | Public bundle | Evidence |
| --- | --- | --- |
| W1 | [Main bundle](https://my.dito.ph/umi.830d261c.js) | Service routes, general versus subscriber catalogs, marketing models, guest entry categories, and load/payment services |
| W2 | [Web Promo](https://my.dito.ph/p__Promo.fd3fdddc.async.js) | Category root built as `ECARE_PROMO_WEB_` plus the account role |
| W3 | [Buy Promo](https://my.dito.ph/p__h5__BuyPromo.2c4ebf1f.async.js) | Recipient selection, category loading, offer validation, payment handoff, and own-number purchase branch |
| W4 | [Just For You](https://my.dito.ph/p__h5__JustForYou.617e3dd2.async.js) | Personalized offer query with default advice code `ECARE_APP_PROMO` |
| W5 | [Offer Home](https://my.dito.ph/p__h5__Offer__Home.0f4e09ce.async.js) | Recipient validation, nested categories, recommendation tree, offer eligibility checks, and checkout |
| W6 | [Guest Buy Promo](https://my.dito.ph/p__h5__Guest__BuyPromo.071a04a2.async.js) | Guest entry cards using returned button URLs; not itself a complete promo list |
| W7 | [H5 Buy Load](https://my.dito.ph/p__h5__BuyLoad.3144f7f4.async.js) | Recipient mobile input and recipient-specific load amount requests |
| W8 | [Web Buy Load](https://my.dito.ph/p__BuyLoad.e99337fc.async.js) | Recipient input and payment submission targeting the selected number |
| W9 | [DITO prepaid FAQ](https://dito.ph/prepaid) | Public description of Long Expiry via GCash; does not confirm availability through our account session |

SHA-256 of inspected JavaScript:

```text
W1  1f0b6f9abe4217a8103573bfa66ed516857ada4a9d5cec7093c8a377ce860a20
W2  f6887fce8fcab4c86bdc770161af306ac9dc4e6d026a99a866897732cad7a0d9
W3  f4b9f667547777cb0990e2c3428a73657f53c5cc846dbc06b5778c3aa6ee57b0
W4  c7ca9600dd747f75ffd23da4b498ae6b035cd45ebce1c3bec5b321de561f11b5
W5  3f9680410043602924aa985be1d2018cb00095fb39c7d924f4db93ebdfd6daa5
W6  4ba1e7b03346aadd5887be55cba3b2016b39e8afbee70a2979b5131b37ea8af9
W7  6348295a8c30272771ddb7bed0204c5fdb1dc49f179e88769ea7719fbd83c6f3
W8  25ca03f8d887f24e65b69b8ea418ce19a5e2938581a7b0c0f331d654e1425bda
```
