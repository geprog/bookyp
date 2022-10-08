import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import MapObjectService from '~/services/mapObjects/mapObject.service';
import { prepareAppMock } from '$/__helpers__/mocks';

describe('mapObjects service', () => {
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
    expect(app.configure).toHaveBeenCalledWith(MapObjectService);
  });

  it('should register the service', () => {
    expect.assertions(2);
    // given
    const app = prepareAppMock();

    // when
    MapObjectService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('mapObjects', expect.any(MongooseService));
  });
});
