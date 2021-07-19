import mongoose from 'mongoose';

import config from '~/config';

mongoose.Promise = global.Promise;

export function getConnectionUri(): string {
  let uri = config().db.uri;
  if (uri) {
    return uri;
  }

  const { host, port, name, user, password } = config().db;

  uri = 'mongodb://';

  if (user && password) {
    uri = `${uri}${user}:${password}@`;
  }

  uri = `${uri}${host}:${port}/${name}`;

  if (user && password) {
    uri = `${uri}?authSource=admin`;
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
