import { Application, createApplication, Model } from '@bookyp/core';
import auth from '@feathersjs/authentication-client';
import socketio from '@feathersjs/socketio-client';
import { io, Socket } from 'socket.io-client';

interface AuthenticationResult {
  user: Model.User;
}

type ClientApplication = Application & {
  get(key: 'authentication'): Promise<AuthenticationResult | null>;
};

const app = createApplication() as ClientApplication;

const socket = io({
  path: '/api/v1/socket',
  transports: ['websocket'],
  autoConnect: false,
});

app.configure(socketio(socket));

app.configure(
  auth({
    storageKey: 'auth',
  }),
);

export default (): ClientApplication => app;

export function connect(): Socket {
  return socket.connect();
}
