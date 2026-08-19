import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRsvpEvent } from "./useEvents";

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ getToken: async () => "fake-jwt" }),
}));

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useRsvpEvent", () => {
  it("POSTs the chosen status with the Clerk bearer token attached", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "rsvp-1", event_id: "evt-1", user_id: "user-1", status: "going", responded_at: "2026-08-19T00:00:00Z" },
        meta: null,
        error: null,
      }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useRsvpEvent("evt-1"), { wrapper });

    result.current.mutate("going");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/events/evt-1/rsvp"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ status: "going" }),
        headers: expect.objectContaining({ Authorization: "Bearer fake-jwt" }),
      }),
    );
  });

  it("surfaces a rejected mutation when the API call fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ success: false, data: null, meta: null, error: { code: "UNAUTHORIZED", message: "Sign in required" } }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useRsvpEvent("evt-1"), { wrapper });

    result.current.mutate("going");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ code: "UNAUTHORIZED" });
  });
});
