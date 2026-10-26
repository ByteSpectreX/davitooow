# DVendo Supply

A fresh foundation for supplier-funded DITO promo renewals. Supplier Admin manually funds their own DITO account; managers choose next promos for assigned recipient SIMs. Supplier policy controls fulfillment.

**Current release: organized starter and interactive prototype.** The UI uses fictional data and resets on reload. The API implements health and capability reporting. Authentication, persistent business records, DITO recipient purchasing and automatic renewals are not implemented here.

## Start locally

Use Node.js 24 or later. Preview, build, tests and documentation checks require no installed dependencies:

```sh
npm run build
npm test
npm run verify
npm run dev
```

Open `http://localhost:5180`. In Codespaces, use port 5180's private forwarded URL. `GET /api/v1/health` checks the API; the preview intentionally makes no API requests. Install pinned Cloudflare tooling with `npm ci` when working on Workers.

## Read in this order

| Guide | Purpose |
| --- | --- |
| [Project map](docs/01-project-map.md) | Where code, contracts, evidence and guides belong |
| [Setup](docs/02-setup.md) | Local commands and creating a fresh repository |
| [Product rules](docs/03-product.md) | Roles, funding, recipient ownership and renewal behavior |
| [Architecture](docs/04-architecture.md) | API boundaries, persistence and fulfillment coordination |
| [Our API](docs/api/README.md) | Implemented contract and separately planned operations |
| [DITO integration](docs/dito/README.md) | Upstream inventory, identifiers, request construction and limitations |
| [Data model](docs/05-data-model.md) | Planned records, privacy and money/time conventions |
| [Cloudflare deployment](docs/06-deployment.md) | Isolated staging first; production prerequisites |
| [Build roadmap](docs/07-roadmap.md) | Deliverable phases and verification gates |
| [Evidence](research/README.md) | Original provenance, evidence levels and live findings |

## Structure

```text
apps/api/src/           Worker API entrypoint
apps/web/preview/       Editable synthetic UI/model, styles and licensed fonts
apps/web/public/        Generated standalone preview
contracts/             Implemented OpenAPI contract
docs/                  Setup, product, architecture and API guides
research/dito/         Imported endpoint inventory and source registry
research/findings/     New sanitized findings
scripts/               Build, development, tests, verification and note recording
tests/                 Offline API and prototype tests
wrangler.jsonc         New staging names; no old account/database identifiers
```

This folder is portable: it has no runtime imports from the old repository and contains no Git history. Follow [the clean-repository procedure](docs/02-setup.md#start-a-fresh-github-repository) to make it its own repository. The import manifest preserves the origin of selected materials, not the old repository's bulk archives or installed dependencies.
