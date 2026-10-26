import test from "node:test";
import assert from "node:assert/strict";
import worker from "../apps/api/src/worker.mjs";

const env = { ASSETS: { fetch: () => new Response("preview") } };
const request = (path, method = "GET") => worker.fetch(new Request(`https://example.test${path}`, { method }), env);

test("capabilities explicitly report every unfinished integration as disabled", async () => {
  const response = await request("/api/v1/capabilities");
  assert.equal(response.status, 200);
  const body = await response.json();
  for (const key of ["authentication", "persistentPlans", "providerConnected", "livePurchases", "automaticRenewals"]) {
    assert.equal(body[key], false);
  }
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("unimplemented purchases and account paths cannot succeed or serve HTML", async () => {
  for (const method of ["GET", "POST", "DELETE"]) {
    for (const path of ["/api/v1/orders", "/api/v1/sims", "/api/v1/supplier", "/api"]) {
      const response = await request(path, method);
      assert.equal(response.status, 404);
      assert.equal((await response.json()).error.code, "NOT_FOUND");
    }
  }
});

test("health is public infrastructure status and rejects mutations", async () => {
  assert.equal((await (await request("/api/v1/health")).json()).stage, "foundation");
  const response = await request("/api/v1/health", "POST");
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET");
});

test("non-API requests delegate to the configured static assets binding", async () => {
  assert.equal(await (await request("/")).text(), "preview");
});
