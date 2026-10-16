import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:4174/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 20_000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } }
  ]
});
