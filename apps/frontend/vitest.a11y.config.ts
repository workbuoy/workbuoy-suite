import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./vitest.setup.ts",
      include: ["src/routes/**/*.a11y.spec.tsx"],
      coverage: {
        enabled: false,
      },
    },
  }),
);
