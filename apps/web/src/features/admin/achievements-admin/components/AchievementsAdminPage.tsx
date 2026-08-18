import { useState } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAchievements } from "@/features/achievements";
import type { Achievement } from "@/features/achievements";
import { AdminDataTable, Button, Modal } from "@/shared/components";
import { useAchievementMutations, type AchievementFormValues } from "../api/useAchievementsAdmin";
import { AchievementForm } from "./AchievementForm";

export function AchievementsAdminPage() {
  const { data, isPending } = useAchievements();
  const { create, update, remove } = useAchievementMutations();
  const [editing, setEditing] = useState<Achievement | null | "new">(null);

  const achievements = data?.data ?? [];

  function handleSubmit(values: AchievementFormValues) {
    if (editing === "new") create.mutate(values, { onSuccess: () => setEditing(null) });
    else if (editing) update.mutate({ id: editing.id!, values }, { onSuccess: () => setEditing(null) });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h2">Prestasi</h1>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={16} className="mr-1.5" /> Tambah Prestasi
        </Button>
      </div>

      <AdminDataTable
        isLoading={isPending}
        rows={achievements}
        rowKey={(a) => a.id!}
        columns={[
          { key: "title", header: "Judul", render: (a) => a.title },
          {
            key: "achieved_at",
            header: "Tanggal",
            render: (a) => (a.achieved_at ? format(new Date(a.achieved_at), "d MMM yyyy") : "-"),
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
                    if (confirm(`Hapus prestasi "${a.title}"?`)) remove.mutate(a.id!);
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
        title={editing === "new" ? "Tambah Prestasi" : "Edit Prestasi"}
      >
        <AchievementForm
          initial={editing !== "new" ? (editing ?? undefined) : undefined}
          onSubmit={handleSubmit}
          submitting={create.isPending || update.isPending}
        />
      </Modal>
    </div>
  );
}
