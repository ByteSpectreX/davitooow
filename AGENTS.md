# DITO research working agreement

The owner has authorized automatic documentation of substantive discoveries. Do not wait for a separate request to take notes.

## Standing authorization for routine work

The owner authorizes routine, reversible work needed to complete the requested task without repeated confirmation. Proceed with reading and searching project files, creating and editing source and documentation, running local builds, lint checks and mocked tests, starting local preview servers, and reading public documentation. Keep these actions within the requested task and report meaningful changes and verification results.

Ask for explicit approval of the concrete action and target before:

- Deleting project files or directories, user data, databases, accounts, or remote resources; destructive cleanup; or overwriting unrelated work.
- Deploying, publishing, releasing, or changing production services, infrastructure, DNS, or live configuration.
- Creating purchases, payments, paid resources, subscriptions, or other financial commitments, or retrying an ambiguous financial submission.
- Requesting OTPs, exporting credentials or private account data, rotating secrets, or changing account access, authentication, security controls, or approval settings.
- Pushing or merging changes to shared repositories, force-pushing, rewriting history, or performing destructive Git operations.
- Sending messages or transferring private information to external services or people.

An explicit approval applies only to its stated action, target, and scope; do not ask again for that same approved action while those remain unchanged. General authorization for routine work does not authorize the actions above. If the impact is uncertain, inspect it first and ask before proceeding with a potentially destructive, external, or costly effect.

These instructions express the owner's workflow preferences; they do not change the host's tool approvals, sandbox, managed policy, or hook trust. Use supported client permission settings for automatic approval review. Honor denied actions and host restrictions without attempting a workaround.

## Record findings as part of the work

- Read [the live findings journal](dito-system-handoff/findings/README.md) when continuing research.
- As soon as a meaningful API behavior, implementation decision, failed experiment, corrected assumption, test result, or limitation is established, record it with `node dito-system-handoff/tools/research/record-finding.mjs`, supplying the structured JSON on stdin. See [the workflow and schema](dito-system-handoff/docs/06-AUTOMATIC-FINDINGS.md).
- Include the concrete observation, evidence/source, evidence level, outcome, affected endpoint IDs when known, and next step. Record failures and uncertainty too. Reuse existing records for unchanged findings; do not create notes for routine reads or every tool call.
- Finish recording findings before the final response, before compaction when possible, and before handing work to another session. No substantive finding should exist only in chat.
- Use `npm --prefix dito-login-test test` for the existing mocked suites. It records results automatically; a passing mock test must never be called a successful live payment or verified account response.
- Do not put credentials, OTPs, cookies, tokens, real mobile numbers, raw account responses, or private screenshots in findings. Supply sanitized summaries rather than transcripts or raw tool output. The recorder's redaction is a secondary safeguard, not permission to feed it secrets.
- Preserve the handoff's original reference source and historical verification evidence. New results belong in the live journal. Updating the frozen reference snapshot is a separate, explicit export task.

## Authorization boundaries

Recording an observation never authorizes a new purchase, repeated payment, OTP request, deployment, or credential export. Existing user authorization still governs those actions. Do not retry an ambiguous financial submission to obtain a cleaner finding.
