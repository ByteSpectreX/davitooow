import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { recipientNumber, loadOptions, createLoadQuote, submitLoadQuote, checkLoadPayment,
  gatewayResult, paymentFormPage, ensureNoPendingLoad, paymentDiagnostics } from "../src/load-purchase.mjs";
import proxy from "../proxy-server.js";
import worker from "../src/worker.mjs";

const recipient = "9000000001"; // Synthetic fixture; all upstream calls are mocked.
const methods = { returnCode: 0, thirdPayChannelDtoList: [{ thirdPayChannelId: 41,
  thirdPayMethodDtoList: [{ thirdPayMethodId: 53, payMethodName: "Test wallet" }] }],
  paymentMethodDtoList: [{ paymentMethodId: 9, payMethodName: "Points" }] };
const input = { recipient: `0${recipient}`, amount: "100", paymentKey: "41:53" };

function upstream(overrides = {}) {
  const calls = [];
  const call = async (path, method, body) => {
    calls.push({ path, method, body });
    if (overrides[path]) return overrides[path](body);
    if (path === `user/${recipient}/exist`) return { status: 200, body: true };
    if (path === "common/configParam") return { status: 200, body: [{ amount: 100 }] };
    if (path === "payMethod/query") return { status: 200, body: methods };
    if (path === "recharge/calcFee") return { status: 200, body: { originalAmount: 10000, discountAmountDisplay: "95.00" } };
    if (path === "recharge/amount/validation") return { status: 200, body: true };
    if (path === "payMethod/submit") return { status: 200, body: { returnCode: 0, paymentSn: "test-reference", urlOrHtml: "https://pay.example.test/checkout" } };
    throw new Error(`Unexpected mocked request: ${path}`);
  };
  return { call, calls };
}

test("normalizes recipient formats and rejects invalid text", () => {
  for (const value of [recipient, `0${recipient}`, `+63${recipient}`, `+63 ${recipient.slice(0, 3)} ${recipient.slice(3)}`]) {
    assert.equal(recipientNumber(value), recipient);
  }
  for (const value of [null, {}, "abc" + recipient, "8000000000", "9", "", recipient + "/x"]) assert.equal(recipientNumber(value), null);
});

test("options verify the recipient and exclude points/own-account payment methods", async () => {
  const api = upstream();
  const result = await loadOptions(api.call, input);
  assert.equal(result.recipient, recipient);
  assert.deepEqual(result.methods, [{ key: "41:53", channelId: 41, methodId: 53, name: "GCash (QR)" }]);
  assert.equal(api.calls.some((call) => call.path === "payMethod/submit"), false);
});

test("web options exclude app-only and alternate provider method pairs", async () => {
  const api = upstream({ "payMethod/query": async () => ({ status: 200, body: {
    thirdPayChannelDtoList: [
      { thirdPayChannelId: 29, thirdPayMethodDtoList: [{ thirdPayMethodId: 29 }, { thirdPayMethodId: 32 }] },
      { thirdPayChannelId: 503, thirdPayMethodDtoList: [{ thirdPayMethodId: 510 }, { thirdPayMethodId: 511 }] },
      { thirdPayChannelId: 42, thirdPayMethodDtoList: [{ thirdPayMethodId: 55 }, { thirdPayMethodId: 56 }] },
    ],
  } }) });
  const result = await loadOptions(api.call, input);
  assert.deepEqual(result.methods.map((method) => method.key), ["29:29", "503:510", "42:55"]);
});

test("an unresolved equivalent payment blocks another quote even if its method changes", async () => {
  for (const status of ["submitting", "pending", "unknown"]) {
    const session = { loadQuotes: { previous: { id: "previous", accountMobile: "payer", recipient, amount: 100, status } } };
    const api = upstream();
    await assert.rejects(createLoadQuote(api.call, session, "payer", { ...input, paymentKey: "29:29" }), /already unresolved/);
    assert.equal(api.calls.length, 0);
  }
});

test("resolved payments do not block another purchase and different recipients remain separate", () => {
  const session = { loadQuotes: { previous: { id: "previous", accountMobile: "payer", recipient, amount: 100, status: "completed" } } };
  assert.doesNotThrow(() => ensureNoPendingLoad(session, "payer", recipient, 100));
  session.loadQuotes.previous.status = "pending";
  assert.doesNotThrow(() => ensureNoPendingLoad(session, "payer", "different-recipient", 100));
});

test("invalid recipients stop before loading checkout methods", async () => {
  const api = upstream({ [`user/${recipient}/exist`]: async () => ({ status: 200, body: false }) });
  await assert.rejects(loadOptions(api.call, input), /recognize/);
  assert.equal(api.calls.length, 1);
});

test("application errors and missing payment options fail closed", async () => {
  const error = upstream({ "payMethod/query": async () => ({ status: 200, body: { returnCode: 4 } }) });
  await assert.rejects(loadOptions(error.call, input), /did not approve/);
  const empty = upstream({ "payMethod/query": async () => ({ status: 200, body: { paymentMethodDtoList: methods.paymentMethodDtoList } }) });
  await assert.rejects(loadOptions(empty.call, input), /no supported/);
});

test("quote retains authoritative charge and total without creating a payment", async () => {
  const api = upstream();
  const session = {};
  const quote = await createLoadQuote(api.call, session, "payer-fixture", input, 1000);
  assert.equal(quote.total, "95.00");
  assert.equal(quote.expiresAt, 301000);
  assert.equal(session.loadQuotes[quote.id].charge, 10000);
  assert.deepEqual(api.calls.find((call) => call.path === "recharge/amount/validation").body, { accNbr: recipient, amount: 10000 });
  assert.equal(api.calls.some((call) => call.path === "payMethod/submit"), false);
});

test("bad amounts, invented payment IDs, and unsupported quotes are rejected", async () => {
  for (const amount of ["0", "-1", "1.001", "1e3", "Infinity", "", {}, true]) {
    const api = upstream();
    await assert.rejects(createLoadQuote(api.call, {}, "payer", { ...input, amount }));
    assert.equal(api.calls.length, 0);
  }
  await assert.rejects(createLoadQuote(upstream().call, {}, "payer", { ...input, paymentKey: "9:9" }), /Select a payment/);
  const api = upstream({ "recharge/calcFee": async () => ({ status: 200, body: { originalAmount: 10000 } }) });
  await assert.rejects(createLoadQuote(api.call, {}, "payer", input), /unsupported price/);
});

test("submission needs explicit confirmation and an unexpired quote", async () => {
  const api = upstream();
  const session = {};
  const q = await createLoadQuote(api.call, session, "payer", input, 1000);
  const record = session.loadQuotes[q.id];
  await assert.rejects(submitLoadQuote(api.call, record, "true", 2000), /Confirm/);
  await assert.rejects(submitLoadQuote(api.call, record, true, q.expiresAt), /expired/);
  assert.equal(api.calls.some((call) => call.path === "payMethod/submit"), false);
});

test("concurrent duplicate submissions create only one payment for the saved recipient", async () => {
  let resolve;
  const waiting = new Promise((done) => { resolve = done; });
  const api = upstream({ "payMethod/submit": async () => { await waiting; return { status: 200, body: { paymentSn: "reference", urlOrHtml: "https://pay.example.test/" } }; } });
  const session = {};
  const q = await createLoadQuote(api.call, session, "payer", input);
  const record = session.loadQuotes[q.id];
  const first = submitLoadQuote(api.call, record, true);
  const second = await submitLoadQuote(api.call, record, true);
  assert.equal(second.status, "submitting");
  resolve();
  const order = await first;
  assert.equal(order.status, "pending");
  assert.equal(order.checkoutAvailable, true);
  assert.equal(api.calls.filter((call) => call.path === "payMethod/submit").length, 1);
  assert.deepEqual(api.calls.find((call) => call.path === "payMethod/submit").body, {
    accNbr: recipient, paymentMethodId: 53, paymentChannelId: 41, charge: 10000, servEventId: 1, channelId: 2,
  });
});

test("network failure leaves an unknown outcome and retries cannot submit again", async () => {
  const api = upstream({ "payMethod/submit": async () => { throw new Error("timeout"); } });
  const session = {};
  const q = await createLoadQuote(api.call, session, "payer", input);
  const record = session.loadQuotes[q.id];
  assert.equal((await submitLoadQuote(api.call, record, true)).status, "unknown");
  await submitLoadQuote(api.call, record, true);
  assert.equal(api.calls.filter((call) => call.path === "payMethod/submit").length, 1);
});

test("separate ready quotes cannot both submit an equivalent payment", async () => {
  const api = upstream();
  const session = {};
  const first = await createLoadQuote(api.call, session, "payer", input);
  const second = await createLoadQuote(api.call, session, "payer", input);
  assert.ok(session.loadQuotes[first.id]);
  const submitted = submitLoadQuote(api.call, session.loadQuotes[first.id], true, Date.now(), session);
  await assert.rejects(submitLoadQuote(api.call, session.loadQuotes[second.id], true, Date.now(), session), /already unresolved/);
  await submitted;
  assert.equal(api.calls.filter((call) => call.path === "payMethod/submit").length, 1);
});

test("external handoffs do not apply the points-only returnCode check", async () => {
  const api = upstream({ "payMethod/submit": async () => ({ status: 200, body: {
    returnCode: 200, paymentSn: "synthetic-reference", urlOrHtml: "https://pay.example.test/checkout",
  } }) });
  const session = {};
  const q = await createLoadQuote(api.call, session, "payer", input);
  const result = await submitLoadQuote(api.call, session.loadQuotes[q.id], true);
  assert.equal(result.status, "pending");
  assert.equal(result.diagnostics.codes.returnCode, "200");
});

test("diagnostics omit credentials, payment references, handoff contents, and raw messages", () => {
  const result = paymentDiagnostics({ code: 200, returnCode: 0, paymentSn: "PRIVATE-REFERENCE",
    urlOrHtml: "https://pay.example.test/?token=PRIVATE-TOKEN", message: "PRIVATE-MESSAGE", password: "PRIVATE-PASSWORD" }, 200);
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /PRIVATE/);
  assert.deepEqual(result.handoffFields, { urlOrHtml: "string", qrCode: "undefined" });
});

test("status-only checks preserve legacy records and explain when they were checked", async () => {
  const quote = { id: "legacy", recipient, method: { name: "Wallet" }, paymentSn: "synthetic-reference", status: "unknown" };
  let calls = 0;
  const result = await checkLoadPayment(async (path, method) => {
    calls++;
    assert.equal(method, "GET");
    assert.match(path, /^transaction\?/);
    return { status: 200, body: { status: "P" } };
  }, quote);
  assert.equal(result.status, "unknown");
  assert.equal(result.upstreamState, "P");
  assert.equal(typeof result.lastCheckedAt, "number");
  assert.equal(calls, 1);
});

test("gateway handling supports HTTPS redirects/forms/QR and rejects unsafe URLs", () => {
  assert.equal(gatewayResult({ urlOrHtml: "https://pay.example.test/" }).type, "url");
  assert.equal(gatewayResult({ urlOrHtml: '<form action="https://pay.example.test/" method="post"></form>' }).type, "html");
  assert.equal(gatewayResult({ qrCode: "synthetic-payment-code" }).type, "qr");
  for (const url of ["http://pay.example.test", "javascript:alert(1)", "//pay.example.test", "https://user:secret@pay.example.test"]) {
    assert.throws(() => gatewayResult({ urlOrHtml: url }));
  }
  assert.match(paymentFormPage("<form></form>", "test-nonce"), /nonce="test-nonce"/);
});

test("only confirmed transaction status C is marked completed", async () => {
  const quote = { id: "q", recipient, method: { name: "Wallet" }, paymentSn: "a&b", status: "pending" };
  let called;
  await checkLoadPayment(async (path) => { called = path; return { status: 200, body: { status: "P" } }; }, quote);
  assert.equal(quote.status, "pending");
  assert.equal(called, "transaction?paymentSn=a%26b");
  await checkLoadPayment(async () => ({ status: 200, body: { status: "C" } }), quote);
  assert.equal(quote.status, "completed");
});

async function request(route, body, { session = "test-session", origin = "http://localhost:5174", method = "POST" } = {}) {
  const req = Readable.from(body === undefined ? [] : [JSON.stringify(body)]);
  req.url = route;
  req.method = method;
  req.headers = { host: "localhost:5174", origin, "content-type": "application/json", cookie: session ? `dito_session=${session}` : "" };
  return new Promise((resolve, reject) => {
    const res = { req, writeHead(status, headers) { this.status = status; this.headers = headers; },
      end(value) { resolve({ status: this.status, headers: this.headers, text: value ?? "" }); } };
    proxy.server.listeners("request")[0](req, res).catch(reject);
  });
}

test("HTTP routes reject unauthenticated, cross-origin, and cross-session purchase attempts", async () => {
  assert.equal((await request("/api/load/submit", {}, { session: "" })).status, 401);
  assert.equal((await request("/api/load/submit", {}, { origin: "https://evil.example.test" })).status, 403);
  proxy.sessions.set("test-session", { accounts: new Map() });
  assert.equal((await request("/api/load/submit", { quoteId: crypto.randomUUID(), confirmed: true })).status, 404);
  proxy.sessions.clear();
});

test("gateway form route is no-store and has an opaque script-restricted sandbox", async () => {
  const id = crypto.randomUUID();
  proxy.sessions.set("test-session", { accounts: new Map(), loadQuotes: {
    [id]: { id, status: "pending", gateway: { type: "html", value: '<form action="https://pay.example.test/"></form><script>throw new Error("blocked")</script>' } },
  } });
  const response = await request(`/api/load/checkout/${id}`, undefined, { method: "GET" });
  assert.equal(response.status, 200);
  assert.equal(response.headers["Cache-Control"], "no-store");
  assert.match(response.headers["Content-Security-Policy"], /sandbox allow-forms allow-scripts;/);
  assert.match(response.headers["Content-Security-Policy"], /default-src 'none'/);
  assert.doesNotMatch(response.headers["Content-Security-Policy"], /allow-same-origin/);
  proxy.sessions.clear();
});

test("HTTP checkout uses the session quote, ignores client tampering, and exposes pending orders", async () => {
  const api = upstream();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://my.dito.ph/ecare/webs/"));
    const route = String(url).slice("https://my.dito.ph/ecare/webs/".length);
    const result = await api.call(route, options.method, options.body ? JSON.parse(options.body) : undefined);
    return new Response(JSON.stringify(result.body), { status: result.status });
  };
  const token = `test.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.test`;
  proxy.sessions.set("test-session", { accounts: new Map([[recipient, { mobile: recipient, token, userData: {} }]]) });
  try {
    const review = await request("/api/load/quote", input);
    assert.equal(review.status, 200);
    const quote = JSON.parse(review.text).quote;
    assert.equal(api.calls.some((call) => call.path === "payMethod/submit"), false);
    const confirmation = { quoteId: quote.id, confirmed: true, recipient: "invalid", amount: "99999", paymentKey: "1:1" };
    const result = await request("/api/load/submit", confirmation);
    assert.equal(result.status, 200);
    assert.equal(JSON.parse(result.text).order.status, "pending");
    assert.equal(api.calls.find((call) => call.path === "payMethod/submit").body.accNbr, recipient);
    await request("/api/load/submit", confirmation);
    assert.equal(api.calls.filter((call) => call.path === "payMethod/submit").length, 1);
    const orders = JSON.parse((await request("/api/load/orders", undefined, { method: "GET" })).text).orders;
    assert.equal(orders.length, 1);
    assert.equal(orders[0].total, "95.00");
    assert.equal(orders[0].paymentSn, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    proxy.sessions.clear();
  }
});

test("QR checkout renders a local SVG without sharing gateway data with another service", async () => {
  const id = crypto.randomUUID();
  proxy.sessions.set("test-session", { accounts: new Map(), loadQuotes: {
    [id]: { id, status: "pending", gateway: { type: "qr", value: "synthetic-payment-code" } },
  } });
  try {
    const response = await request(`/api/load/checkout/${id}`, undefined, { method: "GET" });
    assert.equal(response.status, 200);
    assert.match(response.text, /<svg/);
    assert.match(response.headers["Content-Security-Policy"], /default-src 'none'/);
  } finally { proxy.sessions.clear(); }
});

test("Cloudflare mode reports unsupported checkout before any purchase attempt", async () => {
  const env = { SESSION_STORE: {} };
  const capability = await worker.fetch(new Request("https://dashboard.example.test/api/load/capabilities"), env);
  assert.equal((await capability.json()).supported, false);
  const submit = await worker.fetch(new Request("https://dashboard.example.test/api/load/submit", {
    method: "POST", headers: { Origin: "https://dashboard.example.test" }, body: "{}",
  }), env);
  assert.equal(submit.status, 501);
});
