import hashlib
import time
from curl_cffi import requests

path = "user/login/check"
body_str = '{"accNbr":"9914889829"}'
alnum_body = "accNbr9914889829"
raw = "/" + path + alnum_body + "" + "32BytesString"
signcode = hashlib.md5(raw.encode("utf-8")).hexdigest()
timestamp = str(int(time.time() * 1000))

headers = {
    "Content-Type": "application/json;charset=UTF-8",
    "Accept": "application/json",
    "Device-Type": "web",
    "authtoken": "",
    "Auth-Token": "",
    "timestamp": timestamp,
    "signcode": signcode,
    "Origin": "https://my.dito.ph",
    "Referer": "https://my.dito.ph/",
}

resp = requests.post(
    "https://my.dito.ph/ecare/webs/" + path,
    headers=headers,
    data=body_str,
    impersonate="chrome124",
)

print("STATUS", resp.status_code)
print("CONTENT-TYPE", resp.headers.get("content-type"))
print("BODY", resp.text)
