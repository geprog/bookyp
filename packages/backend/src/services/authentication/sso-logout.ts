import { Request, Response, Router } from 'express';

import getConfig from '~/config';

import { oauthServerUrl } from './utils';

export default function SSOLogoutRoute(): Router {
  const router = Router();

  // endpoint to logout user from SSO provider
  router.get('/authentication/logout', (_: Request, res: Response) => {
    const config = getConfig();
    const keycloakSubdomain = config.oauth.keycloak.subdomain;
    const clientId = config.oauth.keycloak.client;
    const redirectUri = config.oauth.redirect_url;

    if (!keycloakSubdomain || !redirectUri || !clientId) {
      res.sendStatus(500);
      return;
    }

    res.redirect(
      `${oauthServerUrl(keycloakSubdomain)}/protocol/openid-connect/logout?client_id=${encodeURIComponent(
        clientId,
      )}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`,
    );
  });

  return router;
}
