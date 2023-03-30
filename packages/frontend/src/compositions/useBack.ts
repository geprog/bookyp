import { RouteLocationRaw, useRouter } from 'vue-router';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useBack() {
  const router = useRouter();

  async function back(fallbackRoute: RouteLocationRaw): Promise<void> {
    if ((history.state as { back: string }).back === null) {
      await router.replace(fallbackRoute);
      return;
    }
    router.back();
  }
  return { back };
}
