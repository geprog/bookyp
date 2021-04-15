import { Application, createApplication, Model } from '@bookyp/core';
import auth from '@feathersjs/authentication-client';
import socketio from '@feathersjs/socketio-client';
import { io, Socket } from 'socket.io-client';

import { getConfig } from '~/compositions/useAppConfig';

interface AuthenticationResult {
  user: Model.User;
}

type ClientApplication = Application & {
  get(key: 'authentication'): Promise<AuthenticationResult | null>;
};

let app: ClientApplication | undefined;
let socket: Socket;

export default (): ClientApplication => {
  // skip if we already initialized the application
  if (app) {
    return app;
  }

  app = createApplication() as ClientApplication;

  const backendUrl = getConfig('BACKEND_URL');
  const socketOptions = {
    path: '/api/v1/socket',
    transports: ['websocket'],
    autoConnect: false,
  };
  socket = backendUrl ? io(backendUrl, socketOptions) : io(socketOptions);

  app.configure(socketio(socket));

  app.configure(
    auth({
      storageKey: 'auth',
    }),
  );

  return app;
};

export function connect(): Socket {
  return socket.connect();
}
