import type { H3Event } from 'h3';

const REDIRECT_COOKIE = 'bookyp_redirect';

/** `?redirect=/path` on the first call of the login is remembered, so the user ends up where they wanted to go */
function rememberRedirect(event: H3Event): void {
  const redirect = safeRedirectPath(getQuery(event).redirect);
  if (redirect) {
    setCookie(event, REDIRECT_COOKIE, redirect, { maxAge: 60 * 60 * 24, httpOnly: true, sameSite: 'lax', path: '/' });
  }
}

function redirectTarget(event: H3Event): string {
  const redirect = getCookie(event, REDIRECT_COOKIE);
  deleteCookie(event, REDIRECT_COOKIE);
  return safeRedirectPath(redirect) ?? '/';
}

/** creates the user on the first login and starts the session */
async function loginUser(event: H3Event, email: string, name: string | undefined): Promise<void> {
  const { users } = await useCollections();
  const user = await users.findOneAndUpdate(
    { email },
    { $set: { name }, $setOnInsert: { email, starredSpaces: [] } },
    { upsert: true, returnDocument: 'after' },
  );
  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Could not create user' });
  }
  await setUserSession(event, {
    user: { _id: user._id.toString(), email: user.email, name: user.name },
    loggedInAt: Date.now(),
  });
}

/**
 * Login via Keycloak (OpenID Connect authorization code flow).
 * The route redirects to Keycloak and is called again as callback with the authorization code.
 */
function keycloakLogin() {
  const keycloak = defineOAuthKeycloakEventHandler({
    config: {
      scope: ['openid', 'profile', 'email'],
    },
    async onSuccess(event, { user: profile }) {
      const email = typeof profile.email === 'string' ? profile.email.trim().toLowerCase() : '';
      if (!email) {
        throw createError({ statusCode: 400, statusMessage: 'Keycloak did not provide an e-mail address' });
      }
      // the account, super admin rights and domain invitations hang on the e-mail, so it has to be verified
      if (profile.email_verified !== true) {
        return sendRedirect(event, `/auth/login?error=${encodeURIComponent('Please verify your e-mail address first')}`);
      }
      const name = typeof profile.name === 'string' && profile.name ? profile.name : profile.preferred_username;
      await loginUser(event, email, name);
      return sendRedirect(event, redirectTarget(event));
    },
    onError(event, error) {
      console.error('🔥 Keycloak login failed', error);
      return sendRedirect(event, `/auth/login?error=${encodeURIComponent(error.message)}`);
    },
  });

  return defineEventHandler((event) => {
    if (!getQuery(event).code) {
      rememberRedirect(event);
    }
    return keycloak(event);
  });
}

/** Login without Keycloak for local development and tests: `/api/auth/dummy-login` picks the user. */
function dummyLogin() {
  console.log('🧪 Dummy login enabled (NUXT_AUTH_HANDLER=dummy), no Keycloak needed');
  return defineEventHandler(async (event) => {
    const { username } = getQuery(event);
    const user = typeof username === 'string' ? resolveDummyUser(username) : undefined;
    if (!user) {
      rememberRedirect(event);
      return sendRedirect(event, '/api/auth/dummy-login');
    }
    await loginUser(event, user.email, user.name);
    return sendRedirect(event, redirectTarget(event));
  });
}

export default isDummyLogin() ? dummyLogin() : keycloakLogin();
