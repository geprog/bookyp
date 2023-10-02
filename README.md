# BOOKYP - Book your place

## Development

### With devcontainer (preferred way)

- copy env-file: `cp docs/.env.example .env`
- set properties in `.env` file (`BACKEND_KEYCLOAK_SECRET` can be found at <https://vault.geprog.com>)
- open VS Code Dev Container
- install dependencies: `pnpm install`
- build libs: `pnpm build:libs`
- seed a space with your user as admin with `pnpm run --filter @bookyp/e2e seed`
- start backend and frontend: `pnpm start` or `pnpm start:frontend` & `pnpm start:backend`

### Without devcontainer

- install pnpm globally: `npm install -g pnpm@7`
- copy env-file: `cp docs/.env.example .env`
- set properties in `.env` file (`BACKEND_KEYCLOAK_SECRET` can be found at <https://vault.geprog.com>)
- install project dependencies: `pnpm install`
- build libs: `pnpm build:libs`
- seed a space with your user as admin with `pnpm run --filter @bookyp/e2e seed`
- run `pnpm docker:up` BEFORE starting the backend

## Release

### Android

To trigger a release on the Play Store, increment the `versionCode` in `packages/native/android/app/build.gradle`.
`versionName` is just a human readable version number and can be incremented as well.
Changelogs can optionally be added.

An example can be found at <https://git.geprog.com/bookyp/bookyp/-/merge_requests/789/diffs>.
