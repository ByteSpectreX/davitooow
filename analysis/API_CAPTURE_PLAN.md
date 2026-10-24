# DITO API Discovery Capture Plan

## Objective

Observe one legitimate DITO login session for the account owner to identify the OTP request, OTP verification, token issuance, balance, and active-promo requests. Do not bypass OTP, automate repeated OTP requests, or access another subscriber's data.

## Current state

- Connected phone: Poco X6 Pro 5G, Android 16 / SDK 36
- Installed app: `com.mydito` 2.12.05 (`2027000030`)
- Current phone proxy: none
- Phone security: stock `user` build, non-root ADB shell, `ro.debuggable=0`, SELinux Enforcing
- App: non-debuggable and SecNeo-protected
- PC address: `192.168.1.12`
- Phone address: `192.168.1.13`
- mitmproxy: 12.2.3 installed; local CA already exists
- Android emulator/SDK tools: not installed

The pulled 2.12.05 APK is at `analysis/DITO_2.12.05_device.apk`, and its decoded tree is at `analysis/apktool-decoded-2.12.05/`.

## Important limitation

DITO's active Android Network Security Config does not opt into trusting user-installed certificate authorities. On the stock Poco, adding mitmproxy as a normal user CA is therefore unlikely to decrypt DITO HTTPS traffic. It would also broaden interception capability for browsers or other apps that do trust user CAs.

No readable certificate-pinning code was found, but most business code is hidden by SecNeo. Absence in decoded smali does not prove absence at runtime.

## Recommended route: rootable test emulator

This route leaves the daily phone unchanged and allows the mitmproxy CA to be installed in the emulator's system trust store.

1. Install Android Studio or Android command-line SDK tools and an API 35/36 emulator image without the Play Store lock-down that prevents root access.
2. Create a clean test AVD. DITO packages x86/x86-64 native libraries, although SecNeo may still detect or reject an emulator.
3. Install the pulled, original signed 2.12.05 APK without modifying it.
4. Start mitmweb/mitmdump on the PC and configure the emulator proxy.
5. Install the mitmproxy CA as a system CA inside the disposable emulator.
6. Confirm ordinary HTTPS interception first using a non-sensitive test page.
7. Open DITO and perform one normal login using the account owner's mobile number and received OTP.
8. Save only the DITO flows needed for protocol analysis. Redact the mobile number, OTP, access token, refresh token, cookies, device identifiers, and account data from any report.
9. Identify the sequence:
   - bootstrap/configuration
   - mobile-number or subscriber validation
   - OTP request
   - OTP verification
   - access/refresh token issuance
   - profile/subscriber list
   - balance/load
   - active promos and expiration
10. Stop the proxy and destroy the emulator after exporting a sanitized capture.

If DITO rejects the emulator or TLS still fails, the next authorized phase would require runtime instrumentation on a disposable rooted test environment. SecNeo contains tracer/protection logic, so instrumentation may require additional analysis.

## Limited stock-phone baseline

This can identify destination hostnames and determine whether DITO accepts interception, but it may not expose HTTPS paths or bodies.

Proposed reversible changes:

1. Start mitmweb on PC TCP port 8080.
2. Allow inbound TCP 8080 through Windows Firewall for the private network only, if required.
3. Set the Poco Wi-Fi proxy to `192.168.1.12:8080`.
4. Open DITO once and inspect mitmproxy CONNECT/TLS events.
5. If HTTPS fails because DITO rejects the generated certificate, stop immediately; do not enter the mobile number or request an OTP.
6. Restore the phone proxy to **None** and remove any temporary firewall rule.

Installing the mitmproxy CA on the daily phone is not recommended as the first step. It is a security-setting change, may expose traffic from other apps that trust user CAs, and still probably will not make DITO trust the proxy.

## Changes requiring explicit approval

No phone, firewall, or trust-store setting has been changed yet. Explicit approval is required before any of the following:

- changing the Poco Wi-Fi/global proxy;
- opening an inbound Windows Firewall port;
- installing a CA certificate on the phone or an emulator;
- installing Android Studio/SDK/emulator dependencies;
- rooting, repackaging, resigning, or instrumenting an APK/device.

Repackaging DITO to alter its Network Security Config is not recommended: it changes the signing certificate and is likely to trigger SecNeo integrity controls or backend signature restrictions.

## Rollback checklist

- Set Poco Wi-Fi proxy back to **None**.
- Remove any mitmproxy user certificate if one was installed.
- Remove any temporary Windows Firewall rule.
- Stop mitmproxy/mitmweb.
- Delete raw captures after producing a redacted protocol description.
- Destroy the disposable emulator if the emulator route was used.

## Data-handling rules

- Never store or commit a real OTP.
- Never place access/refresh tokens, cookies, mobile numbers, account IDs, or device IDs in source files.
- Keep raw captures local and temporary.
- Use environment variables or a local untracked secrets file for any later proof-of-concept client.
- Implement strict OTP request throttling; manually trigger only the minimum number of OTP messages needed.
- Stop if the app or backend displays a security lockout, device-integrity warning, or unexpected account state.
