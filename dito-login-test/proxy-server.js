const http = require("http");
const crypto = require("crypto");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const loadService = import("./src/load-purchase.mjs?revision=20261024-checkout2");

const PORT = Number(process.env.PORT || 5174);
const PWA_ORIGIN = "http://localhost:5173";
const DITO_BASE = "https://my.dito.ph/ecare/webs";
const AES_KEY = Buffer.from("4EGJ6D9CFFA2GG9A", "utf8");
const AES_IV = Buffer.from("0102030405060708", "utf8");
const SIGN_SALT = "32BytesString";
const PUBLIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/promo-catalog.mjs", ["promo-catalog.mjs", "text/javascript; charset=utf-8"]],
  ["/app.css", ["app.css", "text/css; charset=utf-8"]],
  ["/sw.js", ["sw.js", "text/javascript; charset=utf-8"]],
  ["/manifest.webmanifest", ["manifest.webmanifest", "application/manifest+json"]],
  ["/icons/icon.svg", ["icons/icon.svg", "image/svg+xml"]],
]);

async function servePublicFile(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  const pathname = new URL(req.url, "http://localhost").pathname;
  const asset = PUBLIC_FILES.get(pathname);
  if (!asset) return false;
  const [filename, contentType] = asset;
  const body = await readFile(path.join(__dirname, "public", filename));
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": body.length,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy": "default-src 'self'; connect-src 'self' http://localhost:5174 http://127.0.0.1:5174; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  });
  res.end(req.method === "HEAD" ? undefined : body);
  return true;
}

// Local proof-of-concept only: sessions disappear when this process stops.
let sessions = new Map();
const otpRequestTimes = new Map();

function aesEncryptBase64(plaintext) {
  const cipher = crypto.createCipheriv("aes-128-cbc", AES_KEY, AES_IV);
  return Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]).toString("base64");
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function computeSigncode(pathAfterWebs, method, bodyObj, authToken, timestamp) {
  let requestPart = "";
  if (method === "GET") {
    requestPart = "";
  } else if (bodyObj !== undefined) {
    requestPart = JSON.stringify(bodyObj)
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/null/g, "");
  }
  const dmcTimestamp = pathAfterWebs.includes("/dmc/") ? timestamp : "";
  return sha256Hex(
    `/${pathAfterWebs}${requestPart}${dmcTimestamp}${authToken || ""}${SIGN_SALT}`
  );
}

function safeUpstreamSummary(body) {
  if (!body || typeof body !== "object") return String(body || "").slice(0, 300);
  return {
    code: body.code,
    resultCode: body.resultCode,
    resultMsg: body.resultMsg,
    errorCode: body.errorCode,
    errorMsg: body.errorMsg,
    message: body.message,
    loginSuccess: body.loginSuccess,
  };
}

async function callDito(pathAfterWebs, method, bodyObj, authToken = "") {
  const timestamp = Date.now().toString();
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
    "Device-Type": "web",
    authtoken: authToken,
    "Auth-Token": authToken,
    timestamp,
    signcode: computeSigncode(pathAfterWebs, method, bodyObj, authToken, timestamp),
  };
  const options = { method, headers, signal: AbortSignal.timeout(20_000) };
  if (method !== "GET" && bodyObj !== undefined) {
    options.body = JSON.stringify(bodyObj);
  }

  const response = await fetch(`${DITO_BASE}/${pathAfterWebs}`, options);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  const authTokenHeader = response.headers.get("Auth-Token");
  if (!response.ok || body?.loginSuccess === false) {
    const safePath = pathAfterWebs.replace(/\d{7,}/g, "[redacted]");
    console.warn(
      `[DITO] ${method} /${safePath} -> ${response.status}`,
      safeUpstreamSummary(body)
    );
  }
  return {
    status: response.status,
    body,
    authToken: authTokenHeader,
  };
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separator = item.indexOf("=");
        return separator < 0
          ? [item, ""]
          : [item.slice(0, separator), decodeURIComponent(item.slice(separator + 1))];
      })
  );
}

function getSession(req) {
  const sessionId = parseCookies(req).dito_session;
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  return session ? { sessionId, session } : null;
}

function getOrCreateSession(req) {
  const current = getSession(req);
  if (current) return { ...current, created: false };
  const sessionId = crypto.randomBytes(32).toString("hex");
  const session = { accounts: new Map(), createdAt: Date.now() };
  sessions.set(sessionId, session);
  return { sessionId, session, created: true };
}

function corsHeaders(origin = PWA_ORIGIN) {
  const allowedOrigins = new Set([PWA_ORIGIN, "http://127.0.0.1:5173"]);
  const responseOrigin = allowedOrigins.has(origin) ? origin : PWA_ORIGIN;
  return {
    "Access-Control-Allow-Origin": responseOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    Vary: "Origin",
  };
}

function sendJson(res, status, value, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...corsHeaders(res.req?.headers.origin),
    ...extraHeaders,
  });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 16_384) reject(new Error("request body too large"));
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("invalid JSON"));
      }
    });
    req.on("error", reject);
  });
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
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8")).exp || null;
  } catch {
    return null;
  }
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
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    const issuedAt = claims.iat || null;
    const expiresAt = claims.exp || null;
    const minutes = issuedAt && expiresAt ? Math.round(((expiresAt - issuedAt) / 60) * 10) / 10 : null;
    return { issuedAt, expiresAt, minutes, hasRefreshToken: Boolean(claims.REFRESH_TOKEN) };
  } catch {
    return { issuedAt: null, expiresAt: null, minutes: null, hasRefreshToken: false };
  }
}

async function loadAccount(account) {
  const { token, userData, mobile } = account;
  const subsId = userData.subsId;
  if (!subsId) throw new Error("login response did not contain subsId");

  const subscriberResult = await callDito(
    `subs/qrySubsDetail?prodInstIds=${encodeURIComponent(subsId)}`,
    "GET",
    undefined,
    token
  );
  if (subscriberResult.status === 401 || subscriberResult.status === 403) {
    const expired = new Error("DITO session expired; sign in again");
    expired.expired = true;
    throw expired;
  }
  if (subscriberResult.status !== 200 || !subscriberResult.body) {
    throw new Error("subscriber lookup failed");
  }
  const subscriber = subscriberResult.body;
  const acctId = subscriber.defaultAcctId || userData.acctId;

  const [balanceResult, promosResult, summaryResult] = await Promise.all([
    acctId
      ? callDito(`account/${encodeURIComponent(acctId)}/balance`, "GET", undefined, token)
      : Promise.resolve({ status: 200, body: null }),
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
    password: aesEncryptBase64(account.password),
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
// live token, silently re-authenticating once if it has expired.
async function withFreshToken(current, mobile) {
  const accounts = current.session.accounts;
  const key = mobile && normalizeMobile(mobile) ? normalizeMobile(mobile) : null;
  const account = key ? accounts.get(key) : accounts.values().next().value;
  if (!account) return null;
  if (tokenExpired(account.token) && !(await reauthWithPassword(account))) {
    accounts.delete(account.mobile);
    return null;
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

async function handleLoadApi(req, res) {
  const service = await loadService;
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/load/capabilities" && req.method === "GET") {
    return sendJson(res, 200, { supported: true });
  }
  const origin = req.headers.origin;
  const requestHosts = [req.headers.host, req.headers["x-forwarded-host"]].filter(Boolean);
  const sameOrigin = origin && requestHosts.some((host) => origin === `https://${host}` || origin === `http://${host}`);
  const legacyOrigin = origin === PWA_ORIGIN || origin === "http://127.0.0.1:5173";
  if ((origin && !sameOrigin && !legacyOrigin) || req.headers["sec-fetch-site"] === "cross-site") {
    return sendJson(res, 403, { error: "cross-origin load request rejected" });
  }
  const current = getSession(req);
  if (!current) return sendJson(res, 401, { error: "Sign in before buying load." });
  try {
    if (url.pathname === "/api/load/orders" && req.method === "GET") {
      return sendJson(res, 200, { orders: Object.values(current.session.loadQuotes || {})
        .filter((quote) => quote.status !== "ready").map(service.publicQuote) });
    }
    if (url.pathname.startsWith("/api/load/checkout/") && req.method === "GET") {
      const quote = service.findLoadQuote(current.session, url.pathname.slice("/api/load/checkout/".length));
      if (!quote.gateway || quote.status !== "pending") return sendJson(res, 409, { error: "No pending checkout is available." });
      const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
      if (quote.gateway.type === "url") {
        res.writeHead(303, { ...headers, Location: quote.gateway.value });
        return res.end();
      }
      const nonce = crypto.randomBytes(24).toString("base64");
      let html;
      if (quote.gateway.type === "qr") {
        const QRCode = require("qrcode");
        const svg = await QRCode.toString(quote.gateway.value, { type: "svg", errorCorrectionLevel: "M" });
        html = `<!doctype html><meta charset="utf-8"><title>DITO load payment</title><h1>Scan to pay</h1><p>Scan this code using the selected payment app. Check payment status in your dashboard after paying.</p><div style="max-width:360px">${svg}</div>`;
      } else html = service.paymentFormPage(quote.gateway.value, nonce);
      res.writeHead(200, { ...headers, "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": `sandbox allow-forms allow-scripts; default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; form-action https:; base-uri 'none'; frame-ancestors 'none'` });
      return res.end(html);
    }
    if (req.method !== "POST" || !["/api/load/options", "/api/load/quote", "/api/load/submit", "/api/load/status"].includes(url.pathname)) {
      return sendJson(res, 404, { error: "not found" });
    }
    if (!req.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
      return sendJson(res, 415, { error: "Send a JSON request." });
    }
    const input = await readBody(req);
    if (url.pathname === "/api/load/submit" || url.pathname === "/api/load/status") {
      const quote = service.findLoadQuote(current.session, input.quoteId);
      if (url.pathname === "/api/load/submit" && quote.status !== "ready") {
        if (input.confirmed !== true) return sendJson(res, 400, { error: "Purchase confirmation required." });
        return sendJson(res, 200, { order: service.publicQuote(quote) });
      }
      const account = await withFreshToken(current, quote.accountMobile);
      if (!account) return sendJson(res, 401, { error: "Session expired. Sign in again; do not repeat the payment." });
      const call = (path, method, body) => callDito(path, method, body, account.token);
      const order = url.pathname === "/api/load/submit"
        ? await service.submitLoadQuote(call, quote, input.confirmed, Date.now(), current.session)
        : await service.checkLoadPayment(call, quote);
      return sendJson(res, 200, { order });
    }
    const account = await withFreshToken(current);
    if (!account) return sendJson(res, 401, { error: "Session expired; sign in again." });
    const call = (path, method, body) => callDito(path, method, body, account.token);
    if (url.pathname === "/api/load/options") return sendJson(res, 200, await service.loadOptions(call, input));
    return sendJson(res, 200, { quote: await service.createLoadQuote(call, current.session, account.mobile, input) });
  } catch (error) {
    return sendJson(res, error instanceof service.LoadError ? error.status : 502, {
      error: error instanceof service.LoadError ? error.message : "The load request could not be completed. Check pending payments before trying again.",
    });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(req.headers.origin));
    return res.end();
  }

  try {
    if (await servePublicFile(req, res)) return;

    if (req.url.startsWith("/api/load/")) return await handleLoadApi(req, res);

    if (req.url === "/api/health" && req.method === "GET") {
      return sendJson(res, 200, { ok: true });
    }

    if (req.url === "/api/captcha" && req.method === "GET") {
      const requestSN = crypto.randomUUID();
      const response = await fetch(`${DITO_BASE}/captcha/${requestSN}`, {
        headers: { Accept: "image/*" },
      });
      if (!response.ok) {
        throw new Error(`DITO captcha request failed with HTTP ${response.status}`);
      }

      const contentType = (response.headers.get("content-type") || "")
        .split(";", 1)[0]
        .toLowerCase();
      if (!contentType.startsWith("image/")) {
        throw new Error("DITO captcha response was not an image");
      }

      const image = Buffer.from(await response.arrayBuffer());
      if (image.length === 0 || image.length > 256_000) {
        throw new Error("DITO captcha image had an invalid size");
      }

      const { sessionId, session } = getOrCreateSession(req);
      session.captcha = { requestSN, createdAt: Date.now() };
      return sendJson(
        res,
        200,
        {
          requestSN,
          image: `data:${contentType};base64,${image.toString("base64")}`,
        },
        { "Set-Cookie": `dito_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/` }
      );
    }

    if (req.url === "/api/check" && req.method === "POST") {
      const mobile = normalizeMobile((await readBody(req)).mobile);
      if (!mobile) return sendJson(res, 400, { error: "invalid mobile" });
      const result = await callDito("user/login/check", "POST", { accNbr: mobile });
      return sendJson(res, result.status, { status: result.status, body: result.body });
    }

    if (req.url === "/api/send-otp" && req.method === "POST") {
      const mobile = normalizeMobile((await readBody(req)).mobile);
      if (!mobile) return sendJson(res, 400, { error: "invalid mobile" });

      const lastRequest = otpRequestTimes.get(mobile) || 0;
      const retryAfterMs = 60_000 - (Date.now() - lastRequest);
      if (retryAfterMs > 0) {
        return sendJson(res, 429, { error: "OTP recently requested", retryAfterMs });
      }

      const result = await callDito(`message/sms/1/${mobile}`, "POST", undefined);
      if (result.status === 200 && result.body === true) otpRequestTimes.set(mobile, Date.now());
      return sendJson(res, result.status, { status: result.status, body: result.body });
    }

    if (req.url === "/api/login" && req.method === "POST") {
      const body = await readBody(req);
      const mobile = normalizeMobile(body.mobile);
      const mode = body.mode === "password" ? "password" : "sms";
      const { otp, password, requestSN, captcha } = body;
      const secret = mode === "password" ? password : otp;
      const secretValid =
        mode === "password"
          ? typeof password === "string" && password.length >= 4 && password.length <= 64
          : typeof otp === "string" && /^\d{4,8}$/.test(otp);
      if (!mobile || !secretValid) {
        return sendJson(res, 400, { error: "invalid mobile or credential" });
      }

      // DITO only demands the graphic captcha after repeated failures, so it is
      // optional. When supplied it must match a live challenge; when omitted we
      // attempt a captcha-free login (the path needed for silent re-auth).
      const wantsCaptcha = typeof captcha === "string" && captcha.length > 0;
      const current = getOrCreateSession(req);
      if (wantsCaptcha) {
        const pendingCaptcha = current.session.captcha;
        if (
          typeof requestSN !== "string" ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestSN) ||
          !/^\w{4}$/.test(captcha)
        ) {
          return sendJson(res, 400, { error: "invalid verification code" });
        }
        if (
          !pendingCaptcha ||
          pendingCaptcha.requestSN !== requestSN ||
          Date.now() - pendingCaptcha.createdAt > 5 * 60_000
        ) {
          return sendJson(res, 400, { error: "verification code expired; request a new one" });
        }
        // Treat every graphic challenge as single-use, including failed attempts.
        current.session.captcha = null;
      }

      // Live validation confirmed DITO encrypts the raw secret directly (no
      // Base64 pre-encoding before AES-CBC). SMS OTP uses loginType 0 / pwdType 1;
      // password login uses loginType 1 / pwdType 0 (from the SPA bundle).
      const loginBody = {
        account: mobile,
        password: aesEncryptBase64(secret),
        channelType: "2",
        loginType: mode === "password" ? "1" : "0",
        pwdType: mode === "password" ? "0" : "1",
      };
      if (wantsCaptcha) {
        loginBody.requestSN = requestSN;
        loginBody.captcha = captcha;
      }
      const result = await callDito("user/login", "POST", loginBody);
      const payload = result.body;
      if (result.status !== 200 || payload?.loginSuccess !== true) {
        return sendJson(res, result.status, { status: result.status, body: payload });
      }

      const token = payload.token || payload.loginToken || result.authToken;
      if (!token) return sendJson(res, 502, { error: "login succeeded without a token" });

      const { sessionId, session } = current;
      const remember = mode === "password" && body.remember === true;
      const accountRecord = {
        mobile,
        token,
        userData: payload.userData || {},
        loggedInAt: Date.now(),
        mode,
      };
      // "Stay signed in" (password mode only): keep the password in the session
      // so the token can be silently renewed. Process-memory only in this proxy.
      if (remember) accountRecord.password = password;
      session.accounts.set(mobile, accountRecord);

      const lifetime = tokenLifetime(token);
      return sendJson(
        res,
        200,
        {
          status: 200,
          body: {
            loginSuccess: true,
            mode,
            autoRenew: remember,
            userData: payload.userData || {},
            accountCount: session.accounts.size,
            tokenExpiresAt: lifetime.expiresAt,
            tokenIssuedAt: lifetime.issuedAt,
            sessionMinutes: lifetime.minutes,
            hasRefreshToken: lifetime.hasRefreshToken,
          },
        },
        { "Set-Cookie": `dito_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/` }
      );
    }

    if (req.url === "/api/accounts" && req.method === "GET") {
      const current = getSession(req);
      if (!current) return sendJson(res, 401, { error: "not logged in" });

      const accounts = [];
      for (const account of current.session.accounts.values()) {
        let renewed = false;
        // Proactive: token already dead -> one silent re-auth if we kept the password.
        if (tokenExpired(account.token)) {
          if (await reauthWithPassword(account)) {
            renewed = true;
          } else {
            current.session.accounts.delete(account.mobile);
            accounts.push({ ok: false, expired: true, mobile: account.mobile, error: "DITO session expired; sign in again" });
            continue;
          }
        }
        try {
          accounts.push({ ok: true, renewed, ...(await loadAccount(account)) });
        } catch (error) {
          // Reactive: token rejected mid-call -> one silent re-auth, then retry once.
          if (error.expired && (await reauthWithPassword(account))) {
            try {
              accounts.push({ ok: true, renewed: true, ...(await loadAccount(account)) });
              continue;
            } catch (retryError) {
              error.message = retryError.message;
            }
          }
          if (error.expired) {
            current.session.accounts.delete(account.mobile);
            accounts.push({ ok: false, expired: true, mobile: account.mobile, error: error.message });
          } else {
            accounts.push({ ok: false, mobile: account.mobile, error: error.message });
          }
        }
      }
      return sendJson(res, 200, { accounts });
    }

    const urlPath = req.url.split("?")[0];

    if ((urlPath === "/api/history/recharge" || urlPath === "/api/history/package") && req.method === "POST") {
      const current = getSession(req);
      if (!current) return sendJson(res, 401, { error: "not logged in" });
      const { mobile, startDate, endDate, pageIndex, pageSize } = await readBody(req);
      const begin = ditoDate(startDate, false);
      const end = ditoDate(endDate, true);
      if (!begin || !end) return sendJson(res, 400, { error: "startDate and endDate must be YYYY-MM-DD" });
      const account = await withFreshToken(current, mobile);
      if (!account) return sendJson(res, 401, { error: "session expired; sign in again" });
      const page = clampPage(pageIndex, 1, 1000);
      const size = clampPage(pageSize, 20, 100);

      if (urlPath === "/api/history/recharge") {
        const result = await callDito("recharge/qryRechargeHis", "POST", {
          beginDate: begin, endDate: end, pageSize: size, pageIndex: page,
          accNbr: account.mobile, rechargeMode: "all",
        }, account.token);
        return sendJson(res, result.status, { status: result.status, body: result.body });
      }

      const subsId = account.userData?.subsId;
      if (!subsId) return sendJson(res, 422, { error: "no subscriber id on file; refresh the dashboard first" });
      const result = await callDito("subs/packageHisPageList", "POST", {
        prodInstId: Number(subsId), startDate: begin, endDate: end, pageSize: size, pageIndex: page,
      }, account.token);
      return sendJson(res, result.status, { status: result.status, body: result.body });
    }

    if (urlPath === "/api/points" && req.method === "GET") {
      const current = getSession(req);
      if (!current) return sendJson(res, 401, { error: "not logged in" });
      const mobile = new URL(req.url, "http://localhost").searchParams.get("mobile");
      const account = await withFreshToken(current, mobile);
      if (!account) return sendJson(res, 401, { error: "session expired; sign in again" });
      const result = await callDito("point/detail", "POST", {}, account.token);
      return sendJson(res, result.status, { status: result.status, body: result.body });
    }

    if (urlPath === "/api/promo/categories" && req.method === "GET") {
      const current = getSession(req);
      if (!current) return sendJson(res, 401, { error: "not logged in" });
      const mobile = new URL(req.url, "http://localhost").searchParams.get("mobile");
      const account = await withFreshToken(current, mobile);
      if (!account) return sendJson(res, 401, { error: "session expired; sign in again" });
      const result = await callDito("shop/catg/list", "POST", { parentCatgCode: "ECARE_PROMO_WEB_PREPAID" }, account.token);
      return sendJson(res, result.status, { status: result.status, body: result.body });
    }

    if (urlPath === "/api/promo/list" && req.method === "POST") {
      const current = getSession(req);
      if (!current) return sendJson(res, 401, { error: "not logged in" });
      const { catgCode, pageIndex, pageSize, mobile } = await readBody(req);
      if (typeof catgCode !== "string" || !catgCode || catgCode.length > 80) return sendJson(res, 400, { error: "catgCode required" });
      const account = await withFreshToken(current, mobile);
      if (!account) return sendJson(res, 401, { error: "session expired; sign in again" });
      const result = await callDito("subs/available/promo/list", "POST", {
        catgCodes: catgCode,
        pageInfo: { currentPage: clampPage(pageIndex, 1, 1000), pageSize: clampPage(pageSize, 20, 100) },
      }, account.token);
      return sendJson(res, result.status, { status: result.status, body: result.body });
    }

    // Purchase a promo from the DITO load balance. SPENDS real load; the
    // frontend must confirm before calling. Single payment/prePay (WSS) call.
    if (urlPath === "/api/promo/buy" && req.method === "POST") {
      const current = getSession(req);
      if (!current) return sendJson(res, 401, { error: "not logged in" });
      const { offerId, mobile } = await readBody(req);
      const offer = Number(offerId);
      if (!Number.isInteger(offer) || offer <= 0 || offer > 1e12) return sendJson(res, 400, { error: "invalid offerId" });
      const account = await withFreshToken(current, mobile);
      if (!account) return sendJson(res, 401, { error: "session expired; sign in again" });
      const custId = Number(account.userData?.custId);
      if (!Number.isInteger(custId)) return sendJson(res, 422, { error: "no customer id on file; refresh the dashboard first" });

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
      return sendJson(res, result.status, {
        status: result.status,
        purchased: Boolean(orderId) && !failure,
        orderId,
        error: failure || null,
        body,
      });
    }

    if (req.url === "/api/session" && req.method === "DELETE") {
      const current = getSession(req);
      if (current) sessions.delete(current.sessionId);
      return sendJson(
        res,
        200,
        { ok: true },
        { "Set-Cookie": "dito_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" }
      );
    }

    return sendJson(res, 404, { error: "not found" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
});

if (require.main === module) {
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`DITO dashboard and API listening on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  get sessions() { return sessions; },
  // Process-local lifecycle hook: a replacement handler can retain the same
  // session Map during an update, including pending payment references.
  adoptSessionStore(store) {
    if (!(store instanceof Map)) throw new TypeError("Session store must be a Map");
    sessions = store;
  },
};
