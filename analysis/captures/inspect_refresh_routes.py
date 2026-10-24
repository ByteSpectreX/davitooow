import re
from pathlib import Path

from mitmproxy import io

root = Path(__file__).parents[2]
bundle_paths = [
    Path(__file__).with_name("umi_bundle.js"),
    Path(__file__).with_name("common_bundle.js"),
    Path(__file__).with_name("login_bundle.js"),
]
keywords = ("refresh", "renew", "token", "session", "relogin", "exchange")

print("Bundle endpoint candidates:")
found = set()
for path in bundle_paths:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    candidates = re.findall(r'["\'](/[^"\']{3,180})["\']', text)
    for candidate in candidates:
        lower = candidate.lower()
        if any(keyword in lower for keyword in keywords):
            found.add(candidate)
for candidate in sorted(found):
    print(" ", candidate)

print("\nLiteral Refresh-Token contexts:")
for path in bundle_paths:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    start = 0
    while True:
        index = text.find("Refresh-Token", start)
        if index < 0:
            break
        context = re.sub(r"\s+", " ", text[max(0, index - 180): index + 220])
        print(f"  {path.name}@{index}: {context}")
        start = index + 1

print("\nCaptured API paths containing relevant keywords:")
capture = Path(__file__).with_name("dito_web_capture.mitm")
captured = set()
if capture.exists():
    for flow in io.FlowReader(capture.open("rb")).stream():
        request = getattr(flow, "request", None)
        if not request:
            continue
        lower = request.path.lower()
        if any(keyword in lower for keyword in keywords):
            captured.add(f"{request.method} {request.host}{request.path}")
for candidate in sorted(captured):
    print(" ", candidate)
