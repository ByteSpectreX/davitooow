# Automatic recording of research findings

The owner authorized recording substantive discoveries without a separate request. This workflow has three parts:

| Part | Behavior | Activation |
| --- | --- | --- |
| Repository `AGENTS.md` | Instructs agents to record discoveries, failures, corrections, and uncertainty as part of their work | Installed; applies to agents that load the repository instructions |
| [Test runner](../tools/research/run-tests.mjs) | Runs the two existing mocked DITO suites and records a sanitized result automatically | Installed through the working app's `npm test` command |
| [Native hook](../tools/research/hook.mjs) | Adds context on startup/prompts and requests a recording pass if research code changed without a corresponding record | Requires installation in the protected Codex config and Codex's one-time trust review |

The native installation attempt was interrupted before completion. Do not infer that native lifecycle hooks are running merely because the files exist. Repository instructions and test-result recording are usable independently. Native support was observed as enabled in the installed `codex-cli 0.162.0` feature list; project configuration/trust are separate requirements.

## Where findings go

Read [the live findings journal](../findings/README.md). Each finding is an individual JSON record under its `records` subfolder; the recorder rebuilds the readable index. Fields include date, outcome, evidence level, summary, source references, source hashes, endpoint IDs, next steps, and a workspace fingerprint.

Identical findings against unchanged source are deduplicated. Changed evidence can produce a new dated record. Original application snapshots and historical verification results remain untouched. The original manifest is preserved in [the baseline archive](../evidence/baselines/2026-10-25-original-manifest.json); the current manifest covers the recorder and documentation. Live finding records are checked separately by their content-derived IDs, so adding a finding does not invalidate the frozen snapshot's hashes.

## What the agent does automatically

The agent must recognize a substantive finding during its normal reasoning and supply a structured, sanitized summary to [the recorder](../tools/research/record-finding.mjs). This is not a background model that reads arbitrary chat transcripts or infers truth from text. The native hook does not inspect prompts, transcripts, assistant messages, credentials, or raw tool output.

The Stop guard checks code fingerprints as a backstop. It can request one extra recording pass for changed research source. It avoids an endless continuation loop, does not certify semantic completeness, and cannot detect every read-only discovery. The repository instructions supply the broader requirement to record read-only discoveries too.

From the repository root, an agent records a finding by sending JSON on stdin:

```sh
node dito-system-handoff/tools/research/record-finding.mjs <<'JSON'
{
  "title": "Concrete observation",
  "category": "api",
  "outcome": "uncertain",
  "evidenceLevel": "code-observed",
  "summary": "State what was observed and what remains unverified.",
  "evidence": [{"type": "file", "location": "dito-login-test/src/load-purchase.mjs"}],
  "endpointIds": ["payment.load-submit"],
  "nextSteps": ["Describe the next needed verification."]
}
JSON
```

This is an agent implementation detail; the owner should not need to issue that command for each discovery. The [JSON example](../tools/research/finding.example.json) shows the available fields.

Allowed categories: `api`, `behavior`, `implementation`, `test`, `limitation`, `correction`, `workflow`. Outcomes: `observed`, `passed`, `failed`, `uncertain`. Evidence levels: `implemented`, `code-observed`, `mock-tested`, `user-reported`, `live-verified`.

Live verification requires a sanitized evidence file and an exact `verifiedStage`: `query`, `quote`, `order-created`, `gateway-opened`, `payment-completed`, or `load-delivered`. A quote or order result must not be described as completed payment or delivered load. The recorder enforces the field distinction, not the truth of a claim; the evidence must support it.

## Test recording

Run the working app's standard test command from the repository root:

```sh
npm --prefix dito-login-test test
```

It records suite names, counts, and pass/fail outcomes. It never saves raw test output or environment values to the live journal and never promotes the result to live-verified. The separately frozen export test log is historical evidence, not produced by this live runner.

The managed sandbox rejected child-process execution in the first runner attempt; that failed result remains in the journal. The corrected runner uses Node's in-process test runner for these two known mocked suites, so recording does not require an elevated subprocess. A zero-test or incomplete run is recorded as failed rather than treated as a pass. See [Node's test-runner isolation documentation](https://nodejs.org/docs/latest-v24.x/api/test.html#runoptions).

The recorder has its own offline regression suite:

```sh
node dito-system-handoff/tools/research/test/automation.test.mjs
```

## Native hook setup and trust

The [installer](../tools/research/install-hooks.mjs) merges only its three event handlers into the repository's native `.codex/hooks.json`, preserving other handlers. It does not edit trust state or bypass managed restrictions. Its command is:

```sh
node dito-system-handoff/tools/research/install-hooks.mjs
```

The current managed sandbox mounts the repository's `.codex` directory read-only. An ordinary install therefore failed with EROFS; the escalated installation was interrupted. Native setup remains pending until that protected write succeeds. Then Codex may require a new session/config reload and its exact hook definitions must be reviewed and trusted through the host's hook UI or CLI `/hooks`.

These are platform requirements, not per-finding approval prompts: [OpenAI's hook documentation](https://learn.chatgpt.com/docs/hooks) describes configuration locations and one-time trust review. [Repository instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md) explains how agents load `AGENTS.md`. Do not disable trust checks to make the status look active.

## Privacy and authorization

The input schema rejects unknown raw-payload fields and unsafe file references. A secondary redactor removes common mobile numbers, credential assignments, JWT/bearer strings, and URL query values. Never depend on that redactor as a complete secret detector: supply only sanitized summaries, not account responses, logs, screenshots, or transcripts.

Journal locks prevent simultaneous writers from overwriting each other; retry recording after another writer completes if necessary. File evidence stores hashes, not source file contents. Recording a finding grants no permission to trigger an OTP, create a payment, retry an ambiguous transaction, deploy, or export credentials.
