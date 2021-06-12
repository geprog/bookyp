export type AppConfig = {
  BACKEND_URL: string;
};

export function getConfig<T extends keyof AppConfig>(key: keyof AppConfig): AppConfig[T] | undefined {
  const { env } = window as unknown as { env: AppConfig };
  const config = env || {};

  return config[key];
}
