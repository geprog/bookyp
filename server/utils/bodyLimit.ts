/**
 * Largest request body the api accepts. `readBody` reads the whole body into memory without a limit,
 * so without this check anyone (the payment webhook needs no login) could exhaust the memory with huge bodies.
 * v1 had 1 MB (the socket.io default), v2 saves all map objects of a space in one request, hence more room.
 */
export const maxBodySize = 5 * 1024 * 1024;

/** routes that check a higher limit themselves before reading the body */
const ownLimit = [/^\/api\/spaces\/[^/]+\/image$/];

const bodyMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * The status code to answer with when the body of the request is too large (or of unknown size), otherwise `undefined`.
 * Node reads at most `content-length` bytes, so checking the header is enough.
 */
export function bodyLimitStatus(method: string, path: string, headers: { contentLength?: string; transferEncoding?: string }): 411 | 413 | undefined {
  if (!bodyMethods.has(method.toUpperCase())) {
    return undefined;
  }
  const pathname = path.split('?')[0] ?? '';
  if (ownLimit.some(pattern => pattern.test(pathname))) {
    return undefined;
  }
  if (headers.contentLength === undefined) {
    // a chunked body has no length in advance (browsers and Mollie always send one)
    return headers.transferEncoding ? 411 : undefined;
  }
  return Number(headers.contentLength) <= maxBodySize ? undefined : 413;
}
