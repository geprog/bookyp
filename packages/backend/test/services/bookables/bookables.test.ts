import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import BookablesService from '~/services/bookables/bookables.service';

describe('bookables service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should configure the service', async () => {
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    serviceIndex(app);

    // then
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(app.configure).toBeCalledWith(BookablesService);
  });

  it('should register the service', async () => {
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    BookablesService(app);

    // then
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(app.use).toBeCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(app.use).toBeCalledWith('bookables', expect.any(MongooseService));
  });
});
