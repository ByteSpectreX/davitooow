"""For each history/transaction endpoint, scan ALL captured calls and report
the MOST-POPULATED response (so a wider date range with real rows is shown).
Prints request params (date/paging contract) and response STRUCTURE only, plus
per-row field names for list items. No values are printed."""
import json
import re
from pathlib import Path

from mitmproxy import io

# endpoint -> the response key that holds the row list (None = whole body is list)
LIST_TARGETS = {
    "/recharge/qryRechargeHis": "rechargeHisDtoList",
    "/subs/packageHisPageList": "packageHisList",
    "/recharge/recent/msisdn/history": None,
    "/transaction/": None,
    "/point/detail": None,
}


def shape(value, depth=0):
    if depth > 4:
        return "..."
    if isinstance(value, dict):
        return {k: shape(v, depth + 1) for k, v in list(value.items())[:60]}
    if isinstance(value, list):
        return [f"list[{len(value)}]", shape(value[0], depth + 1) if value else "empty"]
    if isinstance(value, bool):
        return "bool"
    if isinstance(value, (int, float)):
        return "number"
    if value is None:
        return "null"
    return "str"


def rows_of(body, key):
    if key is None:
        return body if isinstance(body, list) else []
    if isinstance(body, dict) and isinstance(body.get(key), list):
        return body[key]
    return []


best = {}  # target -> (rowcount, body, request_masked, query)
capture = Path(__file__).with_name("dito_history_capture.mitm")
with capture.open("rb") as handle:
    for flow in io.FlowReader(handle).stream():
        req = getattr(flow, "request", None)
        resp = getattr(flow, "response", None)
        if not req or not resp:
            continue
        base = req.path.split("?")[0]
        target = next((t for t in LIST_TARGETS if t in base), None)
        if not target:
            continue
        try:
            body = json.loads(resp.get_text(strict=False))
        except Exception:
            continue
        count = len(rows_of(body, LIST_TARGETS[target]))
        if target not in best or count > best[target][0]:
            reqmask = ""
            if req.method != "GET":
                try:
                    reqmask = re.sub(r"\d", "#", json.dumps(json.loads(req.get_text(strict=False) or "{}")))
                except Exception:
                    reqmask = "(non-JSON)"
            query = re.sub(r"\d", "#", req.path.split("?", 1)[1]) if "?" in req.path else ""
            best[target] = (count, body, reqmask, query, req.method, re.sub(r"\d", "#", base))

for target, (count, body, reqmask, query, method, mbase) in best.items():
    print(f"\n===== {method} {mbase}  (best result: {count} rows) =====")
    if query:
        print("  query:", query)
    if reqmask:
        print("  request:", reqmask)
    print("  response shape:", json.dumps(shape(body), indent=1))
