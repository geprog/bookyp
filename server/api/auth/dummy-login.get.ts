const escape = (value: string) => value.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

/** The page of the dummy login (`NUXT_AUTH_HANDLER=dummy`): pick a test user or type any e-mail address. */
export default defineEventHandler((event) => {
  if (!isDummyLogin()) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }
  const users = dummyUsers
    .map(user => `<li><a href="/api/auth/login?username=${encodeURIComponent(user.username)}">${escape(user.username)}</a> - ${escape(user.name)} (${escape(user.email)})${user.hint ? `, ${escape(user.hint)}` : ''}</li>`)
    .join('\n');
  setHeader(event, 'content-type', 'text/html; charset=utf-8');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dummy login</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #f3f4f6; display: flex; justify-content: center; padding: 3rem 1rem; }
      main { background: #fff; padding: 2rem; border-radius: 0.75rem; max-width: 26rem; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
      label { display: block; margin-top: 1rem; font-size: .875rem; color: #374151; }
      input[type=text] { width: 100%; padding: .5rem; margin-top: .25rem; border: 1px solid #d1d5db; border-radius: .375rem; box-sizing: border-box; }
      input[type=submit] { margin-top: 1.5rem; width: 100%; padding: .75rem; background: #f59e0b; color: #fff; border: 0; border-radius: .375rem; font-size: 1rem; cursor: pointer; }
      ul { font-size: .875rem; color: #6b7280; }
    </style>
  </head>
  <body>
    <main>
      <h1>Dummy login</h1>
      <p>Login for local development and tests, no Keycloak involved. Type a username or any e-mail address.</p>
      <form method="get" action="/api/auth/login">
        <label>Username or e-mail <input type="text" name="username" autofocus /></label>
        <input type="submit" value="Login" />
      </form>
      <h2>Test users</h2>
      <ul>
        ${users}
      </ul>
    </main>
  </body>
</html>`;
});
