import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import BookingsService from '~/services/bookings/bookings.service';
import { prepareAppMock } from '$/__helpers__/mocks';

describe('bookings service', () => {
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
    expect(app.configure).toHaveBeenCalledWith(BookingsService);
  });

  it('should register the service', () => {
    expect.assertions(2);
    // given
    const app = prepareAppMock();

    // when
    BookingsService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('bookings', expect.any(MongooseService));
  });
});
