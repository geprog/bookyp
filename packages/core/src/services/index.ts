import { AuthenticationService } from '@feathersjs/authentication';
import { Service } from '@feathersjs/feathers';

import { User } from '~/model';

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: Service<User>;
};
