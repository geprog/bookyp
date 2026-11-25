/**
 * The currently logged in user (or `null`). The app calls this on every navigation,
 * which also renews the session cookie.
 */
export default defineEventHandler(async (event) => {
  const user = await getUser(event);
  if (user) {
    await renewUserSession(event);
  }
  return { user: user ?? null };
});
