import { mocked } from 'ts-jest/utils';

import getMapObjects from '~/compositions/space/useMapObjects';
import useFind from '~/compositions/useFind';
import { sampleMapObjects } from '$/__fixtures__/mapObject';
import { prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');

describe('useGetMapObjects composition', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should get mapObjects', () => {
    // given
    prepareUseFindMockOnce(sampleMapObjects);
    // when
    const { data: mapObjects } = getMapObjects();

    // then
    expect(mapObjects.value).toMatchSnapshot();
  });
});

describe('useGetMapObjects composition 2', () => {
  it('should call find only once', () => {
    // given
    mocked(useFind, true).mockReturnValueOnce(prepareUseFindMockOnce());
    // when
    getMapObjects();
    getMapObjects();

    // then
    expect(useFind).toHaveBeenCalledTimes(1);
  });
});
