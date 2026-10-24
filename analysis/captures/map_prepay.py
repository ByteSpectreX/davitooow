"""Resolve the prePay field mappings WITHOUT printing PII. Prints small constant
params (businessType/source/payChannel/appCode/billFlag) and, for ID fields,
only RELATIONSHIPS (does offerId match a promo field? does custId match userData?
where does servEventId first appear?)."""
import json
from pathlib import Path
from mitmproxy import io

p = Path(__file__).with_name("dito_purchase_capture.mitm")

prepay_req = None
promo_items = []          # collected promo list items
login_userdata = None
servevent_origins = []    # (path, json-path) where servEventId value appears

flows = []
with p.open("rb") as h:
    for flow in io.FlowReader(h).stream():
        req = getattr(flow, "request", None); resp = getattr(flow, "response", None)
        if not req or "my.dito.ph" not in (req.host or ""):
            continue
        base = req.path.split("?")[0]
        try: reqj = json.loads(req.get_text(strict=False) or "{}")
        except Exception: reqj = {}
        try: respj = json.loads(resp.get_text(strict=False))
        except Exception: respj = {}
        flows.append((base, reqj, respj))
        if base.endswith("/payment/prePay") and prepay_req is None:
            prepay_req = reqj
        if base.endswith("/subs/available/promo/list") and isinstance(respj, dict):
            for it in (respj.get("data", {}) or {}).get("promoList", []) or []:
                promo_items.append(it)
        if base.endswith("/user/login") and isinstance(respj, dict):
            login_userdata = respj.get("userData", {})

if not prepay_req:
    print("no prePay request captured"); raise SystemExit

bd = prepay_req.get("businessData", {}) or {}
print("=== prePay constant-ish params ===")
for k in ("businessType", "source", "payChannel", "appCode"):
    print(f"  {k} = {prepay_req.get(k)!r}")
print(f"  businessData.billFlag = {bd.get('billFlag')!r}")

offer_id = bd.get("offerId")
serv = prepay_req.get("servEventId")
cust = prepay_req.get("custId")
accnbr = bd.get("accNbr")

print("\n=== ID field mappings (relationships only) ===")
# offerId vs promo fields
matches = []
for it in promo_items:
    for field in ("offerNbr", "relatedOfferId", "offerCode", "relatedOfferCode"):
        v = it.get(field)
        if v is not None and str(v) == str(offer_id):
            matches.append(f"{field} (offerName={it.get('offerName')!r})")
print("  offerId matches promo field:", matches or "NO MATCH (offerId source unknown)")
print("  accNbr == login mobile digits:", "yes" if accnbr else "n/a")
if login_userdata is not None:
    print("  custId == userData.custId:", str(login_userdata.get("custId")) == str(cust))
    print("  userData keys:", sorted(login_userdata.keys()))
else:
    print("  (no login in this capture; custId source not cross-checkable here)")

# where does servEventId appear elsewhere?
print("\n=== servEventId origin search ===")
def find_val(obj, target, trail="$"):
    hits = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            hits += find_val(v, target, f"{trail}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            hits += find_val(v, target, f"{trail}[{i}]")
    else:
        if obj is not None and str(obj) == str(target):
            hits.append(trail)
    return hits

for base, reqj, respj in flows:
    if base.endswith("/payment/prePay"):
        continue
    for label, blob in (("resp", respj), ("req", reqj)):
        for loc in find_val(blob, serv):
            servevent_origins.append(f"{base} [{label}] {loc}")
print("  servEventId also seen at:")
for o in servevent_origins[:20]:
    print("   ", o)
if not servevent_origins:
    print("   (not found elsewhere — likely generated client-side or from an uncaptured call)")
