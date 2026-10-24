 (() => {
  "use strict";

  const ENDPOINTS = {
    LOGIN_CHECK: "login-check",
    SMS: "sms",
    LOGIN: "login",
  };
  const LOGIN_CHECK_PATH = "/ecare/webs/user/login/check";
  const LOGIN_PATH = "/ecare/webs/user/login";
  const SMS_PATH_PREFIX = "/ecare/webs/message/sms/";
  const BANNER_ID = "dito-login-result-listener";
  const PANEL_ID = "dito-password-login-panel";
  const AES_KEY = "4EGJ6D9CFFA2GG9A";
  const AES_IV = "0102030405060708";
  const SIGNING_SUFFIX = "32BytesString";
  const encoder = new TextEncoder();
  const deviceHeaders = new Map();
  let passwordAttempted = false;

  function watchedEndpoint(value) {
    try {
      const raw = value instanceof Request ? value.url : String(value ?? "");
      const path = new URL(raw, window.location.href).pathname;
      if (path === LOGIN_CHECK_PATH) return ENDPOINTS.LOGIN_CHECK;
      if (path === LOGIN_PATH) return ENDPOINTS.LOGIN;
      if (path.startsWith(SMS_PATH_PREFIX) && !path.includes("/captcha/")) {
        return ENDPOINTS.SMS;
      }
      return null;
    } catch {
      return null;
    }
  }

  function rememberDeviceHeaders(input, init) {
    const allowed = ["appVersion", "Device-ID", "Device-Type", "contact_channel"];
    try {
      const source = new Headers(
        init?.headers || (input instanceof Request ? input.headers : undefined),
      );
      for (const name of allowed) {
        const value = source.get(name);
        if (value) deviceHeaders.set(name, value);
      }
    } catch {
      // Optional metadata only; safe defaults are used when unavailable.
    }
  }

  function isBlockedPrecheck(body) {
    return Number(body?.data?.result) === 1;
  }

  function bypassPrecheck(response, body) {
    const modifiedBody = {
      ...body,
      data: {
        ...body.data,
        result: 0,
      },
    };
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    return new Response(JSON.stringify(modifiedBody), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  function findResult(value, depth = 0, seen = new WeakSet()) {
    const result = {
      loginSuccess: undefined,
      tokenPresent: false,
      apiErrorPresent: false,
      captchaRequired: false,
      invalidPassword: false,
    };

    if (!value || typeof value !== "object" || depth > 6) {
      return result;
    }
    if (seen.has(value)) return result;
    seen.add(value);

    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();

      if (normalizedKey === "loginsuccess" && typeof child === "boolean") {
        result.loginSuccess = child;
      }

      if (
        ["token", "logintoken", "accesstoken", "refreshtoken"].includes(
          normalizedKey,
        ) &&
        typeof child === "string" &&
        child.length > 0
      ) {
        result.tokenPresent = true;
      }

      if (["oricode", "errorcode", "code"].includes(normalizedKey)) {
        const code = String(child ?? "");
        const successCodes = new Set(["", "0", "200", "S"]);
        if (!successCodes.has(code)) result.apiErrorPresent = true;
        if (
          code === "USER-CENTER-SERVER-00064" ||
          code === "USER-CENTER-SERVER-00071"
        ) {
          result.captchaRequired = true;
        }
        if (code === "USER-CENTER-SERVER-00003") {
          result.invalidPassword = true;
        }
      }

      if (child && typeof child === "object") {
        const nested = findResult(child, depth + 1, seen);
        result.loginSuccess ??= nested.loginSuccess;
        result.tokenPresent ||= nested.tokenPresent;
        result.apiErrorPresent ||= nested.apiErrorPresent;
        result.captchaRequired ||= nested.captchaRequired;
        result.invalidPassword ||= nested.invalidPassword;
      }
    }

    return result;
  }

  function ensureBanner() {
    let banner = document.getElementById(BANNER_ID);
    if (banner) return banner;
    if (!document.documentElement) return null;

    banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.setAttribute("role", "status");
    Object.assign(banner.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "12px",
      right: "12px",
      maxWidth: "440px",
      padding: "12px 14px",
      borderRadius: "8px",
      background: "#172554",
      color: "#ffffff",
      boxShadow: "0 4px 18px rgba(0,0,0,.28)",
      font: "14px/1.4 system-ui, sans-serif",
      whiteSpace: "pre-line",
    });
    banner.textContent =
      "DITO session login v1.4 active — password sign-in available below.";
    document.documentElement.appendChild(banner);
    return banner;
  }

  function setBanner(background, text) {
    const banner = ensureBanner();
    if (!banner) {
      setTimeout(() => setBanner(background, text), 50);
      return;
    }
    banner.style.background = background;
    banner.textContent = text;
  }

  function showResult(result, httpStatus, endpoint) {
    const privacyNotice =
      "Sensitive values were not logged, persisted, displayed, or transmitted elsewhere.";

    if (endpoint === ENDPOINTS.SMS) {
      if (httpStatus >= 200 && httpStatus < 300 && !result.apiErrorPresent) {
        setBanner(
          "#166534",
          `RESULT: SMS REQUEST ACCEPTED\nDITO accepted the browser's OTP request.\n\n${privacyNotice}`,
        );
      } else {
        setBanner(
          "#991b1b",
          `RESULT: SMS REQUEST REJECTED\nDITO rejected the OTP request (HTTP ${httpStatus || "status unavailable"}).\n\n${privacyNotice}`,
        );
      }
      return;
    }

    if (endpoint !== ENDPOINTS.LOGIN) return;

    if (result.tokenPresent) {
      setBanner(
        "#166534",
        `RESULT: PASSWORD ACCEPTED — TOKEN ISSUED\nDITO authenticated the account. The test did not persist the token. Tell Kiro: password accepted.\n\n${privacyNotice}`,
      );
    } else if (result.captchaRequired) {
      setBanner(
        "#92400e",
        `RESULT: CAPTCHA REQUIRED\nDITO requires its normal CAPTCHA flow. This tool will not bypass it. Tell Kiro: CAPTCHA required.\n\n${privacyNotice}`,
      );
    } else if (result.invalidPassword) {
      setBanner(
        "#991b1b",
        `RESULT: PASSWORD REJECTED\nDITO reported an incorrect password. Do not retry by guessing. Tell Kiro: password rejected.\n\n${privacyNotice}`,
      );
    } else if (result.loginSuccess === false || result.apiErrorPresent) {
      setBanner(
        "#991b1b",
        `RESULT: SERVER REFUSED PASSWORD LOGIN\nNo login token was issued. Tell Kiro: password login refused.\n\n${privacyNotice}`,
      );
    } else {
      setBanner(
        "#92400e",
        `RESULT: NO TOKEN DETECTED\nHTTP ${httpStatus || "status unavailable"}; the response was inconclusive. Tell Kiro: password inconclusive.\n\n${privacyNotice}`,
      );
    }
  }

  async function processFetchResponse(response, endpoint) {
    let body;
    try {
      body = await response.clone().json();
    } catch {
      showResult(findResult(null), response.status, endpoint);
      return response;
    }

    if (endpoint === ENDPOINTS.LOGIN_CHECK && isBlockedPrecheck(body)) {
      setBanner(
        "#166534",
        "RESULT: PRE-CHECK BYPASSED\nDITO returned result 1; only the page's local copy was changed to result 0.\n\nSensitive values were not logged, persisted, displayed, or transmitted elsewhere.",
      );
      return bypassPrecheck(response, body);
    }

    if (endpoint === ENDPOINTS.LOGIN_CHECK) {
      setBanner("#166534", "RESULT: PRE-CHECK PASSED");
      return response;
    }

    showResult(findResult(body), response.status, endpoint);
    return response;
  }

  function normalizeAccount(value) {
    let digits = String(value ?? "").replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("63")) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    return /^\d{10}$/.test(digits) ? digits : null;
  }

  function bytesToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  async function encryptPassword(password) {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AES_KEY),
      { name: "AES-CBC" },
      false,
      ["encrypt"],
    );
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: encoder.encode(AES_IV) },
      key,
      encoder.encode(password),
    );
    return bytesToBase64(encrypted);
  }

  async function sha256Hex(value) {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }

  function findLoginPayload(value, depth = 0, seen = new WeakSet()) {
    if (!value || typeof value !== "object" || depth > 6 || seen.has(value)) {
      return null;
    }
    seen.add(value);
    if (
      (typeof value.token === "string" || typeof value.loginToken === "string") &&
      value.userData &&
      typeof value.userData === "object"
    ) {
      return value;
    }
    for (const child of Object.values(value)) {
      const found = findLoginPayload(child, depth + 1, seen);
      if (found) return found;
    }
    return null;
  }

  function encodeSessionValue(value) {
    return bytesToBase64(encoder.encode(JSON.stringify(value)));
  }

  function setSessionCookie(name, value) {
    if (!value) return;
    document.cookie = `${name}=${value};path=/;Secure;SameSite=Lax`;
  }

  function establishPortalSession(responseBody, account) {
    const payload = findLoginPayload(responseBody);
    if (!payload) return false;

    const token = payload.token || payload.loginToken;
    const refreshToken = payload.refreshToken;
    const userData = payload.userData;

    setSessionCookie("Auth-Token", token);
    setSessionCookie("/portal:Auth-Token", token);
    setSessionCookie("Refresh-Token", refreshToken);
    localStorage.setItem("/portal:userInfo", encodeSessionValue(userData));
    localStorage.setItem("/portal:appUserInfo", JSON.stringify(userData));

    const loginCountKey = `/portal:${account}-loginCount`;
    const previousCount = Number(localStorage.getItem(loginCountKey) || "0");
    localStorage.setItem(loginCountKey, String(previousCount + 1));
    sessionStorage.removeItem("/portal:pwdWrongCount");
    return true;
  }

  async function passwordLogin(accountValue, passwordValue) {
    if (passwordAttempted) throw new Error("Only one attempt is allowed per page load.");
    const account = normalizeAccount(accountValue);
    if (!account) throw new Error("Enter a valid 11-digit DITO number.");
    if (!passwordValue) throw new Error("Enter your existing DITO password.");

    passwordAttempted = true;
    const encryptedPassword = await encryptPassword(passwordValue);
    const body = {
      account,
      password: encryptedPassword,
      channelType: "2",
      loginType: "1",
      pwdType: "0",
    };
    const cleanedBody = JSON.stringify(body)
      .replace(/[^a-zA-Z\d]/g, "")
      .replace(/null/g, "");
    const signcode = await sha256Hex(
      `/user/login${cleanedBody}${SIGNING_SUFFIX}`,
    );
    const timestamp = String(Date.now());
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
      "Auth-Token": "",
      "X-CSRF-TOKEN": "",
      authtoken: "",
      signcode,
      timestamp,
      "Device-Type": deviceHeaders.get("Device-Type") || "PC",
    });
    for (const [name, value] of deviceHeaders) headers.set(name, value);

    const response = await originalFetch(LOGIN_PATH, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });

    let responseBody;
    try {
      responseBody = await response.clone().json();
    } catch {
      responseBody = null;
    }

    const result = findResult(responseBody);
    if (result.tokenPresent && establishPortalSession(responseBody, account)) {
      setBanner(
        "#166534",
        "RESULT: SESSION ESTABLISHED\nPassword accepted. The official MyDITO session values were saved only on my.dito.ph. Redirecting to the account home page…",
      );
      setTimeout(() => window.location.assign("/pto/home"), 900);
      return;
    }
    showResult(result, response.status, ENDPOINTS.LOGIN);
  }

  function ensurePasswordPanel() {
    if (
      document.getElementById(PANEL_ID) ||
      !document.documentElement ||
      window.location.pathname !== "/"
    ) {
      return;
    }

    const host = document.createElement("div");
    host.id = PANEL_ID;
    Object.assign(host.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "150px",
      right: "12px",
    });
    const shadow = host.attachShadow({ mode: "closed" });
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <style>
        .panel { width: 350px; padding: 16px; border-radius: 10px; background: #fff;
          color: #172554; box-shadow: 0 5px 22px rgba(0,0,0,.3); font: 14px/1.4 system-ui,sans-serif; }
        h2 { margin: 0 0 6px; font-size: 18px; }
        p { margin: 0 0 12px; color: #475569; }
        label { display: block; margin: 10px 0 4px; font-weight: 600; }
        input { box-sizing: border-box; width: 100%; padding: 9px 10px; border: 1px solid #94a3b8;
          border-radius: 6px; font: inherit; }
        button { width: 100%; margin-top: 13px; padding: 10px; border: 0; border-radius: 6px;
          background: #1d4ed8; color: #fff; font: 600 14px system-ui,sans-serif; cursor: pointer; }
        button:disabled { opacity: .6; cursor: not-allowed; }
        .status { min-height: 20px; margin-top: 9px; color: #991b1b; }
        .privacy { margin-top: 10px; font-size: 12px; color: #64748b; }
      </style>
      <form class="panel" autocomplete="off">
        <h2>Local DITO password sign-in</h2>
        <p>Use your confirmed current password. One attempt is allowed per reload.</p>
        <label for="dito-account">DITO Home WiFi number</label>
        <input id="dito-account" inputmode="numeric" autocomplete="username" maxlength="13" required>
        <label for="dito-password">Existing password</label>
        <input id="dito-password" type="password" autocomplete="current-password" required>
        <button type="submit">Sign in with password</button>
        <div class="status" role="status"></div>
        <div class="privacy">The password is encrypted in this page, sent only to my.dito.ph, then immediately cleared. On success, only DITO's normal session cookies and profile data are saved on this site.</div>
      </form>`;
    shadow.appendChild(wrapper);
    const form = wrapper.querySelector("form");
    const accountInput = wrapper.querySelector("#dito-account");
    const passwordInput = wrapper.querySelector("#dito-password");
    const button = wrapper.querySelector("button");
    const status = wrapper.querySelector(".status");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (passwordAttempted) return;
      const password = passwordInput.value;
      button.disabled = true;
      status.style.color = "#475569";
      status.textContent = "Signing in directly with DITO…";
      try {
        const pending = passwordLogin(accountInput.value, password);
        passwordInput.value = "";
        await pending;
        status.style.color = "#166534";
        status.textContent = "Request completed. Read the result banner above.";
      } catch (error) {
        passwordInput.value = "";
        status.style.color = "#991b1b";
        status.textContent = error instanceof Error ? error.message : "Request failed.";
        if (!passwordAttempted) button.disabled = false;
      }
    });

    document.documentElement.appendChild(host);
  }

  function getCookie(name) {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(";")) {
      const cookie = part.trim();
      if (cookie.startsWith(prefix)) {
        const value = cookie.slice(prefix.length);
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }
    return "";
  }

  function getAuthToken() {
    return getCookie("Auth-Token") || getCookie("/portal:Auth-Token");
  }

  function readSessionUserData() {
    try {
      const raw = localStorage.getItem("/portal:appUserInfo");
      if (raw) return JSON.parse(raw);
    } catch {
      // Try the portal's encoded copy below.
    }
    try {
      const encoded = localStorage.getItem("/portal:userInfo");
      if (!encoded) return null;
      const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
      const bytes = Uint8Array.from(binary, (character) =>
        character.charCodeAt(0),
      );
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  function unwrapApiData(value) {
    if (
      value &&
      !Array.isArray(value) &&
      typeof value === "object" &&
      value.data !== undefined &&
      (value.code !== undefined || value.retCode !== undefined)
    ) {
      return value.data;
    }
    return value;
  }

  async function callDitoRead(path, method = "GET", body) {
    const token = getAuthToken();
    if (!token) throw new Error("MyDITO session is missing. Sign in again.");

    const normalizedMethod = method.toUpperCase();
    const timestamp = String(Date.now());
    const requestPart =
      normalizedMethod === "GET" || body === undefined
        ? ""
        : JSON.stringify(body)
            .replace(/[^a-zA-Z\d]/g, "")
            .replace(/null/g, "");
    const signcode = await sha256Hex(
      `/${path}${requestPart}${token}${SIGNING_SUFFIX}`,
    );
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
      "Auth-Token": token,
      "X-CSRF-TOKEN": token,
      authtoken: token,
      signcode,
      timestamp,
      "Device-Type": deviceHeaders.get("Device-Type") || "PC",
    });
    for (const [name, value] of deviceHeaders) headers.set(name, value);

    const options = {
      method: normalizedMethod,
      credentials: "include",
      headers,
    };
    if (normalizedMethod !== "GET" && body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await originalFetch(`/ecare/webs/${path}`, options);
    if (response.status === 401 || response.status === 403) {
      throw new Error("MyDITO session expired. Sign in with password again.");
    }
    if (!response.ok) {
      throw new Error(`DITO returned HTTP ${response.status} for a read request.`);
    }

    const rotatedToken = response.headers.get("Auth-Token");
    if (rotatedToken) {
      setSessionCookie("Auth-Token", rotatedToken);
      setSessionCookie("/portal:Auth-Token", rotatedToken);
    }

    try {
      return await response.json();
    } catch {
      throw new Error("DITO returned an unreadable response.");
    }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function formatDate(value) {
    if (!value) return "No expiry supplied";
    let date;
    if (typeof value === "number") {
      date = new Date(value < 100000000000 ? value * 1000 : value);
    } else {
      date = new Date(String(value).replace(" ", "T"));
    }
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString();
  }

  function formatResourceAmount(resource) {
    if (String(resource?.unlimitedFlag).toUpperCase() === "Y") {
      return "Unlimited";
    }
    const value =
      resource?.cascadeRealBalance ??
      resource?.formatRealBalance ??
      resource?.realBalance ??
      "—";
    const unit = resource?.formatRealBalanceUnitName || "";
    const text = String(value);
    return unit && !text.toLowerCase().includes(String(unit).toLowerCase())
      ? `${text} ${unit}`
      : text;
  }

  function formatGrossAmount(resource) {
    const value = resource?.formatGrossBalance ?? resource?.grossBalance;
    if (value === undefined || value === null || value === "") return "";
    const unit = resource?.formatGrossBalanceUnitName || "";
    const text = String(value);
    return unit && !text.toLowerCase().includes(String(unit).toLowerCase())
      ? `${text} ${unit}`
      : text;
  }

  function maskedAccount(userData) {
    const raw = String(
      userData?.accNbr || userData?.mobile || userData?.account || "",
    ).replace(/\D/g, "");
    if (!raw) return "Home WiFi account";
    return `•••• ${raw.slice(-4)}`;
  }

  function findAccountLabel(source, depth = 0, seen = new WeakSet()) {
    if (
      !source ||
      typeof source !== "object" ||
      depth > 4 ||
      seen.has(source)
    ) {
      return "";
    }
    seen.add(source);

    const preferredKeys = [
      "alias",
      "nickname",
      "accountalias",
      "accnbralias",
      "servicealias",
    ];
    const entries = Object.entries(source);
    const normalizedEntries = new Map(
      entries.map(([key, value]) => [
        key.toLowerCase().replace(/[^a-z0-9]/g, ""),
        value,
      ]),
    );

    for (const key of preferredKeys) {
      const value = normalizedEntries.get(key);
      if (typeof value !== "string") continue;
      const label = value.trim();
      if (label && label.length <= 80 && !/^\d+$/.test(label)) return label;
    }

    for (const [, value] of entries) {
      if (value && typeof value === "object") {
        const nested = findAccountLabel(value, depth + 1, seen);
        if (nested) return nested;
      }
    }
    return "";
  }

  function fetchedAccountLabel(userData, subscriber, profile) {
    return (
      findAccountLabel(userData) ||
      findAccountLabel(subscriber) ||
      findAccountLabel(profile)
    );
  }

  function dashboardDisplayName(userData, subscriber, profile) {
    return (
      fetchedAccountLabel(userData, subscriber, profile) ||
      "DITO nickname not returned"
    );
  }

  async function loadReadOnlyDashboard(view) {
    view.refresh.disabled = true;
    view.status.textContent = "Loading directly from DITO…";
    view.error.textContent = "";
    view.summary.replaceChildren();
    view.allocations.replaceChildren();

    try {
      const userData = readSessionUserData();
      const subsId = userData?.subsId;
      if (!userData || !subsId) {
        throw new Error("Subscriber details are missing. Sign in again.");
      }
      const numericSubsId = Number(subsId);
      if (!Number.isSafeInteger(numericSubsId) || numericSubsId <= 0) {
        throw new Error("The subscriber identifier is not usable.");
      }

      const subscriberPath = `subs/qrySubsDetail?prodInstIds=${encodeURIComponent(subsId)}`;
      const profilePromise = userData.userId
        ? callDitoRead(`cust/qryUserInfo/${encodeURIComponent(userData.userId)}`)
        : Promise.resolve(null);
      const [subscriberResponse, profileResponse] = await Promise.all([
        callDitoRead(subscriberPath),
        profilePromise.catch(() => null),
      ]);
      const resourcesResponse = await callDitoRead(
        "balance/balInfo",
        "POST",
        { prodInstId: numericSubsId },
      );

      const subscriber = unwrapApiData(subscriberResponse) || {};
      const profile = unwrapApiData(profileResponse) || {};
      const unwrappedResources = unwrapApiData(resourcesResponse);
      if (!Array.isArray(unwrappedResources)) {
        throw new Error("DITO did not return a balance-allocation list.");
      }

      const load = unwrappedResources.find(
        (item) => Number(item?.acctResId) === 1,
      );
      const allocations = unwrappedResources.filter(
        (item) => Number(item?.acctResId) !== 1,
      );

      const nickname = fetchedAccountLabel(userData, subscriber, profile);
      const name = createElement(
        "h2",
        "account-name",
        dashboardDisplayName(userData, subscriber, profile),
      );
      const nicknameSource = createElement(
        "small",
        nickname ? "nickname-found" : "nickname-missing",
        nickname
          ? "Nickname supplied by DITO"
          : "No nickname field was returned by DITO’s current web responses.",
      );
      nicknameSource.style.color = nickname ? "#166534" : "#b45309";
      const accountLine = createElement(
        "p",
        "muted",
        `${maskedAccount(userData)} · ${subscriber.statusName || "Home WiFi"}`,
      );
      const loadCard = createElement("article", "card load-card");
      loadCard.append(
        createElement("span", "eyebrow", "Load balance"),
        createElement(
          "strong",
          "load-value",
          load ? formatResourceAmount(load) : "Not returned",
        ),
        createElement(
          "small",
          "muted",
          load ? `Expires: ${formatDate(load.expDate)}` : "",
        ),
      );
      view.summary.append(name, nicknameSource, accountLine, loadCard);

      if (!allocations.length) {
        view.allocations.append(
          createElement(
            "p",
            "empty",
            "DITO returned no active promo allocations for this account.",
          ),
        );
      } else {
        for (const resource of allocations) {
          const card = createElement("article", "card allocation-card");
          const label =
            resource.offerName || resource.acctResName || "Active allocation";
          const gross = formatGrossAmount(resource);
          card.append(
            createElement("h3", "resource-name", label),
            createElement(
              "strong",
              "resource-value",
              formatResourceAmount(resource),
            ),
          );
          if (gross) {
            card.append(createElement("span", "muted", `of ${gross}`));
          }
          card.append(
            createElement(
              "small",
              "expiry",
              `Expires: ${formatDate(resource.expDate)}`,
            ),
          );
          view.allocations.append(card);
        }
      }

      view.status.textContent = `Updated ${new Date().toLocaleTimeString()} · read-only`;
    } catch (error) {
      view.status.textContent = "Unable to load dashboard.";
      view.error.textContent =
        error instanceof Error ? error.message : "Unknown read error.";
    } finally {
      view.refresh.disabled = false;
    }
  }

  function openReadOnlyDashboard() {
    const existing = document.getElementById("dito-readonly-dashboard");
    if (existing) return;
    document.getElementById(BANNER_ID)?.remove();

    const host = document.createElement("div");
    host.id = "dito-readonly-dashboard";
    Object.assign(host.style, {
      position: "fixed",
      zIndex: "2147483647",
      inset: "0",
    });
    const shadow = host.attachShadow({ mode: "closed" });
    const root = document.createElement("div");
    root.innerHTML = `
      <style>
        :host { color-scheme: light; }
        * { box-sizing: border-box; }
        .shell { position: fixed; inset: 0; overflow: auto; background: #f4f7fb;
          color: #14213d; font: 15px/1.45 system-ui, sans-serif; }
        header { position: sticky; top: 0; z-index: 1; display: flex; align-items: center;
          justify-content: space-between; gap: 16px; padding: 18px max(24px, calc((100vw - 1080px)/2));
          background: #082b70; color: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.2); }
        .brand { font-size: 20px; font-weight: 750; }
        .readonly { margin-left: 8px; padding: 3px 8px; border-radius: 999px;
          background: #dbeafe; color: #1e3a8a; font-size: 12px; }
        .actions { display: flex; gap: 8px; }
        button { border: 0; border-radius: 7px; padding: 9px 13px; cursor: pointer;
          font: 600 14px system-ui, sans-serif; }
        .refresh { background: #fff; color: #173d82; }
        .close { background: #31549a; color: #fff; }
        button:disabled { opacity: .6; cursor: wait; }
        main { width: min(1080px, calc(100% - 32px)); margin: 28px auto 48px; }
        .notice { padding: 12px 14px; border: 1px solid #bfdbfe; border-radius: 8px;
          background: #eff6ff; color: #1e3a8a; }
        .status { margin: 16px 0 4px; color: #64748b; }
        .error { min-height: 22px; color: #b91c1c; font-weight: 600; }
        .summary { margin: 18px 0 28px; }
        .account-name { margin: 0; font-size: 28px; }
        .muted { color: #64748b; }
        .card { display: flex; flex-direction: column; gap: 7px; padding: 18px;
          border: 1px solid #d9e2ef; border-radius: 12px; background: #fff;
          box-shadow: 0 3px 12px rgba(28,55,90,.06); }
        .load-card { width: min(360px, 100%); margin-top: 16px; border-left: 5px solid #f2cc0c; }
        .eyebrow { color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; }
        .load-value { font-size: 30px; color: #0b43a0; }
        h2.section-title { margin: 0 0 12px; font-size: 21px; }
        .allocation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
        .allocation-card { border-top: 4px solid #df142b; }
        .resource-name { margin: 0; font-size: 16px; }
        .resource-value { font-size: 25px; color: #0b43a0; }
        .expiry { margin-top: 5px; color: #475569; }
        .empty { padding: 24px; border: 1px dashed #94a3b8; border-radius: 10px;
          background: #fff; color: #64748b; }
        footer { margin-top: 28px; color: #64748b; font-size: 12px; }
      </style>
      <div class="shell">
        <header>
          <div><span class="brand">DITO Home WiFi Dashboard</span><span class="readonly">READ-ONLY</span></div>
          <div class="actions"><button class="refresh" type="button">Refresh</button><button class="close" type="button">Close</button></div>
        </header>
        <main>
          <div class="notice">This local view calls only DITO profile, subscriber-detail, and balance-allocation read endpoints. It cannot purchase promos, transfer load, or change the account.</div>
          <p class="status" role="status">Preparing dashboard…</p>
          <p class="error" role="alert"></p>
          <section class="summary"></section>
          <h2 class="section-title">Existing promo and active allocations</h2>
          <section class="allocation-grid"></section>
          <footer>Data stays in this browser tab and is loaded directly from my.dito.ph. Session tokens are never displayed or sent elsewhere.</footer>
        </main>
      </div>`;
    shadow.appendChild(root);
    document.documentElement.appendChild(host);

    const view = {
      refresh: root.querySelector(".refresh"),
      status: root.querySelector(".status"),
      error: root.querySelector(".error"),
      summary: root.querySelector(".summary"),
      allocations: root.querySelector(".allocation-grid"),
    };
    root.querySelector(".close").addEventListener("click", () => host.remove());
    view.refresh.addEventListener("click", () => loadReadOnlyDashboard(view));
    loadReadOnlyDashboard(view);
  }

  function ensureDashboardLauncher() {
    if (document.getElementById("dito-dashboard-launcher")) return;
    const host = document.createElement("div");
    host.id = "dito-dashboard-launcher";
    Object.assign(host.style, {
      position: "fixed",
      zIndex: "2147483646",
      right: "16px",
      bottom: "16px",
    });
    const shadow = host.attachShadow({ mode: "closed" });
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Open Home WiFi dashboard";
    Object.assign(button.style, {
      border: "0",
      borderRadius: "999px",
      padding: "12px 18px",
      background: "#df142b",
      color: "#fff",
      boxShadow: "0 4px 16px rgba(0,0,0,.25)",
      cursor: "pointer",
      font: "600 14px system-ui, sans-serif",
    });
    button.addEventListener("click", openReadOnlyDashboard);
    shadow.appendChild(button);
    document.documentElement.appendChild(host);
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = function patchedFetch(input, init) {
    const endpoint = watchedEndpoint(input);
    if (endpoint) rememberDeviceHeaders(input, init);
    const request = originalFetch(input, init);
    if (!endpoint) return request;

    return request.then(
      (response) => processFetchResponse(response, endpoint),
      (error) => {
        showResult(findResult(null), 0, endpoint);
        throw error;
      },
    );
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function patchedOpen(method, url) {
    this.__ditoListenerEndpoint = watchedEndpoint(url);
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function patchedSend() {
    const endpoint = this.__ditoListenerEndpoint;
    if (endpoint) {
      this.addEventListener(
        "loadend",
        () => {
          try {
            const body =
              this.responseType === "json"
                ? this.response
                : JSON.parse(this.responseText);
            if (endpoint === ENDPOINTS.LOGIN_CHECK && isBlockedPrecheck(body)) {
              setBanner(
                "#991b1b",
                "RESULT: XHR PRE-CHECK DETECTED\nThe safe override does not rewrite XHR objects.",
              );
              return;
            }
            showResult(findResult(body), this.status, endpoint);
          } catch {
            showResult(findResult(null), this.status, endpoint);
          }
        },
        { once: true },
      );
    }
    return originalSend.apply(this, arguments);
  };

  function initialize() {
    ensureBanner();
    if (getAuthToken() && readSessionUserData()?.subsId) {
      setBanner(
        "#166534",
        "DITO dashboard v1.7 active — authenticated read-only session detected.",
      );
      ensureDashboardLauncher();
      setTimeout(openReadOnlyDashboard, 150);
    } else {
      setBanner(
        "#172554",
        "DITO dashboard v1.7 active — sign in with password below.",
      );
      ensurePasswordPanel();
    }
  }
  if (document.documentElement) initialize();
  else document.addEventListener("DOMContentLoaded", initialize, { once: true });
})();
