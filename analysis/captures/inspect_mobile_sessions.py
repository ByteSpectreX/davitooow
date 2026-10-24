"""Survey the mobile captures: which hosts/paths were seen and whether TLS
bodies were actually decrypted. Masks digits so no PII/tokens are printed."""
import re
import sys
from pathlib import Path

from mitmproxy import io

MASK = lambda s: re.sub(r"\d", "#", s or "")

for name in ("dito_mobile_metadata.mitm", "dito_mobile_active_20260929.mitm"):
    path = Path(__file__).with_name(name)
    print(f"\n===== {name} =====")
    if not path.exists():
        print("  (missing)")
        continue
    hosts = {}
    decrypted = 0
    tls_only = 0
    total = 0
    dito_paths = set()
    with path.open("rb") as handle:
        for flow in io.FlowReader(handle).stream():
            total += 1
            request = getattr(flow, "request", None)
            response = getattr(flow, "response", None)
            if not request:
                # likely a raw TCP/TLS passthrough flow (no HTTP parsed)
                tls_only += 1
                host = getattr(getattr(flow, "server_conn", None), "address", None)
                if host:
                    hosts[host[0]] = hosts.get(host[0], 0) + 1
                continue
            decrypted += 1
            hosts[request.host] = hosts.get(request.host, 0) + 1
            if request.host and request.host.endswith("dito.ph"):
                dito_paths.add(f"{request.method} {MASK(request.path.split('?')[0])} -> {getattr(response,'status_code',None)}")
    print(f"  flows: {total}  http-decrypted: {decrypted}  tls/tcp-only: {tls_only}")
    print("  top hosts:")
    for host, count in sorted(hosts.items(), key=lambda kv: -kv[1])[:15]:
        print(f"    {count:4d}  {host}")
    if dito_paths:
        print("  decrypted DITO paths (digits masked):")
        for p in sorted(dito_paths):
            print(f"    {p}")
    else:
        print("  decrypted DITO paths: NONE (bodies not readable)")
