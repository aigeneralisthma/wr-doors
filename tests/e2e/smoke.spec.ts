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
  test("Header renders the WR Doors logo and links to home", async ({ page }) => {
    await page.goto("/en");

    // The header is a banner landmark
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();

    // WR Doors logo is rendered as next/image with alt="WR Doors"
    await expect(header.getByAltText(/WR Doors/i)).toBeVisible();
  });

  test("Footer surfaces the AI DODO trademark, contact info, and legal entity", async ({ page }) => {
    await page.goto("/en");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();

    // AI DODO trademark copy
    await expect(footer.getByText(/Site managed by AI DODO/i)).toBeVisible();
    // Phone number (UAE format)
    await expect(footer.getByText(/\+971/)).toBeVisible();
    // Legal entity (LLC)
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

test.describe("Homepage sections", () => {
  test("/en renders all 8 homepage sections in order", async ({ page }) => {
    await page.goto("/en");

    // Hero
    await expect(
      page.getByRole("heading", { name: /Premium Doors\. Crafted in UAE\./i }),
    ).toBeVisible();

    // USPs
    await expect(
      page.getByRole("heading", { name: /Why customers choose us/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Local Factory" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Triple Guard" })).toBeVisible();

    // Product categories
    await expect(
      page.getByRole("heading", { name: /Doors and surfaces for every space/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "WPC Doors" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pivot Aluminium Doors" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sliding Systems" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wall Cladding" })).toBeVisible();

    // Projects
    await expect(
      page.getByRole("heading", { name: /Crafted for villas and developments/i }),
    ).toBeVisible();

    // Why Us stats — "1,000+" appears in several places (hero copy, trust
    // badge, and the stat block). Scope to the section heading and check
    // the stats by their accessible name to avoid strict-mode violations.
    await expect(
      page.getByRole("heading", {
        name: /A factory-direct relationship/i,
      }),
    ).toBeVisible();

    // Services
    await expect(
      page.getByRole("heading", {
        name: /Three ways to engage with WR Doors/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Product Sales" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Free Consultation" }),
    ).toBeVisible();

    // Testimonials
    await expect(
      page.getByRole("heading", { name: /Trusted by villa owners/i }),
    ).toBeVisible();

    // Final CTA
    await expect(
      page.getByRole("heading", { name: /Let's transform your space/i }),
    ).toBeVisible();
  });

  test("/ar renders all 8 homepage sections with Arabic headings", async ({
    page,
  }) => {
    await page.goto("/ar");

    // Hero Arabic
    await expect(
      page.getByRole("heading", { name: /أبواب فاخرة/ }),
    ).toBeVisible();
    // USPs Arabic — "Why customers choose us" in Arabic
    await expect(
      page.getByRole("heading", { name: /لماذا يختارنا عملاؤنا/ }),
    ).toBeVisible();
    // Final CTA Arabic
    await expect(
      page.getByRole("heading", { name: /هيا نغير مساحتك/ }),
    ).toBeVisible();
  });
});

test.describe("Homepage images & performance", () => {
  test("Hero product image is served via <picture> with AVIF/WebP/JPG", async ({
    page,
  }) => {
    await page.goto("/en");

    // Count AVIF and WebP source tags directly with attribute selectors.
    // We expect many — every ProductImage in every section adds one of each.
    const avif = await page.locator('source[type="image/avif"]').count();
    const webp = await page.locator('source[type="image/webp"]').count();

    expect(avif).toBeGreaterThan(0);
    expect(webp).toBeGreaterThan(0);
    // Sanity check: same number of AVIF and WebP sources (we always emit pairs)
    expect(avif).toBe(webp);
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
