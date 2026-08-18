import { useForm } from "react-hook-form";
import { Button } from "@/shared/components";
import { inputClass } from "@/shared/lib/formStyles";
import type { EventFormValues } from "../api/useEventsAdmin";
import type { EventItem } from "@/features/events";

const categories = [
  { value: "training", label: "Latihan" },
  { value: "competition", label: "Kompetisi" },
  { value: "social", label: "Acara Sosial" },
  { value: "other", label: "Lainnya" },
];

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function EventForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: EventItem;
  onSubmit: (values: EventFormValues) => void;
  submitting: boolean;
}) {
  const { register, handleSubmit } = useForm<EventFormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "training",
      location: initial?.location ?? "",
      start_at: toDatetimeLocal(initial?.start_at),
      end_at: toDatetimeLocal(initial?.end_at),
      cover_image_url: initial?.cover_image_url ?? "",
      is_public: initial?.is_public ?? true,
    },
  });

  function submit(values: EventFormValues) {
    onSubmit({
      ...values,
      start_at: new Date(values.start_at).toISOString(),
      end_at: new Date(values.end_at).toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Field label="Judul">
        <input {...register("title", { required: true })} className={inputClass} />
      </Field>
      <Field label="Deskripsi">
        <textarea {...register("description")} rows={3} className={`${inputClass} resize-none`} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Kategori">
          <select {...register("category")} className={inputClass}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Lokasi">
          <input {...register("location")} className={inputClass} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Mulai">
          <input type="datetime-local" {...register("start_at", { required: true })} className={inputClass} />
        </Field>
        <Field label="Selesai">
          <input type="datetime-local" {...register("end_at", { required: true })} className={inputClass} />
        </Field>
      </div>
      <Field label="URL Gambar Sampul (opsional)">
        <input {...register("cover_image_url")} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("is_public")} className="rounded border-neutral-200" />
        Tampilkan di kalender publik
      </label>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
