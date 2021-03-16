import { Application } from '@bookyp/core';

import BookablesService from './bookables/bookables.service';
import UsersService from './users/users.service';

export default function (app: Application): void {
  app.configure(UsersService);
  app.configure(BookablesService);
}
