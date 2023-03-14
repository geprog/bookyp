import { Application } from '@bookyp/core';

import AuthenticationService from './authentication/authentication.service';
import BookablesService from './bookables/bookables.service';
import BookingsService from './bookings/bookings.service';
import InvitationsService from './invitations/invitations.service';
import InvoiceDownloadService from './invoice-download/invoice-download.service';
import InvoicesService from './invoices/invoices.service';
import MapObjectService from './mapObjects/mapObject.service';
import PaymentCustomersService from './paymentCustomers/paymentCustomers.service';
import SpacesService from './spaces/spaces.service';
import SpaceSubscriptionsService from './spaceSubscriptions/spaceSubscriptions.service';
import uploadFileService from './upload-file/upload-file.service';
import UsersService from './users/users.service';

export default function (app: Application): void {
  app.configure(UsersService);
  app.configure(BookablesService);
  app.configure(BookingsService);
  app.configure(AuthenticationService);
  app.configure(SpacesService);
  app.configure(MapObjectService);
  app.configure(InvitationsService);
  app.configure(SpaceSubscriptionsService);
  app.configure(PaymentCustomersService);
  app.configure(uploadFileService);
  app.configure(InvoicesService);
  app.configure(InvoiceDownloadService);
}
