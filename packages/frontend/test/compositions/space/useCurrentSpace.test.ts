import { nextTick } from 'vue';

import getCurrentSpace from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';
import { sampleSpaces } from '$/__fixtures__/space';
import { prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');
const refData = prepareUseFindMockOnce();

describe('useGetCurrentSpace composition', () => {
  it('should return undefined if no space is found', () => {
    // when
    const { data: currentSpace } = getCurrentSpace();

    // then
    expect(currentSpace.value).not.toBeDefined();
  });

  it('should get current space if one space is set', async () => {
    // when
    expect.hasAssertions();
    refData.data.value = sampleSpaces;
    await nextTick();
    const { data: currentSpace } = getCurrentSpace();

    // then
    expect(currentSpace.value).toBeDefined();
    expect(currentSpace.value?._id).toBe(sampleSpaces[0]._id);
  });

  it('should call find only once', () => {
    // given
    prepareUseFindMockOnce(sampleSpaces);
    prepareUseFindMockOnce();
    // when
    getCurrentSpace();
    getCurrentSpace();

    // then
    expect(useFind).toHaveBeenCalledTimes(1);
  });
});
