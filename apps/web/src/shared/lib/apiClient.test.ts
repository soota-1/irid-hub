import { describe, expect, it, vi, afterEach } from "vitest";
import { apiRequest, ApiError } from "./apiClient";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockFetchOnce(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe("apiRequest", () => {
  it("unwraps data + meta from a successful envelope", async () => {
    mockFetchOnce({ success: true, data: [{ id: "1" }], meta: { page: 1, per_page: 20, total: 1 }, error: null });

    const result = await apiRequest<{ id: string }[]>("/events");

    expect(result.data).toEqual([{ id: "1" }]);
    expect(result.meta).toEqual({ page: 1, per_page: 20, total: 1 });
  });

  it("throws ApiError with the envelope's error body when success is false", async () => {
    mockFetchOnce(
      { success: false, data: null, meta: null, error: { code: "VALIDATION_ERROR", message: "Field invalid", fields: { email: "bad" } } },
      422,
    );

    await expect(apiRequest("/membership-applications", { method: "POST", body: {} })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Field invalid",
    });
  });

  it("throws a plain ApiError instance so callers can narrow on it", async () => {
    mockFetchOnce({ success: false, data: null, meta: null, error: { code: "FORBIDDEN", message: "nope" } }, 403);

    try {
      await apiRequest("/admin/dashboard/summary");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("FORBIDDEN");
    }
  });

  it("returns undefined data for 204 No Content without parsing a body", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 204, ok: true, json: async () => { throw new Error("should not be called"); } }) as unknown as typeof fetch;

    const result = await apiRequest("/schedules/abc");
    expect(result.data).toBeUndefined();
  });
});
