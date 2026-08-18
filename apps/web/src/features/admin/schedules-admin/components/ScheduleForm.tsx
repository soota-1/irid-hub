import { useForm } from "react-hook-form";
import { Button } from "@/shared/components";
import { inputClass } from "@/shared/lib/formStyles";
import { dayLabels, type TrainingSchedule } from "@/features/schedules";
import type { ScheduleFormValues } from "../api/useSchedulesAdmin";

export function ScheduleForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: TrainingSchedule;
  onSubmit: (values: ScheduleFormValues) => void;
  submitting: boolean;
}) {
  const { register, handleSubmit } = useForm<ScheduleFormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      day_of_week: initial?.day_of_week ?? 1,
      start_time: initial?.start_time?.slice(0, 5) ?? "18:00",
      end_time: initial?.end_time?.slice(0, 5) ?? "20:00",
      location: initial?.location ?? "",
      is_active: initial?.is_active ?? true,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit({ ...v, start_time: `${v.start_time}:00`, end_time: `${v.end_time}:00` }))}
      className="space-y-4"
    >
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Judul</span>
        <input {...register("title", { required: true })} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Hari</span>
        <select {...register("day_of_week")} className={inputClass}>
          {dayLabels.map((label, i) => (
            <option key={i} value={i}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Mulai</span>
          <input type="time" {...register("start_time", { required: true })} className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1.5">Selesai</span>
          <input type="time" {...register("end_time", { required: true })} className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">Lokasi</span>
        <input {...register("location")} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("is_active")} className="rounded border-neutral-200" />
        Aktif
      </label>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
