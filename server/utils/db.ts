import type { Db } from 'mongodb';
import type {
  DbBookable,
  DbBooking,
  DbInvitation,
  DbInvitationMail,
  DbInvoice,
  DbMapObject,
  DbMapObjectType,
  DbMigration,
  DbPaymentCustomer,
  DbPaymentMock,
  DbSpace,
  DbUser,
} from './dbTypes';
import { MongoClient, ObjectId } from 'mongodb';

let clientPromise: Promise<MongoClient> | undefined;
let ready: Promise<Db> | undefined;

async function connect(): Promise<MongoClient> {
  const { mongodbUri } = useRuntimeConfig();
  if (!mongodbUri) {
    throw new Error('Please set NUXT_MONGODB_URI');
  }
  const client = new MongoClient(mongodbUri);
  await client.connect();
  return client;
}

/**
 * Connects to the database (once) and runs the pending migrations.
 * Called from the startup plugin, every request waits for it via `useDatabase()`.
 */
export function initDatabase(migrate: (db: Db) => Promise<void>): Promise<Db> {
  if (!ready) {
    clientPromise = connect();
    ready = clientPromise.then(async (client) => {
      const db = client.db();
      await ensureIndexes(db);
      await migrate(db);
      return db;
    });
  }
  return ready;
}

export function useDatabase(): Promise<Db> {
  if (!ready) {
    throw new Error('Database is not initialized');
  }
  return ready;
}

export async function closeDatabase(): Promise<void> {
  const client = await clientPromise;
  await client?.close();
  clientPromise = undefined;
  ready = undefined;
}

/**
 * Typed access to all collections. The collection names are the ones mongoose used in v1,
 * so an existing database keeps working without a data migration.
 */
export function collections(db: Db) {
  return {
    users: db.collection<DbUser>('users'),
    spaces: db.collection<DbSpace>('spaces'),
    bookables: db.collection<DbBookable>('bookables'),
    bookings: db.collection<DbBooking>('bookings'),
    mapObjects: db.collection<DbMapObject>('mapobjects'),
    mapObjectTypes: db.collection<DbMapObjectType>('mapobjecttypes'),
    invitations: db.collection<DbInvitation>('invitations'),
    invitationMails: db.collection<DbInvitationMail>('invitationmails'),
    paymentCustomers: db.collection<DbPaymentCustomer>('paymentcustomers'),
    invoices: db.collection<DbInvoice>('invoices'),
    migrations: db.collection<DbMigration>('migrations'),
    paymentMock: db.collection<DbPaymentMock>('paymentmock'),
  };
}

export type Collections = ReturnType<typeof collections>;

export async function useCollections(): Promise<Collections> {
  return collections(await useDatabase());
}

async function ensureIndexes(db: Db): Promise<void> {
  const c = collections(db);
  await c.users.createIndex({ email: 1 }, { unique: true });
  await c.invitations.createIndex({ spaceId: 1, email: 1 }, { unique: true });
  await c.invitationMails.createIndex({ sentAt: 1 }, { expireAfterSeconds: invitationMailWindowSeconds });
  await c.invitationMails.createIndex({ spaceId: 1, sentAt: 1 });
  await c.bookings.createIndex({ bookable: 1, start: 1, end: 1 });
  await c.bookings.createIndex({ space: 1, start: 1 });
  await c.bookings.createIndex({ bookedBy: 1, start: 1 });
  await c.bookables.createIndex({ space: 1 });
  await c.mapObjects.createIndex({ space: 1 });
  await c.mapObjectTypes.createIndex({ spaceId: 1 });
  await c.paymentCustomers.createIndex({ userId: 1 }, { unique: true });
  await c.invoices.createIndex({ spaceId: 1, date: -1 });
  await c.invoices.createIndex({ providerPaymentId: 1 }, { unique: true, sparse: true });
  await c.invoices.createIndex({ userId: 1, status: 1 });
}

/** Parses an id from a request, answering with 400 if it is not a valid object id. */
export function toObjectId(id: unknown): ObjectId {
  if (typeof id !== 'string' || !ObjectId.isValid(id) || String(new ObjectId(id)) !== id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' });
  }
  return new ObjectId(id);
}

export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

/** Converts a database document into its json representation (object ids become strings). */
export function serialize<T extends { _id: ObjectId }>(doc: T): Omit<T, '_id'> & { _id: string } {
  return { ...doc, _id: doc._id.toString() };
}

export function serializeAll<T extends { _id: ObjectId }>(docs: T[]): (Omit<T, '_id'> & { _id: string })[] {
  return docs.map(serialize);
}
