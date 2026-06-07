import { test, expect } from "@playwright/test";

/**
 * Admin smoke tests — Prompt 9a.
 *
 * These exercise auth gating + login page rendering. The actual logged-in
 * pages (dashboard / leads / bookings) require valid Supabase Auth credentials
 * which we can't bake into tests safely. Manual verification covers those.
 *
 * Each test runs only on mobile to save CI time — admin is desktop-first
 * anyway but should not crash on small screens.
 */

test.describe("/admin — auth gating + login page", () => {
  test("unauthenticated /admin/dashboard redirects to /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login(\?|$)/);
    // The "next" query param should preserve the requested path
    expect(page.url()).toContain("next=%2Fadmin%2Fdashboard");
  });

  test("unauthenticated /admin/leads redirects to /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/admin\/login(\?|$)/);
  });

  test("unauthenticated /admin/bookings redirects to /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/bookings");
    await expect(page).toHaveURL(/\/admin\/login(\?|$)/);
  });

  test("login page renders with email + password fields", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(
      page.getByRole("heading", { name: /Admin Sign In/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sign in/i }),
    ).toBeVisible();
  });

  test("login page submits with invalid credentials and shows error", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.getByLabel(/Email/i).fill("nobody@example.com");
    await page.getByLabel(/Password/i).fill("wrong-password");
    await page.getByRole("button", { name: /Sign in/i }).click();

    // Expect an error alert (Supabase returns "Invalid login credentials")
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
  });

  test("admin login page is not indexed (robots noindex)", async ({
    page,
  }) => {
    const response = await page.goto("/admin/login");
    const robotsMeta = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(response?.status()).toBeLessThan(400);
    expect(robotsMeta).toContain("noindex");
  });
});
