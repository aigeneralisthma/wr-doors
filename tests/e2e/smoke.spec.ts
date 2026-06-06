import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the bilingual foundation works end-to-end.
 *
 * Runs across mobile, tablet, and desktop (configured in playwright.config.ts).
 * Each test checks both /en and /ar so we catch RTL regressions early.
 */

test.describe("Bilingual foundation", () => {
  test("/en renders English headline with LTR direction", async ({ page }) => {
    await page.goto("/en");

    // Direction is set on <html dir="ltr">
    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("ltr");

    // Lang attribute is set correctly for screen readers + Google
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");

    // English hero headline is visible
    await expect(
      page.getByRole("heading", { name: /Premium Doors\. Crafted in UAE\./i }),
    ).toBeVisible();

    // Co-brand badge shows both DODA and WR Doors
    await expect(page.getByText("DODA")).toBeVisible();
    await expect(page.getByText("WR Doors")).toBeVisible();
  });

  test("/ar renders Arabic headline with RTL direction", async ({ page }) => {
    await page.goto("/ar");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("ar");

    // Arabic hero headline visible
    await expect(
      page.getByRole("heading", { name: /أبواب فاخرة/ }),
    ).toBeVisible();

    // Arabic co-brand (دودا) visible
    await expect(page.getByText("دودا")).toBeVisible();
  });

  test("redirects bare / to default locale", async ({ page }) => {
    const res = await page.goto("/");
    // next-intl middleware redirects (3xx) or rewrites — either way we land on /en or /ar
    const url = page.url();
    expect(url).toMatch(/\/(en|ar)\b/);
    expect(res?.status()).toBeLessThan(500);
  });
});

test.describe("Security headers", () => {
  test("sends X-Frame-Options, X-Content-Type-Options, and Referrer-Policy", async ({
    page,
  }) => {
    const res = await page.goto("/en");
    expect(res).not.toBeNull();
    const headers = res!.headers();
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});
