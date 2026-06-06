import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — end-to-end smoke tests.
 *
 * Run with:
 *   pnpm test:e2e          (headless)
 *   pnpm test:e2e --ui     (interactive)
 *
 * Tests live in tests/e2e/. The smoke suite verifies that /en and /ar both
 * render correctly across mobile, tablet, and desktop viewports.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // Each prompt's verification runs the suite; reasonable timeout per test.
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Retry once in CI (handle flake), no retries locally
  retries: process.env.CI ? 1 : 0,

  // CI: 1 worker for predictable serial runs. Local: parallel.
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Three viewports = three breakpoints from the design system
  projects: [
    {
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "tablet",
      use: { ...devices["iPad (gen 7)"] },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Auto-start the dev server when running locally
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
