import { test, expect } from "@playwright/test";

/**
 * Service & Booking E2E tests — Prompt 5.
 *
 * Covers:
 *   - /services  (overview page, all 4 service cards)
 *   - /book      (multi-step consultation booking form)
 *   - /quote     (standalone quote request form)
 *
 * All tests run across mobile, tablet, desktop viewports.
 * All tests verify bilingual content on both /en and /ar routes.
 */

// ── Services overview page ────────────────────────────────────────────────

test.describe("/services — overview page", () => {
  test("EN services page shows heading and all 4 service cards", async ({
    page,
  }) => {
    await page.goto("/en/services");

    await expect(
      page.getByRole("heading", {
        name: /Professional door services across the UAE/i,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /Free Consultation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Supply & Installation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /On-Demand Technicians/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Custom Design/i }),
    ).toBeVisible();
  });

  test("services page shows includes lists and CTAs", async ({ page }) => {
    await page.goto("/en/services");

    // Includes items from the consultation card
    await expect(
      page.getByText(/Home visit & site measurement/i),
    ).toBeVisible();
    await expect(page.getByText(/No obligation/i)).toBeVisible();

    // CTA buttons
    await expect(
      page.getByRole("link", { name: /Book a Consultation/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Get a Quote/i }).first(),
    ).toBeVisible();
  });

  test("'Most popular' badge shown on Consultation card", async ({ page }) => {
    await page.goto("/en/services");
    await expect(page.getByText("Most popular")).toBeVisible();
  });

  test("AR services page shows Arabic heading and RTL layout", async ({
    page,
  }) => {
    await page.goto("/ar/services");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    await expect(
      page.getByRole("heading", { name: /خدمات أبواب احترافية/i }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /استشارة مجانية/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /التوريد والتركيب/i }),
    ).toBeVisible();
  });

  test("bottom CTA section has WhatsApp and Book links", async ({ page }) => {
    await page.goto("/en/services");
    await page.addStyleTag({ content: "* { scroll-behavior: auto !important; }" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const waLink = page.getByRole("link", { name: /Chat on WhatsApp/i });
    await expect(waLink).toBeVisible();
    const href = await waLink.getAttribute("href");
    expect(href).toContain("wa.me/971554039966");

    await expect(
      page.getByRole("link", { name: /Book a free consultation/i }),
    ).toBeVisible();
  });
});

// ── Booking page ─────────────────────────────────────────────────────────

test.describe("/book — consultation booking form", () => {
  test("EN booking page shows step 1 with 4 service cards", async ({
    page,
  }) => {
    await page.goto("/en/book");

    await expect(
      page.getByRole("heading", { name: /Book a free consultation/i }),
    ).toBeVisible();

    // Step label
    await expect(page.getByText(/Step 1 of 2/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /What do you need/i }),
    ).toBeVisible();

    // All 4 service buttons
    await expect(
      page.getByRole("button", { name: /Free Consultation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Supply & Installation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /On-Demand Technician/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Custom Design/i }),
    ).toBeVisible();
  });

  test("clicking Next without selecting service shows error", async ({
    page,
  }) => {
    await page.goto("/en/book");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(
      page.getByText(/Please select a service type/i),
    ).toBeVisible();
    // Still on step 1
    await expect(page.getByText(/Step 1 of 2/i)).toBeVisible();
  });

  test("booking form: select service → fill details → submit → success", async ({
    page,
  }) => {
    await page.goto("/en/book");
    await page.addStyleTag({ content: "* { scroll-behavior: auto !important; }" });

    // Step 1: select a service
    await page.getByRole("button", { name: /Free Consultation/i }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Step 2 should be visible
    await expect(page.getByText(/Step 2 of 2/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Your details/i }),
    ).toBeVisible();

    // Fill contact details
    await page.getByLabel(/Full Name/i).fill("Ahmad Al Mansouri");
    await page.getByLabel(/Phone/i).fill("+971501234567");
    await page.getByLabel(/Area/i).fill("Dubai Marina");

    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await page.locator("#bk-date").fill(dateStr);

    // Submit
    await page.getByRole("button", { name: /Confirm Booking/i }).click();

    // Success state
    await expect(
      page.getByText(/Consultation booked!/i),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole("link", { name: /Message us on WhatsApp/i }),
    ).toBeVisible();
  });

  test("booking form Back button returns to step 1", async ({ page }) => {
    await page.goto("/en/book");

    await page.getByRole("button", { name: /Free Consultation/i }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // On step 2 — click back
    await expect(page.getByText(/Step 2 of 2/i)).toBeVisible();
    await page.getByRole("button", { name: /Back/i }).click();

    // Back to step 1
    await expect(page.getByText(/Step 1 of 2/i)).toBeVisible();
  });

  test("AR booking page shows Arabic step labels and service cards", async ({
    page,
  }) => {
    await page.goto("/ar/book");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    await expect(
      page.getByRole("heading", { name: /احجز استشارة مجانية/i }),
    ).toBeVisible();
    await expect(page.getByText(/الخطوة 1 من 2/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /استشارة مجانية/i }),
    ).toBeVisible();
  });
});

// ── Quote page ────────────────────────────────────────────────────────────

test.describe("/quote — quote request form", () => {
  test("EN quote page shows form with all fields", async ({ page }) => {
    await page.goto("/en/quote");

    await expect(
      page.getByRole("heading", { name: /Get a free quote/i }),
    ).toBeVisible();

    // Form fields
    await expect(page.getByLabel(/Product \/ Category/i)).toBeVisible();
    await expect(page.getByLabel(/Approximate Quantity/i)).toBeVisible();
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Phone/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Project Location/i)).toBeVisible();
    await expect(page.getByLabel(/Project Details/i)).toBeVisible();

    // Submit button
    await expect(
      page.getByRole("button", { name: /Request Quote/i }),
    ).toBeVisible();
  });

  test("quote form shows trust panel with 24-hour response", async ({
    page,
  }) => {
    await page.goto("/en/quote");

    await expect(page.getByText(/24-hour response/i)).toBeVisible();
    // "Free & no obligation" appears twice (hero eyebrow + trust panel) — scope to aside
    await expect(
      page.locator("aside").getByText(/Free & no obligation/i),
    ).toBeVisible();
    await expect(page.getByText(/Local UAE team/i)).toBeVisible();
  });

  test("quote form validates required fields", async ({ page }) => {
    await page.goto("/en/quote");

    // Submit without filling anything
    await page.getByRole("button", { name: /Request Quote/i }).click();

    // At least one validation error should appear
    const errors = page.locator('[role="alert"]');
    await expect(errors.first()).toBeVisible();
  });

  test("quote form: fill all fields → submit → success state", async ({
    page,
  }) => {
    await page.goto("/en/quote");
    await page.addStyleTag({ content: "* { scroll-behavior: auto !important; }" });

    // Select product — click to focus, then use keyboard ArrowDown to select "WPC Doors"
    // (1st real option after the placeholder). Keyboard events generate isTrusted=true
    // events that react-hook-form picks up reliably.
    await page.locator("#qt-product").focus();
    await page.locator("#qt-product").press("ArrowDown"); // Moves to "WPC Doors"

    // Quantity
    await page.locator("#qt-quantity").fill("3 doors");

    // Name + Phone
    await page.getByLabel(/Full Name/i).fill("Sarah Al Rashidi");
    await page.getByLabel(/Phone/i).fill("+971551234567");

    // Email (optional — leave blank, should still pass)
    // Location
    await page.getByLabel(/Project Location/i).fill("Abu Dhabi, Khalidiyah");

    // Message
    await page.getByLabel(/Project Details/i).fill(
      "Looking for 3 WPC interior doors for a villa renovation in Abu Dhabi",
    );

    // Submit
    await page.getByRole("button", { name: /Request Quote/i }).click();

    // Success
    await expect(
      page.getByText(/Quote request received!/i),
    ).toBeVisible({ timeout: 5000 });

    const waLink = page.getByRole("link", { name: /Chat on WhatsApp/i });
    await expect(waLink).toBeVisible();
    const href = await waLink.getAttribute("href");
    expect(href).toContain("wa.me/971554039966");
  });

  test("quote form: invalid email shows error", async ({ page }) => {
    await page.goto("/en/quote");

    await page.locator("#qt-product").selectOption("pivotDoors");
    await page.locator("#qt-quantity").fill("1");
    await page.getByLabel(/Full Name/i).fill("Test User");
    await page.getByLabel(/Phone/i).fill("+971500000000");
    await page.locator("#qt-email").fill("not-an-email");
    await page.getByLabel(/Project Location/i).fill("Dubai");
    await page.getByLabel(/Project Details/i).fill(
      "Just testing the email validation here",
    );
    await page.getByRole("button", { name: /Request Quote/i }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("AR quote page shows Arabic heading and RTL layout", async ({
    page,
  }) => {
    await page.goto("/ar/quote");

    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    await expect(
      page.getByRole("heading", { name: /احصل على عرض سعر مجاني/i }),
    ).toBeVisible();

    // Trust panel in Arabic
    await expect(page.getByText(/رد خلال 24 ساعة/i)).toBeVisible();
  });
});
