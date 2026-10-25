# DITO 2.11.38 APK Static Reverse-Engineering Report

**Artifact:** `DITO_2.11.38_APKPure.apk`  
**Analysis date:** 2026-09-28  
**Method:** Static analysis with APKTool 3.0.2, Java `keytool`, archive inspection, manifest/resource review, and smali review  
**Decoded output:** `analysis/apktool-decoded/`

## Executive summary

The APK is an Android telecom/customer application with account management, payments, rewards, top-up, transfer, support, maps, camera/OCR, push messaging, and embedded web/H5 features. It targets Android 15 and contains integrations for Google/Firebase, Huawei HMS, Facebook, WeChat, Alipay, Alibaba ARouter/mPaaS-style H5, iWhaleCloud, SensorsData, Realm, MMKV, and other Android libraries.

The APK is protected by a **SecNeo application wrapper**. APKTool recovered the manifest, resources, assets, native libraries, wrapper smali, and generated ARouter route metadata, but not the real `com.mydito` business class implementations. The wrapper identifies the real application as `com.mydito.DitoApplication` and loads it through native `libDexHelper.so`. This materially limits implementation-level conclusions.

No confirmed critical or high-severity vulnerability was found in the exposed static layer. The most concrete issue is a production-domain cleartext exception. Other meaningful findings—broad deep links/payment callbacks, H5 debug/verification settings, broad FileProvider roots, and an exported HMS service—require validation against runtime code hidden by SecNeo.

## Artifact identity

| Property | Value |
|---|---|
| Package | `com.mydito` |
| App label | DITO |
| Version | `2.11.38` |
| Version code | `20251201` |
| Minimum SDK | 23 / Android 6.0 |
| Target SDK | 35 / Android 15 |
| Compile SDK | 35 / Android 15 |
| APK size | 77,033,324 bytes |
| SHA-256 | `5D1B59830542FBFC21D477811101134C1CBFC965BB929963A7683DD0962EA386` |
| SHA-1 | `B3480F71C057E32604193DDC958818D4FE5C19AD` |
| Backup | Disabled (`android:allowBackup="false"`) |
| Debuggable | Not declared true |

Evidence: `analysis/apktool-decoded/apktool.yml`, `analysis/apktool-decoded/AndroidManifest.xml`.

The filename contains `APKPure`, but a filename alone does not prove download origin or official provenance. Compare the certificate fingerprint below with a trusted known-good DITO release before treating this artifact as authentic.

## Signing certificate

The JAR/APK signer certificate is self-signed, which is normal for Android application signing:

- Subject/issuer: `CN=way, OU=ztesoft, O=ued, C=86`
- Serial: `0ec302c9`
- Validity: 2018-03-06 through 2118-02-10
- Algorithm: SHA256withRSA
- Public key: RSA 2048-bit
- Certificate SHA-1: `6D:30:2D:8D:30:89:05:2A:38:DC:28:9B:43:11:AA:C9:70:28:1C:41`
- Certificate SHA-256: `85:8A:A2:7D:F1:1E:6D:04:99:A5:31:EE:F5:F7:CA:91:98:91:57:A7:49:5F:F6:0F:84:35:4E:73:FC:AB:F2:76`

Static inspection verified the signer certificate but did not independently verify every APK Signature Scheme block because `apksigner` is not installed.

## Packing and code visibility

The manifest replaces the normal application and component factory with:

- `android:name="com.secneo.apkwrapper.AW"`
- `android:appComponentFactory="com.secneo.apkwrapper.AP"`
- High-priority bootstrap provider `com.secneo.apkwrapper.CP`

`analysis/apktool-decoded/smali/com/secneo/apkwrapper/H.smali` contains:

- Package: `com.mydito`
- Real application: `com.mydito.DitoApplication`
- ARM loader: `DexHelper`
- x86 loader: `DexHelper-x86`
- ABI selection followed by `System.loadLibrary(...)`

No `.class ... Lcom/mydito/...` declarations were found in exposed smali. The only visible `com` namespaces are SecNeo and generated Alibaba ARouter metadata. The protected code likely becomes available only after native initialization at runtime.

**What cannot yet be verified:** authorization logic, API clients/base URLs hidden in code, deep-link validation, payment callback validation, WebView bridge safety, credential/token storage, cryptographic use, logging, root/debug checks, SQL/Realm access, and custom/native TLS behavior.

## Permissions and privacy footprint

Notable runtime or privacy-sensitive permissions include:

- Precise and coarse location
- Contacts
- Phone state and direct phone calls
- Camera and microphone
- Images, audio, and video media access
- Notifications
- Legacy external storage access
- Advertising ID

Special, restricted, or vendor-specific declarations include:

- `SYSTEM_ALERT_WINDOW`
- `READ_PRIVILEGED_PHONE_STATE`
- `OBSERVE_GRANT_REVOKE_PERMISSIONS`
- Fingerprint vendor access
- Samsung usage survey permission

`READ_PRIVILEGED_PHONE_STATE` and similar restricted permissions are generally unavailable to ordinary third-party apps; declaration does not prove they can be granted. Legacy storage permissions are constrained by scoped-storage behavior on modern Android. The broad permission footprint is not itself a vulnerability, but it raises impact if application code or an SDK is compromised.

## Externally reachable components and URI handlers

### Exported application activities

- `com.mydito.ui.login.GuidePageActivity`
  - Launcher activity
  - Handles unrestricted `sa85646696:` custom-scheme URIs
- `com.mydito.base.SchemeFilterActivity`
  - Verified HTTPS App Link: `https://app.dito.ph` with no path restriction
  - Unrestricted `mydito:` custom scheme
- `com.mydito.wxapi.WXPayEntryActivity`
  - Likely WeChat Pay callback based on package/name
- `com.iwhalecloud.nudges.activity.NudgesSchemeActivity`
  - Unrestricted `nudges:` custom scheme
- `com.alipay.sdk.app.PayResultActivity`
- `com.alipay.sdk.app.AlipayResultActivity`
- `com.facebook.CustomTabActivity`
  - `fbconnect://cct.com.mydito`

Fourteen exported launcher aliases are present but disabled by default. Custom schemes can be claimed by other installed applications; handler code must enforce authentication state, strict route/parameter allowlists, nonce/state binding, trusted destination allowlists, and transaction verification. `autoVerify=true` helps the HTTPS App Link only when domain verification succeeds; it does not protect custom schemes.

### Other exported components

Most exported framework components have appropriate system or signature permissions. One item needs runtime validation:

- `com.huawei.hms.support.api.push.service.HmsMsgService` is exported and has no manifest-level permission. Huawei HMS may perform internal caller/message validation, but the implementation is unavailable in the exposed smali.

The exported Facebook content provider is standard SDK surface. Huawei push receivers/providers use the app's signature-level permissions. WorkManager/ProfileInstaller exported components use system permissions such as `BIND_JOB_SERVICE` or `DUMP`.

Evidence: `analysis/apktool-decoded/AndroidManifest.xml`.

## Network and embedded web configuration

The active application network policy is `res/xml/network_security_config.xml`:

- Cleartext is disabled globally.
- Cleartext is explicitly enabled for `regdigital.dito.ph` and **all subdomains**.
- No XML certificate pins, custom trust anchors, or debug overrides are configured.

A secondary `res/xml/jz_network_security_config.xml` enables cleartext globally, but it is not referenced by the decoded application manifest. Its runtime relevance was not established.

`assets/config/custom_config.json` contains:

- Remote debug endpoint: `ws://mpaasproxy.digitalstrato.com:8083/host/`
- `h5_shouldverifyapp` set to `NO`
- External WebView enabled for SDK versions 11–31

These values are present in the production artifact, but protected code prevents confirming whether they are active. The main Android network policy would normally block cleartext to the non-exempt WebSocket host for platform networking stacks that honor Network Security Config; native or SDK-specific behavior may differ.

Other exposed network/configuration data includes Firebase project identifiers, Google client/API keys, a Maps text-search key, Facebook app ID, Huawei app ID, and a UC SDK key. Android client identifiers and Firebase configuration are commonly public, but they must be restricted by package name and signing certificate where supported. Firebase Database/Storage and backend authorization must not rely on key secrecy.

No plaintext private key, password, bearer token, or confirmed production backend secret was found in exposed text. This negative result is limited by packing.

## FileProvider configuration

Three private, URI-granting providers have broad eligible path roots:

- `res/xml/file_path.xml` includes root, complete internal files/cache, and broad external roots.
- `res/xml/ps_file_paths.xml` includes external and filesystem root paths.
- `res/xml/util_code_provider_paths.xml` includes full internal/external storage categories.

The providers are `exported=false`, which prevents direct external querying. Risk arises only if application code accepts attacker-controlled paths and grants a URI. Restrict path XML to the narrowest required subdirectories and validate every path before issuing grants.

## Native payload and supported ABIs

The APK supports `arm64-v8a`, `armeabi-v7a`, `x86`, and `x86_64`. Each ABI contains:

- `libDexHelper.so` — SecNeo protected-code loader
- `libdexjni.so` — DEX/JNI support
- `libmmkv.so` — Tencent MMKV storage
- `libpl_droidsonroids_gif.so` — GIF rendering
- `librealm-jni.so` — Realm database

Native internals were inventoried but not disassembled in this phase.

## Notable third-party integrations

Observed integrations include:

- SecNeo APK protection
- Alibaba ARouter and mPaaS/Nebula-style H5 configuration
- Google/Firebase Messaging, Analytics/Measurement, Data Transport, Install Referrer, Play Core, and Maps
- Huawei HMS Push/OpenDevice/GRS and AGConnect
- Facebook SDK
- Alipay and WeChat payment integrations
- iWhaleCloud CLP/Nudges/UCC modules
- SensorsData Analytics
- AndroidX WorkManager, Room, Startup, and ProfileInstaller
- Realm and Tencent MMKV
- Luck PictureSelector, Glide/OkHttp integration, EasyPermissions, AutoSize, GIF and camera/PDF components

Bundled PDF HTML references PDF.js 1.9.426 scripts from cdnjs with integrity metadata and cMaps from unpkg. This adds runtime supply-chain/availability dependencies and warrants an upgrade/dependency review; this report does not assert a specific exploitable PDF.js CVE.

## Findings

| Severity | Finding | Confidence |
|---|---|---|
| Medium | Cleartext HTTP is permitted for `regdigital.dito.ph` and all subdomains. HTTP traffic to this namespace would be vulnerable to on-path observation/modification. | Confirmed policy; actual HTTP traffic not confirmed |
| Medium | Unrestricted custom schemes and broad HTTPS route handling expose deep-link input, redirect, and payment callback surfaces. | Confirmed surface; exploitability depends on protected handlers |
| Medium | H5 assets contain a cleartext remote-debug WebSocket, disabled app verification, and external-WebView configuration. | Confirmed configuration; runtime activation unknown |
| Medium | FileProvider XML exposes very broad path roots. | Confirmed configuration; requires an unsafe URI grant in protected code |
| Low–Medium | Exported HMS message service has no manifest permission. | Confirmed surface; SDK internal validation unknown |
| Low | External PDF resources and an old PDF.js integration increase dependency/supply-chain risk. | Confirmed references; no specific exploit established |
| Informational | Embedded service identifiers/API keys require package/signing restrictions and backend rules review. | Confirmed identifiers; abuse not tested |
| Informational | Large sensitive-permission footprint increases privacy and compromise impact. | Confirmed declarations; usage/grants unknown |
| Limitation | SecNeo prevents implementation-level assurance from the decoded APK alone. | Confirmed |

No confirmed critical/high issue was found in the exposed static layer.

## Recommended remediation order

1. Remove the cleartext exception if possible. If legacy HTTP is unavoidable, constrain it to exact hosts, migrate endpoints to HTTPS, and do not send credentials or personal data over HTTP.
2. Review every exported URI/payment handler. Require strict URI allowlists, authentication gates, one-time state/nonce validation, server-side transaction verification, and safe WebView destination checks.
3. Confirm H5 production configuration. Remove remote-debug configuration and set app/content verification on unless a documented production requirement exists.
4. Narrow all FileProvider roots to dedicated subdirectories and audit every URI-grant call.
5. Confirm HMS service caller/message validation or protect/disable the exported service when possible.
6. Restrict Google/Maps keys to `com.mydito` plus the trusted signing certificate; review enabled APIs, quotas, and Firebase rules.
7. Upgrade and locally bundle PDF dependencies where practical.
8. Remove permissions that are unused or unavailable to a normal app, and request sensitive runtime permissions only at the feature point.

## Recommended next reverse-engineering phase

Because the core DEX is runtime-protected, the next useful phase is authorized dynamic extraction on a controlled emulator or test device:

1. Verify the APK certificate against a trusted release and install only in an isolated test environment.
2. Launch the app and wait until `com.mydito.DitoApplication` completes initialization.
3. Capture the loaded DEX from process memory or hook class loading after SecNeo decrypts it.
4. Decompile recovered DEX with JADX.
5. Review exported handlers, WebView bridges, API clients, authentication/token storage, TLS configuration, Realm/MMKV usage, and payment validation.
6. Run targeted dynamic tests for deep-link spoofing, callback tampering, WebView redirects, cleartext traffic, provider URI grants, and exported HMS intents.

Dynamic unpacking was not performed because no Android emulator/device or runtime instrumentation environment was provided in the workspace.

## Analysis artifacts

- Original APK: `DITO_2.11.38_APKPure.apk`
- Decoded tree: `analysis/apktool-decoded/`
- Manifest: `analysis/apktool-decoded/AndroidManifest.xml`
- APK metadata: `analysis/apktool-decoded/apktool.yml`
- Network policy: `analysis/apktool-decoded/res/xml/network_security_config.xml`
- H5 config: `analysis/apktool-decoded/assets/config/custom_config.json`
- SecNeo loader: `analysis/apktool-decoded/smali/com/secneo/apkwrapper/H.smali`
- Native libraries: `analysis/apktool-decoded/lib/`
