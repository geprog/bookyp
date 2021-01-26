import { Application as FeathersApplication } from '@feathersjs/feathers';

import ServiceTypes from "./services";

type Application = FeathersApplication<ServiceTypes>;

export default Application;
