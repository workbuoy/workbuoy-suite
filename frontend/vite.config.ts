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
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    include: [
      "src/features/settings/Preferences.test.tsx",
      "src/components/ui/dialog.test.tsx",
      "src/__tests__/uiSnapshots.test.tsx",
      "src/__tests__/slider.test.tsx",
      "src/__tests__/whyDrawer.test.tsx",
      // Nytt i denne PR
      "src/features/demo/useDemoMode.test.ts",
      "src/components/UndoToast.test.tsx",
      "src/features/integrations/__tests__/CollabPanel.test.tsx",
      "src/features/integrations/__tests__/GWorkspacePanel.test.tsx",
      "src/features/integrations/__tests__/VismaImpactPanel.test.tsx",
      "src/features/navi/NaviGridRender.test.tsx",
      "src/features/dock/__tests__/DockWidget.test.tsx",
      "src/features/dock/__tests__/DockHost.test.tsx",
      "src/features/dock/__tests__/PeripheralCue.test.tsx",
      "src/features/dock/__tests__/DockHostA11y.test.tsx",
      "src/features/dock/__tests__/DockPersistence.test.tsx",
      "src/features/core/__tests__/DockStatus.test.tsx",
      "src/components/FlipCard/FlipCardFastFlip.test.tsx",
      "src/proposals/ProposalsPanel.test.tsx",
    ],
    exclude: ["e2e/**"],
  },
});
