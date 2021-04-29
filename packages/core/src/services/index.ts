import { AuthenticationService } from '@feathersjs/authentication';
import { Service } from '@feathersjs/feathers';

import { Bookable, Booking, MapObject, Space, User } from '~/model';

export type ServiceModels = {
  users: User;
  bookables: Bookable;
  bookings: Booking;
  spaces: Space;
  mapObjects: MapObject;
};

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: Service<User>;
  bookables: Service<Bookable>;
  bookings: Service<Booking>;
  spaces: Service<Space>;
  mapObjects: Service<MapObject>;
};
