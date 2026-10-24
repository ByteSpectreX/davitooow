"""Quick live peek at the new history capture: list decrypted my.dito.ph API
paths seen so far, digits masked. Safe to run repeatedly during capture."""
import re
from pathlib import Path

from mitmproxy import io

MASK = lambda s: re.sub(r"\d", "#", s or "")
path = Path(__file__).with_name("dito_history_capture.mitm")
if not path.exists():
    print("capture file not created yet")
    raise SystemExit

seen = {}
total = 0
with path.open("rb") as handle:
    try:
        for flow in io.FlowReader(handle).stream():
            req = getattr(flow, "request", None)
            resp = getattr(flow, "response", None)
            if not req or not req.host or "dito.ph" not in req.host:
                continue
            if req.host.startswith("sensors"):
                continue
            base = req.path.split("?")[0]
            if "/ecare/" not in base and "/webs/" not in base:
                continue  # skip static assets, only API
            total += 1
            key = f"{req.method} {MASK(base)}"
            seen[key] = getattr(resp, "status_code", "pending")
    except Exception as exc:
        print(f"(partial read: {exc})")

print(f"decrypted DITO API calls so far: {total}")
for k in sorted(seen):
    print(f"  {seen[k]}  {k}")
