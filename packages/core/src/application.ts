import { Application as FeathersApplication, feathers } from '@feathersjs/feathers';

import { ServiceTypes } from './services';

export type Application = FeathersApplication<ServiceTypes>;

export function createApplication(): Application {
  return feathers<ServiceTypes>();
}
