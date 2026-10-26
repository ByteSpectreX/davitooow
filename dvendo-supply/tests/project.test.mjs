import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { verify } from "../scripts/verify-project.mjs";
import worker from "../apps/api/src/worker.mjs";

test("portable documentation and imported evidence have valid links and hashes", () => {
  const result = verify();
  assert.equal(result.upstreamEndpoints, 33);
  assert.ok(result.localLinks > 20);
});

test("implemented OpenAPI examples match actual responses", async () => {
  const contract = JSON.parse(readFileSync(new URL("../contracts/openapi.json", import.meta.url)));
  for (const [path, operations] of Object.entries(contract.paths)) {
    const response = await worker.fetch(new Request(`https://example.test${path}`), {});
    assert.deepEqual(await response.json(), operations.get.responses["200"].content["application/json"].example);
  }
});

test("preview stays labelled synthetic and blocks provider/API traffic", () => {
  const html = readFileSync(new URL("../apps/web/public/index.html", import.meta.url), "utf8");
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /INTERACTIVE PREVIEW · Sample data/);
  assert.match(html, /SIL OPEN FONT LICENSE/i);
});
