import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { handoffRoot, workspaceRoot, sourceFingerprint, loadRecords } from "./lib.mjs";

export function decideHook(event, baseline, fingerprint, records) {
  const reminder = "DITO research: follow AGENTS.md. Record substantive discoveries, failed/uncertain experiments, and corrections immediately with the structured finding recorder. Run npm --prefix dito-login-test test for automatic mocked-test recording. Never record secrets or infer live payment success from mocks. The live journal is dito-system-handoff/findings/README.md.";
  if (["SessionStart", "UserPromptSubmit"].includes(event.hook_event_name)) {
    return { hookSpecificOutput: { hookEventName: event.hook_event_name, additionalContext: reminder } };
  }
  if (event.hook_event_name !== "Stop" || !baseline || baseline.fingerprint === fingerprint || records.some((item) => item.workspaceFingerprint === fingerprint)) return {};
  if (event.stop_hook_active) return { systemMessage: "Research changes still lack a matching finding record. Follow AGENTS.md before the next research task." };
  return { decision: "block", reason: "Research source changed without a current finding record. Record the substantive observation, evidence level, outcome, and next step using node dito-system-handoff/tools/research/record-finding.mjs. Capture failure/uncertainty honestly; do not write a success claim just to satisfy this check. If there was no substantive finding, record that narrow implementation/maintenance observation. Then finish the user's task." };
}

export function runHook(event) {
  const key = createHash("sha256").update(String(event.session_id || "unknown")).digest("hex").slice(0, 24);
  const directory = join(handoffRoot, "findings/.state");
  const path = join(directory, `${key}.json`);
  const fingerprint = sourceFingerprint(workspaceRoot);
  let baseline = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
  if (event.hook_event_name === "SessionStart" || (event.hook_event_name === "UserPromptSubmit" && !baseline)) {
    mkdirSync(directory, { recursive: true });
    baseline = { fingerprint };
    writeFileSync(path, JSON.stringify(baseline), { mode: 0o600 });
  }
  return decideHook(event, baseline, fingerprint, loadRecords());
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  try {
    const raw = readFileSync(0, "utf8");
    if (raw.length > 2_000_000) throw new Error("Hook input too large");
    // Only event/session identifiers are used. Never read transcript_path,
    // prompt, last_assistant_message, tool inputs, or raw tool output.
    const event = JSON.parse(raw);
    console.log(JSON.stringify(runHook(event)));
  } catch {
    console.log(JSON.stringify({ systemMessage: "Research recorder hook could not check its state; follow AGENTS.md and record findings through the local recorder." }));
  }
}
