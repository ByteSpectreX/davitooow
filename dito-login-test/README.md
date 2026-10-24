# DITO Account Dashboard PWA

An installable web dashboard for the confirmed DITO web login flow: mobile validation, SMS OTP, graphic verification, account balance, and active promo balances.

## Current limits

- **Fetch all promos** loads every returned web category and follows pagination, deduplicating offers shared by multiple categories. Filter the fetched results by category or search by name, category, or validity. Any failed category, repeated page, or safety limit is reported as incomplete results. This covers the authenticated web catalog, not every DITO sales channel: DITO's [prepaid FAQ](https://dito.ph/prepaid) lists Long Expiry through GCash, so its absence from the web catalog does not establish account ineligibility.
- Linked numbers are associated with the primary DITO account, but the authenticated list/switch API has not yet been captured. This project does not guess that route or present independently logged-in numbers as DITO-linked accounts.
- The DITO web access token lasts about 30 minutes for both OTP and password logins, and there is no refresh exchange: the SPA bundles expose no token-renewal route, the refresh token embedded in the login JWT expires about a minute before the access token, and authenticated responses never rotate the token. So a single token cannot be extended.
- Persistence is instead achieved through silent re-login. DITO web accepts a captcha-free password login (the graphic code is only required after repeated failures), so with "Stay signed in" enabled the dashboard stores the account password and transparently logs in again with it whenever the 30-minute token expires. Re-auth is attempted at most once per refresh; any failure clears the stored password, shows the expired card, and requires a manual login, so a wrong password cannot loop into a DITO lockout.
- Security tradeoff: "Stay signed in" keeps your DITO password server-side. In the Worker it lives only inside the AES-GCM-encrypted KV session record; in the local Node proxy it lives only in process memory. Leave the option unchecked to require a fresh login every 30 minutes and never store the password.
- This is an unofficial proof of concept. Use only with accounts you own or are authorized to access.

## Structure

- `public/` — PWA shell, service worker, manifest, and icon.
- `src/worker.mjs` — Cloudflare Worker API. DITO tokens are held only in AES-GCM-encrypted KV session records.
- `proxy-server.js` — original localhost Node proxy; its sessions remain process-memory-only.
- `wrangler.jsonc` — Worker static-assets and KV configuration.

## Local and GitHub Codespaces mode

Install the pinned dependencies once, then start the server from this directory:

```sh
npm install
npm start
```

Open `http://localhost:5174`. The Node server serves both the dashboard and `/api` on the same port.

In GitHub Codespaces, open port **5174** from the **Ports** panel and keep its visibility **Private**. Use that port's forwarded HTTPS URL for the dashboard. The frontend uses `/api` on the same forwarded URL, so no second port is needed. Keep the server task running while using the dashboard; restart it after the Codespace restarts.

The older two-terminal setup (Node on port 5174 plus `python -m http.server 5173 --bind 127.0.0.1 --directory public`) remains supported for localhost use only.

## Buy load for another recipient

In local Node mode, sign in and use **Buy load for someone**:

1. Enter a DITO recipient and check payment options. The recipient does not need to be signed in to this dashboard.
2. Enter the regular-load amount and choose one of the external online payment methods returned by DITO.
3. Review the recipient, load amount, quoted total, payment method, and five-minute quote expiry.
4. Click **Confirm and create payment** once, then **Open payment checkout** to complete the gateway payment. HTTPS redirects, gateway forms, and scan-to-pay QR responses are supported.
5. Use **Check payment status**. Only a DITO transaction response with status `C` is shown as completed. Creating checkout does not mean the recipient has received load.

This buys new regular load through an external payment gateway. It does not transfer the payer's existing DITO balance or use DITO points. The server verifies the recipient, obtains the authoritative fee quote, validates the amount, and binds the confirmed request to a saved server-side quote. Editing client fields cannot change that quote. Duplicate submissions use the same local session record and are never automatically retried after a network error.

Only payment channel/method pairs selected by DITO's inspected web checkout are offered; app-only/alternate provider methods are excluded. An unresolved payment for the same payer, recipient, and amount blocks another quote or confirmation even when a different method is selected. Checkout diagnostics expose only response types, HTTP status, and selected result codes; payment URLs, references, credentials, and raw messages are excluded. Earlier attempts without diagnostics still require transaction/provider-history checks.

Load orders, payment references, and gateway handoffs remain in process memory. Reloading the browser preserves their visibility while that server runs, but restarting the Node process loses them. Check DITO/payment-provider history before retrying any uncertain payment, especially after a restart. Keep the forwarded port private.

Cloudflare Worker mode explicitly disables this checkout and links to DITO's official Buy Load page. Encrypted KV sessions alone cannot guarantee atomic consumption of a payment quote across Worker instances. A durable coordinator is required before enabling checkout there.

The request flow was matched to DITO's public frontend code and tested with mocked upstream responses; an end-to-end purchase on a real account has not been performed. Unsupported response shapes fail closed. Gateway HTML is served in an opaque sandbox with upstream scripts blocked; a gateway requiring custom scripts may need the official DITO page.

See [Expantor study notes](../expantor/notes/2026-10-24-load-purchase.md) for the route mapping and validation record. Run the focused checks with `node tests/load-purchase.test.mjs` and `node tests/promo-catalog.test.mjs`.

## Cloudflare local development

1. Install the pinned tooling:

   ```powershell
   npm install
   ```

2. Copy `.dev.vars.example` to `.dev.vars` and replace the placeholder with a Base64-encoded random 32-byte encryption key.
3. Start a one-shot development session manually with `npm run dev`. Wrangler provides local KV emulation.

Do not put DITO tokens, OTPs, mobile numbers, or the real encryption key in source control.

## Cloudflare provisioning (not yet performed)

Deployment creates a public service and moves encrypted authentication state to Cloudflare. Review the Worker, configure access controls and a custom domain, and obtain explicit approval before running these steps.

1. Authenticate: `npx wrangler login`.
2. Create a KV namespace: `npx wrangler kv namespace create SESSION_STORE`.
3. Replace the all-zero namespace ID in `wrangler.jsonc` with the returned ID.
4. Add the production encryption secret: `npx wrangler secret put SESSION_ENCRYPTION_KEY`.
5. Run `npm run check`, then deploy only after approval with `npm run deploy`.

## Linked-account discovery

The decoded Android resources confirm a Linked Accounts screen, but the existing captures contain no request that lists or switches linked numbers. To implement it accurately, capture DITO traffic while opening that screen and switching once on an authorized test account. A connected test device or sanitized capture is required.

## Cloudflare references

- [Workers static asset configuration](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Workers KV bindings](https://developers.cloudflare.com/kv/learning/kv-bindings/)

Cloudflare documentation content was rephrased for compliance with licensing restrictions.
