import { test, expect } from "@playwright/test";

/** Critical flow #2 (Architecture.md §10): RSVP to an event. Needs a real
 * signed-in Clerk session, so it reads test credentials from env vars and
 * skips itself when they're not configured (e.g. local dev without a
 * Clerk test user) rather than failing CI on missing secrets. */
const TEST_EMAIL = process.env.E2E_MEMBER_EMAIL;
const TEST_PASSWORD = process.env.E2E_MEMBER_PASSWORD;

test.describe("Event RSVP", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "E2E_MEMBER_EMAIL / E2E_MEMBER_PASSWORD not configured");

  test("member can sign in and RSVP to an upcoming event", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).first().fill(TEST_EMAIL!);
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByLabel(/password/i).fill(TEST_PASSWORD!);
    await page.getByRole("button", { name: /continue/i }).click();

    await page.goto("/events");
    await page.getByRole("button").first().click(); // open the first event card's detail panel

    await page.getByRole("button", { name: /^hadir$/i }).click();
    await expect(page.getByText(/rsvp tersimpan/i)).toBeVisible({ timeout: 10_000 });
  });
});
