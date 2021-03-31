# BOOKYP - Book your place

## Development

### Without devcontainer

- install pnpm globally: `npm -g install pnpm`
- copy `.env.example` to `.env` file
- set properties in `.env` file
- install project dependencies: `pnpm install`
- run `pnpm docker:up` BEFORE starting the backend
- run `pnpm start` or `pnpm start:frontend` & `pnpm start:backend`

### With devcontainer

- copy `.devcontainer/.env.example` to `.devcontainer/.env` file
- set properties in `.devcontainer/.env` file
- open VS Code Dev Container
- install dependencies: `pnpm install`
- start backend and frontend: `pnpm run start`
