import { test, expect } from "@playwright/test";

const envelope = (data: unknown, meta: unknown = null) => ({ success: true, data, meta, error: null });

const sampleEvent = {
  id: "evt_e2e_1",
  community_id: "com_1",
  title: "Latihan Rutin Selasa",
  description: "Latihan mingguan di studio utama.",
  category: "training",
  location: "Studio A",
  start_at: "2026-09-01T18:00:00Z",
  end_at: "2026-09-01T20:00:00Z",
  cover_image_url: null,
  is_public: true,
  created_by: "usr_1",
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

test.describe("Events browsing + RSVP gating", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/events**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(envelope([sampleEvent], { page: 1, per_page: 20, total: 1 })),
      });
    });
  });

  test("lists events fetched from the API", async ({ page }) => {
    await page.goto("/events");

    await expect(page.getByText("Latihan Rutin Selasa")).toBeVisible();
  });

  test("opening an event's detail panel prompts sign-in to RSVP when logged out", async ({ page }) => {
    await page.goto("/events");

    await page.getByText("Latihan Rutin Selasa").click();

    await expect(page.getByRole("dialog", { name: "Latihan Rutin Selasa" })).toBeVisible();
    await expect(page.getByText(/masuk sebagai member untuk konfirmasi kehadiran/i)).toBeVisible();
  });
});
