const DITO_BASE = "https://my.dito.ph/ecare/webs";
const DITO_AES_KEY = "4EGJ6D9CFFA2GG9A";
const DITO_AES_IV = "0102030405060708";
const SIGN_SALT = "32BytesString";
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function hex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

async function aesEncryptOtp(otp) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(DITO_AES_KEY), { name: "AES-CBC" }, false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv: encoder.encode(DITO_AES_IV) }, key, encoder.encode(otp));
  return bytesToBase64(new Uint8Array(encrypted));
}

async function computeSigncode(path, method, body, authToken, timestamp) {
  let requestPart = "";
  if (method !== "GET" && body !== undefined) {
    requestPart = JSON.stringify(body).replace(/[^a-zA-Z0-9]/g, "").replace(/null/g, "");
  }
  const dmcTimestamp = path.includes("/dmc/") ? timestamp : "";
  return sha256Hex(`/${path}${requestPart}${dmcTimestamp}${authToken || ""}${SIGN_SALT}`);
}

async function callDito(path, method, body, authToken = "") {
  const timestamp = Date.now().toString();
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
    "Device-Type": "web",
    authtoken: authToken,
    "Auth-Token": authToken,
    timestamp,
    signcode: await computeSigncode(path, method, body, authToken, timestamp),
  };
  const options = { method, headers };
  if (method !== "GET" && body !== undefined) options.body = JSON.stringify(body);

  const response = await fetch(`${DITO_BASE}/${path}`, options);
  const text = await response.text();
  let parsed;
  try { parsed = JSON.parse(text); }
  catch { parsed = text; }
  return { status: response.status, body: parsed, authToken: response.headers.get("Auth-Token") };
}

function json(status, value, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.get("Cookie") || "").split(";").map((item) => item.trim()).filter(Boolean).map((item) => {
    const separator = item.indexOf("=");
    return separator < 0 ? [item, ""] : [item.slice(0, separator), decodeURIComponent(item.slice(separator + 1))];
  }));
}

function randomId() {
  return hex(crypto.getRandomValues(new Uint8Array(32)));
}

async function sessionKey(env) {
  if (!env.SESSION_ENCRYPTION_KEY) throw new Error("SESSION_ENCRYPTION_KEY is not configured");
  const raw = base64ToBytes(env.SESSION_ENCRYPTION_KEY.trim());
  if (raw.length !== 32) throw new Error("SESSION_ENCRYPTION_KEY must be a Base64-encoded 32-byte key");
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptSession(session, env) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await sessionKey(env), encoder.encode(JSON.stringify(session)));
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

async function decryptSession(value, env) {
  const [ivValue, encryptedValue] = value.split(".");
  if (!ivValue || !encryptedValue) throw new Error("invalid encrypted session");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivValue) },
    await sessionKey(env),
    base64ToBytes(encryptedValue),
  );
  return JSON.parse(decoder.decode(decrypted));
}

async function loadSession(request, env) {
  const sessionId = parseCookies(request).dito_session;
  if (!sessionId || !/^[a-f0-9]{64}$/.test(sessionId)) return null;
  const stored = await env.SESSION_STORE.get(`session:${sessionId}`);
  if (!stored) return null;
  try { return { sessionId, session: await decryptSession(stored, env) }; }
  catch {
    await env.SESSION_STORE.delete(`session:${sessionId}`);
    return null;
  }
}

async function saveSession(sessionId, session, env) {
  await env.SESSION_STORE.put(`session:${sessionId}`, await encryptSession(session, env), { expirationTtl: SESSION_SECONDS });
}

async function getOrCreateSession(request, env) {
  const current = await loadSession(request, env);
  if (current) return current;
  return { sessionId: randomId(), session: { accounts: {}, createdAt: Date.now(), captcha: null } };
}

function sessionCookie(sessionId) {
  return `dito_session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}`;
}

function clearSessionCookie() {
  return "dito_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
}

async function readBody(request) {
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > 16_384) throw new Error("request body too large");
  const text = await request.text();
  if (text.length > 16_384) throw new Error("request body too large");
  try { return text ? JSON.parse(text) : {}; }
  catch { throw new Error("invalid JSON"); }
}

// DITO expects the 10-digit national number (9XXXXXXXXX, no leading 0).
// Accept the common user formats and normalize to that canonical form.
function normalizeMobile(value) {
  if (typeof value !== "string") return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("63")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^9\d{9}$/.test(digits) ? digits : null;
}

function jwtExpiry(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(decoder.decode(base64ToBytes(payload))).exp || null;
  } catch { return null; }
}

// DITO web access tokens live ~30 minutes and there is no refresh endpoint
// (confirmed from captured SPA bundles and login JWT), so an expired token can
// only be replaced by a full re-login. Treat a token within the skew window as
// already dead to avoid firing calls that DITO will reject.
function tokenExpired(token, skewSeconds = 30) {
  const exp = jwtExpiry(token);
  if (!exp) return false;
  return exp * 1000 <= Date.now() + skewSeconds * 1000;
}

// Decode iat/exp from the DITO access token to report the granted session
// length. Also surfaces whether the login handed back a refresh token.
function tokenLifetime(token) {
  try {
    const claims = JSON.parse(decoder.decode(base64ToBytes(token.split(".")[1])));
    const issuedAt = claims.iat || null;
    const expiresAt = claims.exp || null;
    const minutes = issuedAt && expiresAt ? Math.round(((expiresAt - issuedAt) / 60) * 10) / 10 : null;
    return { issuedAt, expiresAt, minutes, hasRefreshToken: Boolean(claims.REFRESH_TOKEN) };
  } catch { return { issuedAt: null, expiresAt: null, minutes: null, hasRefreshToken: false }; }
}

function verifySameOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function loadAccount(account) {
  const { token, userData, mobile } = account;
  const subsId = userData.subsId;
  if (!subsId) throw new Error("login response did not contain subsId");

  const subscriberResult = await callDito(`subs/qrySubsDetail?prodInstIds=${encodeURIComponent(subsId)}`, "GET", undefined, token);
  if (subscriberResult.status === 401 || subscriberResult.status === 403) {
    const expired = new Error("DITO session expired; sign in again");
    expired.expired = true;
    throw expired;
  }
  if (subscriberResult.status !== 200 || !subscriberResult.body) throw new Error("subscriber lookup failed");
  const subscriber = subscriberResult.body;
  const acctId = subscriber.defaultAcctId || userData.acctId;
  const [balanceResult, promosResult, summaryResult] = await Promise.all([
    acctId ? callDito(`account/${encodeURIComponent(acctId)}/balance`, "GET", undefined, token) : { status: 200, body: null },
    callDito("balance/balInfo", "POST", { prodInstId: Number(subsId) }, token),
    callDito("balance/balInfo/glSumInfo", "POST", { prodInstId: Number(subsId) }, token),
  ]);
  return {
    mobile,
    userData,
    subscriber,
    balance: balanceResult.body,
    promos: Array.isArray(promosResult.body) ? promosResult.body : [],
    summary: Array.isArray(summaryResult.body) ? summaryResult.body : [],
    tokenExpiresAt: jwtExpiry(token),
  };
}

// Silent re-authentication: when the 30-minute token dies, log in again with
// the stored password (captcha-free, no OTP) to get a fresh token. Mutates the
// account in place. Returns true only on a confirmed new token. Callers must
// attempt this at most once per request so a wrong password cannot loop into a
// DITO lockout.
async function reauthWithPassword(account) {
  if (!account.password) return false;
  const result = await callDito("user/login", "POST", {
    account: account.mobile,
    password: await aesEncryptOtp(account.password),
    channelType: "2",
    loginType: "1",
    pwdType: "0",
  });
  const payload = result.body;
  if (result.status === 200 && payload?.loginSuccess === true) {
    const token = payload.token || payload.loginToken || result.authToken;
    if (token) {
      account.token = token;
      account.userData = payload.userData || account.userData;
      account.loggedInAt = Date.now();
      return true;
    }
  }
  return false;
}

// Resolve the requested account (by mobile, or the first one) and guarantee a
// live token, silently re-authenticating once if it has expired. Returns null
// if the account is gone or cannot be renewed.
async function withFreshToken(current, mobile, env) {
  const accounts = current.session.accounts || {};
  const account = mobile && normalizeMobile(mobile)
    ? accounts[normalizeMobile(mobile)]
    : Object.values(accounts)[0];
  if (!account) return null;
  if (tokenExpired(account.token)) {
    const renewed = await reauthWithPassword(account);
    if (!renewed) {
      delete accounts[account.mobile];
      await saveSession(current.sessionId, current.session, env);
      return null;
    }
    await saveSession(current.sessionId, current.session, env);
  }
  return account;
}

// Convert a YYYY-MM-DD date into the "YYYY-MM-DD HH:MM:SS" form DITO expects.
function ditoDate(value, endOfDay = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return `${value} ${endOfDay ? "23:59:59" : "00:00:00"}`;
}

function clampPage(value, fallback, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : fallback;
}

async function handleApi(request, env) {
  if (!env.SESSION_STORE) return json(503, { error: "SESSION_STORE is not configured" });
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/health" && request.method === "GET") {
    return json(200, {
      ok: true,
      sessionStore: true,
      encryptionConfigured: Boolean(env.SESSION_ENCRYPTION_KEY),
      linkedAccounts: "capture-required",
    });
  }
  if (!verifySameOrigin(request)) return json(403, { error: "cross-origin request rejected" });

  if (path === "/api/load/capabilities" && request.method === "GET") {
    return json(200, { supported: false, reason: "Buy Load currently runs in local Node mode. Use DITO's official Buy Load checkout for this deployment." });
  }
  if (path.startsWith("/api/load/")) {
    return json(501, { error: "Load checkout requires the local Node server. Cloudflare KV does not provide the atomic checkout state needed to prevent duplicate submissions." });
  }

  if (path === "/api/captcha" && request.method === "GET") {
    await sessionKey(env);
    const requestSN = crypto.randomUUID();
    const response = await fetch(`${DITO_BASE}/captcha/${requestSN}`, { headers: { Accept: "image/*" } });
    if (!response.ok) throw new Error(`DITO captcha request failed with HTTP ${response.status}`);
    const contentType = (response.headers.get("content-type") || "").split(";", 1)[0].toLowerCase();
    if (!contentType.startsWith("image/")) throw new Error("DITO captcha response was not an image");
    const image = new Uint8Array(await response.arrayBuffer());
    if (!image.length || image.length > 256_000) throw new Error("DITO captcha image had an invalid size");

    const { sessionId, session } = await getOrCreateSession(request, env);
    session.captcha = { requestSN, createdAt: Date.now() };
    await saveSession(sessionId, session, env);
    return json(200, { requestSN, image: `data:${contentType};base64,${bytesToBase64(image)}` }, { "Set-Cookie": sessionCookie(sessionId) });
  }

  if (path === "/api/check" && request.method === "POST") {
    const mobile = normalizeMobile((await readBody(request)).mobile);
    if (!mobile) return json(400, { error: "invalid mobile" });
    const result = await callDito("user/login/check", "POST", { accNbr: mobile });
    return json(result.status, { status: result.status, body: result.body });
  }

  if (path === "/api/send-otp" && request.method === "POST") {
    const mobile = normalizeMobile((await readBody(request)).mobile);
    if (!mobile) return json(400, { error: "invalid mobile" });
    const throttleKey = `otp:${await sha256Hex(mobile)}`;
    if (await env.SESSION_STORE.get(throttleKey)) return json(429, { error: "OTP recently requested", retryAfterMs: 60_000 });
    const result = await callDito(`message/sms/1/${mobile}`, "POST", undefined);
    if (result.status === 200 && result.body === true) {
      await env.SESSION_STORE.put(throttleKey, "1", { expirationTtl: 60 });
    }
    return json(result.status, { status: result.status, body: result.body });
  }

  if (path === "/api/login" && request.method === "POST") {
    const requestBody = await readBody(request);
    const mobile = normalizeMobile(requestBody.mobile);
    const mode = requestBody.mode === "password" ? "password" : "sms";
    const { otp, password, requestSN, captcha } = requestBody;
    const secret = mode === "password" ? password : otp;
    const secretValid = mode === "password"
      ? typeof password === "string" && password.length >= 4 && password.length <= 64
      : typeof otp === "string" && /^\d{4,8}$/.test(otp);
    if (!mobile || !secretValid) {
      return json(400, { error: "invalid mobile or credential" });
    }
    // DITO only demands the graphic captcha after repeated failures, so it is
    // optional. When supplied it must match a live challenge; when omitted we
    // attempt a captcha-free login (the path needed for silent re-auth).
    const wantsCaptcha = typeof captcha === "string" && captcha.length > 0;
    const current = await getOrCreateSession(request, env);
    if (wantsCaptcha) {
      const pendingCaptcha = current.session.captcha;
      if (typeof requestSN !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestSN) || !/^\w{4}$/.test(captcha)) {
        return json(400, { error: "invalid verification code" });
      }
      if (!pendingCaptcha || pendingCaptcha.requestSN !== requestSN || Date.now() - pendingCaptcha.createdAt > 5 * 60_000) {
        return json(400, { error: "verification code expired; request a new one" });
      }
      current.session.captcha = null;
      await saveSession(current.sessionId, current.session, env);
    }

    // SMS OTP: loginType 0 / pwdType 1. Password: loginType 1 / pwdType 0.
    // Both encrypt the secret into the same `password` field (from SPA bundle).
    const loginBody = {
      account: mobile,
      password: await aesEncryptOtp(secret),
      channelType: "2",
      loginType: mode === "password" ? "1" : "0",
      pwdType: mode === "password" ? "0" : "1",
    };
    if (wantsCaptcha) { loginBody.requestSN = requestSN; loginBody.captcha = captcha; }
    const result = await callDito("user/login", "POST", loginBody);
    const payload = result.body;
    if (result.status !== 200 || payload?.loginSuccess !== true) return json(result.status, { status: result.status, body: payload });
    const token = payload.token || payload.loginToken || result.authToken;
    if (!token) return json(502, { error: "login succeeded without a token" });

    const accountRecord = { mobile, token, userData: payload.userData || {}, loggedInAt: Date.now(), mode };
    // "Stay signed in" (password mode only): keep the password inside the
    // AES-GCM-encrypted session so the token can be silently renewed.
    const remember = mode === "password" && requestBody.remember === true;
    if (remember) accountRecord.password = password;
    current.session.accounts[mobile] = accountRecord;
    await saveSession(current.sessionId, current.session, env);
    const lifetime = tokenLifetime(token);
    return json(200, {
      status: 200,
      body: {
        loginSuccess: true,
        mode,
        autoRenew: remember,
        userData: payload.userData || {},
        accountCount: Object.keys(current.session.accounts).length,
        tokenExpiresAt: lifetime.expiresAt,
        tokenIssuedAt: lifetime.issuedAt,
        sessionMinutes: lifetime.minutes,
        hasRefreshToken: lifetime.hasRefreshToken,
      },
    }, { "Set-Cookie": sessionCookie(current.sessionId) });
  }

  if (path === "/api/accounts" && request.method === "GET") {
    const current = await loadSession(request, env);
    if (!current) return json(401, { error: "not logged in" });
    const accounts = [];
    let dirty = false;
    for (const account of Object.values(current.session.accounts || {})) {
      let renewed = false;
      // Proactive: token already dead -> one silent re-auth if we kept the password.
      if (tokenExpired(account.token)) {
        if (await reauthWithPassword(account)) { renewed = true; dirty = true; }
        else {
          delete current.session.accounts[account.mobile];
          dirty = true;
          accounts.push({ ok: false, expired: true, mobile: account.mobile, error: "DITO session expired; sign in again" });
          continue;
        }
      }
      try {
        accounts.push({ ok: true, renewed, ...(await loadAccount(account)) });
      } catch (error) {
        // Reactive: token rejected mid-call -> one silent re-auth, then retry once.
        if (error.expired && await reauthWithPassword(account)) {
          dirty = true;
          try { accounts.push({ ok: true, renewed: true, ...(await loadAccount(account)) }); continue; }
          catch (retryError) { error.message = retryError.message; }
        }
        if (error.expired) {
          delete current.session.accounts[account.mobile];
          dirty = true;
          accounts.push({ ok: false, expired: true, mobile: account.mobile, error: error.message });
        } else {
          accounts.push({ ok: false, mobile: account.mobile, error: error.message });
        }
      }
    }
    if (dirty) await saveSession(current.sessionId, current.session, env);
    return json(200, { accounts });
  }

  if ((path === "/api/history/recharge" || path === "/api/history/package") && request.method === "POST") {
    const current = await loadSession(request, env);
    if (!current) return json(401, { error: "not logged in" });
    const { mobile, startDate, endDate, pageIndex, pageSize } = await readBody(request);
    const begin = ditoDate(startDate, false);
    const end = ditoDate(endDate, true);
    if (!begin || !end) return json(400, { error: "startDate and endDate must be YYYY-MM-DD" });
    const account = await withFreshToken(current, mobile, env);
    if (!account) return json(401, { error: "session expired; sign in again" });
    const page = clampPage(pageIndex, 1, 1000);
    const size = clampPage(pageSize, 20, 100);

    if (path === "/api/history/recharge") {
      const result = await callDito("recharge/qryRechargeHis", "POST", {
        beginDate: begin, endDate: end, pageSize: size, pageIndex: page,
        accNbr: account.mobile, rechargeMode: "all",
      }, account.token);
      return json(result.status, { status: result.status, body: result.body });
    }

    const subsId = account.userData?.subsId;
    if (!subsId) return json(422, { error: "no subscriber id on file; refresh the dashboard first" });
    const result = await callDito("subs/packageHisPageList", "POST", {
      prodInstId: Number(subsId), startDate: begin, endDate: end, pageSize: size, pageIndex: page,
    }, account.token);
    return json(result.status, { status: result.status, body: result.body });
  }

  if (path === "/api/points" && request.method === "GET") {
    const current = await loadSession(request, env);
    if (!current) return json(401, { error: "not logged in" });
    const account = await withFreshToken(current, new URL(request.url).searchParams.get("mobile"), env);
    if (!account) return json(401, { error: "session expired; sign in again" });
    const result = await callDito("point/detail", "POST", {}, account.token);
    return json(result.status, { status: result.status, body: result.body });
  }

  if (path === "/api/promo/categories" && request.method === "GET") {
    const current = await loadSession(request, env);
    if (!current) return json(401, { error: "not logged in" });
    const account = await withFreshToken(current, new URL(request.url).searchParams.get("mobile"), env);
    if (!account) return json(401, { error: "session expired; sign in again" });
    const result = await callDito("shop/catg/list", "POST", { parentCatgCode: "ECARE_PROMO_WEB_PREPAID" }, account.token);
    return json(result.status, { status: result.status, body: result.body });
  }

  if (path === "/api/promo/list" && request.method === "POST") {
    const current = await loadSession(request, env);
    if (!current) return json(401, { error: "not logged in" });
    const { catgCode, pageIndex, pageSize, mobile } = await readBody(request);
    if (typeof catgCode !== "string" || !catgCode || catgCode.length > 80) return json(400, { error: "catgCode required" });
    const account = await withFreshToken(current, mobile, env);
    if (!account) return json(401, { error: "session expired; sign in again" });
    const result = await callDito("subs/available/promo/list", "POST", {
      catgCodes: catgCode,
      pageInfo: { currentPage: clampPage(pageIndex, 1, 1000), pageSize: clampPage(pageSize, 20, 100) },
    }, account.token);
    return json(result.status, { status: result.status, body: result.body });
  }

  // Purchase a promo paying from the DITO load balance. This SPENDS real load;
  // the frontend must confirm with the user before calling it. Captured flow:
  // a single payment/prePay call with payChannel WSS + billFlag true.
  if (path === "/api/promo/buy" && request.method === "POST") {
    const current = await loadSession(request, env);
    if (!current) return json(401, { error: "not logged in" });
    const { offerId, mobile } = await readBody(request);
    const offer = Number(offerId);
    if (!Number.isInteger(offer) || offer <= 0 || offer > 1e12) return json(400, { error: "invalid offerId" });
    const account = await withFreshToken(current, mobile, env);
    if (!account) return json(401, { error: "session expired; sign in again" });
    const custId = Number(account.userData?.custId);
    if (!Number.isInteger(custId)) return json(422, { error: "no customer id on file; refresh the dashboard first" });

    const result = await callDito("payment/prePay", "POST", {
      businessType: 2,
      appCode: "Web Selfcare",
      source: 5,
      payChannel: "WSS",
      servEventId: 1,
      custId,
      businessData: { accNbr: account.mobile, offerId: offer, billFlag: true },
    }, account.token);
    const body = result.body;
    const orderId = body?.payInfo?.orderId || null;
    const failure = body?.payInfo?.exceptionCode || body?.payInfo?.exceptionMsg;
    return json(result.status, {
      status: result.status,
      purchased: Boolean(orderId) && !failure,
      orderId,
      error: failure || null,
      body,
    });
  }

  if (path === "/api/session" && request.method === "DELETE") {
    const current = await loadSession(request, env);
    if (current) await env.SESSION_STORE.delete(`session:${current.sessionId}`);
    return json(200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  return json(404, { error: "not found" });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try { return await handleApi(request, env); }
    catch (error) {
      console.error("API request failed", { path: url.pathname, message: error.message });
      return json(500, { error: error.message });
    }
  },
};
