# DVendo Supply — roles and redesign blueprint

Status: working blueprint, 2026-10-25. The owner has agreed with the role-separation direction and asked to proceed with a simple, clean, navigable and modern redesign. Treat manager-submitted numbers with Supplier Admin control of final assignment/transfers as the working onboarding default. A local interactive redesign now demonstrates the core workflow; see section 12. Detailed numeric limits and real provider timing remain illustrative until settled. This document does not authorize live account access or spending.

## 1. Start with the service

DVendo Supply lets an Account Manager organize assigned DITO SIMs and select their next promos. The Supplier Admin funds a DITO account and fulfills those selections, automatically when an enabled supplier rule permits it.

- **Supplier Admin:** “What must I supply, when, and do I have enough load?”
- **Account Manager:** “Which of my SIMs needs a promo, and what should it receive next?”

Retain the useful DVendo visual language and chart components as inspiration. Build navigation and page priorities around these different jobs. The existing app's page list is not a requirement for either new role.

## 2. Do not confuse these identities

1. **Application user:** a person signed into DVendo Supply with an application role.
2. **Supplier funding account:** the DITO account whose load pays for supplied promos.
3. **Recipient SIM:** the number receiving a promo, assigned to an application workspace.

An Account Manager can manage several SIMs. A phone number is not itself a manager login. A DITO linked-account feature is also not the application's ownership or authorization model.

## 3. What each role sees first

### Supplier Admin: Supply overview

Primary content, in order:

1. **Supplier wallet:** last observed load balance, last checked time and connection state.
2. **Funding forecast:** scheduled cost over 7/14/30 days, chosen reserve, expected shortfall and suggested manual top-up. Display which schedules are estimates and which accounts lack a reliable renewal date.
3. **Next to supply:** recipient/site, manager, chosen promo, planned cost, scheduled time and fulfillment status.
4. **Needs attention:** insufficient funds, unknown payment outcome, failed delivery, unavailable offer, changed cost, missing renewal date or a required account reconnection.
5. **Manager portfolios:** assigned SIM counts and upcoming supply cost per manager. Selecting one opens that portfolio's queue.

Secondary content: funding and fulfillment history, plus connected-account monitoring when it explains a renewal issue. Full balance charts belong in a monitoring/drill-down view rather than displacing the funding and supply work.

Do not call a planned supply a delivered promo, or a recorded manual top-up a confirmed wallet credit. Do not show profit, receivables or customer-wallet balances until billing terms are decided and the relevant records exist.

Suggested navigation:

| Page | Purpose |
| --- | --- |
| Supply overview | Wallet, shortfall, upcoming work and exceptions |
| Renewal queue | Scheduled, processing, delivered, failed, paused and needs-checking work |
| Managers & SIMs | Membership, number assignment, site labels and monitoring connections |
| Promo catalog & rules | Which offers managers may select, spending limits and automation policy |
| Funding & supply history | Separate wallet funding, confirmed supply events and unresolved records |
| Settings | Supplier connection, reserve, notifications and team permissions |

### Account Manager: My dashboard

Primary content, in order:

1. **My SIMs:** assigned numbers and site labels, with clear connection/validation states.
2. **Upcoming renewals:** saved next promo, scheduled or estimated date, and whether automatic supply is enabled or paused.
3. **Current allowance:** remaining data or unlimited status, active promo and expiry only for a connected SIM with available account evidence. Include last checked time.
4. **Needs my attention:** choose a next promo, reconnect for monitoring, or resolve a number/setup issue. Supplier-side financial issues should be summarized as a service issue, such as “Awaiting supplier funding,” without exposing the supplier wallet balance.
5. **Recent supply results:** delivered, pending, failed or needs checking, scoped to this manager's SIMs.

Suggested navigation:

| Page | Purpose |
| --- | --- |
| My dashboard | Assigned SIMs, renewal needs and supply status |
| My SIMs | Number/site details, connection state and the assigned number's promo choices |
| Promo plans | Saved next promos, planned dates and future pause requests/actions |
| Supply history | This manager's order and delivery records |
| Settings | Personal profile, theme and notification preferences |

“Choose promo” should also be a contextual action on a SIM. A manager should not need to find a separate page and re-enter a number already assigned to them. Supplier wallet, fleet-wide spending, team access, provider diagnostics and global thresholds are not manager settings.

## 4. Proposed permission matrix

All Account Manager access below is limited to their assigned workspace/SIMs. Server authorization must enforce this on lists, details, exports, background jobs and mutations; hiding a navigation item is insufficient.

| Capability | Supplier Admin | Account Manager |
| --- | --- | --- |
| View assigned numbers and site labels | All managed portfolios | Own assigned SIMs |
| View connected balances, active promo and expiry | Authorized managed SIMs | Own connected SIMs |
| View supplier funding balance/history | Yes | No |
| Top up the supplier DITO account | Manually outside this app's automatic supply flow | No |
| View recipient-eligible, supplier-enabled offers | All managed recipients | Own recipients |
| Choose a next promo | Support override, with a recorded reason | Own SIMs, within enabled catalog/rules |
| Spend from the supplier wallet | Supplier-controlled fulfillment executor or an explicit admin order | No direct debit |
| Request an immediate promo | May create an explicit order | May submit a request; no immediate debit |
| Enable automatic spending and set limits | Yes | No independent spending authorization |
| Pause a future renewal before execution | Any managed SIM | Recommended: own future renewals, recorded and visible to admin |
| Resume a paused renewal | Within supplier policy | Request resume, or self-resume only if the supplier explicitly permits it |
| Move a SIM between managers | Yes, recorded | No |
| Invite managers or change roles | Yes | No |
| View delivery history | All managed orders | Own orders |
| Export records | Scope-appropriate fleet records | Own records only |
| View DITO credentials, session material or raw account payloads | Not part of normal supplier operations | Not part of normal manager operations |
| Change theme/notification preferences | Own preferences | Own preferences |

Pausing is a recommended permission and has not yet been accepted by the owner or implemented for managers. Pausing affects future unsent work; it does not imply an in-flight payment or delivered promo can be cancelled. An admin override of a manager's promo should remain visible to that manager.

## 5. Number validation, monitoring and delivery are different capabilities

The supplied app screenshot shows a recipient input marked valid, recipient-facing offer categories and promo cards. It is useful inspiration for a number-first selection flow. It does not establish access to a recipient's balance, prove that every displayed offer is available to every SIM, or establish an API response schema. The private number in the screenshot is not copied into this plan.

Three checks must remain separate:

| Check | What it establishes | What it does not establish |
| --- | --- | --- |
| Number/recipient validation | The provider accepts the number for the particular checked flow | Ownership, monitoring permission or eligibility for every promo |
| Offer eligibility | The selected recipient may use a specific offer in the checked flow | That the supplier payment route will succeed or that delivery happened |
| Connected-account monitoring | Authorized access to the supported balance/history data for that SIM | Internet or camera availability, or automatic proof of a specific new delivery |

The existing source has a login pre-check and separate research leads for recipient promo validation. They must not be treated as the same API merely because both are described as validating a number.

Recommended SIM states:

- **Registered recipient:** a number and workspace assignment have been saved. Show validation state, next-promo preference, application schedule and our supply history. Where recipient-specific offers are supported, retrieve them through that verified flow.
- **Connected SIM:** additionally has an authorized DITO monitoring connection. Show supported current balances, active promos, expiry and last successful check.
- **Connection needs attention:** preserve previous data with its timestamp and explain what is unavailable. Do not relabel an old snapshot as current.

A recipient without a monitoring connection can still be part of the supply service. Its dashboard must say “Monitoring not connected,” rather than inventing current data or expiry. A next date derived from our own confirmed delivery and known validity should be labelled estimated unless the provider confirms the relevant dates. A promo reference alone is not a confirmed delivery and cannot establish that baseline.

**Scope recommendation:** begin with a service that supports registered recipients, next-promo plans and supply records, with connected monitoring as an additional capability. This makes the product useful without assuming the supplier login can read every recipient's private account.

## 6. Use the screenshot's selection flow with the correct action

For an assigned number:

```text
My SIMs → choose a SIM → validate recipient for this flow
        → eligible promo categories → promo details
        → choose “Next renewal” → review → save promo plan
```

For adding a new number, the working default is that managers submit numbers into their workspace and Supplier Admin controls final assignment and transfers. Validation does not authorize taking a SIM from another manager or viewing its private data. Prevent cross-manager duplicate assignment; a transfer needs an admin action.

Recommended promo-card fields, only when returned by the offer source:

- Offer name and provider offer identifier.
- Price and validity, including units.
- Data amount or unlimited label; relevant speed restrictions or inclusions.
- Recipient eligibility/check time and whether the supplier enables this offer.

Do not fill absent fields with guesses or treat a public card as an authoritative checkout price. Offers shown to managers are the intersection of provider eligibility for that recipient and the supplier's enabled catalog.

Manager action text is **Choose for next renewal** or **Save promo plan**. An optional **Request now** creates a request with its own status. A **Buy now** label belongs only where the user is actually authorizing a purchase; it is misleading on a manager preference form.

Suggested SIM tabs: **Current promo** when monitoring is connected, **Next promo**, and **Supply history**. If monitoring is not connected, show that state explicitly in Current promo. Do not show the supplier account's active promos as if they belonged to the selected recipient.

## 7. Separate the three timelines

| Timeline | Example statuses | Owner |
| --- | --- | --- |
| Promo plan | Draft, saved, scheduled, paused, needs review | Manager chooses; supplier policy authorizes execution |
| Supply attempt | Not submitted, submitting, pending, delivered, failed, unknown outcome | Supplier fulfillment service |
| Monitoring | Current, stale, reconnect required, unavailable | Authorized account connection |

The interface may combine these in a SIM detail page, but one status must not stand in for the others. A saved plan is not a payment. A delivered promo does not prove a fresh monitoring connection. A stale balance does not establish that a delivery failed.

Recommended default operation:

1. Manager saves a recipient-specific next promo from the enabled catalog.
2. The service includes the saved plan in the supplier's forecast, excluding drafts and pauses.
3. At the agreed renewal time, fulfillment rechecks offer eligibility, current price and supplier policy.
4. An enabled rule may proceed automatically within its limits. Out-of-rule changes become “Needs review,” rather than being silently substituted.
5. Persist and coordinate a single attempt, record the provider reference, and verify the outcome. Unknown outcomes block repeat submission until reconciled.
6. Both roles see the relevant supply result. Only the supplier sees funding details.

Timing remains a product decision. Recommended first policy is renewal around known expiry under explicit supplier rules; do not silently add consumption-triggered top-ups when current data monitoring may be unavailable. A confirmed initial schedule is required before automatic renewal can be enabled.

## 8. Where data comes from

| Information | Source | Current evidence and limitation |
| --- | --- | --- |
| Users, roles, manager assignments, site labels | Our application | Must be designed and authorized in our backend; not supplied by DITO |
| Next promo, pauses and budgets | Our application | Preview behavior exists; live persistence/policy not implemented |
| Supplier balance | Authorized supplier account | Existing balance client code; no new account response checked here |
| Recipient validity and offer catalog | Recipient/provider flow | Screenshot is owner-provided evidence; official frontend leads exist; exact web-session integration remains unverified |
| Current recipient balances/promos/expiry | Authorized recipient monitoring connection | Existing account client and dashboard support these shapes; not guaranteed from recipient validation alone |
| Funding forecast | App plans plus available observed balance | Derived estimate, with freshness, missing-date and unresolved-amount limits disclosed |
| Supply status | Provider order/fulfillment evidence plus our durable records | End-to-end supplier-wallet recipient flow is owner-reported; integration and exact delivery evidence require validation |
| Financial margin or customer debt | App billing and collection records | Business model remains undecided; omit from the initial dashboard |
| Camera or internet availability | Separate integration | Not implemented; account balance is not an availability check |

The existing API catalog is not proof that no further data is available. Equally, a screen design must not promise fields just because an endpoint name exists. If a needed field is missing, the UI shows it as unavailable and the exact capability becomes a research question.

## 9. Decisions before the next visual pass

Already established by the owner:

- Two distinct roles/workspaces: supplier funding/fulfillment and manager SIM/promo selection.
- Manual top-ups to the supplier account.
- Automated recipient supply under planned rules.
- The existing DVendo UI is inspiration; a custom mark replaces the stock icon.

Recommended defaults, pending review:

- Keep supplier wallet and operational funding private from managers.
- Give managers control of next-promo choices for assigned SIMs, using an enabled recipient-specific catalog.
- Support recipient registration separately from monitoring connection.
- Preserve independent plan, fulfillment and monitoring statuses.
- Keep billing, CCTV and automatic low-data replenishment outside the first redesign.

Open decisions:

1. Onboarding working default, following the owner's agreement with the proposed direction: managers submit their numbers; Supplier Admin controls final assignment and transfers. Resolve any detailed assignment checks during workflow design.
2. Does an enabled next-promo rule execute at expiry, a fixed lead time before expiry, or another explicit time? Start with one policy and make overlap behavior clear.
3. Can a manager pause future renewals and request resumption as recommended above?
4. Does the supplier provide this at cost, with a markup, on credit or as an owner-funded service? Keep collection/profit screens pending that decision.

## 10. Focused verification later

Credentials are not needed to choose roles and navigation. If API validation is requested later, use the existing authorized sign-in flow and a narrowly scoped experiment, with sanitized observations:

1. Identify which exact validation route corresponds to the recipient flow in the screenshot.
2. Establish the recipient-specific category/offer response and available public offer fields.
3. Establish whether current recipient balances/expiry require a separate authorized monitoring connection.
4. Identify supported payer/recipient identifiers and delivery status evidence without assuming the existing own-account purchase request can simply be retargeted.

Read/query access does not authorize creating a financial order, sending an OTP or performing a purchase. Test those actions only within their specific authorized scope. Do not store credentials, full private numbers or raw account responses in this draft or the findings journal.

## 11. Additional recommendations before visual redesign

These are new product recommendations, not approved automation parameters or live behavior.

### A. Make one SIM detail page the shared source of truth

Both roles should see the same underlying facts for an assigned SIM, with different controls:

- **Identity:** site name, number, manager assignment and recipient-validation state.
- **Current service:** current promo, allowance/expiry when monitoring provides them, connection state and last checked time.
- **Next renewal:** saved promo, exact validity, estimated cost, planned date, pause state and whether the schedule is estimated or confirmed.
- **Supply history:** attempt time, selected versus supplied promo, outcome, provider reference where appropriate and verification state.
- **Changes:** who changed the preference, pause, assignment or supplier override, with the before/after values.

Managers choose their next promo or pause future work under policy. Admins see the applicable spending rule and fulfillment exceptions. A shared record prevents the two dashboards from giving conflicting answers about the same SIM.

### B. Separate catalog permission from recipient eligibility

The supplier enables the supported catalog and policy limits; the provider establishes which of those offers are eligible for each recipient. Managers see their intersection. Do not show an offer solely because it is eligible for the supplier's own SIM. A disappeared or changed offer should produce a visible exception rather than an automatic substitute.

### C. Establish a renewal change boundary

Before a renewal is submitted, a newly saved preference may update its next eligible plan according to policy. Once submission begins, that attempt keeps its original recipient, offer and accepted cost. Later edits apply to a later renewal, and the UI explains which cycle they affect. Maintain the plan version on each supply attempt.

Recommend a simple expiry-based policy first. Use an actual known expiry or a clearly labelled planned date. The purchase lead time remains undecided until promo overlap/activation behavior is understood; do not assume early purchase extends an existing promo. Low-data-triggered purchases are a later policy because they depend on reliable monitoring and extra spending rules.

### D. Make the funding forecast actionable

Show these separately: observed wallet balance and timestamp; upcoming scheduled cost; internal amounts protected for unresolved work that are not already reflected in that balance; reserve; and suggested additional load. Also show **the date the next top-up is needed**, not only a total amount.

List unscheduled SIMs separately as missing forecast coverage. Unknown costs/dates must not silently contribute zero. Planned totals should disclose missing or stale inputs and personal wallet activity. Pause and draft exclusions remain explicit.

### E. Give the supplier spending controls

Recommend a per-SIM ceiling, a per-manager budget for a defined period and a fleet-wide daily ceiling. Keep price caps distinct from spend already consumed or committed. If a saved manager choice exceeds policy, present it as needing review; do not spend automatically or silently switch to a cheaper offer.

The actual amounts, periods and priority policy are still undecided. Insufficient funding holds work with a clear status. A paused funding queue should not appear as a failed DITO delivery. Preserve a deterministic ordering for queued work and explain any prioritization.

### F. Use role-specific, actionable notifications

Start with an in-app attention inbox:

| Event | Supplier Admin sees | Account Manager sees |
| --- | --- | --- |
| Funding forecast shortfall | Amount needed, deadline and affected planned renewals | Affected SIM awaiting supplier funding, without the private wallet amount |
| Renewal approaching | Queue/cost impact | SIM, planned promo and next date |
| Plan missing or invalid | Missing coverage and affected manager | Choose or revise a promo for this SIM |
| Offer/price no longer fits policy | Exact reason and review action | Selection needs review |
| Delivery confirmed | Supply record and wallet/accounting evidence | Confirmed promo result for this SIM |
| Outcome uncertain | Reconcile the existing attempt; block duplicate spending | Supply is being checked; no false delivery or failure claim |

Use resolved/unresolved state and sensible deduplication so repeat refreshes do not create repeated alerts. Email/SMS channels remain a later choice; this plan does not send messages.

### G. Make exceptions understandable and recoverable

Provide a concise reason and next action rather than one generic Failed state. Distinguish funding hold, unavailable offer, reconnect required, confirmed provider failure and unknown outcome. Unknown financial outcomes never automatically create a new purchase. A supplier intervention and its result remain visible in the record.

For future manager pause permission, label the effect as pausing future unsent renewals; do not promise to stop an order already in progress. Resumption follows the supplier's explicit policy.

### H. Keep the first release small and prove one complete loop

First prove: manager registration/assignment → recipient validation → eligible catalog → saved next promo → supplier forecast → controlled fulfillment → verified result visible to both roles. Start with one manager and a small set of authorized SIMs when live validation is separately requested.

Only expand after assignment isolation, schedule changes, funding holds and unknown-result handling work. Bulk promo presets, advanced billing, extra supplier wallets, CCTV and new notification channels can follow. The user has not been asked to reapprove the already-established preference for automated renewals.

### Suggested next planning artifact

Define the exact SIM-detail fields and the renewal policy before another whole-dashboard visual pass. Those two pieces determine what belongs on each homepage and which controls are appropriate. A design should use available data with explicit unavailable states; further API work should answer specific missing-field questions.

## Sources for the draft

- Owner's current role/separation request and supplied recipient promo screenshot; no private screenshot copied into the repository.
- Current supplier plan (historical path: `./supplier-dashboard-plan.md`) for established funding/automation requirements and unresolved billing.
- API catalog (historical path: `../../expantor/api-catalog.json`) for separate recipient validation and purchase leads.
- Recipient/catalog study (historical path: `../../expantor/notes/2026-10-24.md`) for catalog and eligibility limitations.
- Verification matrix (historical path: `../../dito-system-handoff/docs/04-VERIFICATION.md`) for evidence levels and pending end-to-end capability.
- Existing Worker (historical path: `../src/worker.mjs`) for shared account access and selected-account purchase behavior; this is not yet the proposed authorization model.

No live account login, validation request, OTP, payment or deployment was performed. Earlier planning passes left the preview unchanged; the subsequently authorized redesign is described below.

## 12. Implemented local redesign

Open the redesigned interactive preview (historical path: `./supplier-dashboard-preview.html`). It is self-contained and has no API connectivity. The existing production theme styles and custom DV mark are reused; a focused prototype renderer now replaces the earlier embedded production application runtime. The production application source and deployed service are unchanged.

The interface has:

- A concise role-specific menu with mobile navigation and light/dark themes.
- A supplier overview led by wallet balance, planned promo demand, top-up amount and deadline, attention items and upcoming renewals.
- A manager overview led by assigned SIMs, current service where available, next promos and plan status.
- One shared SIM record with Overview, Renewal plan, Supply history and Activity tabs; controls follow the active sample role.
- Sample recipient registration, format-only versus simulated validation states, and supplier assignment confirmation.
- Promo-card selection with explicit saving, preserving current service and wallet balance. Supplier overrides require a reason.
- Future pause, manager resume request, admin enable, explicit renewal dates and saved-expiry shortcuts.
- Separate catalog controls, reserve/spending settings, scoped history, sample funding records, CSV export and an attention inbox.
- Connected, stale, unconnected, paused and missing-date fixtures, including forecast-coverage disclosure.

The screenshot-inspired offer cards are illustrative examples, not independently verified current offers, recipient eligibility or checkout prices. Initial wallet, historical funding and delivered supply fixtures reconcile arithmetically; the UI does not claim any live transaction. Demo changes reset on reload. The prototype retains masked suffixes rather than actual numbers, so its duplicate check is only a sample-data behavior; production needs canonical full-number identity and server authorization.

The current renderer is supplier-redesign-ui.js (historical path: `./supplier-redesign-ui.js`), its synthetic model is supplier-redesign-model.js (historical path: `./supplier-redesign-model.js`), and its additional styling is supplier-redesign.css (historical path: `./supplier-redesign.css`). Earlier `supplier-preview*` modules remain as previous design iterations and are not loaded by the current builder.

From the repository root:

```sh
node "Project DVito/design/build-supplier-preview.mjs"
node "Project DVito/design/supplier-redesign.test.mjs"
```

The pure model tests cover funding/forecast consistency, validity cycles, draft versus saved preferences, role scope, overrides, pause/resume, unresolved attempts, missing inputs, budgets, registration and assignment/history ownership. They use fictional data and do not verify a live account or payment.

Still required before a working service: authenticated server roles and workspace scope, canonical number storage and validated assignment, supported recipient APIs, persistent plan/order/audit records, durable purchase coordination, provider delivery evidence, actual timing/overlap policy, and agreed spending/billing rules.

## 13. Readability correction

The owner reported that the preview's font and size were too small. A rendered baseline confirmed 15px body text, 13px navigation, 11px table content, 9px table headings, 12px buttons and 10px statuses. The preview now uses an embedded Inter variable font with its Latin and Latin Extended subsets, including currency glyph support. The font's SIL Open Font License (historical path: `./fonts/Inter-LICENSE.txt`) is preserved with the assets and embedded into the standalone HTML build.

The shared type scale in the redesign stylesheet (historical path: `./supplier-redesign.css`) now sets:

- Body, navigation, inputs and primary controls: 16px.
- Table content: 15px; table headings: 14px.
- Important secondary text, status labels and chart labels: at least 14px.
- Card and page headings: approximately 20–34px, with larger financial totals.
- Decorative eyebrows and the footer: 12px.

Line spacing, navigation weight, control height and table row spacing were increased. Responsive layouts reflow rather than shrinking operational text. Narrow charts group the same forecast events into fewer bars with explicit grouped-period labels; forecast amounts do not change. Mobile history uses cards and the bottom navigation uses concise visible names while keeping full accessible labels.

Browser checks verified the embedded font loads, the operational text minimum, both themes, both roles, all main pages and SIM tabs at 320/390/768/1024/1440px, without page overflow. A first typography sweep found a few remaining 12px coverage/offer labels; those were enlarged and the final sweep passed. Manager promo saving and funding/current-service invariants were also checked. No production source, account connection or financial transaction changed.
