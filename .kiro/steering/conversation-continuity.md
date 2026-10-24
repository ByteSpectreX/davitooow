# Conversation Continuity

Minimize avoidable conversation growth while completing the user's task correctly.

- Keep responses concise and results-focused. Do not restate instructions, prior messages, or large file contents unless necessary.
- Use targeted searches and reads. Summarize large outputs and retain only paths, decisions, errors, and details required for subsequent work.
- Reuse information already gathered. Do not repeat equivalent searches, reads, validations, or explanations without a specific reason.
- For lengthy work, maintain the task list and record compact checkpoints containing the goal, completed work, modified files, validation results, unresolved issues, and exact next action.
- Split independent investigation into subagents when available, requesting concise findings rather than raw output.
- Prefer focused edits and targeted validation over repository-wide operations unless broader scope is required.
- If the conversation shows signs of context or model-continuation limits, stop nonessential exploration, save a compact checkpoint, and warn the user before continuing. Recommend starting a new conversation with that checkpoint, rewinding to a stable point, or selecting another compatible model.
- Never claim that steering can override model retirement, service availability, model compatibility, account access, or platform-enforced context limits. If Kiro reports that the selected model cannot continue, explain that recovery requires changing models, rewinding, or starting a new conversation.
