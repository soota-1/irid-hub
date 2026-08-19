import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MembershipFormPage } from "./MembershipFormPage";

vi.mock("./MembershipSuccessScene", () => ({
  // Isolate form-validation behavior from the R3F/WebGL success accent,
  // which jsdom can't render anyway.
  MembershipSuccessScene: () => null,
}));

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MembershipFormPage />
    </QueryClientProvider>,
  );
}

describe("MembershipFormPage", () => {
  it("shows validation errors and does not submit when required fields are invalid", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    renderPage();

    await user.click(screen.getByRole("button", { name: /kirim pendaftaran/i }));

    expect(await screen.findByText(/nama minimal 2 karakter/i)).toBeInTheDocument();
    expect(await screen.findByText(/format email tidak valid/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits the application and shows the success state on a valid submission", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "app-1", full_name: "Sari Lestari", email: "sari@example.com", phone: "08123456789", status: "pending" },
        meta: null,
        error: null,
      }),
    }) as unknown as typeof fetch;

    renderPage();

    await user.type(screen.getByLabelText(/nama lengkap/i), "Sari Lestari");
    await user.type(screen.getByLabelText(/^email$/i), "sari@example.com");
    await user.type(screen.getByLabelText(/nomor telepon/i), "08123456789");
    await user.click(screen.getByRole("button", { name: /kirim pendaftaran/i }));

    await waitFor(() => expect(screen.getByText(/pendaftaran terkirim/i)).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/membership-applications"),
      expect.objectContaining({ method: "POST" }),
    );
  });
});
