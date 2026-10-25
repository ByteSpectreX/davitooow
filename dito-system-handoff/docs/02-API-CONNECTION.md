# API connection and request construction

This documents **the current implementation**, not a supported public DITO API contract. [The inventory](../reference/expantor/api-catalog.json) lists exact methods, paths, effects, and known request fields. [The sources](../reference/expantor/sources.md) distinguish project code from references found in DITO's frontend.

## Two API layers

| Layer | Address | Authentication |
| --- | --- | --- |
| Browser → our backend | Same-origin `/api/...` | HttpOnly `dito_session` cookie |
| Backend → DITO | `https://my.dito.ph/ecare/webs/` plus the implemented path | DITO token and request-specific headers |
| Other discovered services | Full paths under `/ecare/common/...` or `/market/...` | May require a different runtime prefix/auth context; not integrated merely because code references exist |

Do not append `/api` to the Postman `baseUrl`, pass the dashboard cookie as a DITO token, or treat a discovered marketing path as part of the verified `/ecare/webs` flow.

## Signatures and headers

The [Node backend](../reference/dito-login-test/proxy-server.js) and [Worker](../reference/dito-login-test/src/worker.mjs) construct the upstream connection. Read `callDito` and `computeSigncode` there when implementing another language or runtime.

The implemented header set includes `Accept`, JSON `Content-Type`, `Device-Type: web`, `authtoken`, `Auth-Token`, `timestamp`, and `signcode`. The timestamp is milliseconds since the Unix epoch, represented as a string.

The signer currently performs these exact operations:

1. Receive the path after `/ecare/webs/`, including any query string used by the caller.
2. For GET, use an empty request-body component.
3. For other methods with a body, apply `JSON.stringify`, remove every non-ASCII-alphanumeric character, then remove literal lowercase `null` occurrences.
4. Include the timestamp in the hashed input only when the path contains `/dmc/`.
5. SHA-256 the concatenation `"/" + path + bodyComponent + conditionalTimestamp + authToken + protocolSalt`, producing hexadecimal output.

These serialization rules are unusual and are not interchangeable with canonical JSON signing, MD5, or hashing an encoded form body. Retain the verified order of operations. The fixed salt/key/IV in source are protocol constants reproduced from the existing implementation, not user credentials or a substitute for authentication.

## Login

The dashboard flow supports account check, captcha creation, optional SMS OTP request, and login. Captcha state is tied to the dashboard session and expires after five minutes; a supplied captcha is checked and consumed once. OTP requests have a local 60-second throttle.

The backend encrypts the **raw** password or OTP using AES-128-CBC and the fixed protocol key/IV, then Base64-encodes the encrypted bytes. It does not Base64-encode the plaintext before encryption.

| Mode | `loginType` | `pwdType` |
| --- | --- | --- |
| Password | `"1"` | `"0"` |
| SMS OTP | `"0"` | `"1"` |

Both send `channelType: "2"`, the normalized account number, and the encrypted secret to `POST user/login`. A live captcha adds `requestSN` and `captcha`. The implementation accepts a token from the login payload or response header and keeps it on the server.

The documented history reports access tokens around 30 minutes and no usable refresh exchange in the inspected flow. Treat that as a historical observation, not a universal lifetime guarantee: inspect current `iat`/`exp`, account behavior, and supported renewal APIs. Current persistence uses a single password re-login attempt when **Stay signed in** is enabled; it is not token refresh.

## Session and identifier map

| Name | Meaning/use |
| --- | --- |
| `dito_session` | Random local session ID, not the DITO access token |
| `account.mobile` / `accNbr` | National mobile/service number; ordinary accepted mobile input is normalized to ten digits starting with 9 |
| `subsId` / `prodInstId` | Subscriber/product instance used for detail and allocation queries |
| `acctId` / `defaultAcctId` | Balance account identifier |
| `custId` | Customer identifier used in the implemented own-account promo purchase |
| `recipient` | Separate target of a regular-load purchase; does not need its own dashboard login |
| `paymentSn` | Payment-provider/DITO reference retained server-side for a status query |
| Quote ID | Local ID binding recipient, amount, total, method, payer, and expiry before confirmation |

Do not substitute one ID for another or replace the recipient in the existing own-account promo payment payload to implement gifting. Recipient load checkout is a distinct flow.

Node sessions are a process-local Map; the Worker encrypts KV session records using AES-GCM and a deployment secret. Node cookies are HttpOnly and SameSite=Lax; the reference local cookie does not set Secure. A production system needs an appropriate HTTPS cookie policy, deliberate session lifetime, redaction, and reviewed origin checks. Local checks decode JWT expiry for scheduling; they are not independent cryptographic JWT verification.

## Reading responses

Inspect HTTP status **and** the application fields expected by that endpoint. A 200 response, a payment reference, a created order, a usable gateway handoff, and confirmed payment completion are different observations.

For regular-load external checkout, the reference follows the inspected web branch: explicit errors block handoff, otherwise HTTPS redirects/forms or QR are parsed. The points-only `returnCode === 0` rule must not be applied indiscriminately to external gateways. A status `C` from the implemented transaction query confirms payment completion; `D`/`E` are mapped to failure. Other states remain unconfirmed. These mappings come from inspected frontend code and still need a dated real-account verification for the next system.

The generic `query` helper rejects unexpected application errors. Unsupported schemas stop the quote/checkout flow rather than inventing a price or marking success. New diagnostics retain response types, selected codes, and HTTP status; they omit raw messages, credentials, payment URLs, and references from browser-visible diagnostics.
