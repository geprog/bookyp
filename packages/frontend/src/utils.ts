import { Ref, watch } from 'vue';

export function waitUntilDataHasBeenLoaded<T>(data: Ref<T>, isLoading: Ref<boolean>): Promise<Ref<T>> {
  return new Promise((resolve) => {
    watch(
      isLoading,
      () => {
        if (isLoading.value === false) {
          resolve(data);
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );
  });
}
