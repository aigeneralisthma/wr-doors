import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import securityPlugin from "eslint-plugin-security";

/**
 * ESLint configuration for WR Doors.
 *
 * Three layers:
 *   1. Next.js core-web-vitals — catches Next-specific perf/UX anti-patterns
 *   2. Next.js TypeScript — adds typed-language safety
 *   3. eslint-plugin-security — flags common XSS/RCE/SSRF patterns at lint time
 *
 * Security is treated as a build concern, not a runtime concern — these
 * rules surface unsafe regexes, dangerous string-to-eval, child_process
 * with concatenated input, etc., before they ever reach production.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Security rules from eslint-plugin-security
  {
    plugins: { security: securityPlugin },
    rules: {
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-new-buffer": "error",
      "security/detect-object-injection": "off", // too noisy; rely on TS for object access
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
    },
  },

  // Build/CLI scripts touch the filesystem with computed paths by design.
  // These warnings are noise for our use case — we're not parsing user input.
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "security/detect-non-literal-fs-filename": "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/assets/**",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
