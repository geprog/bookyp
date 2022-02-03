import { nextTick, ref } from 'vue';

import { waitUntilDataHasBeenLoaded } from '~/utils';

describe('waitUntilDataHasBeenLoaded', () => {
  it('should wait until data has been loaded', async () => {
    expect.assertions(1);
    // given
    const testData = ref('test');
    const testIsLoading = ref(true);

    // when
    // change testIsLoading to false after 10ms timeout
    setTimeout(async () => {
      testIsLoading.value = false;
      await nextTick();
    }, 1);

    const result = await waitUntilDataHasBeenLoaded(testData, testIsLoading);

    // then
    expect(result.value).toBe('test');
  });
});
