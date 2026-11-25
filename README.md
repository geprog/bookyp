# BOOKYP - Book your place

Bookyp is an open-source platform for managing and booking spaces, such as rooms or workspaces.

> Try now at: [app.bookyp.com](https://app.bookyp.com)

![Bookyp Demo Screenshots](./docs/screenshots.png)

Bookyp is a single [Nuxt 4](https://nuxt.com) application (Vue app + REST api) with [Nuxt UI](https://ui.nuxt.com),
MongoDB, Keycloak for authentication and Mollie for payments. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
for the structure and the decisions behind it.

## Development

Requirements: Node.js >= 24, pnpm (`corepack enable`), Docker.

```sh
cp .env.example .env            # adjust if needed, the defaults work with the docker services
pnpm install
pnpm docker:up                  # MongoDB, mongo-express (:8081), mailhog (:8025), minio (:9001)
pnpm seed                       # sample data, you are the admin of "New Space" (user alice)
pnpm dev                        # http://localhost:3000
```

Development uses the dummy login (`NUXT_AUTH_HANDLER=dummy`): the login button opens a page that logs in one of the
test users or any e-mail address, no Keycloak needed. Set `NUXT_AUTH_HANDLER=keycloak` and the `NUXT_OAUTH_KEYCLOAK_*`
settings for the real login.

Payments use a mocked provider in development (`NUXT_PAYMENT_PROVIDER=mock`), the checkout is a small page
served by the app. Set `NUXT_PAYMENT_PROVIDER=mollie` and `NUXT_PAYMENT_MOLLIE_API_KEY` to talk to Mollie.

### Checks

```sh
pnpm lint          # eslint (antfu config), `pnpm lint:fix` to auto fix
pnpm typecheck     # vue-tsc
pnpm spelling      # cspell
pnpm test          # unit tests (vitest)
pnpm test:e2e      # Playwright, starts the app on :3010 with the dummy login
```

The e2e tests reset the database to the sample data and log in as `alice`. Set `E2E_BASE_URL` to run them
against an already running instance.

## Configuration

Every setting is a `NUXT_*` environment variable mapping to `runtimeConfig` in `nuxt.config.ts`, see
[.env.example](./.env.example) for the full list. Production deployments use the Helm chart in
[.ci/charts/bookyp](./.ci/charts/bookyp) which wires the same variables.

## Release

To trigger the release pipeline, create a release in GitLab with an appropriate semantic version tag (e.g., `2.0.0`).
The pipeline builds the docker image `app:<tag>` and publishes the Helm chart.

## Migrating from v1

v2 runs on the same MongoDB database as v1 (same collections). On the first start a migration removes the
Gringotts ids of spaces and users. Paid spaces keep their plan until the already paid period ends.

To keep paying spaces running without action of their admins, an administrator moves the billing data from
Gringotts with two scripts in [scripts/gringotts](./scripts/gringotts). They are not part of the app image, run
them from a checkout of this repository (`pnpm install`). Gringotts and v2 must use the same Mollie account (use the API key of
the website profile).

1. Stop v1, keep Gringotts and its database running.
2. Export, nothing is changed: `pnpm gringotts:export --env-file export.env --dir gringotts-export` with
   `NUXT_MONGODB_URI` (the v1 database), `GRINGOTTS_DATABASE_URL` (Postgres of Gringotts), `GRINGOTTS_URL` and
   `GRINGOTTS_TOKEN` (api token of the Gringotts project, to download the invoice pdfs). The folder gets
   `export.json` with customers, subscriptions and invoices, and `pdfs/` with the original invoices.
   **The folder is the archive of the v1 invoices and contains personal data: store it safely for as long as invoices
   must be kept (10 years).** Customers request old invoices by mail (linked in the invoice list).
3. Shut down Gringotts and deploy v2. Its first start removes the Gringotts ids from the database.
4. Import, as dry run first: `pnpm gringotts:import --env-file import.env --dir gringotts-export` with the production
   values of v2: `NUXT_MONGODB_URI`, `NUXT_PUBLIC_APP_URL`, `NUXT_PAYMENT_PROVIDER=mollie`,
   `NUXT_PAYMENT_MOLLIE_API_KEY`, `NUXT_PAYMENT_VAT_RATE`. Check the output, then run it with `--apply`. It
   - copies billing details, Mollie customer and mandate of every v1 customer. v1 did not ask for the VAT ID, so the
     invoices of these customers wait until they complete their billing details in the app,
   - creates a Mollie subscription for every active Gringotts subscription that starts at the end of the current
     Gringotts period,
   - charges the current Gringotts period right away (Gringotts bills at the end of a period, so it is still
     unpaid; the credit of the customer is subtracted). Pass `--skip-open-period` to skip this.

   The import can run again, imported entries are skipped. It exits with an error if an entry failed.

5. Delete the env files.
