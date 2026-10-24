"""List every my.dito.ph API path in the web capture, and separately flag any
that look transaction/history/usage related. Digits masked so no PII leaks."""
import re
from pathlib import Path

from mitmproxy import io

MASK = lambda s: re.sub(r"\d", "#", s or "")
HISTORY_HINTS = ("history", "transaction", "txn", "trans", "record", "detail",
                 "usage", "consume", "consumption", "bill", "order", "recharge",
                 "topup", "top-up", "payment", "purchase", "log", "activity", "flow")

capture = Path(__file__).with_name("dito_web_capture.mitm")
all_paths = set()
history_paths = set()

with capture.open("rb") as handle:
    for flow in io.FlowReader(handle).stream():
        request = getattr(flow, "request", None)
        response = getattr(flow, "response", None)
        if not request or not request.host or not request.host.endswith("dito.ph"):
            continue
        if request.host.startswith("sensors"):
            continue  # analytics SDK, not the account API
        base = request.path.split("?")[0]
        entry = f"{request.method} {MASK(base)} -> {getattr(response, 'status_code', '?')}"
        all_paths.add(entry)
        low = base.lower()
        if any(h in low for h in HISTORY_HINTS):
            history_paths.add(entry)

print(f"=== all my.dito.ph API paths ({len(all_paths)}) ===")
for p in sorted(all_paths):
    print("  ", p)

print(f"\n=== history/transaction-like paths ({len(history_paths)}) ===")
for p in sorted(history_paths) or []:
    print("  ", p)
if not history_paths:
    print("   (none captured)")
