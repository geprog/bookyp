import { createApplication } from '@bookyp/core';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import { authorizeWithFreshAbility, feathersCasl } from '~/casl';
import channels from '~/channels';
import config from '~/config';
import { extractSoftDeleteFlag } from '~/hooks/softDelete';
import services from '~/services';
import SSOLogoutRoute from '~/services/authentication/sso-logout';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const configureApplication = () => {
  const app = express(createApplication());

  // configure oauth
  app.set('host', config().app.host);
  app.set('port', config().app.port);

  // Configure Socket.io real-time APIs
  app.configure(
    socketio({
      path: '/api/v1/socket',
      serveClient: false,
    }),
  );

  app.configure(feathersCasl);

  // Set up our services (see `services/index.js`)
  app.configure(services);

  app.configure(channels);

  app.use(SSOLogoutRoute());

  app.use('/', (_req, res) => {
    res.send('You found the backend of Bookyp! ;-)');
  });

  const memoryServices: string[] = [];

  app.hooks({
    before: {
      all: [
        extractSoftDeleteFlag,
        (ctx) => {
          if (ctx.params.provider === undefined || (ctx.path === 'authentication' && ctx.method === 'create')) {
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
          if (ctx.params.provider === undefined || (ctx.path === 'authentication' && ctx.method === 'create')) {
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
          if (process.env.NODE_ENV === 'production') {
            return;
          }
          // eslint-disable-next-line no-console
          console.log(`🔥 Error ${ctx.path}.${ctx.method}:`, ctx.error);
        },
      ],
    },
  });

  return app;
};
