const config = {
  app: {
    host: process.env.BACKEND_HOST || 'localhost',
    port: parseInt(process.env.BACKEND_PORT || '4000'),
    secret: process.env.BACKEND_SECRET,
    frontendUrl: process.env.BACKEND_FRONTEND_URL,
  },
  oauth: {
    redirect_url: process.env.BACKEND_OAUTH_REDIRECT_URL,
    keycloak: {
      secret: process.env.BACKEND_KEYCLOAK_SECRET,
      client: process.env.BACKEND_KEYCLOAK_CLIENT,
      subdomain: process.env.BACKEND_KEYCLOAK_SUBDOMAIN,
    },
    defaults: {
      origin:
        process.env.BACKEND_HOST && process.env.BACKEND_HOST !== 'localhost'
          ? `https://${process.env.BACKEND_HOST}`
          : undefined,
    },
  },
  db: {
    uri: process.env.BACKEND_DB_URI,
  },
  mail: {
    host: process.env.BACKEND_MAIL_HOST,
    port: parseInt(process.env.BACKEND_MAIL_PORT || '25'),
    from: process.env.BACKEND_MAIL_FROM,
    secure: process.env.BACKEND_MAIL_SECURE === 'true',
    requireTLS: process.env.BACKEND_MAIL_REQUIRE_TLS === 'true',
    username: process.env.BACKEND_MAIL_USERNAME,
    password: process.env.BACKEND_MAIL_PASSWORD,
  },
};

export type Config = typeof config;

export default function get(): Config {
  return config;
}
