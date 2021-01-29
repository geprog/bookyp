import { createApplication } from '@bookyp/core';
import socketio from '@feathersjs/socketio';

const app = createApplication();

// Configure Socket.io real-time APIs
app.configure(
  socketio({
    path: '/api/v1/socket',
    serveClient: false,
  }),
);

export default app;
