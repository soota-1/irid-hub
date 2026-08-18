import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MembershipFormPage } from "./MembershipFormPage";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MembershipFormPage />
    </QueryClientProvider>,
  );
}

describe("MembershipFormPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows validation errors and does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    renderPage();

    await user.click(screen.getByRole("button", { name: /kirim pendaftaran/i }));

    expect(await screen.findByText(/nama minimal 2 karakter/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits and shows the success state on a valid submission", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "app_1", status: "pending" },
        meta: null,
        error: null,
      }),
    });
    renderPage();

    await user.type(screen.getByLabelText(/nama lengkap/i), "Budi Santoso");
    await user.type(screen.getByLabelText(/^email$/i), "budi@example.com");
    await user.type(screen.getByLabelText(/nomor telepon/i), "081234567890");
    await user.click(screen.getByRole("button", { name: /kirim pendaftaran/i }));

    await waitFor(() => expect(screen.getByText(/pendaftaran terkirim/i)).toBeInTheDocument());
  });

  it("surfaces field errors returned by the API (e.g. duplicate email conflict)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      status: 409,
      ok: false,
      json: async () => ({
        success: false,
        data: null,
        meta: null,
        error: { code: "CONFLICT", message: "Sudah ada pendaftaran pending untuk email ini" },
      }),
    });
    renderPage();

    await user.type(screen.getByLabelText(/nama lengkap/i), "Budi Santoso");
    await user.type(screen.getByLabelText(/^email$/i), "budi@example.com");
    await user.type(screen.getByLabelText(/nomor telepon/i), "081234567890");
    await user.click(screen.getByRole("button", { name: /kirim pendaftaran/i }));

    expect(await screen.findByText(/sudah ada pendaftaran pending/i)).toBeInTheDocument();
  });
});
