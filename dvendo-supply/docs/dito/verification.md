# Verification and integration gaps

The [historical ledger](../../research/dito/verification-ledger.json) is preserved as imported evidence. It does not certify this new project's runtime.

| Capability | Evidence currently available | Remaining work |
| --- | --- | --- |
| Supplier/manager UI | Synthetic local prototype and historical offline checks | Connect authenticated persistent backend |
| Supplier funding and recipient model | Owner-reported intended workflow | Confirm exact provider payer/recipient identifiers |
| Login and account reads | Historical implementation; owner-reported login success | Current authorized query schemas and reconnection behavior |
| Catalog traversal | Historical pagination implementation and mock tests | Nested categories, pageInfo.total, personalized/channel scope |
| Recipient eligibility | Official frontend code leads | Verify supported recipient flow and eligible offer response |
| Regular-load checkout | Historical local implementation and mock tests; ambiguous real attempts reported | Resolve existing attempts through history; verify selected gateway separately |
| Wallet-funded recipient promo | Owner-reported capability | Exact debit route, accepted offer/amount and delivered-recipient evidence |
| Automated renewals | Target design only | Durable coordination, policy, recovery and delivery reconciliation |

For each provider experiment, first define scope and side effects, then record only sanitized observations with endpoint IDs, date, result code/schema summary, evidence level, outcome and next step. Query authorization does not authorize an OTP or purchase. Never retry an ambiguous submission to get clearer evidence.

Live verification stages remain separate: query, quote, order-created, gateway-opened, payment-completed and load-delivered. Record the stage actually supported. Hosting or mocked tests cannot establish a successful real payment.
