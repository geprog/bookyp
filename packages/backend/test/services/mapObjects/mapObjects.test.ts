import { Service as MongooseService } from 'feathers-mongoose';

import serviceIndex from '~/services';
import MapObjectService from '~/services/mapObjects/mapObject.service';

describe('mapObjects service', () => {
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
    expect(app.configure).toHaveBeenCalledWith(MapObjectService);
  });

  it('should register the service', async () => {
    expect.assertions(2);
    // given
    jest.mock('@bookyp/core');
    const bookypCore = await import('@bookyp/core');
    const app = bookypCore.createApplication();

    // when
    MapObjectService(app);

    // then
    expect(app.use).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith('mapObjects', expect.any(MongooseService));
  });
});
