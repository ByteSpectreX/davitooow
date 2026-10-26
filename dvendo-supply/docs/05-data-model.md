# Planned data model

This is the implementation guide, not an applied schema. Create versioned SQL migrations when persistent business operations are built, then test constraints and access against a real local database.

| Record | Key fields/invariants |
| --- | --- |
| Workspace | ID, display name, business timezone |
| Membership | Workspace/user/role, status; unique active membership |
| Supplier account | Workspace, provider identity, encrypted connection reference, observed balance and timestamp |
| Recipient SIM | Canonical number, workspace, site label, manager assignment, validation state and timestamp |
| Assignment event | Old/new manager, actor, reason, effective time; prevent conflicting active ownership |
| Monitoring connection | Recipient, authorized connection reference, state; separate from registration |
| Monitoring snapshot | Observation time, source, supported allowance/promo/expiry; staleness explicit |
| Promo choice | Provider offer ID, recipient eligibility observation, supplier enablement, displayed cost/validity |
| Renewal plan | Recipient, offer choice, version, schedule, date evidence, pause and policy state |
| Supply attempt | Payer, recipient, plan version, cycle key, accepted offer/cost/currency, state, upstream reference, verification stage |
| Wallet reservation | Supplier account, attempt, amount, state; coordinator-owned authoritative record |
| Funding record | Manual funding note versus observed account credit, separately labelled |
| Audit event | Actor, workspace, entity, action, before/after safe fields, UTC time |

Money uses integer minor units in app records, never binary floating-point arithmetic. Provider amounts preserve their original documented units in server-side validated mappings. Public records mask recipient numbers where possible. Tokens and password material belong in encrypted server-side storage with a deliberate retention policy, not audit JSON or research.

Enforce uniqueness for renewal cycles and applicable active assignments in storage, not just UI checks. Support historical ownership scoping: transferring a SIM must not accidentally expose another manager's prior private records. Define retention, deletion, backup/restore and projection recovery before production.
