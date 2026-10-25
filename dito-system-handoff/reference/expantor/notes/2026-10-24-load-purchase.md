# Buy Load for another recipient — implementation study

Date: **2026-10-24 UTC**. Sources: W1, W8, P2, P3, P8, P9 in the [source index](../sources.md).

## Implemented flow

The local Node dashboard supports buying regular load for a selected recipient using an online payment method returned by DITO. It does not transfer the signed-in account's existing load balance. DITO points are excluded because the official web flow applies separate eligibility and OTP requirements.

| Dashboard route | Upstream behavior | Effects |
| --- | --- | --- |
| `GET /api/load/capabilities` | Local capability response | No upstream call |
| `POST /api/load/options` | `GET user/{recipient}/exist`; query denomination config and `payMethod/query` with `source: 5, payEvent: recharge` | Recipient/payment queries |
| `POST /api/load/quote` | Recheck options; `POST recharge/calcFee` with `amount, channelId: 2`; `POST recharge/amount/validation` with recipient and returned `originalAmount` | Query/validation; saves a five-minute quote |
| `POST /api/load/submit` | `POST payMethod/submit` with saved recipient, charge, payment/channel IDs, `servEventId: 1`, `channelId: 2` | May create a payment order; explicit confirmation required |
| `GET /api/load/orders` | Return session order summaries | No upstream call |
| `GET /api/load/checkout/{quoteId}` | Present the already-created gateway handoff | Opens payment gateway or QR; does not resubmit the DITO order |
| `POST /api/load/status` | `GET transaction?paymentSn={reference}` | Query; `C` completes the order, `D`/`E` report failure |

The fee response's `originalAmount` supplies the validation amount and checkout `charge`. Its `discountAmountDisplay` supplies the user-visible total. We do not hardcode a currency-unit multiplier or silently substitute an estimated price. Unsupported shapes stop before submitting an order.

## State and confirmation

- A quote binds the recipient, displayed amount/total, returned payment method, payer account, and expiry in the server session.
- The confirm request includes only the quote ID and literal `confirmed: true`; extra client price/recipient fields are ignored.
- The quote moves from `ready` to `submitting` synchronously before the upstream call. Within the local Node process, concurrent clicks and retries cannot submit it twice.
- A timeout, unsupported handoff, or ambiguous error leaves an `unknown` outcome. That quote cannot be resubmitted. Check transaction/history before starting another purchase.
- Pending orders can be reopened after browser reload while the Node process remains alive. Node restart loses this memory, including its duplicate-submission protection; provider history must then be checked first.
- Cloudflare Worker mode reports checkout unsupported before options are requested. KV's storage behavior is insufficient for an atomic financial confirmation across instances; add a durable coordinator before enabling it there.

## Gateway handling

Payment redirects must be HTTPS without URL credentials. Gateway forms are displayed in a separate opaque sandbox: remote resources and upstream scripts are blocked, and a nonce-authorized script submits only a HTTPS form in that window. QR images are generated locally with the pinned `qrcode` package; payment payloads are not sent to a third-party image service. No card details are collected in this dashboard.

## Verification

Focused tests use synthetic fixtures and mocked DITO responses. They cover recipient normalization, invalid recipients, unsupported payment methods, authoritative quote values, invalid amounts, explicit confirmation, expiry, concurrent duplicate submissions, timeouts, gateway URL restrictions, status mapping, origin/session isolation, tampered confirm payloads, sandbox headers, QR rendering, and the Cloudflare capability guard. Existing promo pagination tests also run.

These checks establish local request construction and control flow. They do not establish that DITO currently accepts a particular real account, amount, payment method, or gateway. No real payment or OTP was sent during implementation. The first authorized account check should record sanitized response shapes, then verify the displayed recipient and total before any separately confirmed purchase.

Validation result: 16 load-purchase tests and nine existing pagination tests passed. The production dependency audit reported zero vulnerabilities. The full audit reported four high-severity entries in the existing Wrangler development-tool dependency tree (Wrangler, Miniflare, Sharp, and the pinned Undici override); those tooling versions were not changed as part of this feature.

## Checkout correction after the first account report

The user reported multiple entries with a payment reference, no usable checkout, and an unknown outcome. This is an incomplete checkout, not evidence of a successful load purchase or a confirmed charge. The original implementation did not retain the response shape for these attempts, so the screenshot alone cannot establish their cause.

Further W8 inspection found two concrete implementation mismatches:

1. `renderPayMethodOptions` filters exact web channel/method pairs. The initial implementation exposed every method in the returned provider list, including alternate app/provider variants.
2. The official web code applies `returnCode === 0` to the points-payment branch. External methods instead inspect errors and consume a redirect/form/QR handoff. The initial implementation applied the points-only check to external responses too.

The corrected web pairs are `29:29`, `31:43`, `41:53`, `503:510`, `38:48`, `502:505`, `37:45`, and `42:55`. These are evidence from the inspected frontend build, not a guarantee of gateway availability.

Changes also block a second unresolved payment for the same payer/recipient/amount across different quotes and payment methods; preserve unexpired ready quotes so concurrent tabs cannot evade the check; retain redacted response diagnostics on future attempts; and show the time and recognized state returned by a status check. A status query can recover an existing handoff if DITO returns one; it never submits another order.

Regression validation: **23 load-purchase tests plus nine pagination tests passed**. The running request handler was replaced in place instead of restarting the process, with the session Map adopted by the replacement handler. The process reported zero stored sessions/payment records at update time, so no historical account responses or payment references could be recovered from it. No new purchase was submitted during this investigation. The temporary local debugger was closed after the update.

The exact earlier account result remains unverified. Preserve the distinction between a corrected code mismatch, a returned payment reference, a usable checkout, and transaction status `C` confirming completion.
