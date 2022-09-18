import { UseFind, UseFindFunc } from '@geprog/use-feathers';

import useFind from '~/compositions/useFind';
import { sampleMapObjects } from '$/__fixtures__/mapObject';
import { prepareUseCurrentSpaceMockOnce, prepareUseFindMockOnce } from '$/__helpers__/mocks';

vi.mock('~/compositions/useFind');
vi.mock('~/compositions/space/useCurrentSpace');

let useMapObjects: typeof import('~/compositions/space/useMapObjects');

describe('useMapObjects composition', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    useMapObjects = await import('~/compositions/space/useMapObjects');
  });

  it('should get mapObjects', () => {
    // given
    prepareUseFindMockOnce(sampleMapObjects);
    prepareUseCurrentSpaceMockOnce();

    // when
    const { data: mapObjects } = useMapObjects.default();

    // then
    expect(mapObjects.value).toMatchSnapshot();
  });

  it('should call useFind with a query containing space', () => {
    // given
    prepareUseCurrentSpaceMockOnce();
    let params: Parameters<UseFindFunc<unknown>>[1];
    vi.mocked(useFind, true).mockImplementationOnce((_, _params): UseFind<unknown> => {
      params = _params;
      return {} as UseFind<unknown>;
    });

    // when
    useMapObjects.default();

    // then
    expect(params?.value).toMatchSnapshot();
    expect(params?.value?.query).toHaveProperty('space');
  });
});
