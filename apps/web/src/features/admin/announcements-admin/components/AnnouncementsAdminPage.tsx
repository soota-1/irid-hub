import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable, type AdminDataTableColumn } from "@/shared/components";
import type { AnnouncementDTO } from "@/shared/types/api";
import { useAnnouncementsAdmin, useDeleteAnnouncement } from "../api/useAnnouncementsAdmin";
import { AnnouncementForm } from "./AnnouncementForm";

export function AnnouncementsAdminPage() {
  const { data, isLoading } = useAnnouncementsAdmin();
  const deleteAnnouncement = useDeleteAnnouncement();
  const [editing, setEditing] = useState<AnnouncementDTO | null | undefined>(undefined);

  const columns: AdminDataTableColumn<AnnouncementDTO>[] = [
    { key: "title", header: "Judul", render: (a) => <span className="font-medium">{a.title}</span> },
    { key: "urgency", header: "Urgensi", render: (a) => a.urgency },
    { key: "visibility", header: "Visibilitas", render: (a) => (a.visibility === "public" ? "Publik" : "Member") },
    {
      key: "status",
      header: "Status",
      render: (a) => <Badge variant={a.published_at ? "success" : "default"}>{a.published_at ? "Terbit" : "Draft"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(a)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Hapus"
            onClick={() => {
              if (!window.confirm(`Hapus pengumuman "${a.title}"?`)) return;
              deleteAnnouncement.mutate(a.id, {
                onSuccess: () => toast.success("Pengumuman dihapus"),
                onError: () => toast.error("Gagal menghapus pengumuman"),
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
        <h1 className="font-display text-h2">Pengumuman</h1>
        <Button variant="gradient" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Pengumuman Baru
        </Button>
      </div>
      <div className="mt-6">
        <AdminDataTable columns={columns} rows={data ?? []} rowKey={(a) => a.id} isLoading={isLoading} />
      </div>
      <AnnouncementForm announcement={editing ?? null} open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)} />
    </div>
  );
}
