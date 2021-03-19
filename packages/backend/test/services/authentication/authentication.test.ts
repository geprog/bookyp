import serviceIndex from '~/services';
import AuthenticationService from '~/services/authentication/authentication.service';

describe('Authentication service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should configure the service', async () => {
    expect.assertions(1);

    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    serviceIndex(app);

    // then
    expect(app.configure).toHaveBeenCalledWith(AuthenticationService);
  });

  it('should set auth config', async () => {
    expect.assertions(1);

    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    AuthenticationService(app);

    // then
    expect(app.set).toHaveBeenCalledWith('authentication', expect.any(Object));
  });

  describe('Configuration', () => {
    it('should match snapshot', async () => {
      expect.assertions(1);

      // given
      jest.mock('@bookyp/core');
      const bookypCore = await import('@bookyp/core');
      const app = bookypCore.createApplication();
      const spy = jest.spyOn(app, 'set');

      // when
      AuthenticationService(app);

      // then
      // check second argument of first call to app.set
      expect(spy.mock.calls[0][1]).toMatchSnapshot();
    });
  });
});
