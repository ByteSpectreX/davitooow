# DITO Home WiFi Dashboard

Version 1.7 displays only an authoritative nickname supplied by DITO. It no longer supports a browser-local nickname and never falls back to the registered legal-owner name.

## Authoritative nickname lookup

The dashboard searches only alias-style fields (`alias`, `nickname`/`nickName`, `accountAlias`, `accNbrAlias`, and `serviceAlias`) in three authenticated DITO responses:

- Login `userData`
- `GET subs/qrySubsDetail?prodInstIds={subsId}`
- `GET cust/qryUserInfo/{userId}`

The customer-profile response is inspected only for alias-style fields. `firstName`, `middleName`, and `lastName` are never rendered or used as a fallback.

The heading displays either:

- The nickname/alias actually returned by DITO, with **Nickname supplied by DITO**; or
- **DITO nickname not returned**, meaning these web-accessible responses did not contain the value entered in the Android app's **Add a nickname for this number** field.

## Read-only data

The dashboard also calls `POST balance/balInfo` as a balance query to display load and active promo allocations. It contains no purchase, payment, transfer, profile update, linked-account mutation, OTP, catalog, or automatic re-login action.

## Update and check

1. In the **DITO-capture** Edge profile, open `edge://extensions`.
2. Reload **DITO Home WiFi Dashboard**.
3. Reload `https://my.dito.ph/` with **Ctrl+Shift+R**.
4. Confirm the banner says **v1.7**.
5. Open or refresh the dashboard.

Report only one of:

- `Nickname supplied by DITO` and whether it is the expected label; or
- `DITO nickname not returned`

Do not share the nickname, legal name, full number, balance, OTP, password, token, or account screenshots.

## Limitation

If version 1.7 reports **DITO nickname not returned**, the authoritative value is stored only in the Android app's separate Linked Accounts service and cannot be fetched through the verified web routes. Discovering that service requires an explicitly approved, redacted Android runtime capture while opening Linked Accounts.
