import { readFileSync } from "node:fs";
import { recordFinding } from "./lib/findings.mjs";
try {
  const input = readFileSync(0, "utf8");
  if (input.length > 32_768) throw new Error("Finding input exceeds 32 KiB; supply a sanitized summary");
  const result = recordFinding(JSON.parse(input));
  console.log(JSON.stringify({ recorded: result.recorded, id: result.id, duplicate: result.duplicate }));
} catch (error) {
  console.error(`Finding was not recorded: ${error.message}`);
  process.exitCode = 1;
}
