import { Application } from '@bookyp/core';

import AuthenticationService from './authentication/authentication.service';
import BookablesService from './bookables/bookables.service';
import BookingsService from './bookings/bookings.service';
import MapObjectService from './mapObjects/mapObject.service';
import SpacesService from './spaces/spaces.service';
import UsersService from './users/users.service';

export default function (app: Application): void {
  app.configure(UsersService);
  app.configure(BookablesService);
  app.configure(BookingsService);
  app.configure(AuthenticationService);
  app.configure(SpacesService);
  app.configure(MapObjectService);
}
