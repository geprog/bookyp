import express from 'express';
import supertest from 'supertest';

import SSOLogoutRoute from '~/services/authentication/sso-logout';
import { prepareGetConfigMockOnce, sampleConfig } from '$/__helpers__/mocks';

vi.mock('~/config');

const configMockReturnValue = sampleConfig;

describe('Authentication SSO logout', () => {
  it('should redirect to the SSO provider', async () => {
    expect.assertions(2);

    // given
    prepareGetConfigMockOnce(configMockReturnValue);
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
    prepareGetConfigMockOnce({
      oauth: {
        // @ts-expect-error - we want to test the case where the config is not properly set
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
