import { AuthenticationService } from '@feathersjs/authentication';
import { Service } from '@feathersjs/feathers';

import { Bookable, Booking, User } from '~/model';

export type ServiceModels = {
  users: User;
  bookables: Bookable;
  bookings: Booking;
};

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: Service<User>;
  bookables: Service<Bookable>;
  bookings: Service<Booking>;
};
