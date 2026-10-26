# Cloudflare deployment guide

The starter is configured for a **new staging Worker**, not the existing DVito deployment. No resources have been provisioned or deployed as part of preparing this project.

## Validate locally

```sh
npm ci
npm run build
npm test
npm run verify
npm run check:cloudflare
```

`npm run dev:cloudflare` runs the staging configuration locally. The base configuration disables workers.dev and version preview URLs; the explicit staging environment enables a new workers.dev address. The API only exposes public infrastructure status. The current UI has fictional data.

## Publish a staging preview when authorized

Authenticate Wrangler to the intended Cloudflare account, review its selected account and the staging Worker name, then run `npm run deploy:staging`. This creates or updates a deployed service; do not treat the dry run as deployment authorization. No old database ID or Access policy is copied into this project. Add an appropriate access policy before introducing private data; disabling version preview URLs alone is not authentication.

After publishing, check the homepage and both documented API routes at the returned address. Review that capabilities still report integrations accurately. A successful deployment is not verification of a DITO login, wallet debit or recipient promo delivery.

## Before a production service

Implement and test app authentication/roles, dedicated D1 migrations and bindings, encrypted supplier connections, scoped APIs, and durable fulfillment coordination. Choose names and resources independently for staging and production. Generate binding types after configuration changes. Use Wrangler secret management for encryption/authentication configuration; never commit secret values or provider account data.

Only enable real purchasing after the exact payer-recipient flow and delivery evidence have been separately verified, with spending policy, ambiguous-result reconciliation and recovery tested. A new domain can be attached after the deployment and access model are settled.

References: [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/), [Workers assets](https://developers.cloudflare.com/workers/static-assets/), [D1](https://developers.cloudflare.com/d1/), [Durable Objects](https://developers.cloudflare.com/durable-objects/).
