# Long Expiry promo discovery — 2026-10-29 UTC

The owner asked whether the promo in their screenshot can be fetched. The selected **Long Expiry 799** shows PHP 799, 80GB all-access data, unlimited all-network SMS, unlimited DITO-to-DITO calls, and 1,000 minutes to other mobile networks, valid for 365 days. The screenshot also shows 599 and 999 tiers. These details are user-supplied evidence; no account identifier or screenshot is retained here.

## Public sources checked

- [DITO prepaid FAQ](https://dito.ph/prepaid): the current FAQ recommends Long Expiry through GCash and describes the 599 tier as 40GB plus calls and texts for a year. This confirms a sales-channel lead, not the 799 offer's API identifier, exclusivity, or account eligibility.
- [GCash's load instructions](https://help.gcash.com/hc/en-us/articles/4413709634969-How-to-buy-load): users select Load, category/brand, recipient, then a promo. The page does not document an integration API or the exact Long Expiry SKU.
- [Public DITO main bundle](https://my.dito.ph/umi.830d261c.js): still distinguishes the general `offer/promo/list` from subscriber-specific `subs/available/promo/list` and implements request signing. Neither route establishes eligibility merely by listing an offer.
- [Public DITO offer-home bundle](https://my.dito.ph/p__h5__Offer__Home.0f4e09ce.async.js): handles recipient validation, returned category codes, nested categories, and separate personalized requests.

## Read-only API observations

No credentials, account login, OTP, recipient validation, payment quote, order, or purchase were used.

| Request | Observation | Limit |
| --- | --- | --- |
| `GET /ecare/common/entity/PTO_PROMO_CATG_FOR_GUEST/records` | HTTP 200; two public entry cards. The mobile entry deep-links to `ECARE_PROMO_PREPAID`; the other entry is for home service. | Entry cards are not an offer inventory. |
| `POST /ecare/webs/shop/catg/list`, parent `ECARE_PROMO_PREPAID` | HTTP 200; 14 top-level categories, with three children under Super Saver. The children are 90, 180 and 365 days. No returned category label says Long Expiry. | Category labels do not establish whether a specific offer is present. |
| `POST /ecare/webs/offer/promo/list`, individually using returned `Valid for 365 days`, `PROMO_PAY_IN_ADVANCE_PREPAID`, and the mobile root; page 1, size 100 | Each unsigned request returned HTTP 200 with `{}`. | Missing `promoList` is an inconclusive response, not an empty or complete catalog. |
| Same three public offer-list targets, with the signing format from the frontend/project, empty authentication, `referenceId` empty and `scope` Image | Each returned HTTP 417 and code `ECARE-COMMON-00009`, with no promo list. | This experiment failed to retrieve offers. It does not establish the reason, account eligibility, or that authentication alone will resolve it. |

The dashboard currently fixes its category root to `ECARE_PROMO_WEB_PREPAID`, which differs from the live guest mobile entry root. Broadening category traversal may improve discovery, but these results do not prove that doing so will expose Long Expiry.

## Result and next step

The promo has a supported public GCash discovery lead, but **direct programmatic retrieval of Long Expiry 799 remains unverified**. No exact DITO offer ID or partner SKU was found. Do not fabricate one, substitute another PHP 799 offer, or make a listed partner offer purchasable through the dashboard's own-account purchase route.

Next, inspect an authorized authenticated catalog response from the application showing the offer, stopping before checkout. Establish the public product name/ID, which service returned it, and whether it is a partner SKU or a DITO catalog offer. If it is a partner SKU, use that partner's supported integration; a partner identifier cannot be assumed valid in DITO's payment API. Retain sanitized summaries rather than raw account responses or session secrets. Separately verify recipient eligibility before enabling purchase.

This note does not claim a successful account query, eligible recipient, completed payment, or delivered promo. The frozen handoff reference and historical verification evidence were not changed.

## Owner clarification and comparison tooling

The owner later confirmed the screenshot is from GCash and reported their aunt previously purchased this promo through the DITO app. Historical app availability is user-reported and does not establish current catalog membership or the owner's account eligibility.

The local dashboard was not running when the expanded investigation began. Its saved task was started. Because local sessions are process-memory-only, no existing signed-in local session was available to the investigation.

A local read-only **Compare catalogs and offer IDs** action now checks both observed category roots, their returned nested categories, and both general/subscriber offer-list routes. It uses the first signed-in account's current token, refuses expired sessions without silently logging in, and does not query purchase/recipient-validation endpoints. Its report is an on-screen, selected-metadata comparison, not a raw account export. It stops on authentication rejection and limits requests to 80. Personalized categories requiring a separate flow are explicitly recorded as missing coverage.

The ID analysis keeps three meanings separate:

| Field | Meaning in this investigation | Purchase implication |
| --- | --- | --- |
| Category `id` / `code` | Identifies the shelf from which a listing was requested. | Never submitted as an offer ID. |
| `offerId` | Public identifier returned on an offer row. | Preserved as returned; no arithmetic or neighboring-ID guesses. |
| `relatedOfferId` | Another public identifier returned on an offer row; the existing dashboard purchase handler uses this field. | Preserved separately from `offerId`. Their interchangeability is not assumed. |
| Subscriber-list membership | The subscriber-available query returned that row using the signed-in account's token. | Evidence of listing only; checkout acceptance, balance sufficiency, and fulfillment remain unverified. |
| General-list membership | The general catalog returned that row. | Does not establish eligibility for the signed-in subscriber. |

The pagination helper now recognizes official `pageInfo.total`. The research comparison deduplicates by the pair of offer IDs so that distinct `offerId` values sharing one `relatedOfferId` are not silently collapsed. Long Expiry matching uses the returned name rather than assuming that all PHP 799 offers are the same promo.

Mocked validation: `npm --prefix dito-login-test test` passed all **39 tests** (24 checkout/HTTP tests and 15 catalog tests). Tests cover nested traversal, the two ID fields, general-only versus subscriber-listed offers, pagination totals, incomplete responses, authentication failures, request limits, selected report fields, and rejection of attempts to inject purchase paths into the research request. No live signed-in comparison or payment was completed by these tests.
