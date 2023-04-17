import { UseFind, UseFindFunc } from '@geprog/use-feathers';
import { ref } from 'vue';

import useFind from '~/compositions/useFind';
import { sampleMapObjects } from '$/__fixtures__/mapObject';
import { prepareUseFindMockOnce } from '$/__helpers__/mocks';

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

    // when
    const { data: mapObjects } = useMapObjects.default(ref('60f53bede6f8313dff7f99e0'));

    // then
    expect(mapObjects.value).toMatchSnapshot();
  });

  it('should call useFind with a query containing space', () => {
    // given
    let params: Parameters<UseFindFunc<unknown>>[1];
    vi.mocked(useFind, true).mockImplementationOnce((_, _params): UseFind<unknown> => {
      params = _params;
      return {} as UseFind<unknown>;
    });

    // when
    useMapObjects.default(ref('60f53bede6f8313dff7f99e0'));

    // then
    expect(params?.value).toMatchSnapshot();
    expect(params?.value?.query).toHaveProperty('space');
  });
});
