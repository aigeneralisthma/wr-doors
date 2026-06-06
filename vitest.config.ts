import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vitest config — unit + component tests.
 *
 * Run with:
 *   pnpm test          (watch mode)
 *   pnpm test:run      (single run, CI)
 *   pnpm test:coverage (with coverage report)
 *
 * E2E tests use Playwright separately (playwright.config.ts).
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    // Tests run in the wr-doors/ folder, not in __tests__/ — keep it close to code.
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**", "playwright/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
