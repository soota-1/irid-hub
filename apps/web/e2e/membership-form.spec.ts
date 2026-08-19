import { test, expect } from "@playwright/test";

/** Critical flow #1 (Architecture.md §10): submit the public membership
 * application form. Requires apps/api running against a seeded community
 * at VITE_API_BASE_URL — this spec doesn't mock the network. */
test.describe("Membership application form", () => {
  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/gabung");
    await page.getByRole("button", { name: /kirim pendaftaran/i }).click();

    await expect(page.getByText(/nama minimal 2 karakter/i)).toBeVisible();
    await expect(page.getByText(/format email tidak valid/i)).toBeVisible();
  });

  test("submits successfully and shows the confetti success state", async ({ page }) => {
    await page.goto("/gabung");

    await page.getByLabel(/nama lengkap/i).fill("Dian Prasetyo");
    await page.getByLabel(/^email$/i).fill(`dian.${Date.now()}@example.com`);
    await page.getByLabel(/nomor telepon/i).fill("081234567890");
    await page.getByLabel(/kenapa mau gabung/i).fill("Ingin belajar hip-hop dari nol.");

    await page.getByRole("button", { name: /kirim pendaftaran/i }).click();

    await expect(page.getByRole("heading", { name: /pendaftaran terkirim/i })).toBeVisible({ timeout: 10_000 });
  });
});
