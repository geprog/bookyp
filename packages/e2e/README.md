# E2E testing

## Running tests

1. Create `packages/e2e/.env` for e2e tests (adjust the db credentials according to your main `.env`)

   ```sh
   BACKEND_DB_URI=mongodb://<DB_USERNAME>:<DB_PASSWORD>@localhost:<DB_PORT>/bookyp-e2e?authSource=admin
   ```

1. Ensure mongodb is running
1. `cd packages/e2e`
1. Install playwright browsers: `pnpm playwright:install`
1. `pnpm run test` to run the e2e tests

## Adding new tests

Create a new `.test.ts` file in `tests/`.

`pnpm run codegen` might be useful in writing the test (see <https://playwright.dev/docs/codegen>). `codegen` accesses your local dev server, so make sure it is running.
Additionally, make sure to [run the existing tests](##running-tests) before to save your session into `storageState.json`.

### codegen in devcontainer

When developing inside a container you have to start `codegen` from your host system since no GUI is available inside docker. Follow these steps:

- open a second editor on your host and check out your branch
- copy `storageState.json` to your host environment
- start your dev server inside the container
- execute `pnpm run codegen` on your host
- copy generated code snippets to a new test inside the container
- execute `pnpm run test` inside the container
