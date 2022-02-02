import { Application, createApplication, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import auth from '@feathersjs/authentication-client';
import { Application as FeathersApplication, Id, ServiceMethods } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import { getEnvConfig } from '@geprog/vite-plugin-env-config';
import { io, Socket } from 'socket.io-client';

interface AuthenticationResult {
  user: Model.User;
}

export type ClientApplication = Application & {
  get(key: 'authentication'): Promise<AuthenticationResult | null>;
};

let app: ClientApplication | undefined;
let socket: Socket;

export function init(): void {
  app = createApplication() as ClientApplication;

  const backendUrl = getEnvConfig('FRONTEND_BACKEND_URL');
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
}

function useFeathers(): ClientApplication {
  if (!app) {
    init();
    return useFeathers();
  }

  return app;
}

export default useFeathers;

export function connect(): Socket {
  return socket.connect();
}

export type PotentialIds = {
  id?: Id;
  _id?: Id;
};

export function getId(item: PotentialIds): Id {
  if (item.id) {
    return item.id;
  }
  if (item._id) {
    return item._id;
  }
  throw new Error('Unable to retrieve id from item');
}

export type ServiceTypes = Application extends FeathersApplication<infer S> ? S : never;

// TODO: the checks below are necessary due to the prerelease state of feathers v5. The problem there is
// that the AdapterService interface is not yet updated and is not compatible with the ServiceMethods interface
// and therefor needs to be checked separately.
export type ServiceModel<T extends keyof ServiceTypes> = ServiceTypes[T] extends AdapterService<infer M1>
  ? M1
  : ServiceTypes[T] extends ServiceMethods<infer M2>
  ? M2
  : never;
