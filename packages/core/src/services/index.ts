import { AdapterService } from '@feathersjs/adapter-commons';
import { AuthenticationService } from '@feathersjs/authentication';

import {
  Bookable,
  Booking,
  FileUpload,
  Invitation,
  Invoice,
  InvoiceDownload,
  MapObject,
  MapObjectType,
  PaymentCustomer,
  PaymentMethod,
  Space,
  User,
} from '~/model';
import { SpaceSubscription } from '~/model/SpaceSubscription';

export type ServiceModels = {
  users: User;
  bookables: Bookable;
  bookings: Booking;
  spaces: Space;
  mapObjects: MapObject;
  invitations: Invitation;
  mapObjectTypes: MapObjectType;
};

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: AdapterService<User>;
  bookables: AdapterService<Bookable>;
  bookings: AdapterService<Booking>;
  spaces: AdapterService<Space>;
  mapObjects: AdapterService<MapObject>;
  invitations: AdapterService<Invitation>;
  spaceSubscriptions: AdapterService<SpaceSubscription>;
  paymentCustomers: AdapterService<PaymentCustomer>;
  'upload-files': AdapterService<FileUpload>;
  invoices: AdapterService<Invoice>;
  'invoice-download': AdapterService<InvoiceDownload>;
  'payment-methods': AdapterService<PaymentMethod>;
  mapObjectTypes: AdapterService<MapObjectType>;
};
