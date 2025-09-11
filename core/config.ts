export interface AppConfig {
  env: string;
  features: Record<string, boolean>;
}

export function getConfig(): AppConfig {
  return {
    env: (process.env.NODE_ENV as string) || 'development',
    features: {
      tasks: process.env.WB_FEATURE_TASKS === 'true',
      log: process.env.WB_FEATURE_LOG === 'true',
    },
  };
}
