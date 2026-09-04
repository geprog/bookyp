# BOOKYP - Book your place

Bookyp is an open-source platform for managing and booking spaces, such as rooms or workspaces.

> Try now at: [app.bookyp.com](https://app.bookyp.com)

![Bookyp Demo Screenshots](./docs/screenshots.png)

## Development

### Manual Setup

- copy env-file: `cp docs/.env.example .env`
- set properties in `.env` file
- install project dependencies: `pnpm install`
- build libs: `pnpm build:libs`
- seed a space with your user as admin with `pnpm run --filter @bookyp/e2e seed`
- run `pnpm docker:up` BEFORE starting the backend
- start backend and frontend: `pnpm start` or `pnpm start:frontend` & `pnpm start:backend`

## Release

To trigger the release pipeline, create a release in GitLab with an appropriate semantic version tag (e.g., `1.0.0`).

### Android

To trigger a release on the Play Store, increment the `versionCode` in `packages/native/android/app/build.gradle`.
`versionName` is just a human readable version number and can be incremented as well.
Changelogs can optionally be added.
