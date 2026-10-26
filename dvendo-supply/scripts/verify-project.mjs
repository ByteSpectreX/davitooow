import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { validateJournal } from "./lib/findings.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const hash = (data) => createHash("sha256").update(data).digest("hex");
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", ".git", ".wrangler"].includes(entry.name)) return [];
    const path = resolve(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
export function verify() {
  let links = 0;
  for (const path of walk(root).filter((path) => path.endsWith(".md"))) {
    for (const match of readFileSync(path, "utf8").matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].replace(/^<|>$/g, "").split("#")[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      const dest = resolve(dirname(path), decodeURIComponent(target));
      if (!dest.startsWith(root + "/") || !existsSync(dest)) throw new Error(`Broken/nonportable link in ${relative(root, path)}: ${target}`);
      links++;
    }
  }
  const spec = JSON.parse(read("contracts/openapi.json"));
  if (spec.openapi !== "3.1.0" || Object.keys(spec.paths).length !== 2) throw new Error("Unexpected implemented API contract");
  const inventory = JSON.parse(read("research/dito/endpoints.json"));
  if (inventory.endpoints.length !== 33 || new Set(inventory.endpoints.map((entry) => entry.id)).size !== 33) throw new Error("Upstream inventory changed unexpectedly");
  const manifest = JSON.parse(read("research/import-manifest.json"));
  const immutable = manifest.files.filter((entry) => entry.projectPath.startsWith("research/"));
  for (const entry of immutable) {
    if (hash(readFileSync(resolve(root, entry.projectPath))) !== entry.importedSha256) throw new Error(`Historical import changed: ${entry.projectPath}`);
  }
  // Manifest hashes for editable source files describe the import baseline, not a freeze on future work.
  const notes = validateJournal();
  return { localLinks: links, upstreamEndpoints: inventory.endpoints.length, historicalImports: immutable.length, findings: notes };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(verify()));
