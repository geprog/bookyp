# Architecture (v2)

Bookyp v2 is a single [Nuxt 4](https://nuxt.com) application: the Vue app (rendered as SPA, `ssr: false`) and the
REST api (Nitro server routes under `server/`) are built and deployed together. It replaces the v1 monorepo
(Feathers backend, Vite frontend, core package, Gringotts payment service).

```
app/            the Vue app (pages, components, composables, layouts)
server/api/     REST endpoints, one file per route (login / logout under `server/api/auth`)
server/utils/   auto-imported server helpers (database, access rules, mail, payments)
server/db/      database migrations
shared/         types and helpers used by app and server
i18n/locales/   translations (de, en)
e2e/            Playwright tests
tests/          unit tests (vitest)
```

## Decisions

| Topic          | v1                                                        | v2                                                                                                                         | Why                                                                                  |
| -------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Framework      | Vite + Vue 3 SPA, Feathers backend, shared core package   | one Nuxt 4 app (SPA + Nitro api)                                                                                           | one build, one deployment, one type system, no shared package to publish             |
| UI             | hand written components (WindiCSS)                        | the v1 components rebuilt on Tailwind 4 (v1 palette, icons and layout), [Nuxt UI](https://ui.nuxt.com) only for primitives | the app looks exactly like v1, every route and component was compared pixel by pixel |
| Database       | MongoDB via mongoose + feathers-mongoose                  | MongoDB via the official driver                                                                                            | same database and collections as v1, no data migration needed                        |
| Realtime       | socket.io, feathers channels + CASL rules for publishing  | plain REST + polling (`usePolling`, 10 s, pauses in background tabs)                                                       | much simpler, no websocket infrastructure, good enough for a booking app             |
| Authorization  | CASL abilities evaluated per request on client and server | explicit access rules in `server/utils/access.ts` (`admin` / `member` / `public`)                                          | easier to read and test, the client only needs `space.role`                          |
| Authentication | feathers oauth + custom JWT strategy                      | `nuxt-auth-utils` with its Keycloak handler, sealed session cookie, renewed on every navigation (`/api/me`)                | 30 lines instead of a custom strategy, no token handling in the browser              |
| Payment        | Gringotts (own service with Postgres + Gotenberg)         | Mollie api directly (`server/utils/payments`), invoices issued by Mollie (Sales Invoices API)                              | Mollie is the only provider, one service and one database less                       |
| File uploads   | presigned S3 urls, public s3 endpoint config              | uploads and downloads go through the app (`/api/spaces/:id/image`)                                                         | no CORS / public endpoint setup, no expiring urls in the client                      |
| Date picker    | v-calendar                                                | v-calendar (same version) and vue-toastification for toasts                                                                | identical look and behavior of the date picker and the toasts                        |
| Native app     | Capacitor project                                         | dropped                                                                                                                    | not maintained, the PWA covers mobile                                                |
| Space importer | `packages/importer`                                       | dropped                                                                                                                    | one-off tool, `importId` and "claim space" are still supported                       |

## Access rules

Every space grants one of four access levels to a user (`server/utils/access.ts`):

- `admin`: members with role `admin` and super admins (`NUXT_SUPER_ADMIN_EMAILS`) - full access
- `member`: members with role `user` - can see the space and book
- `public`: everyone (also anonymous users) for public spaces - can see the space, logged in users can book / request
- `none`: the space is invisible

Non-admins only receive the public subset of a space (no members, no e-mail, no subscription) and only the
time slots of foreign bookings (no description, no name).

## Payments

- Billing details are stored in the `paymentcustomers` collection: a company (name plus VAT ID or commercial register
  number) or a private person (first and last name), address with an ISO country code. Mollie customers only get
  name, e-mail and locale, the full details go into the invoices.
- Upgrading a space from free (or after the paid period ended) starts a Mollie checkout for the first month
  (`metadata.purpose = 'first-period'`). This "first payment" also creates the payment method (mandate). When Mollie
  reports it as paid, the webhook switches the plan and creates a monthly subscription (gross price = plan price + VAT)
  that starts with the second month. A canceled checkout changes nothing. `space.currentPeriodEnd` is the end of the
  period that is paid for.
- Another payment method is added on the billing page with a checkout of 0 € (`metadata.purpose = 'mandate'`), which
  Mollie only supports for credit card and PayPal. The new payment method becomes the active one and the running
  subscriptions of the user use it. Other methods (e.g. direct debit) are chosen in the checkout of the first month
  when a plan is booked again after the paid period.
- Mollie is called through its generated SDK [`mollie-api-typescript`](https://github.com/mollie/mollie-api-typescript)
  (`server/utils/payments/mollie.ts`).
- During a paid period an upgrade applies immediately and charges the price difference for the rest of the period as a
  one-off payment from the mandate (`metadata.purpose = 'proration'`). If that payment fails, the plan goes back.
- A downgrade (also to free) takes effect at `currentPeriodEnd`: it is stored as `space.scheduledPlan`, the subscription
  is updated to the new price (or canceled for free). `getActivePlan` applies a due scheduled plan, so no job is needed.
  Choosing the paid plan again before the period ends takes the downgrade back.
- Mollie calls `POST /api/payment/webhook` for every payment status change. A paid subscription payment extends
  `space.activeUntil` (next payment date + 7 days grace) and `currentPeriodEnd`.
  A failed subscription payment changes nothing (the plan runs out at `activeUntil`), the paying user gets a mail
  to check the payment method.
- Invoices are issued by Mollie ([Sales Invoices API](https://docs.mollie.com/docs/sales-invoices-api-guide)), which
  numbers them, renders the pdf and mails it. Every paid payment of a space gets an entry in the `invoices` collection
  and is issued as a sales invoice that is already paid by that payment (idempotent per payment). Without complete
  billing details (e.g. customers migrated from v1 without VAT ID) the invoice stays `pending` and is issued as soon as
  the customer saves complete billing details. The pdf is loaded from Mollie through `/api/spaces/:id/invoices/:id/pdf`.
  Use the API key of the website profile (an organization access token would need a `profileId` in every request).
- `NUXT_AUTH_HANDLER=dummy` (default in development and in the e2e tests) replaces the Keycloak login with a page that logs in any test user, no identity provider needed.
- `NUXT_PAYMENT_PROVIDER=mock` replaces Mollie with an in-database mock and a tiny checkout page for local development and tests.
- The migration `v023-remove-gringotts` removes the Gringotts ids. The billing data is moved by the standalone scripts in
  `scripts/gringotts` (not part of the build), see "Migrating from v1" in the README. v1 invoices are not migrated, the
  invoice list links to a mail to request them.
