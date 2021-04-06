import { AuthenticationService } from '@feathersjs/authentication';
import { Service } from '@feathersjs/feathers';

import { Bookable, Booking, Space, User } from '~/model';

export type ServiceModels = {
  users: User;
  bookables: Bookable;
  bookings: Booking;
  spaces: Space;
};

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: Service<User>;
  bookables: Service<Bookable>;
  bookings: Service<Booking>;
  spaces: Service<Space>;
};
