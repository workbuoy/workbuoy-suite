import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  testDir: 'tests/e2e',
  use: {
    headless: true,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
  },
  webServer: {
    command: 'docker compose -f docker/docker-compose.yml up -d --build',
    port: 8080,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
,
  projects: [
    { name: 'smoke' },
    { name: 'fuzz' }
  ]
