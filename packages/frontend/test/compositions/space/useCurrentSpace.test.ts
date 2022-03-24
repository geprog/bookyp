import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { sampleSpace } from '$/__fixtures__/space';
import { prepareUseGetMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useGet');

describe('useCurrentSpace composition', () => {
  it('should return undefined if no space is found', () => {
    // given
    prepareUseGetMockOnce();

    // when
    const { currentSpace } = useCurrentSpace();

    // then
    expect(currentSpace.value).toBeUndefined();
  });

  it('should get current space if one space is set', () => {
    // given
    prepareUseGetMockOnce(sampleSpace);

    // when
    const { currentSpace } = useCurrentSpace();

    // then
    expect(currentSpace.value).toBeDefined();
    expect(currentSpace.value?._id).toBe(sampleSpace._id);
  });
});
