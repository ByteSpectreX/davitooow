"use strict";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const API = location.port === "5173" && LOCAL_HOSTS.has(location.hostname)
  ? `http://${location.hostname}:5174/api`
  : "/api";
const $ = (id) => document.getElementById(id);

// DITO expects the 10-digit national number (9XXXXXXXXX). Accept 09..., 9...,
// 63..., or +63... and normalize; return null when it cannot be a DITO number.
function normalizeMobile(value) {
  let digits = String(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("63")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^9\d{9}$/.test(digits) ? digits : null;
}

function log(message) {
  const safeMessage = String(message).replace(/\b\d{4,8}\b/g, "[SENSITIVE VALUE REDACTED]");
  $("log").textContent += `[${new Date().toLocaleTimeString()}] ${safeMessage}\n`;
  $("log").scrollTop = $("log").scrollHeight;
}

function setStatus(message, isError = false) {
  $("status").textContent = message;
  $("status").className = isError ? "error" : "ok";
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const contentType = response.headers.get("Content-Type") || "";
  const text = await response.text();
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`API returned a non-JSON response (HTTP ${response.status}). Make sure the local proxy is running on port 5174.`);
  }
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`API returned invalid JSON (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    const detail = body.error || body.body?.errorMsg || body.body?.resultMsg || body.body?.message ||
      body.body?.errorCode || body.body?.resultCode || `HTTP ${response.status}`;
    const error = new Error(String(detail));
    error.status = response.status;
    error.payload = body;
    throw error;
  }
  return body;
}

let captchaRequestSN = "";

const loginMode = () => (document.querySelector('input[name="mode"]:checked') || {}).value || "sms";

function applyMode() {
  const password = loginMode() === "password";
  $("sendOtp").textContent = password ? "Check account & continue" : "Check account & send OTP";
  $("otpField").classList.toggle("hidden", password);
  $("passwordField").classList.toggle("hidden", !password);
  // Force a fresh account check when switching methods.
  $("otpStep").classList.add("hidden");
  clearCaptcha();
  setStatus("");
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => radio.addEventListener("change", applyMode));

async function refreshCaptcha() {
  const button = $("refreshCaptcha");
  button.disabled = true;
  try {
    const challenge = await api("/captcha");
    if (!challenge.requestSN || !challenge.image?.startsWith("data:image/")) {
      throw new Error("DITO returned an invalid verification challenge");
    }
    captchaRequestSN = challenge.requestSN;
    $("captchaImage").src = challenge.image;
    $("captcha").value = "";
  } finally {
    button.disabled = false;
  }
}

function clearCaptcha() {
  captchaRequestSN = "";
  $("captcha").value = "";
  $("captchaImage").removeAttribute("src");
}

function formatExpiry(value) {
  if (!value) return "No expiry supplied";
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAccounts(accounts) {
  if (!accounts.length) {
    $("accounts").innerHTML = '<p class="muted">No account is signed in yet.</p>';
    return;
  }
  $("accounts").innerHTML = accounts.map((account) => {
    if (account.expired) {
      return `<article class="account expired"><h3>${escapeHtml(account.mobile)}</h3><p class="notice">DITO sessions expire after about 30 minutes and cannot be refreshed. Sign in again to reload balances.</p></article>`;
    }
    if (!account.ok) {
      return `<article class="account"><h3>${escapeHtml(account.mobile)}</h3><p class="error">${escapeHtml(account.error)}</p></article>`;
    }
    const promos = account.promos.filter((item) => item.acctResId !== 1);
    const promoHtml = promos.map((item) => `
      <div class="metric">
        <strong>${escapeHtml(item.acctResName)}</strong>
        <span>${escapeHtml(item.cascadeRealBalance || item.formatRealBalance)}</span><br>
        <small>Expires: ${escapeHtml(formatExpiry(item.expDate))}</small>
        ${item.offerName ? `<br><small>${escapeHtml(item.offerName)}</small>` : ""}
      </div>`).join("");
    return `
      <article class="account">
        <h3>${escapeHtml(account.userData.alias || account.mobile)}</h3>
        <p>${escapeHtml(account.mobile)} · ${escapeHtml(account.subscriber.statusName || "")}</p>
        <div class="balance">${escapeHtml(account.balance?.currencySymbol || "₱")}${escapeHtml(account.balance?.displayBalance || "—")}</div>
        <p><small>Load expiry: ${escapeHtml(formatExpiry(account.balance?.expDate))}<br>Session expiry: ${escapeHtml(formatExpiry(account.tokenExpiresAt))}</small></p>
        <div class="account-grid">${promoHtml || '<p class="muted">No active promo balances returned.</p>'}</div>
      </article>`;
  }).join("");
}

async function refreshAccounts() {
  $("refresh").disabled = true;
  try {
    const result = await api("/accounts");
    const accounts = result.accounts || [];
    renderAccounts(accounts);
    log(`Loaded ${accounts.length} account(s).`);
    if (accounts.some((account) => account.renewed)) {
      log("Session auto-renewed with the stored password (no OTP needed).");
    }
    if (accounts.some((account) => account.expired)) {
      setStatus("A DITO session expired. Sign in again to reload balances.", true);
    }
    // Populate the promo category dropdown once we have a live session.
    if (!promoCategoriesLoaded && accounts.some((account) => account.ok)) {
      loadPromoCategories();
    }
  } catch (error) {
    if (error.message === "not logged in") renderAccounts([]);
    else log(`Dashboard error: ${error.message}`);
  } finally {
    $("refresh").disabled = false;
  }
}

$("sendOtp").addEventListener("click", async () => {
  const mobile = normalizeMobile($("mobile").value);
  if (!mobile) return setStatus("Enter a valid DITO mobile number (e.g. 09XXXXXXXXX).", true);
  const password = loginMode() === "password";
  $("sendOtp").disabled = true;
  clearCaptcha();
  try {
    const check = await api("/check", { method: "POST", body: JSON.stringify({ mobile }) });
    if (check.body?.data?.result !== 0) throw new Error("DITO account check was not successful");
    if (!password) {
      const sent = await api("/send-otp", { method: "POST", body: JSON.stringify({ mobile }) });
      if (sent.body !== true) throw new Error("DITO did not confirm the OTP request");
    }
    await refreshCaptcha();
    $("otpStep").classList.remove("hidden");
    if (password) {
      setStatus("Enter your account password and the graphic verification code.");
      log("Account check passed; ready for password login (no OTP sent).");
    } else {
      setStatus("OTP sent. Enter it and the graphic verification code.");
      log("OTP requested successfully.");
    }
  } catch (error) {
    $("otpStep").classList.add("hidden");
    setStatus(error.message, true);
  } finally {
    $("sendOtp").disabled = false;
  }
});

$("login").addEventListener("click", async () => {
  const mobile = normalizeMobile($("mobile").value);
  const mode = loginMode();
  const otp = $("otp").value.trim();
  const password = $("password").value;
  if (!mobile) return setStatus("Enter a valid DITO mobile number (e.g. 09XXXXXXXXX).", true);
  const captcha = $("captcha").value.trim();
  if (mode === "password") {
    if (password.length < 4) return setStatus("Enter your DITO account password.", true);
  } else if (!/^\d{4,8}$/.test(otp)) {
    return setStatus("Enter the OTP from the SMS.", true);
  }
  // Captcha is optional: DITO only requires it after repeated failures. Leaving
  // it blank tests whether a clean login (needed for silent re-auth) works.
  const useCaptcha = captcha.length > 0;
  if (useCaptcha && (!/^\w{4}$/.test(captcha) || !captchaRequestSN)) {
    return setStatus("The graphic verification code must be 4 characters, or leave it blank.", true);
  }
  $("login").disabled = true;
  try {
    const base = mode === "password"
      ? { mobile, mode, password, remember: $("remember").checked }
      : { mobile, mode, otp };
    const payload = useCaptcha ? { ...base, requestSN: captchaRequestSN, captcha } : base;
    const result = await api("/login", { method: "POST", body: JSON.stringify(payload) });
    if (result.body?.loginSuccess !== true) {
      throw new Error(result.body?.errorMsg || result.body?.message || "Login failed");
    }
    $("otp").value = "";
    $("password").value = "";
    clearCaptcha();
    $("otpStep").classList.add("hidden");
    const minutes = result.body.sessionMinutes;
    const lifeText = minutes ? `DITO granted a ${minutes}-minute session.` : "";
    const renewText = result.body.autoRenew ? " Auto-renew is on — you'll stay signed in." : "";
    setStatus(`Login succeeded via ${mode === "password" ? "password" : "OTP"}. ${lifeText}${renewText}`.trim());
    log(`Login succeeded (${mode}); session=${minutes ?? "?"} min; embedded-refresh-claim=${result.body.hasRefreshToken} (expires before the access token, unusable). Token retained server-side only.`);
    await refreshAccounts();
  } catch (error) {
    setStatus(error.message, true);
    try { await refreshCaptcha(); }
    catch (captchaError) {
      clearCaptcha();
      log(`Verification-code refresh failed: ${captchaError.message}`);
    }
  } finally {
    $("login").disabled = false;
  }
});

$("refreshCaptcha").addEventListener("click", async () => {
  try {
    await refreshCaptcha();
    setStatus("A new graphic verification code is ready.");
  } catch (error) {
    clearCaptcha();
    setStatus(error.message, true);
  }
});
$("captchaImage").addEventListener("click", () => $("refreshCaptcha").click());
$("refresh").addEventListener("click", refreshAccounts);
$("logout").addEventListener("click", async () => {
  await api("/session", { method: "DELETE" });
  renderAccounts([]);
  setStatus("Session cleared.");
});

function updateNetworkStatus() {
  $("networkStatus").textContent = navigator.onLine ? "Online" : "Offline";
  $("networkStatus").classList.toggle("offline", !navigator.onLine);
}
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
updateNetworkStatus();

let installPrompt;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  $("install").classList.remove("hidden");
});
$("install").addEventListener("click", async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  installPrompt = null;
  $("install").classList.add("hidden");
});

// ---- Available promos (browse; purchase pending capture) ----
let promoCategoriesLoaded = false;

async function loadPromoCategories() {
  try {
    const result = await api("/promo/categories");
    const cats = result.body?.prodCatgList || [];
    // Send the category `code`; show the friendly `name`.
    $("promoCat").innerHTML = cats.map((c) => `<option value="${escapeHtml(c.code)}">${escapeHtml(c.name || c.code)}</option>`).join("");
    promoCategoriesLoaded = cats.length > 0;
  } catch (error) {
    promoCategoriesLoaded = false;
  }
}

function renderPromoCards(promos) {
  if (!promos.length) return `<p class="muted">No promos in this category.</p>`;
  return promos.map((p, index) => {
    const discounted = p.displayListPrice && p.displaySalesPrice && p.displayListPrice !== p.displaySalesPrice;
    const validity = p.validityPeriod ? `${escapeHtml(String(p.validityPeriod))} ${escapeHtml(p.validityPeriodUnit || "days")}` : "";
    return `
      <article class="account promo-card">
        <h3>${escapeHtml(p.offerName || "")}</h3>
        <div class="balance">${escapeHtml(p.displaySalesPrice || p.salesPrice || "")}</div>
        ${discounted ? `<p class="muted"><s>${escapeHtml(p.displayListPrice)}</s>${p.discountRate ? " · " + escapeHtml(String(p.discountRate)) + "% off" : ""}</p>` : ""}
        ${validity ? `<p class="muted">Valid for ${validity}</p>` : ""}
        ${p.brief ? `<p>${escapeHtml(p.brief)}</p>` : ""}
        <button class="promo-buy" type="button" data-index="${index}">Buy with load</button>
      </article>`;
  }).join("");
}

let currentPromos = [];

// In-app purchase confirmation modal. Returns a Promise<boolean>. Requires an
// explicit "Confirm purchase" click; Cancel, backdrop click, or Escape all abort.
function confirmPurchase(promo) {
  return new Promise((resolve) => {
    const price = promo.displaySalesPrice || promo.salesPrice || "";
    $("buyModalText").textContent = `Buy "${promo.offerName}"${price ? " for " + price : ""} using your DITO load balance?`;
    const modal = $("buyModal");
    modal.classList.remove("hidden");
    $("buyConfirm").focus();
    const cleanup = (result) => {
      modal.classList.add("hidden");
      $("buyConfirm").removeEventListener("click", onConfirm);
      $("buyCancel").removeEventListener("click", onCancel);
      modal.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKey);
      resolve(result);
    };
    const onConfirm = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onBackdrop = (event) => { if (event.target === modal) cleanup(false); };
    const onKey = (event) => { if (event.key === "Escape") cleanup(false); };
    $("buyConfirm").addEventListener("click", onConfirm);
    $("buyCancel").addEventListener("click", onCancel);
    modal.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKey);
  });
}

async function loadPromos() {
  const catgCode = $("promoCat").value;
  if (!catgCode) { $("promoStatus").textContent = "No category selected."; return; }
  $("promoLoad").disabled = true;
  $("promoStatus").textContent = "Loading promos…";
  $("promoStatus").className = "";
  try {
    const result = await api("/promo/list", { method: "POST", body: JSON.stringify({ catgCode, pageIndex: 1, pageSize: 50 }) });
    currentPromos = result.body?.data?.promoList || [];
    $("promoResult").innerHTML = renderPromoCards(currentPromos);
    $("promoStatus").textContent = "";
  } catch (error) {
    $("promoStatus").textContent = error.message;
    $("promoStatus").className = "error";
    $("promoResult").innerHTML = "";
  } finally {
    $("promoLoad").disabled = false;
  }
}

$("promoLoad").addEventListener("click", () => {
  if (!promoCategoriesLoaded) { loadPromoCategories().then(loadPromos); } else { loadPromos(); }
});

$("promoResult").addEventListener("click", async (event) => {
  const button = event.target.closest(".promo-buy");
  if (!button) return;
  const promo = currentPromos[Number(button.dataset.index)];
  const offerId = promo?.relatedOfferId;
  if (!offerId) { setStatus("This promo has no purchasable offer id.", true); return; }

  // Money-moving action: require an explicit in-app confirmation naming the promo and price.
  const confirmed = await confirmPurchase(promo);
  if (!confirmed) return;
  button.disabled = true;
  setStatus(`Purchasing "${promo.offerName}"…`);
  try {
    const result = await api("/promo/buy", { method: "POST", body: JSON.stringify({ offerId }) });
    if (result.purchased) {
      setStatus(`Purchased "${promo.offerName}". Order ${escapeHtml(result.orderId || "")}.`);
      log(`Promo purchased: "${promo.offerName}" (order ${result.orderId}).`);
      await refreshAccounts();
    } else {
      const msg = result.error || result.body?.payInfo?.exceptionMsg || "purchase not confirmed by DITO";
      setStatus(`Purchase failed: ${msg}`, true);
      log(`Promo purchase failed for "${promo.offerName}": ${msg}`);
    }
  } catch (error) {
    setStatus(`Purchase error: ${error.message}`, true);
    log(`Promo purchase error: ${error.message}`);
  } finally {
    button.disabled = false;
  }
});

// ---- History (load / promo / points) ----
const HIST_PAGE_SIZE = 20;
let histPage = 1;
let histTotalPages = 1;

const histType = () => (document.querySelector('input[name="histType"]:checked') || {}).value || "recharge";

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function applyHistType() {
  const points = histType() === "points";
  $("histRange").classList.toggle("hidden", points);
  $("histResult").innerHTML = "";
  $("histPager").classList.add("hidden");
  $("histStatus").textContent = "";
}

function renderRechargeHistory(body) {
  const rows = body.rechargeHisDtoList || [];
  histTotalPages = body.pageInfo?.totalPage || 1;
  if (!rows.length) return `<p class="muted">No load transactions in this date range.</p>`;
  const total = body.formatTotalAmount ? `<p class="hist-total">Total: ${escapeHtml(body.formatTotalAmount)}</p>` : "";
  return total + rows.map((row) => `
    <div class="hist-row">
      <div><strong>${escapeHtml(row.formatPayAmount || row.formatAmount || "")}</strong>
        <span class="muted"> · ${escapeHtml(row.rechargeMode || "")}</span></div>
      <div class="muted">${escapeHtml(row.formatDate || row.txnDate || "")}</div>
      <div class="muted">${escapeHtml(row.channelName || "")}${row.paymentMethodName ? " · " + escapeHtml(row.paymentMethodName) : ""}</div>
    </div>`).join("");
}

function renderPackageHistory(body) {
  const rows = body.packageHisList || [];
  histTotalPages = body.pageInfo?.totalNumber ? Math.ceil(body.pageInfo.totalNumber / HIST_PAGE_SIZE) : 1;
  if (!rows.length) return `<p class="muted">No promo purchases in this date range.</p>`;
  const total = body.formatTotalAmount ? `<p class="hist-total">Total: ${escapeHtml(body.formatTotalAmount)}</p>` : "";
  return total + rows.map((row) => {
    const paid = row.displayCashAmount ? `Paid ${escapeHtml(row.displayCashAmount)}` : "";
    const pts = row.displayUsePointAmount && row.displayUsePointAmount !== "0" ? ` + ${escapeHtml(row.displayUsePointAmount)} pts` : "";
    return `
    <div class="hist-row">
      <div><strong>${escapeHtml(row.offerName || "")}</strong>
        <span class="muted"> · ${escapeHtml(row.displayPrice || "")}</span></div>
      <div class="muted">${escapeHtml(row.effDate || "")} → ${escapeHtml(row.expDate || "")}</div>
      <div class="muted">${escapeHtml(row.stateName || row.orderStateName || "")}${paid ? " · " + paid + pts : ""}${row.channelName ? " · " + escapeHtml(row.channelName) : ""}</div>
    </div>`;
  }).join("");
}

function renderPoints(body) {
  const metric = (label, value) => `<div class="metric"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value ?? "—")}</span></div>`;
  return `<div class="account-grid">
    ${metric("Total points", body.pointCount)}
    ${metric("Usable", body.usablePoint)}
    ${metric("Expiring this month", body.expiringByMonthEnd)}
    ${metric("Used", body.usedPoint)}
    ${metric("Due", body.pointDue)}
    ${metric("Transferable", body.transferablePoint)}
  </div>`;
}

async function loadHistory(resetPage = true) {
  const type = histType();
  if (resetPage) histPage = 1;
  $("histLoad").disabled = true;
  $("histStatus").textContent = "Loading…";
  $("histStatus").className = "";
  try {
    if (type === "points") {
      const result = await api("/points");
      $("histResult").innerHTML = renderPoints(result.body || {});
      $("histPager").classList.add("hidden");
      $("histStatus").textContent = "";
      return;
    }
    const startDate = $("histStart").value;
    const endDate = $("histEnd").value;
    if (!startDate || !endDate) { $("histStatus").textContent = "Pick a start and end date."; return; }
    const result = await api(`/history/${type}`, {
      method: "POST",
      body: JSON.stringify({ startDate, endDate, pageIndex: histPage, pageSize: HIST_PAGE_SIZE }),
    });
    const body = result.body || {};
    $("histResult").innerHTML = type === "recharge" ? renderRechargeHistory(body) : renderPackageHistory(body);
    $("histPager").classList.toggle("hidden", histTotalPages <= 1);
    $("histPageLabel").textContent = `Page ${histPage} of ${histTotalPages}`;
    $("histPrev").disabled = histPage <= 1;
    $("histNext").disabled = histPage >= histTotalPages;
    $("histStatus").textContent = "";
  } catch (error) {
    $("histStatus").textContent = error.message;
    $("histStatus").className = "error";
    if (error.message.includes("not logged in") || error.message.includes("session expired")) {
      $("histResult").innerHTML = "";
    }
  } finally {
    $("histLoad").disabled = false;
  }
}

document.querySelectorAll('input[name="histType"]').forEach((radio) => radio.addEventListener("change", applyHistType));
$("histLoad").addEventListener("click", () => loadHistory(true));
$("histPrev").addEventListener("click", () => { if (histPage > 1) { histPage--; loadHistory(false); } });
$("histNext").addEventListener("click", () => { if (histPage < histTotalPages) { histPage++; loadHistory(false); } });

// Default the date range to the last 90 days.
(function initHistoryDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);
  $("histEnd").value = isoDate(end);
  $("histStart").value = isoDate(start);
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch((error) => log(`PWA setup failed: ${error.message}`)));
}

refreshAccounts();
