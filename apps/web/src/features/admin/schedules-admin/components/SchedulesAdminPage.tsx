import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable, type AdminDataTableColumn } from "@/shared/components";
import { DAY_NAMES, type TrainingScheduleDTO } from "../../../schedules/types";
import { useSchedulesAdmin, useDeleteSchedule } from "../api/useSchedulesAdmin";
import { ScheduleForm } from "./ScheduleForm";

export function SchedulesAdminPage() {
  const { data, isLoading } = useSchedulesAdmin();
  const deleteSchedule = useDeleteSchedule();
  const [editing, setEditing] = useState<TrainingScheduleDTO | null | undefined>(undefined);

  const columns: AdminDataTableColumn<TrainingScheduleDTO>[] = [
    { key: "title", header: "Judul", render: (s) => <span className="font-medium">{s.title}</span> },
    { key: "day", header: "Hari", render: (s) => DAY_NAMES[s.day_of_week] },
    { key: "time", header: "Waktu", render: (s) => `${s.start_time} – ${s.end_time}` },
    { key: "location", header: "Lokasi", render: (s) => s.location ?? "-" },
    {
      key: "is_active",
      header: "Status",
      render: (s) => <Badge variant={s.is_active ? "success" : "default"}>{s.is_active ? "Aktif" : "Nonaktif"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(s)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Hapus"
            onClick={() => {
              if (!window.confirm(`Hapus jadwal "${s.title}"?`)) return;
              deleteSchedule.mutate(s.id, {
                onSuccess: () => toast.success("Jadwal dihapus"),
                onError: () => toast.error("Gagal menghapus jadwal"),
              });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2">Jadwal Latihan</h1>
        <Button variant="gradient" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Jadwal Baru
        </Button>
      </div>
      <div className="mt-6">
        <AdminDataTable columns={columns} rows={data ?? []} rowKey={(s) => s.id} isLoading={isLoading} />
      </div>
      <ScheduleForm schedule={editing ?? null} open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)} />
    </div>
  );
}
