import { useForm } from "react-hook-form";
import { Button } from "@/shared/components";
import { inputClass } from "@/shared/lib/formStyles";
import type { Achievement } from "@/features/achievements";
import type { AchievementFormValues } from "../api/useAchievementsAdmin";

export function AchievementForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Achievement;
  onSubmit: (values: AchievementFormValues) => void;
  submitting: boolean;
}) {
  const { register, handleSubmit } = useForm<AchievementFormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      achieved_at: initial?.achieved_at?.slice(0, 10) ?? "",
      icon_or_badge_url: initial?.icon_or_badge_url ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Judul</span>
        <input {...register("title", { required: true })} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Deskripsi</span>
        <textarea {...register("description")} rows={3} className={`${inputClass} resize-none`} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Tanggal Dicapai</span>
        <input type="date" {...register("achieved_at", { required: true })} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">URL Ikon/Badge (opsional)</span>
        <input {...register("icon_or_badge_url")} className={inputClass} />
      </label>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
