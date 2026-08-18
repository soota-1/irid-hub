import { test, expect } from "@playwright/test";

test.describe("Auth gating (login flow)", () => {
  test("visiting /admin while logged out redirects to /sign-in", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("visiting /akun (member profile) while logged out redirects to /sign-in", async ({ page }) => {
    await page.goto("/akun");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("the sign-in page renders Clerk's sign-in form", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByText(/sign in to iridescent hub/i)).toBeVisible();
  });
});
