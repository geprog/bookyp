import { config as dotenvConfig } from 'dotenv';
import path from 'path';

import { seed } from './seed';

dotenvConfig({ path: path.join(__dirname, '.env') });
dotenvConfig({ path: path.join(__dirname, '..', '..', '.env') });

void (async () => {
  // eslint-disable-next-line no-console
  console.log('seeding database ...');
  await seed();
  // eslint-disable-next-line no-console
  console.log('seeding done');
})();
