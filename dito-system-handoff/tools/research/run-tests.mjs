import { run } from "node:test";
import { join, basename } from "node:path";
import { existsSync } from "node:fs";
import { workspaceRoot, handoffRoot, recordFinding } from "./lib.mjs";

const app = existsSync(join(workspaceRoot, "dito-login-test")) ? join(workspaceRoot, "dito-login-test") : join(handoffRoot, "reference/dito-login-test");
const files = ["load-purchase.test.mjs", "promo-catalog.test.mjs"];
const counts = new Map(files.map((file) => [file, { passed: 0, failed: 0 }]));
let summary;
let interrupted = false;
try {
  // In-process execution works inside the managed sandbox without permission
  // to spawn children. Node runs these known mocked suites sequentially.
  for await (const event of run({ files: files.map((file) => join(app, "tests", file)), isolation: "none", timeout: 60_000 })) {
    if (["test:pass", "test:fail"].includes(event.type)) {
      const count = counts.get(basename(event.data.file || ""));
      if (count) count[event.type === "test:pass" ? "passed" : "failed"]++;
    }
    if (event.type === "test:summary") summary = event.data;
  }
} catch { interrupted = true; }
let failed = interrupted || summary?.success !== true || !(summary?.counts?.tests > 0);
const summaries = files.map((file) => {
  const count = counts.get(file);
  return `${file}: ${count.passed} passed, ${count.failed} failed`;
});
summaries.push(`Combined run: ${summary?.counts?.tests || 0} tests; ${failed ? "failed or incomplete" : "passed"}`);
console.log(summaries.join("\n"));
try {
  const record = recordFinding({ title: "Mocked DITO test-suite result", category: "test", outcome: failed ? "failed" : "passed",
    evidenceLevel: "mock-tested", summary: summaries.join(". "),
    evidence: files.map((location, index) => ({ type: "test", location, description: summaries[index] })),
    nextSteps: [failed ? "Investigate the failing local suite; this result says nothing about live DITO payment completion." : "Live account and payment outcomes still require separate dated evidence."] });
  console.log(`Recorded test finding ${record.id}${record.duplicate ? " (unchanged result already recorded)" : ""}.`);
} catch (error) { console.error(`Could not record test result: ${error.message}`); failed = true; }
process.exitCode = failed ? 1 : 0;
