/**
 * Domain model shared between the server (api) and the app (client).
 * All documents are serialized as json, so ids are strings and dates are ISO strings.
 */

export type Id = string;

export interface User {
  _id: Id;
  email: string;
  name?: string;
  starredSpaces?: Id[];
  /** derived from the configured super admin e-mails, never persisted */
  isSuperAdmin?: boolean;
}

/** the subset of a user other users are allowed to see */
export type PublicUser = Pick<User, '_id' | 'email' | 'name'>;

export type MemberRole = 'admin' | 'user';

export interface Member {
  role: MemberRole;
  userId: Id;
  /** populated from the user on read, never persisted */
  name?: string;
  /** populated from the user on read, never persisted */
  email?: string;
}

export type BookingOrRequest = 'bookings' | 'requests' | 'both' | 'only_info';

export type SpacePlan = 'free' | 'standard' | 'pro';

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface Space {
  _id: Id;
  name: string;
  floorPlan: string[];
  members: Member[];
  description?: string;
  address?: string;
  plan: SpacePlan;
  /** timestamp until which the plan is valid (undefined / past timestamp falls back to the free plan) */
  activeUntil?: string;
  /** end of the period the current plan is already paid for */
  currentPeriodEnd?: string;
  /** plan the space switches to at `currentPeriodEnd` (downgrades take effect at the end of the paid period) */
  scheduledPlan?: SpacePlan;
  /** id of the subscription at the payment provider */
  subscription?: string;
  /** e-mail address that receives booking notifications */
  email?: string;
  /** s3 object key of the space image */
  imageKey?: string;
  /** url of the space image, added on read and never persisted */
  imageUrl?: string;
  coordinates?: Coordinates | null;
  importId?: string;
  phone?: string;
  website?: string;
  isPublic?: boolean;
  bookingsAndRequests: BookingOrRequest;
  deleted?: boolean;
  /** number of bookings of the current user in the last 30 days, added on read */
  frequency?: number;
  /** the role of the current user in this space, added on read */
  role?: MemberRole | null;
}

/** the subset of a space members and visitors of public spaces are allowed to see */
export type PublicSpace = Omit<Space, 'members' | 'email' | 'subscription' | 'isPublic' | 'deleted'>;

export interface Bookable {
  _id: Id;
  name: string;
  description: string;
  space: Id;
  deleted?: boolean;
}

export interface Booking {
  _id: Id;
  start: string;
  end: string;
  bookedBy: Id;
  bookable: Id;
  description?: string;
  space: Id;
  /** a booking request that still has to be accepted by an admin */
  request?: boolean;
  deleted?: boolean;
  /** populated for admins and own bookings */
  bookedByUser?: PublicUser;
}

/** the subset of a booking other members of the space are allowed to see */
export type ForeignBooking = Pick<Booking, '_id' | 'start' | 'end' | 'bookable' | 'space' | 'request'>;

export type MapObjectLink = { type: 'url'; url: string } | { type: 'bookable'; bookable: Id };

export interface MapObject {
  _id: Id;
  /** position in x-axis from the top left corner, one unit represents 1m */
  xPos: number;
  /** position in y-axis from the top left corner, one unit represents 1m */
  yPos: number;
  /** clockwise rotation around the center in degree */
  rotation: number;
  /** paths rendered as background of the object */
  bgPaths?: string[];
  /** each item being the value for the attribute d of one svg-path */
  paths: string[];
  /** name of the map object type this object was created from */
  type: string;
  link?: MapObjectLink;
  space: Id;
}

export interface MapObjectType {
  _id: Id;
  name: string;
  bgPaths?: string[];
  paths: string[];
  viewBox: string;
  spaceId: Id;
}

export interface Invitation {
  _id: Id;
  role: MemberRole;
  /** an e-mail address or a domain in the form `@example.com` */
  email: string;
  rejectedBy: Id[];
  spaceId: Id;
  /** populated on read */
  spaceName?: string;
}

export function isDomainInvitation(invitation: Pick<Invitation, 'email'>): boolean {
  return invitation.email.startsWith('@');
}

export type BillingType = 'business' | 'consumer';

export interface PaymentCustomer {
  /** invoices go to a company (`business`) or a private person (`consumer`) */
  type: BillingType;
  /** company name (business) */
  organizationName: string;
  /** VAT ID (business), this or the organization number is required */
  vatNumber: string;
  /** commercial register number (business) */
  organizationNumber: string;
  /** first name (consumer) */
  givenName: string;
  /** last name (consumer) */
  familyName: string;
  /** e-mail the invoices are sent to (empty: e-mail of the user) */
  email: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
  city: string;
  /** ISO 3166-1 alpha-2 country code */
  country: string;
  language: string;
  /** id of the payment method used for subscriptions */
  activePaymentMethod?: string;
  /** whether a customer was already created at the payment provider */
  exists: boolean;
}

export type PaymentMethodType = 'directdebit' | 'creditcard' | 'paypal';

export interface PaymentMethod {
  _id: Id;
  type: PaymentMethodType;
  name: string;
  status: 'valid' | 'pending' | 'invalid';
}

/** `pending`: the payment is done, the invoice is created as soon as the billing details are complete */
export type InvoiceStatus = 'issued' | 'pending';

export interface Invoice {
  _id: Id;
  /** invoice number assigned by the payment provider (once issued) */
  number?: string;
  date: string;
  status: InvoiceStatus;
  /** the invoice is pending because the billing details of the customer are incomplete */
  waitsForBillingDetails?: boolean;
  spaceId: Id;
  currency: string;
  totalAmount: number;
}

export interface SpaceSubscription {
  space: Id;
  plan: SpacePlan;
  activeUntil?: string;
  currentPeriodEnd?: string;
  scheduledPlan?: SpacePlan;
  status?: 'active' | 'pending' | 'canceled' | 'suspended' | 'completed' | 'none';
}
