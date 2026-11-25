import type { H3Event } from 'h3';

/** the origin the request was made to (behind the ingress the forwarded host and protocol) */
export function requestOrigin(event: H3Event): string {
  return getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin;
}

/**
 * The public url of the app without a trailing slash, used for links in mails and payment webhooks
 * (addresses that must stay valid outside the request). Configured with `NUXT_PUBLIC_APP_URL`,
 * when nothing is configured (local development) the origin of the request is used.
 */
export function publicAppUrl(event: H3Event): string {
  const configured = useRuntimeConfig(event).public.appUrl.replace(/\/$/, '');
  return configured || requestOrigin(event);
}
