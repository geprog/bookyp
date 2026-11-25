/** the url when it is an absolute http(s) url, other schemes like `javascript:` or `data:` are rejected */
export function parseWebUrl(value: string): URL | undefined {
  const url = URL.parse(value);
  return url && (url.protocol === 'http:' || url.protocol === 'https:') ? url : undefined;
}
