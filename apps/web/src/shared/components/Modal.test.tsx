import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Tambah Event">
        <p>Isi modal</p>
      </Modal>,
    );

    expect(screen.queryByText("Isi modal")).not.toBeInTheDocument();
  });

  it("renders its content and title when open", () => {
    render(
      <Modal open onClose={vi.fn()} title="Tambah Event">
        <p>Isi modal</p>
      </Modal>,
    );

    expect(screen.getByText("Isi modal")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Tambah Event" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Tambah Event">
        <p>Isi modal</p>
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: /tutup/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Tambah Event">
        <p>Isi modal</p>
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });
});
