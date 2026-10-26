import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync, openSync, closeSync, unlinkSync } from "node:fs";
import { dirname, join, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const handoffRoot = join(workspaceRoot, "research");
const levels = new Set(["implemented", "code-observed", "mock-tested", "user-reported", "live-verified"]);
const outcomes = new Set(["observed", "passed", "failed", "uncertain"]);
const categories = new Set(["api", "behavior", "implementation", "test", "limitation", "correction", "workflow"]);
const allowed = new Set(["title", "category", "outcome", "evidenceLevel", "summary", "evidence", "endpointIds", "nextSteps", "verifiedStage"]);
const digest = (value) => createHash("sha256").update(value).digest("hex");

export function redact(value) {
  return value
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED_TOKEN]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/\b(password|otp|access[_-]?token|refresh[_-]?token|auth[_-]?token|authorization|cookie|session[_-]?id)["']?\s*[:=]\s*(?:"[^"\n]*"|'[^'\n]*'|[^\s,;}]+)/gi, "$1=[REDACTED]")
    .replace(/(?<![A-Za-z0-9])(?:\+?63|0)?9\d{9}(?![A-Za-z0-9])/g, "[REDACTED_MOBILE]")
    .replace(/https?:\/\/[^\s<>"')]+/g, (value) => {
      try {
        const url = new URL(value);
        url.username = ""; url.password = ""; url.search = ""; url.hash = "";
        url.pathname = url.pathname.replace(/\d{7,}/g, "REDACTED_ID");
        return url.href;
      } catch { return "[REDACTED_URL]"; }
    });
}

function text(value, label, max = 2000) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`Invalid ${label}`);
  return redact(value.trim());
}

export function validateFinding(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Finding must be an object");
  for (const key of Object.keys(input)) if (!allowed.has(key)) throw new Error(`Unsupported finding field: ${key}`);
  if (!categories.has(input.category) || !outcomes.has(input.outcome) || !levels.has(input.evidenceLevel)) throw new Error("Invalid category, outcome, or evidence level");
  if (!Array.isArray(input.evidence) || !input.evidence.length || input.evidence.length > 12) throw new Error("Supply 1–12 evidence references");
  const evidence = input.evidence.map((item) => {
    if (!item || !["file", "url", "test", "user-report"].includes(item.type)) throw new Error("Invalid evidence type");
    for (const key of Object.keys(item)) if (!["type", "location", "description"].includes(key)) throw new Error("Unsupported evidence field");
    const location = text(item.location, "evidence location", 500);
    if (item.type === "file" && (location.startsWith("/") || location.split(/[\\/]/).some((part) => part.startsWith(".")) || /(?:credentials|secrets)(?:\.|$)|\.(?:mitm|har|key|pem)$/i.test(location))) throw new Error("Use a safe repository-relative evidence file");
    if (item.type === "url" && !/^https:\/\//.test(location)) throw new Error("Evidence URL must use HTTPS");
    return { type: item.type, location, ...(item.description ? { description: text(item.description, "evidence description", 500) } : {}) };
  });
  const endpointIds = input.endpointIds || [];
  if (!Array.isArray(endpointIds) || endpointIds.length > 20 || endpointIds.some((id) => typeof id !== "string" || !/^[a-z][a-z0-9.-]{0,79}$/.test(id))) throw new Error("Invalid endpoint IDs");
  const nextSteps = input.nextSteps || [];
  if (!Array.isArray(nextSteps) || nextSteps.length > 10) throw new Error("Invalid next steps");
  const result = { title: text(input.title, "title", 200), category: input.category, outcome: input.outcome,
    evidenceLevel: input.evidenceLevel, summary: text(input.summary, "summary"), evidence,
    endpointIds: [...new Set(endpointIds)], nextSteps: nextSteps.map((item) => text(item, "next step", 500)) };
  if (input.evidenceLevel === "live-verified") {
    if (!evidence.some((item) => item.type === "file") ||
        !["query", "quote", "order-created", "gateway-opened", "payment-completed", "load-delivered"].includes(input.verifiedStage)) {
      throw new Error("Live verification needs a sanitized evidence file and an exact verifiedStage");
    }
    result.verifiedStage = input.verifiedStage;
  } else if (input.verifiedStage != null) throw new Error("verifiedStage applies only to live verification");
  return result;
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || ["node_modules", "findings", "reference"].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walk(path) : [path];
  });
}

export function sourceFingerprint(root = workspaceRoot) {
  const direct = ["AGENTS.md", "README.md", "package.json", "wrangler.jsonc", "contracts/openapi.json"];
  const directories = ["apps/api", "apps/web/preview", "scripts", "tests", "docs"];
  const paths = [...direct.map((path) => join(root, path)).filter(existsSync), ...directories.flatMap((path) => walk(join(root, path)))];
  const files = [...new Set(paths)].sort().map((path) => [relative(root, path).split(sep).join("/"), digest(readFileSync(path))]);
  return digest(JSON.stringify(files));
}

export function loadRecords(journal = join(handoffRoot, "findings")) {
  const directory = join(journal, "records");
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((name) => /^[0-9a-f]{24}\.json$/.test(name))
    .map((name) => JSON.parse(readFileSync(join(directory, name), "utf8")))
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt) || a.id.localeCompare(b.id));
}

function atomic(path, value) {
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, value, { mode: 0o600 });
  renameSync(temporary, path);
}

export function recordFinding(input, { root = workspaceRoot, journal = join(handoffRoot, "findings"), now = new Date() } = {}) {
  const finding = validateFinding(input);
  // Only sanitized references and source hashes are persisted; never read chats.
  const fingerprint = sourceFingerprint(root);
  const id = digest(JSON.stringify({ finding, fingerprint })).slice(0, 24);
  mkdirSync(join(journal, "records"), { recursive: true });
  const lock = join(journal, ".write-lock");
  let handle;
  try { handle = openSync(lock, "wx", 0o600); }
  catch { throw new Error("Findings journal is busy; retry recording once the other writer finishes"); }
  try {
    const destination = join(journal, "records", `${id}.json`);
    const duplicate = existsSync(destination);
    if (!duplicate) {
      const fileEvidence = finding.evidence.filter((item) => item.type === "file").map((item) => {
        const path = resolve(root, item.location);
        if (!path.startsWith(resolve(root) + sep) || !existsSync(path) || !statSync(path).isFile()) throw new Error("Evidence file does not exist inside the repository");
        return { location: item.location, sha256: digest(readFileSync(path)) };
      });
      atomic(destination, JSON.stringify({ schemaVersion: 1, id, recordedAt: now.toISOString(), workspaceFingerprint: fingerprint, ...finding, fileEvidence }, null, 2) + "\n");
    }
    const records = loadRecords(journal);
    const escape = (value) => value.replace(/[|\n\r]/g, " ").replace(/[<>]/g, "").replace(/[\\[\]()*`]/g, "\\$&");
    const rows = records.slice().reverse().map((item) => `| ${item.recordedAt.slice(0, 10)} | [${escape(item.title)}](./records/${item.id}.json) | ${item.evidenceLevel} | ${item.outcome} |`);
    atomic(join(journal, "README.md"), "# Live research findings\n\nNew discoveries, failed tests, corrections, and unresolved questions are recorded here automatically by the research workflow. The reference snapshot and its historical verification ledger remain separate.\n\nA mock-tested pass does not establish a live account result or payment success. Records are sanitized summaries, not raw transcripts or account responses.\n\n| UTC date | Finding | Evidence | Outcome |\n| --- | --- | --- | --- |\n" + rows.join("\n") + "\n");
    return { id, recorded: true, path: destination, duplicate };
  } finally { closeSync(handle); unlinkSync(lock); }
}

export function validateJournal(journal = join(handoffRoot, "findings")) {
  const records = loadRecords(journal);
  for (const record of records) {
    const { title, category, outcome, evidenceLevel, summary, evidence, endpointIds, nextSteps, verifiedStage } = record;
    validateFinding({ title, category, outcome, evidenceLevel, summary, evidence, endpointIds, nextSteps, ...(verifiedStage ? { verifiedStage } : {}) });
    if (!/^[0-9a-f]{64}$/.test(record.workspaceFingerprint) || !Number.isFinite(Date.parse(record.recordedAt))) throw new Error("Invalid finding metadata");
    if (digest(JSON.stringify({ finding: validateFinding({ title, category, outcome, evidenceLevel, summary, evidence, endpointIds, nextSteps, ...(verifiedStage ? { verifiedStage } : {}) }), fingerprint: record.workspaceFingerprint })).slice(0, 24) !== record.id) throw new Error("Finding content checksum mismatch");
  }
  return records.length;
}
