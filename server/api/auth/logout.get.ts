/**
 * Clears the session and logs the user out of Keycloak as well.
 */
export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  if (isDummyLogin()) {
    return sendRedirect(event, '/');
  }

  const { oauth } = useRuntimeConfig(event);
  const { serverUrl, realm, clientId } = oauth.keycloak;
  if (!serverUrl || !realm || !clientId) {
    return sendRedirect(event, '/');
  }

  const logoutUrl = new URL(`${serverUrl}/realms/${realm}/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set('client_id', clientId);
  logoutUrl.searchParams.set('post_logout_redirect_uri', `${requestOrigin(event)}/`);
  return sendRedirect(event, logoutUrl.toString());
});
