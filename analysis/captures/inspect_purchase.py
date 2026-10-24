"""List the order/payment calls in the purchase capture, in time order, with
request/response SHAPES only (keys + types). No values printed."""
import json, re
from pathlib import Path
from mitmproxy import io

WATCH = ("/order", "/payment", "/buy-promo", "/addOnOffer", "/mccm/order",
         "/subs/available/promo", "/offer/promo/detail", "/coupon", "/pay")

def shape(v, d=0):
    if d > 4: return "..."
    if isinstance(v, dict): return {k: shape(x, d+1) for k, x in list(v.items())[:50]}
    if isinstance(v, list): return [f"list[{len(v)}]", shape(v[0], d+1) if v else "empty"]
    if isinstance(v, bool): return "bool"
    if isinstance(v, (int, float)): return "number"
    if v is None: return "null"
    return "str"

p = Path(__file__).with_name("dito_purchase_capture.mitm")
rows = []
with p.open("rb") as h:
    for flow in io.FlowReader(h).stream():
        req = getattr(flow, "request", None); resp = getattr(flow, "response", None)
        if not req or not req.host or "my.dito.ph" not in req.host:
            continue
        base = req.path.split("?")[0]
        if not any(w in base.lower() for w in WATCH):
            continue
        reqbody = {}
        if req.method != "GET":
            try: reqbody = json.loads(req.get_text(strict=False) or "{}")
            except Exception: reqbody = "(non-JSON)"
        try: rbody = json.loads(resp.get_text(strict=False))
        except Exception: rbody = "(non-JSON)"
        ts = getattr(getattr(flow, "request", None), "timestamp_start", 0)
        rows.append((ts, req.method, re.sub(r"\d", "#", base), shape(reqbody), shape(rbody),
                     re.sub(r"\d", "#", json.dumps(reqbody)) if isinstance(reqbody, dict) else str(reqbody)))

rows.sort(key=lambda r: r[0])
for _, method, base, reqshape, respshape, reqmask in rows:
    print(f"\n===== {method} {base} =====")
    print("  request (masked):", reqmask[:600])
    print("  response shape:", json.dumps(respshape)[:900])
print(f"\ntotal order/payment calls: {len(rows)}")
