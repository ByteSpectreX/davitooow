from pathlib import Path
from mitmproxy import io

capture = Path(__file__).with_name("dito_web_capture.mitm")
flows = list(io.FlowReader(capture.open("rb")).stream())
interesting = (
    "/cust/qryUserInfo/",
    "/subs/qrySubsDetail",
    "/account/",
    "/balance/balInfo",
)
seen = set()

for flow in flows:
    request = getattr(flow, "request", None)
    response = getattr(flow, "response", None)
    if not request or not response or request.host != "my.dito.ph":
        continue
    if not any(key in request.path for key in interesting):
        continue
    signature = (request.method, request.path)
    if signature in seen:
        continue
    seen.add(signature)
    request_text = request.get_text(strict=False) or ""
    response_text = response.get_text(strict=False) or ""
    print(f"\n=== {request.method} {request.path} status {response.status_code} ===")
    print("REQUEST:", request_text[:2_000])
    print("RESPONSE:", response_text[:12_000])
