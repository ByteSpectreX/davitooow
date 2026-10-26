# DITO integration reference

This is a historical research reference, not a supported public DITO API contract or a working connector in this project.

| Resource | Contents |
| --- | --- |
| [Upstream endpoints](../../research/dito/endpoints.json) | 33 discovered routes, examples, effects and source IDs |
| [Source registry](../../research/dito/sources.md) | Project sources and official inspected frontend bundle URLs/hashes |
| [Historical evidence ledger](../../research/dito/verification-ledger.json) | Original feature and endpoint verification limits |
| [Connection reference](connection.md) | Signing/login/identifier conventions from the historical implementation |
| [Verification gaps](verification.md) | What must be proven before live supplier fulfillment |

The imported inventory's `dashboardRoute` fields describe the old reference application, not our versioned API. An `implemented` evidence tag means implemented in that historical codebase. It does not mean implemented in this starter or independently accepted by DITO.

Keep these flows separate: own-account promo purchase, external-payment regular-load checkout for a recipient, and supplier-wallet-funded recipient promo purchase. The first two historical implementations do not establish the third. The owner reports the third works through DITO; the exact new backend integration still needs verification.
