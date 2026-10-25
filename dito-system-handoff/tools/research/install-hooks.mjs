import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { workspaceRoot, handoffRoot } from "./lib.mjs";

export function buildHookConfig(existing, command) {
const config = existing ? structuredClone(existing) : { description: "Record DITO research findings before finishing a task.", hooks: {} };
if (!config || typeof config !== "object" || Array.isArray(config) ||
    (config.hooks && (typeof config.hooks !== "object" || Array.isArray(config.hooks)))) throw new Error("Existing hooks configuration has an unsupported shape; it was not changed.");
config.hooks ||= {};
for (const event of ["SessionStart", "UserPromptSubmit", "Stop"]) {
  if (config.hooks[event] != null && !Array.isArray(config.hooks[event])) throw new Error("Existing hook event is not an array; configuration was not changed.");
  config.hooks[event] ||= [];
  if (!config.hooks[event].some((group) => group.hooks?.some((hook) => hook.command === command))) {
    config.hooks[event].push({ hooks: [{ type: "command", command, timeout: 10, statusMessage: "Checking research findings" }] });
  }
}
return config;
}

export function installHooks() {
const script = join(handoffRoot, "tools/research/hook.mjs");
const quote = (value) => "'" + value.replace(/'/g, "'\"'\"'") + "'";
const command = `node ${quote(script)}`;
const directory = join(workspaceRoot, ".codex");
const target = join(directory, "hooks.json");
const config = buildHookConfig(existsSync(target) ? JSON.parse(readFileSync(target, "utf8")) : null, command);
mkdirSync(directory, { recursive: true });
writeFileSync(target, JSON.stringify(config, null, 2) + "\n");
console.log("Installed repository SessionStart, UserPromptSubmit, and Stop hooks. Native execution still requires Codex's one-time hook trust review and configuration reload.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) installHooks();
