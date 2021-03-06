import { createApplication } from '@bookyp/core';
import socketio from '@feathersjs/socketio';

import services from './services';

const app = createApplication();

// Configure Socket.io real-time APIs
app.configure(
  socketio({
    path: '/api/v1/socket',
    serveClient: false,
  }),
);

// Set up our services (see `services/index.js`)
app.configure(services);
export default app;
