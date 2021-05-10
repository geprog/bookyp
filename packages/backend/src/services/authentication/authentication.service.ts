import { Application } from '@bookyp/core';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { ServiceAddons } from '@feathersjs/feathers';

import getConfig from '~/config';

import { KeycloakStrategy } from './keycloak.auth-strategy';

declare module '@bookyp/core' {
  interface ServiceTypes {
    authentication: AuthenticationService & ServiceAddons<unknown, AuthenticationService>;
  }
}

export default function (app: Application): void {
  const config = getConfig();

  // configure oauth
  app.set('authentication', {
    entity: 'user',
    service: 'users',
    secret: config.app.secret,
    authStrategies: ['jwt', 'keycloak'],
    jwtOptions: {
      header: {
        typ: 'access',
      },
      audience: 'api',
      algorithm: 'HS256',
      expiresIn: '1d',
    },
    oauth: {
      redirect: config.oauth.redirect_url,
      keycloak: {
        secret: config.oauth.keycloak.secret,
        client_id: config.oauth.keycloak.client,
        subdomain: config.oauth.keycloak.subdomain,
      },
    },
  });
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('keycloak', new KeycloakStrategy());

  app.use('authentication', authentication);
  app.configure(expressOauth());
}
