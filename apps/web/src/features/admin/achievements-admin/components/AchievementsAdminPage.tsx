import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminDataTable, type AdminDataTableColumn } from "@/shared/components";
import type { AchievementDTO } from "@/shared/types/api";
import { useAchievementsAdmin, useDeleteAchievement } from "../api/useAchievementsAdmin";
import { AchievementForm } from "./AchievementForm";

export function AchievementsAdminPage() {
  const { data, isLoading } = useAchievementsAdmin();
  const deleteAchievement = useDeleteAchievement();
  const [editing, setEditing] = useState<AchievementDTO | null | undefined>(undefined);

  const columns: AdminDataTableColumn<AchievementDTO>[] = [
    { key: "title", header: "Judul", render: (a) => <span className="font-medium">{a.title}</span> },
    { key: "achieved_at", header: "Tanggal", render: (a) => a.achieved_at?.slice(0, 10) ?? "-" },
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
              if (!window.confirm(`Hapus prestasi "${a.title}"?`)) return;
              deleteAchievement.mutate(a.id, {
                onSuccess: () => toast.success("Prestasi dihapus"),
                onError: () => toast.error("Gagal menghapus prestasi"),
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
        <h1 className="font-display text-h2">Prestasi</h1>
        <Button variant="gradient" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Prestasi Baru
        </Button>
      </div>
      <div className="mt-6">
        <AdminDataTable columns={columns} rows={data ?? []} rowKey={(a) => a.id} isLoading={isLoading} />
      </div>
      <AchievementForm achievement={editing ?? null} open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)} />
    </div>
  );
}
