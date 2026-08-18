import { test, expect } from "@playwright/test";

const envelope = (data: unknown, extra: Record<string, unknown> = {}) => ({
  success: true,
  data,
  meta: null,
  error: null,
  ...extra,
});

test.describe("Membership application form", () => {
  test("submitting a valid application shows the success state", async ({ page }) => {
    await page.route("**/api/v1/membership-applications", async (route) => {
      expect(route.request().method()).toBe("POST");
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(envelope({ id: "app_e2e_1", status: "pending" })),
      });
    });

    await page.goto("/gabung");
    await page.getByLabel(/nama lengkap/i).fill("Dewi Lestari");
    await page.getByLabel(/^email$/i).fill("dewi@example.com");
    await page.getByLabel(/nomor telepon/i).fill("081298765432");
    await page.getByRole("button", { name: /kirim pendaftaran/i }).click();

    await expect(page.getByText(/pendaftaran terkirim/i)).toBeVisible();
  });

  test("shows client-side validation errors before hitting the API", async ({ page }) => {
    let apiCalled = false;
    await page.route("**/api/v1/membership-applications", async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, body: "{}" });
    });

    await page.goto("/gabung");
    await page.getByRole("button", { name: /kirim pendaftaran/i }).click();

    await expect(page.getByText(/nama minimal 2 karakter/i)).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test("surfaces a duplicate-email conflict from the API", async ({ page }) => {
    await page.route("**/api/v1/membership-applications", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          data: null,
          meta: null,
          error: { code: "CONFLICT", message: "Sudah ada pendaftaran pending untuk email ini" },
        }),
      });
    });

    await page.goto("/gabung");
    await page.getByLabel(/nama lengkap/i).fill("Dewi Lestari");
    await page.getByLabel(/^email$/i).fill("dewi@example.com");
    await page.getByLabel(/nomor telepon/i).fill("081298765432");
    await page.getByRole("button", { name: /kirim pendaftaran/i }).click();

    await expect(page.getByText(/sudah ada pendaftaran pending/i)).toBeVisible();
  });
});
