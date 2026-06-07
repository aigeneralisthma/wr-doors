import { test, expect } from "@playwright/test";

/**
 * Product catalog E2E tests — Prompt 4.
 *
 * Covers:
 *   - /products  (main catalog, all 8 products)
 *   - /products/[category]  (category listing)
 *   - /products/[category]/[slug]  (product detail + quote modal)
 *
 * All tests run across mobile, tablet, desktop (playwright.config.ts projects).
 * All tests check both /en (LTR) and /ar (RTL) where bilingual content matters.
 */

// ── Main catalog page ────────────────────────────────────────────────────────

test.describe("/products — catalog page", () => {
  test("EN catalog shows page heading and all 4 category pills", async ({ page }) => {
    await page.goto("/en/products");

    await expect(
      page.getByRole("heading", { name: /Doors for every home/i }),
    ).toBeVisible();

    // Category filter pills
    await expect(page.getByRole("link", { name: /All Products/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /WPC Doors/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Pivot Aluminium Doors/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Sliding Systems/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Wall Cladding/i }).first()).toBeVisible();
  });

  test("AR catalog shows Arabic heading and RTL layout", async ({ page }) => {
    await page.goto("/ar/products");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    await expect(
      page.getByRole("heading", { name: /أبواب لكل منزل/i }),
    ).toBeVisible();

    // Arabic "All Products" pill
    await expect(
      page.getByRole("link", { name: /جميع المنتجات/i }).first(),
    ).toBeVisible();
  });

  test("catalog grid shows all 8 product cards with images", async ({ page }) => {
    await page.goto("/en/products");

    // All 8 product names should be visible
    const productNames = [
      "Modern WPC Interior Door",
      "Waterproof Bathroom WPC Door",
      "Custom Engineered WPC Door",
      "Grand Exterior Aluminium Pivot Door",
      "Minimalist Aluminium Entry Door",
      "Glass & Aluminium Sliding System",
      "Minimalist Pocket Sliding Door",
      "Modern Fluted Wall Cladding",
    ];

    for (const name of productNames) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }

    // All product cards have AVIF sources
    const avifSources = await page.locator('source[type="image/avif"]').count();
    expect(avifSources).toBeGreaterThanOrEqual(8);
  });

  test("View Details links go to /products/[category]/[slug]", async ({ page }) => {
    await page.goto("/en/products");

    // Click the first "View Details" link
    const firstViewDetails = page.getByRole("link", { name: /View Details/i }).first();
    await firstViewDetails.click();

    // Should navigate to a product detail URL
    await page.waitForURL(/\/en\/products\/[^/]+\/[^/]+/);
    expect(page.url()).toMatch(/\/en\/products\/.+\/.+/);
  });
});

// ── Category listing page ────────────────────────────────────────────────────

test.describe("/products/[category] — category listing", () => {
  test("WPC Doors category shows heading, breadcrumb, and 3 products", async ({
    page,
  }) => {
    await page.goto("/en/products/wpc-doors");

    // Breadcrumb
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /All Products/i }).first(),
    ).toBeVisible();

    // Page heading
    await expect(
      page.getByRole("heading", { name: /Premium WPC Doors/i }),
    ).toBeVisible();

    // 3 WPC products
    await expect(page.getByRole("heading", { name: /Modern WPC Interior Door/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Waterproof Bathroom WPC Door/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Custom Engineered WPC Door/i })).toBeVisible();

    // Pivot door should NOT be here
    const pivotDoor = page.getByRole("heading", { name: /Grand Exterior Aluminium/i });
    await expect(pivotDoor).not.toBeVisible();
  });

  test("AR category page shows Arabic heading and category pills", async ({
    page,
  }) => {
    await page.goto("/ar/products/sliding-systems");

    await expect(
      page.getByRole("heading", { name: /أنظمة منزلقة داخلية/i }),
    ).toBeVisible();

    // Arabic pill for sliding systems should be active
    await expect(
      page.getByRole("link", { name: /أنظمة منزلقة/i, exact: false }).first(),
    ).toBeVisible();
  });

  test("category pills navigate correctly", async ({ page }) => {
    await page.goto("/en/products/wpc-doors");

    // Click "Pivot Aluminium Doors" pill
    await page.getByRole("link", { name: /Pivot Aluminium Doors/i }).first().click();
    await page.waitForURL(/\/en\/products\/pivot-aluminium-doors/);

    await expect(
      page.getByRole("heading", { name: /Luxury Pivot Aluminium Doors/i }),
    ).toBeVisible();
  });
});

// ── Product detail page ──────────────────────────────────────────────────────

test.describe("/products/[category]/[slug] — product detail", () => {
  test("EN detail page shows product name, specs table, and CTAs", async ({
    page,
  }) => {
    await page.goto("/en/products/wpc-doors/modern-wpc-interior");

    // Product heading
    await expect(
      page.getByRole("heading", { name: /Modern WPC Interior Door/i, level: 1 }),
    ).toBeVisible();

    // Breadcrumb: All Products → Premium WPC Doors → [product]
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /All Products/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Premium WPC Doors/i })).toBeVisible();

    // Specs section
    await expect(
      page.getByRole("heading", { name: /Specifications/i }),
    ).toBeVisible();
    // A spec value
    await expect(page.getByText(/WPC Composite/i).first()).toBeVisible();

    // CTA: Request a Quote button
    await expect(
      page.getByRole("button", { name: /Request a Quote/i }),
    ).toBeVisible();

    // WhatsApp link
    const waLink = page.getByRole("link", { name: /WhatsApp/i }).first();
    await expect(waLink).toBeVisible();
    const href = await waLink.getAttribute("href");
    expect(href).toContain("wa.me/971554039966");
  });

  test("AR detail page shows Arabic product name and specs", async ({ page }) => {
    await page.goto("/ar/products/wpc-doors/modern-wpc-interior");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    // Arabic product heading
    await expect(
      page.getByRole("heading", { name: /باب WPC داخلي حديث/i, level: 1 }),
    ).toBeVisible();

    // Arabic specs label
    await expect(page.getByText(/المادة/i).first()).toBeVisible();
  });

  test("Triple Guard section is present on detail page", async ({ page }) => {
    await page.goto("/en/products/pivot-aluminium-doors/grand-exterior-pivot");

    await expect(
      page.getByRole("heading", { name: /Triple Guard Protection/i }),
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: /Water Resistant/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sound Insulated/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Termite Proof/i })).toBeVisible();
  });

  test("AR detail page shows Arabic Triple Guard section", async ({ page }) => {
    await page.goto("/ar/products/pivot-aluminium-doors/grand-exterior-pivot");

    await expect(
      page.getByRole("heading", { name: /الحماية الثلاثية/i }),
    ).toBeVisible();

    // Use exact:true to avoid collision with a related product card heading
    // (e.g. "باب حمام WPC مقاوم للماء") that also contains "مقاوم للماء"
    await expect(
      page.getByRole("heading", { name: "مقاوم للماء", exact: true }),
    ).toBeVisible();
  });

  test("Related products strip shows 3 products", async ({ page }) => {
    await page.goto("/en/products/wpc-doors/modern-wpc-interior");

    await expect(
      page.getByRole("heading", { name: /You might also like/i }),
    ).toBeVisible();

    // Should show related product cards
    const relatedLinks = page.getByRole("link", { name: /View Details/i });
    const count = await relatedLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("Quote modal opens and shows form fields", async ({ page }) => {
    await page.goto("/en/products/wpc-doors/modern-wpc-interior");

    // Disable CSS smooth scrolling so Playwright's auto-scroll completes
    // synchronously before clicking — globals.css sets scroll-behavior:smooth
    // on <html> which can cause the click to land before the scroll finishes.
    await page.addStyleTag({ content: "* { scroll-behavior: auto !important; }" });

    await page.getByRole("button", { name: /Request a Quote/i }).click();

    // Modal should appear with a dialog role
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Form fields inside the modal
    await expect(dialog.getByLabel(/Full Name/i)).toBeVisible();
    await expect(dialog.getByLabel(/Phone/i)).toBeVisible();
    await expect(dialog.getByLabel(/Project Details/i)).toBeVisible();

    // Product name is pre-filled (read-only input) — use page.getByDisplayValue
    // Note: getByDisplayValue only exists on Page, not Locator, so we verify
    // by checking the readonly input has the correct value instead.
    await expect(dialog.locator("input[readonly]")).toHaveValue(/Modern WPC Interior Door/i);
  });

  test("Quote modal submits and shows success state", async ({ page }) => {
    await page.goto("/en/products/wpc-doors/modern-wpc-interior");
    await page.addStyleTag({ content: "* { scroll-behavior: auto !important; }" });
    await page.getByRole("button", { name: /Request a Quote/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Fill the form
    await dialog.getByLabel(/Full Name/i).fill("Test User");
    await dialog.getByLabel(/Phone/i).fill("+971501234567");
    await dialog.getByLabel(/Project Details/i).fill("Dubai villa, 3 doors needed");

    // Submit
    await dialog.getByRole("button", { name: /Send Inquiry/i }).click();

    // Success state: "Inquiry received!" heading
    await expect(dialog.getByText(/Inquiry received!/i)).toBeVisible({ timeout: 5000 });
    // WhatsApp link in success state
    await expect(dialog.getByRole("link", { name: /WhatsApp/i })).toBeVisible();
  });

  test("product image uses AVIF/WebP picture sources", async ({ page }) => {
    await page.goto("/en/products/wpc-doors/modern-wpc-interior");

    const avif = await page.locator('source[type="image/avif"]').count();
    const webp = await page.locator('source[type="image/webp"]').count();

    expect(avif).toBeGreaterThan(0);
    expect(webp).toBeGreaterThan(0);
    expect(avif).toBe(webp);
  });
});
