export interface AppConfig {
  nodeEnv: string;
  features: {
    tasksEnabled: boolean;
    logEnabled: boolean;
  };
}

export function getConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    features: {
      tasksEnabled: process.env.WB_FEATURE_TASKS === 'true',
      logEnabled: process.env.WB_FEATURE_LOG === 'true',
    },
  };
}
