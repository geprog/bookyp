import type { ObjectId } from 'mongodb';
import type {
  Bookable,
  Booking,
  Invitation,
  Invoice,
  MapObject,
  MapObjectType,
  PaymentCustomer,
  Space,
  SpacePlan,
  User,
} from '#shared/types/models';

/** a document as it is stored in the database: object id and native dates */
export type DbDoc<T> = Omit<T, '_id'> & { _id: ObjectId };

export type DbUser = DbDoc<Omit<User, 'isSuperAdmin'>>;

export type DbSpace = Omit<DbDoc<Space>, 'activeUntil' | 'currentPeriodEnd' | 'imageUrl' | 'frequency' | 'role'> & {
  activeUntil?: Date;
  currentPeriodEnd?: Date;
  /** id of the user that owns the subscription (the one who pays) */
  subscriptionOwner?: string;
};

export type DbBookable = DbDoc<Bookable>;

export type DbBooking = Omit<DbDoc<Booking>, 'start' | 'end' | 'bookedByUser'> & {
  start: Date;
  end: Date;
};

export type DbMapObject = DbDoc<MapObject>;

export type DbMapObjectType = DbDoc<MapObjectType>;

export type DbInvitation = DbDoc<Omit<Invitation, 'spaceName'>>;

/** an invitation mail that was sent, kept for a day to limit the mails per space */
export interface DbInvitationMail {
  _id: ObjectId;
  spaceId: string;
  sentAt: Date;
}

export type DbPaymentCustomer = Omit<PaymentCustomer, 'exists'> & {
  _id: ObjectId;
  userId: string;
  /** id of the customer at the payment provider */
  providerCustomerId?: string;
};

export interface DbInvoiceLine {
  description: string;
  /** net amount */
  amount: number;
}

/**
 * The invoice of a paid payment. It is issued by the payment provider (which assigns the number,
 * renders the pdf and mails it), as soon as the billing details of the customer are complete.
 */
export type DbInvoice = Omit<DbDoc<Invoice>, 'date' | 'number'> & {
  date: Date;
  /** user whose billing details the invoice is addressed to */
  userId: string;
  providerPaymentId: string;
  plan: SpacePlan;
  lines: DbInvoiceLine[];
  /** credit subtracted from the lines (net) */
  discount?: number;
  vatRate: number;
  /** set once issued */
  number?: string;
  providerInvoiceId?: string;
  /** why the invoice could not be issued yet */
  error?: string;
};

export interface DbMigration {
  _id: ObjectId;
  migrationId: string;
  timestamp: number;
}

/** state of the mocked payment provider used for local development and tests */
export interface DbPaymentMock {
  _id: string;
  type: 'customer' | 'mandate' | 'subscription' | 'payment' | 'invoice';
  data: Record<string, unknown>;
}
