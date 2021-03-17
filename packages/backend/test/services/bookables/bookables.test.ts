import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import BookablesService from '~/services/bookables/bookables.service';

describe('Bookables service', () => {
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
    expect(app.configure).toHaveBeenCalledWith(BookablesService);
  });

  it('should register the service', async () => {
    expect.assertions(2);
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    BookablesService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('bookables', expect.any(MongooseService));
  });
});
