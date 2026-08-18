import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface AdminDataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

/**
 * High-density admin table — neutral-dominant, color reserved for accents
 * only (status badges, primary actions) so it stays efficient to scan for
 * long admin sessions. Design.md §7.5.
 */
export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "Belum ada data.",
  isLoading,
}: AdminDataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col) => (
              <th key={col.key} className={cn("text-left font-medium text-surface-muted px-4 py-3", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-200 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 w-full max-w-32 rounded bg-neutral-200/70 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-surface-muted">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-neutral-200 last:border-0 hover:bg-neutral-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-surface", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminStatusBadge({ tone, children }: { tone: "neutral" | "warning" | "success" | "danger"; children: ReactNode }) {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "bg-neutral-200 text-surface-muted",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", toneClasses[tone])}>
      {children}
    </span>
  );
}
