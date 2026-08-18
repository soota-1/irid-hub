import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, ApiClientError } from "./apiClient";

function mockFetchResponse(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  });
}

describe("apiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns data and meta when the envelope reports success", async () => {
    global.fetch = mockFetchResponse({
      success: true,
      data: { id: "1", title: "Latihan" },
      meta: { page: 1, per_page: 20, total: 1 },
      error: null,
    });

    const result = await apiClient.get<{ id: string; title: string }>("/events/1");

    expect(result.data).toEqual({ id: "1", title: "Latihan" });
    expect(result.meta).toEqual({ page: 1, per_page: 20, total: 1 });
  });

  it("throws ApiClientError with the envelope's code/message when success is false", async () => {
    global.fetch = mockFetchResponse(
      {
        success: false,
        data: null,
        meta: null,
        error: { code: "VALIDATION_ERROR", message: "Field tidak valid", fields: { email: "wajib diisi" } },
      },
      422,
    );

    await expect(apiClient.post("/membership-applications", {})).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION_ERROR",
      fields: { email: "wajib diisi" },
    });
  });

  it("is an instance of ApiClientError so callers can narrow with instanceof", async () => {
    global.fetch = mockFetchResponse(
      { success: false, data: null, meta: null, error: { code: "NOT_FOUND", message: "Tidak ditemukan" } },
      404,
    );

    try {
      await apiClient.get("/events/missing");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
    }
  });

  it("returns undefined data for 204 No Content responses without parsing a body", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 204, ok: true, json: async () => { throw new Error("should not be called"); } });

    const result = await apiClient.delete("/events/1");

    expect(result.data).toBeUndefined();
  });
});
