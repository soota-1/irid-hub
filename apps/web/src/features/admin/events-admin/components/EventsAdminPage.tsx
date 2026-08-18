import { useState } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminDataTable, AdminAccessDenied, Button, Modal } from "@/shared/components";
import { ApiClientError } from "@/shared/lib/apiClient";
import { useEventsAdmin, useEventMutations, type EventFormValues } from "../api/useEventsAdmin";
import { EventForm } from "./EventForm";
import type { EventItem } from "@/features/events";

export function EventsAdminPage() {
  const { data, isPending, isError, error } = useEventsAdmin();
  const { create, update, remove } = useEventMutations();
  const [editing, setEditing] = useState<EventItem | null | "new">(null);

  if (isError && error instanceof ApiClientError && error.status === 403) return <AdminAccessDenied />;

  const events = data?.data ?? [];

  function handleSubmit(values: EventFormValues) {
    if (editing === "new") {
      create.mutate(values, { onSuccess: () => setEditing(null) });
    } else if (editing) {
      update.mutate({ id: editing.id!, values }, { onSuccess: () => setEditing(null) });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h2">Event</h1>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={16} className="mr-1.5" /> Tambah Event
        </Button>
      </div>

      <AdminDataTable
        isLoading={isPending}
        rows={events}
        rowKey={(e) => e.id!}
        columns={[
          { key: "title", header: "Judul", render: (e) => e.title },
          { key: "category", header: "Kategori", render: (e) => e.category },
          {
            key: "start_at",
            header: "Waktu",
            render: (e) => (e.start_at ? format(new Date(e.start_at), "d MMM yyyy HH:mm") : "-"),
          },
          { key: "visibility", header: "Visibilitas", render: (e) => (e.is_public ? "Publik" : "Privat") },
          {
            key: "actions",
            header: "",
            render: (e) => (
              <div className="flex gap-1 justify-end">
                <button onClick={() => setEditing(e)} aria-label="Edit" className="p-1.5 hover:text-iri-violet">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus event "${e.title}"?`)) remove.mutate(e.id!);
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

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Tambah Event" : "Edit Event"}>
        <EventForm
          initial={editing !== "new" ? (editing ?? undefined) : undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>
    </div>
  );
}
