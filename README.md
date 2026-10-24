# DITO account study

A workspace for exploring an authorized DITO account, documenting its APIs, and building an account dashboard.

| Area | Start here |
| --- | --- |
| Expantor API collection and research notebook | [expantor/](./expantor/README.md) |
| Account dashboard and local startup | [dito-login-test/](./dito-login-test/README.md) |
| Existing browser extension | [DITO Home WiFi Dashboard](./tools/dito-login-listener/README.md) |
| Earlier Android static analysis | [APK analysis report](./analysis/APK_STATIC_ANALYSIS_REPORT.md) |
| Existing runtime capture plan | [Capture plan](./analysis/API_CAPTURE_PLAN.md) |

The API study distinguishes project implementations from endpoints seen in official frontend code and responses actually verified for an account. Finding an endpoint does not prove that an offer is available or purchasable.

Start the dashboard from the repository root with:

```sh
npm --prefix dito-login-test start
```

Open `http://localhost:5174`, or the private forwarded URL for port 5174 in Codespaces. Keep credentials, session cookies, tokens, and unredacted account responses out of these notes and source control.
