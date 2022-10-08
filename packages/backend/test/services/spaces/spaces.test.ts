import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import SpacesService from '~/services/spaces/spaces.service';
import { prepareAppMock } from '$/__helpers__/mocks';

describe('Spaces service', () => {
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
    expect(app.configure).toHaveBeenCalledWith(SpacesService);
  });

  it('should register the service', () => {
    expect.assertions(2);
    // given
    const app = prepareAppMock();

    // when
    SpacesService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('spaces', expect.any(MongooseService));
  });
});
