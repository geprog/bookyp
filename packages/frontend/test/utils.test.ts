import { ref } from 'vue';

import { waitUntilDataHasBeenLoaded } from '~/utils';

describe('waitUntilDataHasBeenLoaded', () => {
  it('should wait until data has been loaded', async () => {
    expect.assertions(1);
    // given
    const testData = ref();
    const testIsLoading = ref(true);

    // when
    // change testIsLoading to false after 10ms timeout
    setTimeout(() => {
      testData.value = 'test';
      testIsLoading.value = false;
    }, 10);

    const result = await waitUntilDataHasBeenLoaded(testData, testIsLoading);

    // then
    expect(result.value).toBe('test');
  });
});
