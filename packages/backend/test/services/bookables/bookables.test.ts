import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import BookablesService from '~/services/bookables/bookables.service';
import { prepareAppMock } from '$/__helpers__/mocks';

describe('Bookables service', () => {
  it('should configure the service', () => {
    expect.assertions(1);
    // given
    const app = prepareAppMock();

    // when
    serviceIndex(app);

    // then
    expect(app.configure).toHaveBeenCalledWith(BookablesService);
  });

  it('should register the service', () => {
    expect.assertions(2);
    // given
    const app = prepareAppMock();

    // when
    BookablesService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('bookables', expect.any(MongooseService));
  });
});
