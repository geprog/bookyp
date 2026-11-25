import type { MultiWatchSources } from 'vue';
import type { AsyncDataOptions } from '#app';

export const defaultPollingInterval = 10_000;

export interface PollingOptions<T> {
  /** refresh interval in ms */
  interval?: number;
  /** reactive sources that trigger a reload when they change */
  watch?: MultiWatchSources;
  default?: () => T;
  immediate?: boolean;
}

/**
 * Loads data with `useAsyncData` and refreshes it periodically while the tab is visible.
 * This replaces the websocket updates of v1 with simple polling.
 */
export function usePolling<T>(key: string | (() => string), fetcher: () => Promise<T>, options: PollingOptions<T> = {}) {
  const { interval = defaultPollingInterval, ...asyncDataOptions } = options;
  const result = useAsyncData<T>(typeof key === 'function' ? key() : key, fetcher, asyncDataOptions as AsyncDataOptions<T>);

  // data cached from an earlier visit is shown immediately, but refreshed right away
  onMounted(() => {
    if (result.status.value !== 'pending') {
      void result.refresh();
    }
  });

  const visibility = useDocumentVisibility();
  const { pause, resume } = useIntervalFn(() => {
    if (visibility.value === 'visible') {
      void result.refresh();
    }
  }, interval, { immediate: true });

  watch(visibility, (value) => {
    if (value === 'visible') {
      void result.refresh();
      resume();
    }
    else {
      pause();
    }
  });

  onScopeDispose(() => pause());

  return Object.assign(result, { loading: useInitialLoading(result.status) });
}
