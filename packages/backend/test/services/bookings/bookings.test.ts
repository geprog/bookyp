import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import BookingsService from '~/services/bookings/bookings.service';

describe('bookings service', () => {
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
    expect(app.configure).toHaveBeenCalledWith(BookingsService);
  });

  it('should register the service', async () => {
    expect.assertions(2);
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    BookingsService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('bookings', expect.any(MongooseService));
  });
});
