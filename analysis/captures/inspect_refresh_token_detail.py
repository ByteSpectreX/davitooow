"""Dig into the login response and authenticated API headers to see whether
DITO offers a usable session-extension path:
  1. Does the login response carry a top-level refreshToken (separate from the
     REFRESH_TOKEN claim embedded in the access token)? What is its lifetime?
  2. Do authenticated responses return a rotated Auth-Token / Refresh-Token
     header (a sliding session we could be discarding)?
Only token *metadata* (iat/exp/lifetime) is printed, never token strings/PII.
"""
import base64
import json
from datetime import datetime, timezone
from pathlib import Path

from mitmproxy import io


def claims(token):
    try:
        payload = token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload).decode("utf-8", "ignore"))
    except Exception:
        return {}


def life(token):
    c = claims(token)
    iat, exp = c.get("iat"), c.get("exp")
    if isinstance(iat, int) and isinstance(exp, int):
        return f"{round((exp - iat) / 60, 1)} min (exp {datetime.fromtimestamp(exp, timezone.utc).isoformat()})"
    return "no iat/exp"


capture = Path(__file__).with_name("dito_web_capture.mitm")
login_seen = False
rotation_events = 0
auth_header_responses = 0
checked = 0

with capture.open("rb") as handle:
    for flow in io.FlowReader(handle).stream():
        request = getattr(flow, "request", None)
        response = getattr(flow, "response", None)
        if not request or not response:
            continue

        if request.path.endswith("/user/login") and not login_seen:
            try:
                body = json.loads(response.get_text(strict=False))
            except Exception:
                continue
            if not isinstance(body, dict):
                continue
            login_seen = True
            print("=== /user/login response ===")
            print("  top-level keys:", sorted(body.keys()))
            for key in ("token", "loginToken", "refreshToken", "accessToken"):
                if body.get(key):
                    print(f"  {key}: {life(body[key])}")
            access = body.get("token") or body.get("loginToken")
            if access:
                nested = claims(access).get("REFRESH_TOKEN")
                print("  embedded REFRESH_TOKEN claim:", life(nested) if nested else "none")
                top = body.get("refreshToken")
                if top and nested:
                    print("  top-level refreshToken == embedded REFRESH_TOKEN:", top == nested)

        # Sliding-session check: does DITO return an Auth-Token/Refresh-Token
        # response header on authenticated my.dito.ph calls?
        if request.host and request.host.endswith("dito.ph"):
            checked += 1
            resp_auth = response.headers.get("Auth-Token") or response.headers.get("authtoken")
            req_auth = request.headers.get("Auth-Token") or request.headers.get("authtoken")
            if resp_auth:
                auth_header_responses += 1
                if req_auth and resp_auth != req_auth:
                    rotation_events += 1

print("\n=== sliding-session header check ===")
print(f"  authenticated dito.ph responses inspected: {checked}")
print(f"  responses carrying an Auth-Token header:   {auth_header_responses}")
print(f"  responses where Auth-Token was ROTATED:    {rotation_events}")
if not login_seen:
    print("\n(no /user/login response found in capture)")
