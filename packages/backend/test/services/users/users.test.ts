import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import UsersService from '~/services/users/users.service';
import { prepareAppMock } from '$/__helpers__/mocks';

describe('Users service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('should configure the service', () => {
    expect.assertions(1);
    // given
    const app = prepareAppMock();

    // when
    serviceIndex(app);

    // then
    expect(app.configure).toHaveBeenCalledWith(UsersService);
  });

  it('should register the service', () => {
    expect.assertions(2);
    // given
    const app = prepareAppMock();

    // when
    UsersService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('users', expect.any(MongooseService));
  });
});
