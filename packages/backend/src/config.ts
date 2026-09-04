const config = {
  app: {
    host: process.env.BACKEND_HOST || 'localhost',
    port: parseInt(process.env.BACKEND_PORT || '4000'),
    secret: process.env.BACKEND_SECRET,
    frontendUrl: process.env.BACKEND_FRONTEND_URL,
    backendUrl:
      process.env.BACKEND_URL || (process.env.BACKEND_HOST ? `https://${process.env.BACKEND_HOST}` : undefined),
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
  payment: {
    gringottsUrl: process.env.BACKEND_PAYMENT_URL,
    gringottsToken: process.env.BACKEND_PAYMENT_TOKEN,
  },
  s3: {
    endpoint: process.env.BACKEND_S3_ENDPOINT,
    port: parseInt(process.env.BACKEND_S3_PORT || '443'),
    useSSL: (process.env.BACKEND_S3_SSL || 'true') === 'true',
    accessKey: process.env.BACKEND_S3_ACCESS_KEY,
    secretKey: process.env.BACKEND_S3_SECRET_KEY,
    bucket: process.env.BACKEND_S3_BUCKET,
    // endpoint the browser connects to. presigned urls are signed for this host
    publicEndpoint: process.env.BACKEND_S3_PUBLIC_ENDPOINT || process.env.BACKEND_S3_ENDPOINT,
    publicPort: parseInt(process.env.BACKEND_S3_PUBLIC_PORT || process.env.BACKEND_S3_PORT || '443'),
    publicUseSSL: (process.env.BACKEND_S3_PUBLIC_SSL || process.env.BACKEND_S3_SSL || 'true') === 'true',
    // signing timestamps are pinned to this window (in seconds) so download urls stay stable long enough for the browser to cache the file
    downloadUrlWindow: parseInt(process.env.BACKEND_S3_DOWNLOAD_URL_WINDOW || '3600'),
  },
};

export type Config = typeof config;

export default function get(): Config {
  return config;
}
