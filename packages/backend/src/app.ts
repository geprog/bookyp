import { createApplication } from '@bookyp/core';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import { feathersCasl } from '~/casl';
import channels from '~/channels';
import config from '~/config';
import services from '~/services';
import SSOLogoutRoute from '~/services/authentication/sso-logout';

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

export default app;
