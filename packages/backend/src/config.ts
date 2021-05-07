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
  },
  db: {
    uri: process.env.BACKEND_DB_URI,
    host: process.env.BACKEND_DB_HOST || 'db',
    port: parseInt(process.env.BACKEND_DB_PORT || '27017'),
    name: process.env.BACKEND_DB_NAME || 'bookyp',
    user: process.env.BACKEND_DB_USERNAME,
    password: process.env.BACKEND_DB_PASSWORD,
  },
};

export type Config = typeof config;

export default function get(): Config {
  return config;
}
