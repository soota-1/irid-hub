import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminDataTable, AdminAccessDenied, AdminStatusBadge, Button, Modal } from "@/shared/components";
import { ApiClientError } from "@/shared/lib/apiClient";
import { dayLabels, type TrainingSchedule } from "@/features/schedules";
import { useSchedulesAdmin, useScheduleMutations, type ScheduleFormValues } from "../api/useSchedulesAdmin";
import { ScheduleForm } from "./ScheduleForm";

export function SchedulesAdminPage() {
  const { data: schedules, isPending, isError, error } = useSchedulesAdmin();
  const { create, update, remove } = useScheduleMutations();
  const [editing, setEditing] = useState<TrainingSchedule | null | "new">(null);

  if (isError && error instanceof ApiClientError && error.status === 403) return <AdminAccessDenied />;

  function handleSubmit(values: ScheduleFormValues) {
    if (editing === "new") create.mutate(values, { onSuccess: () => setEditing(null) });
    else if (editing) update.mutate({ id: editing.id!, values }, { onSuccess: () => setEditing(null) });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h2">Jadwal Latihan</h1>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={16} className="mr-1.5" /> Tambah Jadwal
        </Button>
      </div>

      <AdminDataTable
        isLoading={isPending}
        rows={schedules ?? []}
        rowKey={(s) => s.id!}
        columns={[
          { key: "title", header: "Judul", render: (s) => s.title },
          { key: "day", header: "Hari", render: (s) => dayLabels[s.day_of_week ?? 0] },
          { key: "time", header: "Jam", render: (s) => `${s.start_time?.slice(0, 5)}–${s.end_time?.slice(0, 5)}` },
          {
            key: "status",
            header: "Status",
            render: (s) => <AdminStatusBadge tone={s.is_active ? "success" : "neutral"}>{s.is_active ? "Aktif" : "Nonaktif"}</AdminStatusBadge>,
          },
          {
            key: "actions",
            header: "",
            render: (s) => (
              <div className="flex gap-1 justify-end">
                <button onClick={() => setEditing(s)} aria-label="Edit" className="p-1.5 hover:text-iri-violet">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus jadwal "${s.title}"?`)) remove.mutate(s.id!);
                  }}
                  aria-label="Hapus"
                  className="p-1.5 hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
            className: "text-right",
          },
        ]}
      />

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Tambah Jadwal" : "Edit Jadwal"}>
        <ScheduleForm
          initial={editing !== "new" ? (editing ?? undefined) : undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>
    </div>
  );
}
