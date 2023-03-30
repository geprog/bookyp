import { RouteLocationRaw, useRouter } from 'vue-router';

export async function back(fallbackRoute: RouteLocationRaw): Promise<void> {
  const router = useRouter();
  if ((history.state as { back: string }).back === null) {
    await router.replace(fallbackRoute);
    return;
  }
  router.back();
}
