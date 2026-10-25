# Setup and commands

## Run the reference application

Use Node.js 24, the version family used for this snapshot's validation. From the handoff folder:

```sh
cd reference/dito-login-test
npm ci --omit=dev
npm start
```

Open `http://localhost:5174`. The Node process serves the page and `/api` together. On Codespaces, use the private forwarded HTTPS URL for that port. To avoid an already-running instance, choose another port before starting this copy, for example `PORT=5175 npm start` in Bash. Do not stop an existing instance with unresolved payments merely to try this snapshot.

Sign in using the UI. The account owner enters credentials locally; there is no account configuration embedded in the snapshot. Leave **Stay signed in** unchecked if you do not want the server to retain a password for automatic reauthentication.

The application stores Node sessions and payment attempts in process memory. Browser refresh can retrieve them while the same server runs; process restart, sign-out, and a different session can make those records unavailable. DITO/payment-provider history remains necessary for uncertain payments.

## Offline checks

After installing runtime dependencies, from the application folder:

```sh
node tests/load-purchase.test.mjs
node tests/promo-catalog.test.mjs
node --check proxy-server.js
node --check src/load-purchase.mjs
```

The test suites mock DITO requests. They do not request an OTP, sign in to a real account, or create a real payment. A passing mock test establishes local behavior under the supplied fixture; it does not prove DITO currently accepts that request.

From the handoff folder, run:

```sh
node tools/verify-handoff.mjs
```

The recorded export validation reused the existing project's installed runtime dependency tree for tests; it did not perform a new dependency installation or contact the package registry. See [the exact validation record](../evidence/VALIDATION.json).

## API collection

Import the [Postman collection](../reference/expantor/collections/dito-dashboard.postman_collection.json). Set `baseUrl` to the origin of the Node app, without `/api`. Set the category, authorized recipient, and date placeholders when relevant.

Authenticated requests require a `dito_session` in that client's cookie jar. A browser login is not automatically shared with Postman. The collection deliberately omits login, OTP generation, and purchase submission; use the signed-in browser's requests to study the current flow, or implement explicit session establishment in your new client after reviewing the [connection guide](./02-API-CONNECTION.md).

## Worker alternative

The [Worker source](../reference/dito-login-test/src/worker.mjs), [configuration](../reference/dito-login-test/wrangler.jsonc), and [secret example](../reference/dito-login-test/.dev.vars.example) are included for reference. The KV ID is a placeholder. No account/namespace has been provisioned or deployed by making this handoff.

Worker mode requires a KV binding and its own session-encryption secret. Its load checkout is intentionally disabled: KV alone is not the atomic financial coordinator this implementation needs. Follow the historical [application guide](../reference/dito-login-test/README.md) only after reviewing the next system's infrastructure and storage choices. The snapshot's old development-tool pins also have [recorded audit caveats](./04-VERIFICATION.md).

## Exclusions

The snapshot excludes installed dependencies, real secrets, live session/payment records, private account screenshots, raw network captures, APK binaries/native libraries, and the old ad-hoc login scripts. Those scripts were not needed to run the current implementation and are not an appropriate migration starting point.
