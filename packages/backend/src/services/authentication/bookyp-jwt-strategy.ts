import { AuthenticationRequest, JWTStrategy } from '@feathersjs/authentication';
import { Params } from '@feathersjs/feathers';

/**
 * JWTStrategy with auto renewal inspired by https://deniapps.com/blog/jwt-token-auto-renew-auto-logout
 */
export class BookypJWTStrategy extends JWTStrategy {
  async authenticate(authentication: AuthenticationRequest, params: Params): ReturnType<JWTStrategy['authenticate']> {
    // run all of the original authentication logic, e.g. checking
    // if the token is there, is valid, is not expired, etc.
    const res = await super.authenticate(authentication, params);

    // and now the key trick - by deleting the accessToken here
    // we will get Feathers AuthenticationStrategy.create()
    // to generate us a new token.
    delete res.accessToken;
    return res;
  }
}
