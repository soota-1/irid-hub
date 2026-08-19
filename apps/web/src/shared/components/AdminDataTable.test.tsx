import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminDataTable, type AdminDataTableColumn } from "./AdminDataTable";

interface Row {
  id: string;
  name: string;
}

const columns: AdminDataTableColumn<Row>[] = [
  { key: "name", header: "Nama", render: (row) => row.name },
];

describe("AdminDataTable", () => {
  it("renders skeleton rows while loading, not the empty message", () => {
    render(<AdminDataTable columns={columns} rows={[]} rowKey={(r) => r.id} isLoading emptyMessage="Kosong" />);
    expect(screen.queryByText("Kosong")).not.toBeInTheDocument();
  });

  it("shows the empty message when not loading and there are no rows", () => {
    render(<AdminDataTable columns={columns} rows={[]} rowKey={(r) => r.id} emptyMessage="Belum ada data." />);
    expect(screen.getByText("Belum ada data.")).toBeInTheDocument();
  });

  it("renders each row via the column's render function", () => {
    render(
      <AdminDataTable
        columns={columns}
        rows={[{ id: "1", name: "Latihan Rutin Selasa" }, { id: "2", name: "Cypher Night" }]}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText("Latihan Rutin Selasa")).toBeInTheDocument();
    expect(screen.getByText("Cypher Night")).toBeInTheDocument();
  });
});
