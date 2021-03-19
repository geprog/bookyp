const config = {
  app: {
    host: process.env.APP_HOST || 'localhost',
    port: parseInt(process.env.APP_PORT || '4000'),
    secret: process.env.APP_SECRET,
  },
  oauth: {
    redirect_url: process.env.OAUTH_REDIRECT_URL,
    keycloak: {
      secret: process.env.KEYCLOAK_SECRET,
      client: process.env.KEYCLOAK_CLIENT,
      subdomain: process.env.KEYCLOAK_SUBDOMAIN,
    },
  },
  db: {
    uri: process.env.DB_URI,
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '27017'),
    name: process.env.DB_NAME || 'bookyp',
    user: process.env.DB_ROOT_USERNAME,
    password: process.env.DB_ROOT_PASSWORD,
  },
};

export type Config = typeof config;

export default function get(): Config {
  return config;
}
