import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { validateJournal } from "./research/lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const json = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".wrangler" || path === resolve(root, "findings")) return [];
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const manifest = json("SNAPSHOT-MANIFEST.json");
for (const entry of manifest.files) {
  const path = resolve(root, entry.path);
  assert.ok(path.startsWith(root + sep), `Path escapes handoff: ${entry.path}`);
  const bytes = readFileSync(path);
  assert.equal(bytes.length, entry.bytes, `Size changed: ${entry.path}`);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, `Content changed: ${entry.path}`);
}

const files = walk(root);
const recorded = new Set(manifest.files.map((entry) => entry.path));
for (const path of files) {
  const name = relative(root, path).split(sep).join("/");
  if (name !== "SNAPSHOT-MANIFEST.json") assert.ok(recorded.has(name), `Unrecorded file: ${name}`);
  if (name.endsWith(".json")) JSON.parse(readFileSync(path, "utf8"));
  if (!name.endsWith(".md")) continue;
  for (const match of readFileSync(path, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1];
    if (/^[a-z][a-z\d+.-]*:/i.test(link) || link.startsWith("#")) continue;
    const destination = resolve(dirname(path), decodeURIComponent(link.split("#")[0]));
    assert.ok(destination === root || destination.startsWith(root + sep), `Nonportable link in ${name}: ${link}`);
    assert.ok(statSync(destination), `Missing link in ${name}: ${link}`);
  }
}

const catalog = json("reference/expantor/api-catalog.json");
const ids = catalog.endpoints.map((entry) => entry.id);
assert.equal(new Set(ids).size, ids.length, "Duplicate endpoint IDs");
const ledger = json("evidence/VERIFICATION-LEDGER.json");
assert.deepEqual(ledger.endpointEvidence.map((entry) => entry.id).sort(), ids.slice().sort(), "Ledger/catalog mismatch");
const collection = json("reference/expantor/collections/dito-dashboard.postman_collection.json");
const requests = collection.item.flatMap((folder) => folder.item);
for (const entry of requests) {
  assert.ok(!/\/api\/(?:login|send-otp|promo\/buy|load\/submit)(?:$|\?)/.test(entry.request.url), `Side-effecting request in query collection: ${entry.name}`);
}
const validation = json("evidence/VALIDATION.json");
assert.ok(validation.checks.every((entry) => entry.exitCode === 0), "Recorded validation failure");
assert.equal(validation.liveAccountCallsMade, false);
assert.equal(validation.paymentsSubmitted, false);
const baseline = json("evidence/baselines/2026-10-25-original-manifest.json");
for (const entry of baseline.files.filter((entry) => entry.path.startsWith("reference/") || entry.path.startsWith("evidence/"))) {
  assert.equal(createHash("sha256").update(readFileSync(resolve(root, entry.path))).digest("hex"), entry.sha256, `Historical evidence changed: ${entry.path}`);
}
const findings = validateJournal(resolve(root, "findings"));
console.log(`Verified ${manifest.files.length} file hashes, portable Markdown links, ${ids.length} endpoint records, ${requests.length} query requests, historical evidence, and ${findings} live findings.`);
