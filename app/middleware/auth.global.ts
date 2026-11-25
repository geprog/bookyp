/**
 * Pages require a logged in user unless they opt out with `definePageMeta({ auth: 'ignored' })`.
 * `auth: 'unauthenticated-only'` sends logged in users to the start page (login page).
 * Like v1 the user is re-authenticated on every navigation: an expired session is noticed
 * right away and the session of an active user is renewed.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, refreshUser } = useAuth();
  await refreshUser();

  const mode = (to.meta.auth as 'ignored' | 'required' | 'unauthenticated-only' | undefined) ?? 'required';
  if (mode === 'ignored') {
    return;
  }
  if (mode === 'required' && !user.value) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } });
  }
  if (mode === 'unauthenticated-only' && user.value) {
    return navigateTo('/');
  }
});
