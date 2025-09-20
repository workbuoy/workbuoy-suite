import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@testing-library/react": path.resolve(__dirname, "src/test-utils/testing-library.ts"),
      "@testing-library/jest-dom": path.resolve(__dirname, "src/test-utils/jest-dom.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
});