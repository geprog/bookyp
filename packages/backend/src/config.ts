const config = {
  app: {
    port: parseInt(process.env.APP_PORT || '3000'),
  },
  db: {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '27017'),
    name: process.env.DB_NAME || 'bookyp',
  },
};

export type Config = typeof config;

export function get(): Config {
  return config;
}

export default get;
