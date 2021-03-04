const config = {
  app: {
    port: parseInt(process.env.APP_PORT || '4000'),
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
