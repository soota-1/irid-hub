import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminDataTable, AdminAccessDenied, AdminStatusBadge, Button, Modal } from "@/shared/components";
import { ApiClientError } from "@/shared/lib/apiClient";
import type { Announcement } from "@/features/announcements";
import { useAnnouncementsAdmin, useAnnouncementMutations, type AnnouncementFormValues } from "../api/useAnnouncementsAdmin";
import { AnnouncementForm } from "./AnnouncementForm";

export function AnnouncementsAdminPage() {
  const { data, isPending, isError, error } = useAnnouncementsAdmin();
  const { create, update, remove } = useAnnouncementMutations();
  const [editing, setEditing] = useState<Announcement | null | "new">(null);

  if (isError && error instanceof ApiClientError && error.status === 403) return <AdminAccessDenied />;

  const announcements = data?.data ?? [];

  function handleSubmit(values: AnnouncementFormValues) {
    if (editing === "new") create.mutate(values, { onSuccess: () => setEditing(null) });
    else if (editing) update.mutate({ id: editing.id!, values }, { onSuccess: () => setEditing(null) });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h2">Pengumuman</h1>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={16} className="mr-1.5" /> Tambah Pengumuman
        </Button>
      </div>

      <AdminDataTable
        isLoading={isPending}
        rows={announcements}
        rowKey={(a) => a.id!}
        columns={[
          { key: "title", header: "Judul", render: (a) => a.title },
          { key: "urgency", header: "Urgensi", render: (a) => a.urgency },
          { key: "visibility", header: "Visibilitas", render: (a) => (a.visibility === "public" ? "Publik" : "Member") },
          {
            key: "status",
            header: "Status",
            render: (a) => (
              <AdminStatusBadge tone={a.published_at ? "success" : "neutral"}>
                {a.published_at ? "Published" : "Draft"}
              </AdminStatusBadge>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (a) => (
              <div className="flex gap-1 justify-end">
                <button onClick={() => setEditing(a)} aria-label="Edit" className="p-1.5 hover:text-iri-violet">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus pengumuman "${a.title}"?`)) remove.mutate(a.id!);
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

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Tambah Pengumuman" : "Edit Pengumuman"}
      >
        <AnnouncementForm
          initial={editing !== "new" ? (editing ?? undefined) : undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>
    </div>
  );
}
