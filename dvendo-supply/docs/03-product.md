# Product and agreed responsibilities

The owner wants a Supplier Admin account that manually buys regular load for its own DITO SIM/account. That account's balance is intended to pay for promos received by other SIMs. Account Managers organize assigned recipient SIMs and choose their next promos. Renewals should execute automatically only within supplier-authorized rules.

## Identities and permissions

| Identity | Responsibility |
| --- | --- |
| App user | Authenticated person with application membership and a role |
| Supplier funding account | DITO account holding the balance intended to fund recipient promos |
| Recipient SIM | Separately identified DITO number receiving service, assigned to a manager |

Supplier Admin manages funding visibility, final SIM assignment/transfers, enabled catalog, spending policy, supplier connection and fulfillment exceptions. Managers see and edit only their assigned SIM plans and scoped supply history. A saved manager preference never directly authorizes a wallet debit. Managers do not see the supplier's wallet balance or credentials.

Managers submit numbers; Supplier Admin controls final assignment and transfers. Pause/resume semantics shown in the preview are proposed behavior, still requiring an explicit production policy. All future APIs enforce membership and SIM assignment on the server, including exports and background work.

## Service states

Recipient registration, provider validation, offer eligibility and monitoring connection are independent. A registered SIM can have a plan without a monitoring login. Show current balance, allowance and expiry only from authorized monitoring evidence with its timestamp. Label computed renewal dates as estimates.

Keep three records distinct: the manager's plan, the supplier's supply attempt, and the recipient's monitoring snapshot. An order reference does not prove payment completion or promo delivery. Unknown financial outcomes block resubmission until reconciled.

## Renewal policy

1. Save a recipient-specific offer choice from the supplier-enabled eligible catalog.
2. Include confirmed schedules in the funding forecast; disclose missing dates, unknown prices and stale wallet observations.
3. Before fulfillment, recheck recipient eligibility, price, wallet availability and policy limits.
4. Persist immutable recipient, payer, offer, accepted cost and plan version on an attempt.
5. Submit through the verified provider flow; persist and reconcile its result.
6. Show each role the supported outcome. A delivered promo requires provider/recipient evidence.

The supplier funds manually. The forecast suggests top-up amounts; a recorded funding entry is not independently verified wallet credit. Do not implement automatic external top-ups as an implicit part of renewals.

## Open choices

- Exact renewal timing and overlap/activation behavior.
- Per-SIM, per-manager and fleet budgets, price-change rules and priorities.
- Manager pause/resume permissions and notification channels.
- Billing, markup, credit and collection terms.

Keep billing/profit, CCTV and automatic low-data-triggered purchases outside the first release. The current UI is a synthetic prototype with demo role switching and reload resets. The DITO wallet-to-recipient purchase capability is owner-reported; its backend integration remains unverified.
