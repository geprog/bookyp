import process from 'node:process';

/** the test user, by default "alice" of the dummy login */
export const credentials = {
  username: process.env.E2E_AUTH_USERNAME || 'alice@wonderland.org',
};
