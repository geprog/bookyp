import express from 'express';
import supertest from 'supertest';

import getConfig from '~/config';
import SSOLogoutRoute from '~/services/authentication/sso-logout';

jest.mock('~/config');

const configMockReturnValue = {
  oauth: {
    redirect_url: 'http://localhost:3000/',
    keycloak: {
      secret: 'i-wont-tell-you',
      client: 'bookyp',
      subdomain: 'auth.example.org/auth/realms/main',
    },
  },
};

describe('Authentication SSO logout', () => {
  it('should redirect to the SSO provider', async () => {
    expect.assertions(2);

    // given
    (getConfig as jest.Mock).mockReturnValueOnce(configMockReturnValue);
    const app = express();
    app.use(SSOLogoutRoute());

    // when
    const res = await supertest(app).get('/authentication/logout');

    // then
    expect(res.statusCode).toBe(302);
    const headers = res.headers as { location: string };
    expect(headers.location).toMatchSnapshot();
  });

  it("should return an error if the SSO provider hasn't been configured properly", async () => {
    expect.assertions(1);

    // given
    (getConfig as jest.Mock).mockReturnValueOnce({
      oauth: {
        keycloak: {},
      },
    });
    const app = express();
    app.use(SSOLogoutRoute());

    // when
    const res = await supertest(app).get('/authentication/logout');

    // then
    expect(res.statusCode).toBe(500);
  });
});
