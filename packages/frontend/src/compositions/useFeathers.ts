import { Application, createApplication } from '@bookyp/core';
import socketio from '@feathersjs/socketio-client';
import { io, Socket } from 'socket.io-client';

const app = createApplication();

const socket = io({
  path: '/api/v1/socket',
  transports: ['websocket'],
  autoConnect: false,
});

app.configure(socketio(socket));

export default (): Application => app;

export function connect(): Socket {
  return socket.connect();
}
