import { AdapterService } from '@feathersjs/adapter-commons';
import { AuthenticationService } from '@feathersjs/authentication';
import { ServiceMethods } from '@feathersjs/feathers';

import { Bookable, Booking, MapObject, Space, SpaceMember, User } from '~/model';

export type ServiceModels = {
  users: User;
  bookables: Bookable;
  bookings: Booking;
  spaces: Space;
  mapObjects: MapObject;
};

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: AdapterService<User>;
  bookables: AdapterService<Bookable>;
  bookings: AdapterService<Booking>;
  spaces: AdapterService<Space>;
  mapObjects: AdapterService<MapObject>;
  spaceMembers: ServiceMethods<SpaceMember>;
};
