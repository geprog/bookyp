import { AuthenticationService } from '@feathersjs/authentication';
import { Service } from '@feathersjs/feathers';

import { Bookable, Booking, User } from '~/model';

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: Service<User>;
  bookables: Service<Bookable>;
  bookings: Service<Booking>;
};
