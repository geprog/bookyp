import { Application, Model } from '@bookyp/core';
import { AuthenticationService } from '@feathersjs/authentication';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';

import getConfig from '~/config';

import { defineAbilitiesFor } from './authentication.abilities';
import { BookypJWTStrategy } from './bookyp-jwt-strategy';
import { KeycloakStrategy } from './keycloak.auth-strategy';
import { oauthServerUrl } from './utils';

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
      expiresIn: '30d',
    },
    oauth: {
      redirect: config.oauth.redirect_url,
      keycloak: {
        authorize_url: `${oauthServerUrl(config.oauth.keycloak.subdomain)}/protocol/openid-connect/auth`,
        access_url: `${oauthServerUrl(config.oauth.keycloak.subdomain)}/protocol/openid-connect/token`,
        secret: config.oauth.keycloak.secret,
        client_id: config.oauth.keycloak.client,
        profile_url: `${oauthServerUrl(config.oauth.keycloak.subdomain)}/protocol/openid-connect/userinfo`,
        scope: 'openid profile email',
      },
      defaults: {
        origin: config.oauth.defaults.origin,
      },
    },
  });
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new BookypJWTStrategy());
  authentication.register('keycloak', new KeycloakStrategy());

  app.use('authentication', authentication);
  app.service('authentication').hooks({
    after: {
      create: [
        // see https://github.com/fratzinger/feathers-casl/blob/0adfa65b00dcfb4d538a2bca51b3f52c23aa806d/docs/getting-started.md#add-abilities-to-hooks-context
        async (context: HookContext<Application>): Promise<HookContext> => {
          const user = (context.result as { user: Model.User | undefined })?.user;
          const ability = await defineAbilitiesFor(user, context.app);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          context.result.ability = ability;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          context.result.rules = ability.rules;
          return context;
        },
      ],
    },
  });
  app.configure(expressOauth());
}
