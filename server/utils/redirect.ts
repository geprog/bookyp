const base = 'http://localhost';

/**
 * The path to redirect to after the login or `undefined` when the value would leave the app.
 * Checking the prefix is not enough, browsers resolve e.g. `/\evil.example` to another host.
 */
export function safeRedirectPath(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return undefined;
  }
  const url = URL.parse(value, base);
  if (!url || url.origin !== base) {
    return undefined;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
