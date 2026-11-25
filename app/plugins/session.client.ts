/**
 * Reacts to an expired session: when the api answers with 401 while the app still has a user,
 * the user is dropped and sent to the login, which returns to the current page afterwards.
 * The app imports `$fetch` from ofetch (the global one is not used), ofetch calls the browser
 * `fetch` on every request, so that is the one place that sees all api responses.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { user } = useAuth();
  const router = useRouter();
  const browserFetch = window.fetch.bind(window);

  function isApiRequest(input: RequestInfo | URL): boolean {
    const url = new URL(input instanceof Request ? input.url : input.toString(), window.location.origin);
    return url.origin === window.location.origin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/');
  }

  window.fetch = async (input, init) => {
    const response = await browserFetch(input, init);
    if (response.status === 401 && user.value && isApiRequest(input)) {
      user.value = null;
      // fetch runs outside of the nuxt context
      void nuxtApp.runWithContext(() => navigateTo({ path: '/auth/login', query: { redirect: router.currentRoute.value.fullPath } }));
    }
    return response;
  };
});
