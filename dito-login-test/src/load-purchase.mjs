// Load checkout follows the official web Buy Load flow (see Expantor sources W8).
// This service uses the local Node session object for atomic, single-use quotes.
export class LoadError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function recipientNumber(value) {
  if (typeof value !== "string" || !/^[+\d\s()-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("63")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^9\d{9}$/.test(digits) ? digits : null;
}

function loadAmount(value) {
  if (!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(String(value))) {
    throw new LoadError(400, "Enter a positive load amount with at most two decimal places.");
  }
  const amount = Number(value);
  if (!(amount > 0)) throw new LoadError(400, "Load amount must be positive.");
  return amount;
}

async function query(call, path, method, body) {
  const result = await call(path, method, body);
  if (result.status !== 200) throw new LoadError(502, "DITO could not complete the load request. Please try again later.");
  const data = result.body;
  if (data && typeof data === "object" &&
      (data.exceptionCode || data.errorCode ||
       (data.code != null && String(data.code) !== "200" && String(data.code) !== "0") ||
       (data.returnCode != null && String(data.returnCode) !== "0"))) {
    throw new LoadError(422, "DITO did not approve this load request. Check the recipient, amount, and payment method.");
  }
  return data;
}

// Exact pairs selected by W8's renderPayMethodOptions, not the broader app list.
export const WEB_LOAD_METHODS = new Map([
  ["29:29", "Visa / Mastercard"], ["31:43", "GrabPay"],
  ["41:53", "GCash (QR)"], ["503:510", "GCash"],
  ["38:48", "Maya (QR)"], ["502:505", "WeChat Pay"],
  ["37:45", "GrabPay (QR)"], ["42:55", "ShopeePay (QR)"],
]);

function paymentMethods(body) {
  const methods = [];
  // External methods only. DITO points and own-balance methods have different
  // authorization/OTP requirements and must not be used for another recipient.
  for (const channel of body?.thirdPayChannelDtoList || []) {
    for (const method of channel.thirdPayMethodDtoList || []) {
      const channelId = Number(channel.thirdPayChannelId);
      const methodId = Number(method.thirdPayMethodId);
      if (!Number.isSafeInteger(channelId) || channelId <= 0 || !Number.isSafeInteger(methodId) || methodId <= 0) continue;
      const key = `${channelId}:${methodId}`;
      if (!WEB_LOAD_METHODS.has(key)) continue;
      methods.push({ key, channelId, methodId, name: WEB_LOAD_METHODS.get(key) });
    }
  }
  return [...new Map(methods.map((method) => [method.key, method])).values()];
}

export async function loadOptions(call, input) {
  const recipient = recipientNumber(input.recipient);
  if (!recipient) throw new LoadError(400, "Enter a valid DITO recipient number.");
  const exists = await query(call, `user/${recipient}/exist`, "GET");
  if (exists !== true) throw new LoadError(422, "DITO did not recognize this recipient as a valid number.");
  const [amounts, methods] = await Promise.all([
    query(call, "common/configParam", "POST", { configCode: "webs.ecare.recharge.web.amount-list-config" }),
    query(call, "payMethod/query", "POST", { source: 5, payEvent: "recharge" }),
  ]);
  const external = paymentMethods(methods);
  if (!external.length) throw new LoadError(422, "DITO returned no supported online payment methods. Please use DITO's official Buy Load page.");
  return { recipient, amounts: Array.isArray(amounts) ? amounts.filter((item) => Number(item.amount) > 0)
    .map((item) => ({ amount: Number(item.amount) })) : [], methods: external };
}

export function ensureNoPendingLoad(session, accountMobile, recipient, amount, excludeId) {
  const unresolved = Object.values(session.loadQuotes || {}).find((q) => q.id !== excludeId &&
    q.accountMobile === accountMobile && q.recipient === recipient && q.amount === amount &&
    ["submitting", "pending", "unknown"].includes(q.status));
  if (unresolved) throw new LoadError(409, "A payment for this recipient and amount is already unresolved. Check the existing payment and payment history before creating another.");
}

export async function createLoadQuote(call, session, accountMobile, input, now = Date.now()) {
  const amount = loadAmount(input.amount);
  const recipient = recipientNumber(input.recipient);
  ensureNoPendingLoad(session, accountMobile, recipient, amount);
  const options = await loadOptions(call, input);
  const method = options.methods.find((item) => item.key === input.paymentKey);
  if (!method) throw new LoadError(400, "Select a payment method returned by DITO.");
  const fee = await query(call, "recharge/calcFee", "POST", { amount, channelId: 2 });
  const charge = Number(fee?.originalAmount);
  const total = String(fee?.discountAmountDisplay ?? "").replace(/,/g, "");
  if (!(charge > 0) || !Number.isSafeInteger(charge) || !/^\d+(?:\.\d{1,2})?$/.test(total) || Number(total) <= 0) {
    throw new LoadError(502, "DITO returned an unsupported price quote. No purchase was submitted.");
  }
  // originalAmount is the authoritative charge/unit value used by DITO's
  // checkout. Do not infer a minor-unit multiplier or trust a client price.
  const valid = await query(call, "recharge/amount/validation", "POST", { accNbr: options.recipient, amount: charge });
  if (valid !== true) throw new LoadError(422, "DITO did not approve this amount for the recipient.");
  const quotes = session.loadQuotes ||= {};
  ensureNoPendingLoad(session, accountMobile, options.recipient, amount);
  for (const [id, quote] of Object.entries(quotes)) {
    if (quote.status === "ready" && now >= quote.expiresAt) delete quotes[id];
  }
  if (Object.keys(quotes).length >= 20) {
    throw new LoadError(429, "This session has reached its checkout limit. Check your pending payments before starting another session.");
  }
  const id = crypto.randomUUID();
  const quote = { id, accountMobile, recipient: options.recipient, amount, charge, total,
    method, createdAt: now, expiresAt: now + 5 * 60_000, status: "ready" };
  quotes[id] = quote;
  return publicQuote(quote);
}

export function publicQuote(quote) {
  return { id: quote.id, recipient: quote.recipient, amount: quote.amount, total: quote.total,
    paymentMethod: quote.method.name, expiresAt: quote.expiresAt, status: quote.status,
    checkoutAvailable: Boolean(quote.gateway), hasPaymentReference: Boolean(quote.paymentSn),
    checkoutIssue: quote.checkoutIssue || (quote.status === "unknown" ? "legacy-unknown" : null),
    diagnostics: quote.diagnostics || null, lastCheckedAt: quote.lastCheckedAt || null,
    upstreamState: quote.upstreamState || null };
}

export function paymentDiagnostics(body, httpStatus) {
  const codes = {};
  for (const key of ["code", "returnCode", "oriCode", "exceptionCode", "errorCode"]) {
    const value = body?.[key];
    if (["string", "number"].includes(typeof value) && /^(?:\d{1,6}|ECARE-[A-Z0-9-]{1,55})$/.test(String(value))) codes[key] = String(value);
  }
  return { httpStatus, codes,
    responseType: body === null ? "null" : Array.isArray(body) ? "array" : typeof body,
    hasPaymentReference: typeof body?.paymentSn === "string" || typeof body?.paymentSn === "number",
    handoffFields: { urlOrHtml: typeof body?.urlOrHtml, qrCode: typeof body?.qrCode } };
}

export function findLoadQuote(session, id) {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new LoadError(400, "Invalid load quote.");
  const quote = session.loadQuotes?.[id];
  if (!quote) throw new LoadError(404, "Load quote not found. Review a new quote.");
  return quote;
}

export function gatewayResult(body) {
  if (typeof body?.urlOrHtml === "string" && body.urlOrHtml.length <= 256_000) {
    const value = body.urlOrHtml.trim();
    if (/^https:\/\//i.test(value)) {
      const url = new URL(value);
      if (url.username || url.password) throw new Error("Invalid payment URL");
      return { type: "url", value: url.href };
    }
    if (/^</.test(value)) return { type: "html", value };
  }
  if (typeof body?.qrCode === "string" && body.qrCode.length > 0 && body.qrCode.length <= 4000) {
    return { type: "qr", value: body.qrCode };
  }
  throw new Error("Unsupported payment handoff");
}

export async function submitLoadQuote(call, quote, confirmed, now = Date.now(), session) {
  if (confirmed !== true) throw new LoadError(400, "Confirm the recipient, amount, total, and payment method first.");
  if (quote.status !== "ready") return publicQuote(quote);
  if (now >= quote.expiresAt) throw new LoadError(409, "This price quote expired. Review a new quote before buying.");
  if (session) ensureNoPendingLoad(session, quote.accountMobile, quote.recipient, quote.amount, quote.id);
  // Set synchronously before any await: concurrent retries in this Node session
  // must never submit a second payment. Unknown outcomes are never auto-retried.
  quote.status = "submitting";
  try {
    const result = await call("payMethod/submit", "POST", {
      accNbr: quote.recipient, paymentMethodId: quote.method.methodId,
      paymentChannelId: quote.method.channelId, charge: quote.charge,
      servEventId: 1, channelId: 2,
    });
    const body = result.body;
    quote.diagnostics = paymentDiagnostics(body, result.status);
    if (body?.paymentSn != null && String(body.paymentSn).length <= 200) quote.paymentSn = String(body.paymentSn);
    if (result.status !== 200 || body?.exceptionCode || body?.errorCode) {
      quote.status = "unknown";
      quote.checkoutIssue = "upstream-response";
    } else {
      try { quote.gateway = gatewayResult(body); quote.status = "pending"; }
      catch { quote.status = "unknown"; quote.checkoutIssue = "handoff-unavailable"; }
    }
  } catch {
    quote.status = "unknown";
    quote.checkoutIssue = "network-uncertain";
  }
  return publicQuote(quote);
}

export async function checkLoadPayment(call, quote) {
  if (!quote.paymentSn) throw new LoadError(409, "No payment reference was returned. Check your DITO payment history before trying again.");
  const body = await query(call, `transaction?paymentSn=${encodeURIComponent(quote.paymentSn)}`, "GET");
  quote.lastCheckedAt = Date.now();
  quote.upstreamState = typeof body?.status === "string" && /^[A-Z0-9_-]{1,20}$/.test(body.status) ? body.status : null;
  if (body?.status === "C") quote.status = "completed";
  else if (body?.status === "D" || body?.status === "E") quote.status = "failed";
  else {
    // A status query may supply an existing handoff. Recover it without ever
    // submitting another payment; otherwise keep the previous uncertainty.
    try { quote.gateway = gatewayResult(body); quote.status = "pending"; quote.checkoutIssue = null; }
    catch { /* Status alone does not establish success or a usable checkout. */ }
  }
  // Never turn an unrecognized response into success.
  return publicQuote(quote);
}

export function paymentFormPage(html, nonce) {
  // The upstream HTML runs in an opaque sandbox. Its scripts and remote
  // resources are blocked; only our nonce script may submit a HTTPS form.
  return `<!doctype html><meta charset="utf-8"><title>DITO payment</title>${html}
<script nonce="${nonce}">
const form = document.forms[0];
if (form) {
  const destination = new URL(form.getAttribute('action') || '', location.href);
  if (destination.protocol === 'https:' && !destination.username && !destination.password) {
    form.target = '_self';
    HTMLFormElement.prototype.submit.call(form);
  } else document.body.textContent = 'Unsupported payment destination. Check your pending payment before retrying.';
} else document.body.textContent = 'No supported payment form was returned. Check your pending payment before retrying.';
</script>`;
}
