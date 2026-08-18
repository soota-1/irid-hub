import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminDataTable } from "./AdminDataTable";

interface Row {
  id: string;
  name: string;
}

const columns = [{ key: "name", header: "Nama", render: (row: Row) => row.name }];

describe("AdminDataTable", () => {
  it("shows the empty message when there are no rows and it isn't loading", () => {
    render(<AdminDataTable columns={columns} rows={[]} rowKey={(r: Row) => r.id} emptyMessage="Tidak ada data." />);

    expect(screen.getByText("Tidak ada data.")).toBeInTheDocument();
  });

  it("renders one row per item using the provided column render function", () => {
    const rows: Row[] = [{ id: "1", name: "Budi" }, { id: "2", name: "Sari" }];
    render(<AdminDataTable columns={columns} rows={rows} rowKey={(r) => r.id} />);

    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Sari")).toBeInTheDocument();
  });

  it("does not show the empty message while isLoading is true, even with zero rows", () => {
    render(<AdminDataTable columns={columns} rows={[]} rowKey={(r: Row) => r.id} emptyMessage="Tidak ada data." isLoading />);

    expect(screen.queryByText("Tidak ada data.")).not.toBeInTheDocument();
  });
});
