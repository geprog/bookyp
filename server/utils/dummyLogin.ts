/**
 * The dummy login replaces Keycloak in local development and in the tests (`NUXT_AUTH_HANDLER=dummy`):
 * a small page logs in one of these users or any other e-mail address, no identity provider needed.
 */
export const dummyUsers = [
  { username: 'alice', email: 'alice@wonderland.org', name: 'Alice Wonderland', hint: 'admin of the sample space' },
  { username: 'toni', email: 'toni@test.com', name: 'Toni Tester', hint: '' },
  { username: 'tina', email: 'tina@test.com', name: 'Tina Tester', hint: '' },
  { username: 'herbert', email: 'her@bert.de', name: 'Herbert', hint: 'super admin' },
];

export function isDummyLogin(): boolean {
  return useRuntimeConfig().authHandler === 'dummy';
}

/** resolves a username or an e-mail address typed into the dummy login to a user */
export function resolveDummyUser(input: string): { email: string; name: string } | undefined {
  const value = input.trim().toLowerCase();
  const known = dummyUsers.find(user => user.username === value || user.email === value);
  if (known) {
    return { email: known.email, name: known.name };
  }
  if (!value.includes('@')) {
    return undefined;
  }
  const name = (value.split('@')[0] ?? '')
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return { email: value, name: name || value };
}
