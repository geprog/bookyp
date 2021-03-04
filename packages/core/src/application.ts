import feathers, { Application as FeathersApplication } from '@feathersjs/feathers';

import { ServiceTypes } from './services';

export type Application = FeathersApplication<ServiceTypes>;

export function createApplication(): Application {
  return feathers<ServiceTypes>();
}
