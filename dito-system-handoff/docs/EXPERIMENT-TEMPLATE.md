# Experiment — YYYY-MM-DD

## Question and scope

- Feature / endpoint ID:
- Specific claim being tested:
- Account/recipient role (omit identifying values):
- Client/build/version and source revision:
- UTC time:
- Expected effects: query / authentication / SMS / order / payment:

## Procedure

Record placeholder request bodies and the exact sequence. For a purchase, record the owner's separate confirmation of recipient, amount, total, payment method, and the intended transaction before submission. Do not put real credentials or private identifiers in this document.

## Result

- HTTP result:
- Application result code and recognized state:
- Sanitized response keys/types:
- Public category/offer names or IDs, if needed:
- Page totals, fetched count, duplicates, and completeness warnings:
- Payment stages separately observed: quote / order / gateway / completed status / delivered load:
- Outcome: passed / failed / ambiguous / blocked:
- Redactions and evidence location:

## Conclusion and ledger change

State exactly what the evidence establishes and what it does not establish. Link the source revision and sanitized result, then update the ledger's evidence level and date. List one follow-up if the result is incomplete. Never mark a payment successful because a request returned HTTP 200 or a reference number.
