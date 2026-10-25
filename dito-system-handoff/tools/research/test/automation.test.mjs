import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { recordFinding, loadRecords, validateJournal, validateFinding, redact } from "../lib.mjs";
import { decideHook } from "../hook.mjs";
import { buildHookConfig } from "../install-hooks.mjs";

const tempRoot = fileURLToPath(new URL("../../../findings/.state/", import.meta.url));
mkdirSync(tempRoot, { recursive: true });
const finding = { title: "Synthetic behavior observation", category: "behavior", outcome: "uncertain", evidenceLevel: "code-observed",
  summary: "A synthetic fixture preserves an unresolved result.", evidence: [{ type: "file", location: "README.md" }],
  nextSteps: ["Verify the narrow behavior with separate evidence."], endpointIds: ["payment.load-submit"] };

function fixture(run) {
  const root = mkdtempSync(join(tempRoot, "fixture-"));
  writeFileSync(join(root, "README.md"), "Synthetic fixture evidence\n");
  const journal = join(root, "journal");
  try { return run({ root, journal }); }
  finally { rmSync(root, { recursive: true, force: true }); }
}

test("records structured findings, a readable index, and evidence hashes", () => fixture((options) => {
  const result = recordFinding(finding, options);
  const [saved] = loadRecords(options.journal);
  assert.equal(saved.outcome, "uncertain");
  assert.equal(saved.evidenceLevel, "code-observed");
  assert.match(saved.fileEvidence[0].sha256, /^[0-9a-f]{64}$/);
  assert.match(readFileSync(join(options.journal, "README.md"), "utf8"), new RegExp(result.id));
  assert.equal(validateJournal(options.journal), 1);
}));

test("deduplicates an unchanged finding even at identical timestamps", () => fixture((options) => {
  const now = new Date("2026-10-25T00:00:00Z");
  const first = recordFinding(finding, { ...options, now });
  const second = recordFinding(finding, { ...options, now });
  assert.equal(first.id, second.id);
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(loadRecords(options.journal).length, 1);
}));

test("changed evidence creates a distinct, dated observation", () => fixture((options) => {
  const first = recordFinding(finding, options);
  writeFileSync(join(options.root, "README.md"), "Changed synthetic evidence\n");
  const second = recordFinding(finding, options);
  assert.notEqual(first.id, second.id);
  assert.equal(validateJournal(options.journal), 2);
}));

test("rejects raw-response fields, traversal, private paths, and missing evidence", () => {
  assert.throws(() => validateFinding({ ...finding, rawResponse: {} }), /Unsupported/);
  for (const location of ["../secret", "/private/file", ".env", ".aws/credentials", "folder/secrets.json"]) {
    assert.throws(() => validateFinding({ ...finding, evidence: [{ type: "file", location }] }), /safe repository-relative/);
  }
  fixture((options) => assert.throws(() => recordFinding({ ...finding, evidence: [{ type: "file", location: "missing.md" }] }, options), /does not exist/));
});

test("redacts mobile numbers, credentials, bearer strings, and URL query values", () => {
  const value = redact('password="synthetic-secret" otp=123456 Cookie=session-fixture Bearer synthetic-access-token phone +639000000001 https://user:synthetic-secret@example.test/path?token=synthetic-access-token');
  assert.doesNotMatch(value, /synthetic-secret|123456|session-fixture|synthetic-access-token|9000000001|user:/);
  assert.equal(redact(value), value);
});

test("requires exact stage and file evidence for live verification", () => {
  assert.throws(() => validateFinding({ ...finding, evidenceLevel: "live-verified" }), /exact verifiedStage/);
  const record = validateFinding({ ...finding, evidenceLevel: "live-verified", verifiedStage: "quote" });
  assert.equal(record.verifiedStage, "quote");
  assert.notEqual(record.verifiedStage, "payment-completed");
});

test("detects edited finding contents instead of accepting a stale checksum", () => fixture((options) => {
  const result = recordFinding(finding, options);
  const record = JSON.parse(readFileSync(result.path, "utf8"));
  record.summary = "A different unsupported claim";
  writeFileSync(result.path, JSON.stringify(record));
  assert.throws(() => validateJournal(options.journal), /checksum/);
}));

test("hook adds instructions without reflecting prompt or transcript values", () => {
  const result = decideHook({ hook_event_name: "UserPromptSubmit", prompt: "PRIVATE_PROMPT", transcript_path: "PRIVATE_TRANSCRIPT" }, null, "x", []);
  assert.match(result.hookSpecificOutput.additionalContext, /Record substantive/);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE/);
});

test("Stop requests recording for changed research and avoids continuation loops", () => {
  const result = decideHook({ hook_event_name: "Stop" }, { fingerprint: "before" }, "after", []);
  assert.equal(result.decision, "block");
  const active = decideHook({ hook_event_name: "Stop", stop_hook_active: true }, { fingerprint: "before" }, "after", []);
  assert.equal(active.decision, undefined);
  assert.match(active.systemMessage, /lack/);
});

test("Stop passes unchanged research, a matching record, or absent startup state", () => {
  assert.deepEqual(decideHook({ hook_event_name: "Stop" }, { fingerprint: "same" }, "same", []), {});
  assert.deepEqual(decideHook({ hook_event_name: "Stop" }, { fingerprint: "before" }, "after", [{ workspaceFingerprint: "after" }]), {});
  assert.deepEqual(decideHook({ hook_event_name: "Stop" }, null, "after", []), {});
});

test("hook installation preserves other handlers and is idempotent", () => {
  const existing = { description: "existing", hooks: { Stop: [{ hooks: [{ type: "command", command: "other-command" }] }] } };
  const first = buildHookConfig(existing, "node findings-hook");
  const second = buildHookConfig(first, "node findings-hook");
  assert.deepEqual(first, second);
  assert.equal(first.hooks.Stop.length, 2);
  assert.equal(existing.hooks.Stop.length, 1);
  assert.equal(first.hooks.SessionStart.length, 1);
});
