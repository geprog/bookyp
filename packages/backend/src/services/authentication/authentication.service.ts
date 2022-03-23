import { Application, Model } from '@bookyp/core';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { HookContext, ServiceAddons } from '@feathersjs/feathers';

import getConfig from '~/config';

import { defineAbilitiesFor } from './authentication.abilities';
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
  app.service('authentication').hooks({
    after: {
      create: [
        // see https://github.com/fratzinger/feathers-casl/blob/0adfa65b00dcfb4d538a2bca51b3f52c23aa806d/docs/getting-started.md#add-abilities-to-hooks-context
        async (context: HookContext<Application>): Promise<HookContext> => {
          const { user } = context.result as { user: Model.User };
          if (!user) {
            return context;
          }
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
