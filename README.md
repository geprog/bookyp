# BOOKYP - Book your place

## Development

### With devcontainer (preferred way)

- copy env-file: `cp docs/.env.example-devcontainer .env`
- set properties in `.env` file (`BACKEND_KEYCLOAK_SECRET` can be found at <https://vault.geprog.com>)
- open VS Code Dev Container
- install dependencies: `pnpm install`
- build libs: `pnpm build:libs`
- start backend and frontend: `pnpm start` or `pnpm start:frontend` & `pnpm start:backend`

### Without devcontainer

- install pnpm globally: `curl -f https://get.pnpm.io/v6.js | node - add --global pnpm@6`
- copy env-file: `cp docs/.env.example-without-devcontainer .env`
- set properties in `.env` file (`BACKEND_KEYCLOAK_SECRET` can be found at <https://vault.geprog.com>)
- install project dependencies: `pnpm install`
- build libs: `pnpm build:libs`
- run `pnpm docker:up` BEFORE starting the backend
