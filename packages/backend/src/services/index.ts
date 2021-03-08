import { Application } from '@bookyp/core';

import UsersService from './users/users.service';

export default function (app: Application): void {
  app.configure(UsersService);
}
