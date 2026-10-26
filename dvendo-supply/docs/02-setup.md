# Setup

Use Node.js 24+. All commands below run from the project root. No credentials are required for the prototype or offline tests.

| Command | Result |
| --- | --- |
| `npm run build` | Rebuild the standalone sample UI from local sources |
| `npm run dev` | Serve the UI and starter API on localhost:5180 |
| `npm test` | Run API and synthetic-model tests and record a finding |
| `npm run verify` | Check local documentation links, contracts and provenance |
| `npm ci` | Install the pinned Wrangler toolchain from the lockfile |
| `npm run dev:cloudflare` | Emulate the staging Worker and static assets locally |
| `npm run check:cloudflare` | Bundle staging without deploying |

The Node server is a small development harness, not the production server. Restart it after API source changes; rebuild after editing preview sources. Keep forwarded ports private. No real phone numbers are needed: the demo uses masked/sample identifiers.

## Start a fresh GitHub repository

Move or copy **the contents of this project folder only** into a new empty project directory. Do not include parent directories, their `.git`, `node_modules`, local secrets, runtime state or archives. The new directory's root should contain this README and package.json.

Run the build, tests and verification there before publishing. Then initialize a fresh Git repository and push to a newly created GitHub repository. Choose repository ownership, name and visibility when creating it; nothing in this starter creates or pushes a repository automatically. Do not initialize a nested Git repository while this project is still being prepared inside the old checkout.

Dependency folders are regenerated with `npm ci`. The tracked dependency lockfile belongs in the new repository. Cloudflare deployment is a separate step described in [the deployment guide](06-deployment.md).
