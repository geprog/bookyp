import { createApplication } from '@bookyp/core';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import config from '~/config';
// TODO only import '~/services'
import services from '~/services/index';

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

// Set up our services (see `services/index.js`)
app.configure(services);

app.get('/', (_req, res) => {
  res.send('You found the backend of Bookyp! ;-)');
});

export default app;
