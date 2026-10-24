# DITO Account Dashboard PWA

An installable web dashboard for the confirmed DITO web login flow: mobile validation, SMS OTP, graphic verification, account balance, and active promo balances.

## Current limits

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

## Existing localhost mode

Run these in separate terminals from this directory:

```powershell
node proxy-server.js
python -m http.server 5173 --bind 127.0.0.1 --directory public
```

Open `http://localhost:5173`. In this mode, the frontend automatically uses `http://localhost:5174/api`.

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
