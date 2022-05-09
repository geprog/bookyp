import { AdapterService } from '@feathersjs/adapter-commons';
import { AuthenticationService } from '@feathersjs/authentication';

import { Bookable, Booking, Invitation, MapObject, Space, User } from '~/model';

export type ServiceModels = {
  users: User;
  bookables: Bookable;
  bookings: Booking;
  spaces: Space;
  mapObjects: MapObject;
  invitations: Invitation;
};

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: AdapterService<User>;
  bookables: AdapterService<Bookable>;
  bookings: AdapterService<Booking>;
  spaces: AdapterService<Space>;
  mapObjects: AdapterService<MapObject>;
  invitations: AdapterService<Invitation>;
};
