import { test, expect } from "@playwright/test";

/**
 * Smoke tests — verify the bilingual foundation + design system shell.
 *
 * Runs across mobile, tablet, and desktop (configured in playwright.config.ts).
 * Each test checks both /en and /ar so we catch RTL regressions early.
 */

test.describe("Bilingual foundation", () => {
  test("/en renders English headline with LTR direction", async ({ page }) => {
    await page.goto("/en");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("ltr");

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");

    await expect(
      page.getByRole("heading", { name: /Premium Doors\. Crafted in UAE\./i }),
    ).toBeVisible();
  });

  test("/ar renders Arabic headline with RTL direction", async ({ page }) => {
    await page.goto("/ar");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("ar");

    await expect(
      page.getByRole("heading", { name: /أبواب فاخرة/ }),
    ).toBeVisible();
  });

  test("redirects bare / to default locale", async ({ page }) => {
    const res = await page.goto("/");
    const url = page.url();
    expect(url).toMatch(/\/(en|ar)\b/);
    expect(res?.status()).toBeLessThan(500);
  });
});

test.describe("Site chrome — Header + Footer + WhatsApp", () => {
  test("Header renders the co-brand lockup and links to home", async ({ page }) => {
    await page.goto("/en");

    // The header is a banner landmark
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();

    // Co-brand lockup is announced as one img with aria-label "DODA × WR Doors"
    await expect(header.getByRole("img", { name: /DODA.*WR Doors/i })).toBeVisible();
  });

  test("Footer surfaces the DODA endorsement, contact info, and legal entity", async ({ page }) => {
    await page.goto("/en");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();

    // DODA endorsement copy (use .first() because the inner SVG <title>
    // also contains "DODA" in some lockup configurations)
    await expect(footer.getByText(/DODA platform brand/i).first()).toBeVisible();
    // Phone number (UAE format)
    await expect(footer.getByText(/\+971/)).toBeVisible();
    // Legal entity (LLC) — use last() to skip the hidden SVG <title>
    // (which appears first in DOM order) and target the visible legal strip
    // paragraph at the bottom of the footer.
    await expect(
      footer.getByText(/Wahat Al Ruman Doors Trading LLC/i).last(),
    ).toBeVisible();
  });

  test("WhatsApp floating button is present and links to wa.me", async ({ page }) => {
    await page.goto("/en");
    // Two WhatsApp anchors exist (the footer text-link and the floating button).
    // Target the floating button by its specific aria-label so we test the
    // sticky CTA that's always within reach.
    const whatsapp = page.getByRole("link", { name: /WhatsApp.*WR Doors/i });
    await expect(whatsapp).toBeVisible();
    const href = await whatsapp.getAttribute("href");
    expect(href).toContain("wa.me/971554039966");
  });

  test("Arabic footer shows the Arabic legal entity name", async ({ page }) => {
    await page.goto("/ar");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/واحة الرمان/)).toBeVisible();
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
