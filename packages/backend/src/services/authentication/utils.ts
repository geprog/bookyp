export function oauthServerUrl(subdomain?: string): string {
  if (!subdomain) {
    throw new Error('Please provide an oauth subdomain');
  }

  if (subdomain.includes('localhost')) {
    return `http://${subdomain}`;
  }

  return `https://${subdomain}`;
}
