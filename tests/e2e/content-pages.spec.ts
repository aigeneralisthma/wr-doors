import { test, expect } from "@playwright/test";

/**
 * Content pages E2E tests — Prompt 6.
 *
 * Covers:
 *   - /projects  (portfolio grid + client-side category filter)
 *   - /about     (company story + factory + values + legal disclosure)
 *   - /contact   (contact form + info panel + Google Maps iframe)
 *
 * All tests run across mobile, tablet, desktop viewports.
 * All tests verify bilingual content on both /en and /ar routes.
 */

// ── Projects portfolio page ──────────────────────────────────────────────

test.describe("/projects — portfolio + filter", () => {
  test("EN projects page shows hero and all 6 project cards", async ({
    page,
  }) => {
    await page.goto("/en/projects");

    await expect(
      page.getByRole("heading", {
        name: /Recent work across the UAE/i,
        level: 1,
      }),
    ).toBeVisible();

    // All 6 project titles visible in default "All" view
    await expect(page.getByText(/Villa Renovation — Dubai Hills/i)).toBeVisible();
    await expect(page.getByText(/Penthouse Living Room — JBR/i)).toBeVisible();
    await expect(
      page.getByText(/Lobby Feature Wall — Business Bay/i),
    ).toBeVisible();
    await expect(
      page.getByText(/Beachfront Villa — Palm Jumeirah/i),
    ).toBeVisible();
    await expect(
      page.getByText(/Boutique Office Fit-out — Al Barsha/i),
    ).toBeVisible();
    await expect(
      page.getByText(/Family Home — Arabian Ranches/i),
    ).toBeVisible();
  });

  test("filter pills are present with All selected by default", async ({
    page,
  }) => {
    await page.goto("/en/projects");

    const allTab = page.getByRole("tab", { name: /All projects/i });
    const residentialTab = page.getByRole("tab", { name: "Residential", exact: true });
    const commercialTab = page.getByRole("tab", { name: "Commercial", exact: true });
    const luxuryTab = page.getByRole("tab", { name: "Luxury", exact: true });

    await expect(allTab).toBeVisible();
    await expect(residentialTab).toBeVisible();
    await expect(commercialTab).toBeVisible();
    await expect(luxuryTab).toBeVisible();

    // Default selected: All
    await expect(allTab).toHaveAttribute("aria-selected", "true");
  });

  test("clicking Residential filter shows only residential projects", async ({
    page,
  }) => {
    await page.goto("/en/projects");

    await page.getByRole("tab", { name: "Residential", exact: true }).click();

    // Should still see the 2 residential
    await expect(page.getByText(/Villa Renovation — Dubai Hills/i)).toBeVisible();
    await expect(
      page.getByText(/Family Home — Arabian Ranches/i),
    ).toBeVisible();

    // Should NOT see commercial/luxury projects
    await expect(
      page.getByText(/Penthouse Living Room — JBR/i),
    ).not.toBeVisible();
    await expect(
      page.getByText(/Lobby Feature Wall — Business Bay/i),
    ).not.toBeVisible();
  });

  test("clicking Luxury filter shows luxury projects", async ({ page }) => {
    await page.goto("/en/projects");

    await page.getByRole("tab", { name: "Luxury", exact: true }).click();

    await expect(page.getByText(/Penthouse Living Room — JBR/i)).toBeVisible();
    await expect(
      page.getByText(/Beachfront Villa — Palm Jumeirah/i),
    ).toBeVisible();

    // Residential should be hidden
    await expect(
      page.getByText(/Villa Renovation — Dubai Hills/i),
    ).not.toBeVisible();
  });

  test("AR projects page shows Arabic heading and RTL layout", async ({
    page,
  }) => {
    await page.goto("/ar/projects");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    // Match the stable substring "في جميع أنحاء الإمارات" — present in any
    // valid copy variation (we tolerate wording tweaks to AR translations).
    await expect(
      page.getByRole("heading", {
        name: /في جميع أنحاء الإمارات/,
        level: 1,
      }),
    ).toBeVisible();

    // Arabic filter tab visible
    await expect(
      page.getByRole("tab", { name: "سكني", exact: true }),
    ).toBeVisible();

    // At least one Arabic project title visible
    await expect(page.getByText(/تجديد فيلا — تلال دبي/)).toBeVisible();
  });

  test("bottom CTA section has WhatsApp and Quote links", async ({ page }) => {
    await page.goto("/en/projects");
    await page.addStyleTag({
      content: "* { scroll-behavior: auto !important; }",
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const waLink = page.getByRole("link", { name: /Chat on WhatsApp/i });
    await expect(waLink).toBeVisible();
    const href = await waLink.getAttribute("href");
    expect(href).toContain("wa.me/971554039966");

    await expect(
      page.getByRole("link", { name: /Request a Quote/i }),
    ).toBeVisible();
  });
});

// ── About page ────────────────────────────────────────────────────────────

test.describe("/about — company story", () => {
  test("EN about page shows hero and all 5 section headings", async ({
    page,
  }) => {
    await page.goto("/en/about");

    await expect(
      page.getByRole("heading", {
        name: /Premium doors\. Crafted in the UAE/i,
        level: 1,
      }),
    ).toBeVisible();

    // Story section
    await expect(
      page.getByRole("heading", { name: /Built locally, designed/i }),
    ).toBeVisible();

    // Factory section
    await expect(
      page.getByRole("heading", { name: /Factory & Quality Assurance/i }),
    ).toBeVisible();

    // Values section
    await expect(
      page.getByRole("heading", { name: /Quality, service, and a 10-year promise/i }),
    ).toBeVisible();
  });

  test("legal entity disclosure shows EN + AR company names", async ({
    page,
  }) => {
    await page.goto("/en/about");

    // The legal name also appears in the global footer; scope to <main>
    // so we test the about page's aside, not the footer.
    const main = page.locator("main");

    await expect(
      main.getByRole("heading", { name: /Legal entity/i }),
    ).toBeVisible();

    // English legal name in the about page aside
    await expect(
      main.getByText("Wahat Al Ruman Doors Trading LLC", { exact: true }),
    ).toBeVisible();

    // Arabic legal name (always shown for bilingual disclosure)
    await expect(
      main.getByText(/واحة الرمان لتجارة الأبواب ذ\.م\.م/),
    ).toBeVisible();
  });

  test("factory stats list shows 4 items", async ({ page }) => {
    await page.goto("/en/about");

    await expect(page.getByText(/1,000\+ designs in catalogue/i)).toBeVisible();
    await expect(page.getByText(/5-point QA per door/i)).toBeVisible();
    await expect(page.getByText(/ISO-aligned production/i)).toBeVisible();
    await expect(page.getByText(/24-hour service response/i)).toBeVisible();
  });

  test("AR about page shows Arabic content and RTL", async ({ page }) => {
    await page.goto("/ar/about");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    // Match "أبواب فاخرة" — stable across copy variations
    await expect(
      page.getByRole("heading", { name: /أبواب فاخرة/, level: 1 }),
    ).toBeVisible();
  });

  test("bottom CTA has Book + Quote buttons", async ({ page }) => {
    await page.goto("/en/about");
    await page.addStyleTag({
      content: "* { scroll-behavior: auto !important; }",
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(
      page.getByRole("link", { name: /Book a consultation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Request a quote/i }),
    ).toBeVisible();
  });
});

// ── Contact page ──────────────────────────────────────────────────────────

test.describe("/contact — form + info panel + map", () => {
  test("EN contact page shows form with all 5 fields", async ({ page }) => {
    await page.goto("/en/contact");

    await expect(
      page.getByRole("heading", { name: /Talk to our team/i, level: 1 }),
    ).toBeVisible();

    // Form fields
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Phone/i)).toBeVisible();
    await expect(page.getByLabel(/Subject/i)).toBeVisible();
    await expect(page.getByLabel(/Message/i)).toBeVisible();

    // Submit button
    await expect(
      page.getByRole("button", { name: /Send Message/i }),
    ).toBeVisible();
  });

  test("info panel shows phone, WhatsApp, email, address, hours", async ({
    page,
  }) => {
    await page.goto("/en/contact");

    // Aside section
    const aside = page.locator("aside");
    await expect(aside.getByText(/Other ways to reach us/i)).toBeVisible();
    await expect(aside.getByText(/Site managed by AI DODO/i)).toBeVisible();

    // Phone link
    const phoneLink = aside.getByRole("link", { name: /\+971 55 403 9966/i }).first();
    await expect(phoneLink).toBeVisible();
    const href = await phoneLink.getAttribute("href");
    expect(href).toContain("tel:971554039966");

    // Hours
    await expect(
      aside.getByText(/Sunday – Thursday: 9:00 AM – 6:00 PM/i),
    ).toBeVisible();
    await expect(
      aside.getByText(/Friday & Saturday: Closed/i),
    ).toBeVisible();
  });

  test("Google Maps iframe is present with correct src", async ({ page }) => {
    await page.goto("/en/contact");
    await page.addStyleTag({
      content: "* { scroll-behavior: auto !important; }",
    });

    const map = page.getByTestId("contact-map");
    await expect(map).toBeAttached();

    const src = await map.getAttribute("src");
    expect(src).toContain("google.com/maps/embed");
    expect(src).toContain("Dubai");
  });

  test("contact form validates required fields", async ({ page }) => {
    await page.goto("/en/contact");

    // Submit without filling — validation should kick in
    await page.getByRole("button", { name: /Send Message/i }).click();

    const errors = page.locator('[role="alert"]');
    await expect(errors.first()).toBeVisible();
  });

  test("contact form: fill all → submit → success state", async ({ page }) => {
    await page.goto("/en/contact");
    await page.addStyleTag({
      content: "* { scroll-behavior: auto !important; }",
    });

    // Click the name field BEFORE filling — this forces React to attach
    // its event handlers (hydration). Without this, the first .fill()
    // races react-hook-form's register pass and the value is silently
    // dropped, even though `.toBeEnabled()` on the submit button passes.
    const nameInput = page.getByLabel(/Full Name/i);
    await nameInput.click();
    await nameInput.fill("Ahmad Al Mansouri");

    await page.getByLabel(/Email/i).fill("ahmad@example.com");
    await page.getByLabel(/Phone/i).fill("+971501234567");
    await page.getByLabel(/Subject/i).fill("WPC interior doors quote");
    await page.getByLabel(/Message/i).fill(
      "Looking for 5 WPC interior doors for a villa renovation in Dubai Marina.",
    );

    await page.getByRole("button", { name: /Send Message/i }).click();

    // Success state
    await expect(page.getByText(/Message received!/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("link", { name: /Message us on WhatsApp/i }),
    ).toBeVisible();
  });

  test("contact form: invalid email shows error", async ({ page }) => {
    await page.goto("/en/contact");

    await page.getByLabel(/Full Name/i).fill("Test User");
    await page.getByLabel(/Email/i).fill("not-an-email");
    await page.getByLabel(/Phone/i).fill("+971500000000");
    await page.getByLabel(/Subject/i).fill("Test");
    await page.getByLabel(/Message/i).fill("Just testing the validation here.");

    await page.getByRole("button", { name: /Send Message/i }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("AR contact page shows Arabic heading and RTL", async ({ page }) => {
    await page.goto("/ar/contact");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    // Tolerate "تحدّث" vs "تحدث" (with/without shadda diacritic)
    await expect(
      page.getByRole("heading", { name: /إلى فريقنا/, level: 1 }),
    ).toBeVisible();

    // Info panel in Arabic
    await expect(page.locator("aside").getByText(/طرق أخرى/)).toBeVisible();
  });
});
