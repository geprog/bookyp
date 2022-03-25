const config = {
  app: {
    host: process.env.BACKEND_HOST || 'localhost',
    port: parseInt(process.env.BACKEND_PORT || '4000'),
    secret: process.env.BACKEND_SECRET,
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
};

export type Config = typeof config;

export default function get(): Config {
  return config;
}
