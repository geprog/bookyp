export type AppConfig = {
  BACKEND_URL: string;
  SSO_AUTH_URL: string;
  SSO_AUTH_LOGOUT_ENDPOINT: string;
};

export function getConfig<T extends keyof AppConfig>(key: keyof AppConfig): AppConfig[T] | undefined {
  const { env } = window as unknown as { env: AppConfig };
  const config = env || {};

  return config[key];
}
