import { test, expect } from "@playwright/test";

/** Critical flow #3 (Architecture.md §10): auth gating. Anonymous visitors
 * must be redirected away from member/admin-only routes rather than seeing
 * their content or a broken page. */
test.describe("Auth gating", () => {
  test("redirects anonymous visitors from /akun to sign-in", async ({ page }) => {
    await page.goto("/akun");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("redirects anonymous visitors from /admin to sign-in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("public pages remain reachable without signing in", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /move\./i })).toBeVisible();

    await page.goto("/events");
    await expect(page.getByRole("heading", { name: /kalender & event/i })).toBeVisible();
  });
});
