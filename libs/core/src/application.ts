import feathers, { Application as FeathersApplication } from '@feathersjs/feathers';

import { ServiceTypes } from './services';

type Application = FeathersApplication<ServiceTypes>;

export type { Application };

export function createApplication(): Application {
  return feathers<ServiceTypes>();
}
