import base64
import json
from datetime import datetime, timezone
from pathlib import Path

from mitmproxy import io


def decode_jwt_payload(token: str) -> dict:
    payload = token.split(".")[1]
    payload += "=" * (-len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))


def describe(name: str, claims: dict) -> None:
    issued = claims.get("iat")
    expires = claims.get("exp")
    duration = expires - issued if isinstance(issued, int) and isinstance(expires, int) else None
    print(f"{name}:")
    print(f"  issued_utc={datetime.fromtimestamp(issued, timezone.utc).isoformat() if issued else None}")
    print(f"  expires_utc={datetime.fromtimestamp(expires, timezone.utc).isoformat() if expires else None}")
    print(f"  lifetime_seconds={duration}")
    print(f"  lifetime_minutes={duration / 60 if duration is not None else None}")
    print(f"  channel={claims.get('LOGIN_CHANNEL_TYPE')}")
    print(f"  issuer={claims.get('iss')}")


capture = Path(__file__).with_name("dito_web_capture.mitm")
for flow in io.FlowReader(capture.open("rb")).stream():
    request = getattr(flow, "request", None)
    response = getattr(flow, "response", None)
    if not request or not response or request.path != "/ecare/webs/user/login":
        continue
    body = json.loads(response.get_text(strict=False))
    access_token = body.get("token") or body.get("loginToken")
    if not access_token:
        continue
    access_claims = decode_jwt_payload(access_token)
    describe("access_token", access_claims)
    nested = access_claims.get("REFRESH_TOKEN")
    if nested:
        describe("embedded_refresh_token", decode_jwt_payload(nested))
    else:
        print("embedded_refresh_token: not present")
    break
else:
    raise SystemExit("No successful login token found in capture")
