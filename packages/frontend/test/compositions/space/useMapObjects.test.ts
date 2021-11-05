import { UseFind, UseFindFunc } from '@geprog/use-feathers';
import { mocked } from 'ts-jest/utils';

import useFind from '~/compositions/useFind';
import { sampleMapObjects } from '$/__fixtures__/mapObject';
import { prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');

let useMapObjects: typeof import('~/compositions/space/useMapObjects');

describe('useMapObjects composition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      // TODO: use import(), see https://github.com/facebook/jest/issues/10428
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useMapObjects = require('~/compositions/space/useMapObjects');
    });
  });

  it('should get mapObjects', () => {
    // given
    prepareUseFindMockOnce(sampleMapObjects);

    // when
    const { data: mapObjects } = useMapObjects.default();

    // then
    expect(mapObjects.value).toMatchSnapshot();
  });

  it('should call useFind with a query containing space', () => {
    // given
    let params: Parameters<UseFindFunc<unknown>>[1];
    mocked(useFind, true).mockImplementationOnce((_, _params): UseFind<unknown> => {
      params = _params;
      return {} as UseFind<unknown>;
    });

    // when
    useMapObjects.default();

    // then
    expect(params?.value).toMatchSnapshot();
    expect(params?.value?.query).toHaveProperty('space');
  });

  it('should call useFind only once', () => {
    // given
    prepareUseFindMockOnce();

    // when
    useMapObjects.default();
    useMapObjects.default();

    // then
    expect(useFind).toHaveBeenCalledTimes(1);
  });
});
