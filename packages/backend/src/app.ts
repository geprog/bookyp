import { createApplication } from '@bookyp/core';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import { authorizeWithFreshAbility, feathersCasl } from '~/casl';
import channels from '~/channels';
import config from '~/config';
import { extractSoftDeleteFlag } from '~/hooks/softDelete';
import s3 from '~/s3';
import services from '~/services';
import SSOLogoutRoute from '~/services/authentication/sso-logout';
import PaymentWebhookRouter from '~/services/spaceSubscriptions/webhook';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const configureApplication = () => {
  const app = express(createApplication());
  const { host, port, frontendUrl } = config().app;

  // configure oauth
  app.set('host', host);
  app.set('port', port);

  // Configure Socket.io real-time APIs
  app.configure(
    socketio({
      path: '/api/v1/socket',
      serveClient: false,
    }),
  );

  app.configure(feathersCasl);

  app.configure(s3);

  // Set up our services (see `services/index.js`)
  app.configure(services);

  app.configure(channels);

  app.use(SSOLogoutRoute());
  app.use(PaymentWebhookRouter(app));

  app.use('/', (_req, res) => {
    if (frontendUrl !== undefined) {
      res.redirect(frontendUrl);
      return;
    }
    res.send('You found the backend of Bookyp! ;-)');
  });

  const memoryServices: string[] = ['spaceSubscriptions', 'paymentCustomers'];

  app.hooks({
    before: {
      all: [
        extractSoftDeleteFlag,
        (ctx) => {
          if (ctx.params.provider === undefined || ctx.path === 'authentication') {
            return ctx;
          }

          return authorizeWithFreshAbility(memoryServices.includes(ctx.path) ? 'feathers-memory' : 'feathers-mongoose')(
            ctx,
          );
        },
      ],
    },
    after: {
      all: [
        (ctx) => {
          if (ctx.params.provider === undefined || ctx.path === 'authentication') {
            return ctx;
          }

          return authorizeWithFreshAbility(memoryServices.includes(ctx.path) ? 'feathers-memory' : 'feathers-mongoose')(
            ctx,
          );
        },
      ],
    },
    error: {
      all: [
        (ctx) => {
          // eslint-disable-next-line no-console
          console.log(`🔥 Error ${ctx.path}.${ctx.method}:`, ctx.error);
        },
      ],
    },
  });

  return app;
};
