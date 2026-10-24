"""Print shop category code/name pairs and the catgCodes values used by the
promo-list calls, to confirm which field to send. Public catalog labels only."""
import json
from pathlib import Path
from mitmproxy import io

p = Path(__file__).with_name("dito_history_capture.mitm")
catgs = []
used = set()
with p.open("rb") as h:
    for flow in io.FlowReader(h).stream():
        req = getattr(flow, "request", None); resp = getattr(flow, "response", None)
        if not req or not resp:
            continue
        base = req.path.split("?")[0]
        if base.endswith("/shop/catg/list") and not catgs:
            try:
                body = json.loads(resp.get_text(strict=False))
                for c in body.get("prodCatgList", []):
                    catgs.append((c.get("code"), c.get("name")))
            except Exception:
                pass
        if base.endswith("/subs/available/promo/list"):
            try:
                used.add(json.loads(req.get_text(strict=False)).get("catgCodes"))
            except Exception:
                pass

print("shop categories (code -> name):")
for code, name in catgs:
    print(f"   code={code!r}  name={name!r}")
print("\ncatgCodes values sent by promo/list:")
for u in sorted(x for x in used if x):
    print("  ", repr(u))
