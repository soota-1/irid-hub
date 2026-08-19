import { useState } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable, type AdminDataTableColumn } from "@/shared/components";
import { EVENT_CATEGORY_META } from "@/shared/lib/eventCategory";
import type { EventDTO } from "@/shared/types/api";
import { useEventsAdmin, useDeleteEvent } from "../api/useEventsAdmin";
import { EventForm } from "./EventForm";

export function EventsAdminPage() {
  const { data, isLoading } = useEventsAdmin();
  const deleteEvent = useDeleteEvent();
  const [editing, setEditing] = useState<EventDTO | null | undefined>(undefined);

  const columns: AdminDataTableColumn<EventDTO>[] = [
    { key: "title", header: "Judul", render: (e) => <span className="font-medium">{e.title}</span> },
    {
      key: "category",
      header: "Kategori",
      render: (e) => <span className={EVENT_CATEGORY_META[e.category].textClass}>{EVENT_CATEGORY_META[e.category].label}</span>,
    },
    { key: "start_at", header: "Tanggal", render: (e) => format(new Date(e.start_at), "d MMM yyyy HH:mm") },
    {
      key: "is_public",
      header: "Visibilitas",
      render: (e) => <Badge variant={e.is_public ? "success" : "default"}>{e.is_public ? "Publik" : "Privat"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(e)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Hapus"
            onClick={() => {
              if (!window.confirm(`Hapus event "${e.title}"?`)) return;
              deleteEvent.mutate(e.id, {
                onSuccess: () => toast.success("Event dihapus"),
                onError: () => toast.error("Gagal menghapus event"),
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
        <h1 className="font-display text-h2">Events</h1>
        <Button variant="gradient" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Event Baru
        </Button>
      </div>

      <div className="mt-6">
        <AdminDataTable columns={columns} rows={data ?? []} rowKey={(e) => e.id} isLoading={isLoading} />
      </div>

      <EventForm event={editing ?? null} open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)} />
    </div>
  );
}
