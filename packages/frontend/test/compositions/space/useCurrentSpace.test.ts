import { nextTick } from 'vue';

import useGet from '~/compositions/useGet';
import { sampleSpace, sampleSpaces } from '$/__fixtures__/space';
import { prepareUseFindMockOnce, prepareUseGetMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useGet');
jest.mock('~/compositions/useFind');

let useCurrentSpace: typeof import('~/compositions/space/useCurrentSpace');

describe('useCurrentSpace composition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      // TODO: use import(), see https://github.com/facebook/jest/issues/10428
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useCurrentSpace = require('~/compositions/space/useCurrentSpace');
    });
  });

  it('should return undefined if no space is found', () => {
    expect.assertions(1);
    // given
    prepareUseGetMockOnce();
    prepareUseFindMockOnce([]);

    // when
    const { currentSpace } = useCurrentSpace.useCurrentSpace();

    // then
    expect(currentSpace.value).not.toBeDefined();
  });

  it('should get current space if one space is set', async () => {
    expect.assertions(2);
    // given
    prepareUseGetMockOnce(sampleSpace);
    prepareUseFindMockOnce([]);

    // when
    await nextTick();
    const { currentSpace } = useCurrentSpace.useCurrentSpace();

    // then
    expect(currentSpace.value).toBeDefined();
    expect(currentSpace.value?._id).toBe(sampleSpace._id);
  });

  it('should call useGet only once', () => {
    expect.assertions(1);
    // given
    prepareUseGetMockOnce(sampleSpace);
    prepareUseFindMockOnce([]);

    // when
    useCurrentSpace.useCurrentSpace();
    useCurrentSpace.useCurrentSpace();

    // then
    expect(useGet).toHaveBeenCalledTimes(1);
  });

  it('should return spaceId of first space found', () => {
    expect.assertions(1);
    // given
    prepareUseGetMockOnce(sampleSpace);
    prepareUseFindMockOnce(sampleSpaces);

    // when
    const { spaceId } = useCurrentSpace.useCurrentSpace();

    // then
    expect(spaceId.value).toBe(sampleSpaces[0]._id);
  });
});
