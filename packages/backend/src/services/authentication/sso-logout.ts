import { Request, Response, Router } from 'express';

import getConfig from '~/config';

export default function SSOLogoutRoute(): Router {
  const router = Router();

  // endpoint to logout user from SSO provider
  router.get('/authentication/logout', (_: Request, res: Response) => {
    const config = getConfig();
    const keycloakSubdomain = config.oauth.keycloak.subdomain;
    const redirectUri = config.oauth.redirect_url;

    if (!keycloakSubdomain || !redirectUri) {
      res.sendStatus(500);
      return;
    }

    res.redirect(`https://${keycloakSubdomain}/protocol/openid-connect/logout?redirect_uri=${encodeURI(redirectUri)}`);
  });

  return router;
}
