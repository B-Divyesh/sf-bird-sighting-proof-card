import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4174', trace: 'retain-on-failure' },
  webServer: { command: 'npm run build && npm run preview -- --port 4174', port: 4174, reuseExistingServer: true },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 } } }
  ]
});
