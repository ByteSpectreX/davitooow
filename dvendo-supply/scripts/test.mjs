import { run } from "node:test";
import { fileURLToPath } from "node:url";
import { recordFinding } from "./lib/findings.mjs";

const files = ["api.test.mjs", "preview.test.mjs", "project.test.mjs"];
let summary;
try {
  for await (const event of run({
    files: files.map((file) => fileURLToPath(new URL(`../tests/${file}`, import.meta.url))),
    isolation: "none", timeout: 60_000,
  })) {
    if (event.type === "test:fail") console.error(`FAIL: ${event.data.name}: ${event.data.details?.error?.message || "see test"}`);
    if (event.type === "test:summary") summary = event.data;
  }
} catch (error) { console.error(error.message); }
let failed = summary?.success !== true || !(summary?.counts?.tests > 0);
const result = `${summary?.counts?.tests || 0} offline tests: ${failed ? "failed or incomplete" : "passed"}. Synthetic API/prototype and project checks only; no live account or payment verification.`;
console.log(result);
try {
  const record = recordFinding({ title: "Clean project offline test result", category: "test",
    outcome: failed ? "failed" : "passed", evidenceLevel: "mock-tested", summary: result,
    evidence: files.map((file) => ({ type: "file", location: `tests/${file}` })),
    endpointIds: [], nextSteps: [failed ? "Correct failures before handoff." : "Complete persistent authenticated features and separately verify provider integration before live fulfillment."] });
  console.log(`Finding: ${record.id}`);
} catch (error) { console.error(`Recording failed: ${error.message}`); failed = true; }
process.exitCode = failed ? 1 : 0;
