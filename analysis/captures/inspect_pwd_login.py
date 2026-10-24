"""Extract password/MPIN login context from the web SPA bundles.
Masks long digit runs so no PII leaks into output."""
import re
from pathlib import Path

files = ["login_bundle.js", "common_bundle.js", "umi_bundle.js"]
keywords = ["pwdType", "loginType", "pwdLogin", "setPwd", "resetPwd", "mpin"]
WINDOW = 260

def mask(s):
    return re.sub(r"\d{5,}", "#####", s)

for name in files:
    path = Path(__file__).with_name(name)
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    for kw in keywords:
        start = 0
        shown = 0
        while shown < 2:  # up to 2 contexts per keyword per file
            idx = text.find(kw, start)
            if idx < 0:
                break
            ctx = re.sub(r"\s+", " ", text[max(0, idx - WINDOW): idx + WINDOW])
            print(f"\n[{name}] {kw} @ {idx}:")
            print("   ", mask(ctx))
            start = idx + len(kw)
            shown += 1

# Also list any login-related endpoint string literals.
print("\n===== login/pwd endpoint string literals =====")
seen = set()
for name in files:
    path = Path(__file__).with_name(name)
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    for m in re.findall(r'["\'](/?ecare/[^"\']{3,120}|/?webs/[^"\']{3,120}|user/[^"\']{3,80}|pwd[A-Za-z/]{2,60})["\']', text):
        low = m.lower()
        if any(k in low for k in ("login", "pwd", "password", "mpin", "otp", "token", "sms")):
            seen.add(m)
for s in sorted(seen):
    print("   ", s)
