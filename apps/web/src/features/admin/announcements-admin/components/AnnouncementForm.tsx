import { useForm } from "react-hook-form";
import { Button } from "@/shared/components";
import { inputClass } from "@/shared/lib/formStyles";
import type { Announcement } from "@/features/announcements";
import type { AnnouncementFormValues } from "../api/useAnnouncementsAdmin";

export function AnnouncementForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Announcement;
  onSubmit: (values: AnnouncementFormValues) => void;
  submitting: boolean;
}) {
  const { register, handleSubmit } = useForm<AnnouncementFormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      content: initial?.content ?? "",
      urgency: initial?.urgency ?? "info",
      visibility: initial?.visibility ?? "public",
      published: !!initial?.published_at,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Judul</span>
        <input {...register("title", { required: true })} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Isi</span>
        <textarea {...register("content", { required: true })} rows={4} className={`${inputClass} resize-none`} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Urgensi</span>
          <select {...register("urgency")} className={inputClass}>
            <option value="info">Info</option>
            <option value="warning">Perhatian</option>
            <option value="important">Penting</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Visibilitas</span>
          <select {...register("visibility")} className={inputClass}>
            <option value="public">Publik</option>
            <option value="members_only">Khusus Member</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("published")} className="rounded border-neutral-200" />
        Publish sekarang (kalau tidak dicentang, tersimpan sebagai draft)
      </label>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
