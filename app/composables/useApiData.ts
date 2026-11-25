import type { ComputedRef, MultiWatchSources, Ref } from 'vue';
import type { AsyncDataOptions, AsyncDataRequestStatus } from '#app';

export interface ApiDataOptions<T> {
  watch?: MultiWatchSources;
  default?: () => T;
  immediate?: boolean;
}

/**
 * `useAsyncData` for api responses that are loaded fresh every time a page is opened
 * (the default of Nuxt 4 is to reuse data cached under the same key).
 */
export function useApiData<T>(key: string | (() => string), fetcher: () => Promise<T>, options: ApiDataOptions<T> = {}) {
  const result = useAsyncData<T>(typeof key === 'function' ? key() : key, fetcher, { ...options, getCachedData: () => undefined } as AsyncDataOptions<T>);
  return Object.assign(result, { loading: useInitialLoading(result.status) });
}

/**
 * `true` until the first request has finished (with data or an error). Unlike `pending` it stays `false`
 * while the data is refreshed in the background (polling, changed watch sources), so a spinner does not
 * replace the content every few seconds and shows even when the data has a default value.
 */
export function useInitialLoading(status: Ref<AsyncDataRequestStatus>): ComputedRef<boolean> {
  const finished = ref(status.value === 'success' || status.value === 'error');
  watch(status, (value) => {
    if (value === 'success' || value === 'error') {
      finished.value = true;
    }
  });
  return computed(() => !finished.value);
}
