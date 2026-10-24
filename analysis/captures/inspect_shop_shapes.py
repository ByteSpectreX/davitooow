"""Shapes for the promo-catalog / top-up related endpoints. Structure only."""
import json, re
from pathlib import Path
from mitmproxy import io

TARGETS = (
    "/subs/available/promo/list",
    "/shop/catg/list",
    "/recharge/limit",
    "/payMethod/query",
    "/recharge/amount",
    "/order/submit",
    "/payment/prePay",
)

def shape(v, d=0):
    if d > 3: return "..."
    if isinstance(v, dict): return {k: shape(x, d+1) for k, x in list(v.items())[:40]}
    if isinstance(v, list): return [f"list[{len(v)}]", shape(v[0], d+1) if v else "empty"]
    if isinstance(v, bool): return "bool"
    if isinstance(v, (int, float)): return "number"
    if v is None: return "null"
    return "str"

best = {}
cap = Path(__file__).with_name("dito_history_capture.mitm")
for src in ("dito_history_capture.mitm", "dito_web_capture.mitm"):
    p = Path(__file__).with_name(src)
    if not p.exists(): continue
    with p.open("rb") as h:
        for flow in io.FlowReader(h).stream():
            req = getattr(flow, "request", None); resp = getattr(flow, "response", None)
            if not req or not resp: continue
            base = req.path.split("?")[0]
            t = next((t for t in TARGETS if t in base), None)
            if not t: continue
            try: body = json.loads(resp.get_text(strict=False))
            except Exception: continue
            n = len(body) if isinstance(body, list) else len(body.get("list", body) if isinstance(body, dict) else [])
            if t not in best or n > best[t][0]:
                best[t] = (n, req.method, re.sub(r"\d","#",base), shape(body))

for t, (n, method, mbase, sh) in best.items():
    print(f"\n===== {method} {mbase} =====")
    print(json.dumps(sh, indent=1)[:1500])
print("\ncaptured:", sorted(best))
