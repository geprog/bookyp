import { Service as MongooseService } from 'feathers-mongoose';
import serviceIndex from '~/services';
import UsersService from '~/services/users/users.service';

describe("'users' service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('configured the service', async () => {
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    serviceIndex(app);

    // then
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(app.configure).toBeCalledWith(UsersService);
  });

  it('registered the service', async () => {
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    UsersService(app);

    // then
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(app.use).toBeCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(app.use).toBeCalledWith('users', expect.any(MongooseService));
  });
});
