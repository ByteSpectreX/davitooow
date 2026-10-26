# Historical request construction

Original observations are dated in [the import manifest](../../research/import-manifest.json) and [source registry](../../research/dito/sources.md). No provider adapter is active in this starter.

## Address and signing

Historical implemented requests use `https://my.dito.ph/ecare/webs/`. Discovered `/ecare/common/...` and `/market/...` routes may have different origins, prefixes or session contexts. The inventory records full paths to avoid silently mixing them.

The historical signer receives the path after `/ecare/webs/`, including its query string. GET has an empty body component. Other JSON bodies are stringified, stripped of non-ASCII-alphanumeric characters, then stripped of lowercase `null` occurrences. The timestamp joins the signed input only for paths containing `/dmc/`. SHA-256 hashes `"/" + path + bodyComponent + conditionalTimestamp + authToken + protocolSalt` to hexadecimal. Request headers include token variants, timestamp, signcode and device/channel metadata.

Do not implement signing by guessing from this prose. The source registry records exact original implementation locations and hashes. Port protocol code only after retrieving/reviewing those sources and adding deterministic parity fixtures. Device metadata varies by flow: the historical web reference uses `web`, while the existing DVito configuration describes `PC` for Home WiFi. A generic copied header set is not verified for every account type.

## Authentication and identifiers

Historical login encrypts the raw password or OTP with AES-128-CBC using protocol constants before Base64 encoding. Password mode uses loginType `1` / pwdType `0`; OTP mode uses `0` / `1`, with channelType `2`. Captcha can be conditional. No OTP or login request is authorized merely by reading this reference.

| Value | Meaning |
| --- | --- |
| App session | Our application identity; separate from DITO authentication |
| DITO token | Provider credential; backend-only |
| `accNbr` | Mobile/service number |
| `subsId` / `prodInstId` | Subscriber/product instance identifier |
| `acctId` | Provider balance account identifier |
| `custId` | Provider customer identifier |
| Supplier payer | Account funding the promo |
| Recipient | SIM receiving the promo, independently identified |
| `paymentSn` | Provider correlation/reference, not proof of completion |

Historical token lifetime was reported around 30 minutes. Recheck current behavior; a stored-password re-login is not token refresh. Do not inherit remembered-password storage automatically. Use encrypted server-held sessions and explicit reconnection handling.

## Responses

Check both HTTP status and endpoint-specific application fields. HTTP 200, created order, gateway handoff, completed payment and delivered promo are separate observations. The historical regular-load transaction branch maps `C` to completed payment and `D`/`E` to failure; do not assume these establish recipient data-promo delivery. Unsupported or ambiguous schemas remain uncertain.
