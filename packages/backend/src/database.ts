import mongoose from 'mongoose';

import config from '~/config';

mongoose.Promise = global.Promise;

export function getConnectionUri(): string {
  const uri = config().db.uri;

  if (!uri) {
    throw new Error('Please set BACKEND_DB_URI');
  }

  return uri;
}

export async function connect(): Promise<void> {
  await mongoose.connect(getConnectionUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
}
