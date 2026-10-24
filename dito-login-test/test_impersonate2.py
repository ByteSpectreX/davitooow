import hashlib
import time
from curl_cffi import requests

session = requests.Session(impersonate="chrome124")

# Step 1: visit the homepage like a real browser would, to accumulate cookies
home_resp = session.get("https://my.dito.ph/")
print("HOME STATUS", home_resp.status_code)
print("COOKIES AFTER HOME:", dict(session.cookies))

# Step 2: make the API call reusing the session (and its accumulated cookies)
path = "user/login/check"
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
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
}

resp = session.post(
    "https://my.dito.ph/ecare/webs/" + path,
    headers=headers,
    data='{"accNbr":"9914889829"}',
)

print("CHECK STATUS", resp.status_code)
print("CHECK CONTENT-TYPE", resp.headers.get("content-type"))
print("CHECK BODY", resp.text)
