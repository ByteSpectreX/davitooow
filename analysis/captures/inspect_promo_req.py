"""Show request bodies for the available-promo list and any order/payment
endpoints, to see what's needed to display and to purchase. Values masked."""
import json, re
from pathlib import Path
from mitmproxy import io

WATCH = ("/subs/available/promo/list", "/shop/catg/list", "/order", "/payment", "/addOnOffer", "/mccm/order", "/buy-promo")

for src in ("dito_history_capture.mitm", "dito_web_capture.mitm"):
    p = Path(__file__).with_name(src)
    if not p.exists():
        continue
    with p.open("rb") as h:
        for flow in io.FlowReader(h).stream():
            req = getattr(flow, "request", None); resp = getattr(flow, "response", None)
            if not req: continue
            base = req.path.split("?")[0]
            if not any(w in base for w in WATCH): continue
            body = ""
            if req.method != "GET":
                try: body = re.sub(r"\d", "#", json.dumps(json.loads(req.get_text(strict=False) or "{}")))
                except Exception: body = "(non-JSON)"
            print(f"[{src}] {req.method} {re.sub(r'#','#',base)} status={getattr(resp,'status_code','?')}")
            if body: print("   req:", body[:400])
