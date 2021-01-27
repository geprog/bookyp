import { createApplication } from '@bookyp/core';
import socketio from '@feathersjs/socketio-client';
import { io } from 'socket.io-client';

const app = createApplication();

const socket = io({
  path: 'api/v1/socket',
  transports: ['websocket'],
});

app.configure(socketio(socket));

export default app;
