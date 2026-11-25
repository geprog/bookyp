import type { RouteLocationRaw } from 'vue-router';

/** navigates back in the history, or to the fallback route when there is no history (e.g. after a reload) */
export function useBack() {
  const router = useRouter();

  async function back(fallback: RouteLocationRaw): Promise<void> {
    const state = window.history.state as { back?: string | null } | null;
    if (!state?.back) {
      await router.replace(fallback);
      return;
    }
    router.back();
  }

  return { back };
}
