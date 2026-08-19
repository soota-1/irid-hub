import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_CATEGORY_OPTIONS } from "@/shared/lib/eventCategory";
import { useCreateEvent, useUpdateEvent, type UpsertEventInput } from "../api/useEventsAdmin";
import type { EventDTO } from "@/shared/types/api";

const schema = z.object({
  title: z.string().min(2, "Judul wajib diisi"),
  description: z.string().optional(),
  category: z.enum(["training", "competition", "social", "other"]),
  location: z.string().optional(),
  start_at: z.string().min(1, "Wajib diisi"),
  end_at: z.string().min(1, "Wajib diisi"),
  cover_image_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
  is_public: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

interface EventFormProps {
  event: EventDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventForm({ event, open, onOpenChange }: EventFormProps) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: event
      ? {
          title: event.title,
          description: event.description ?? "",
          category: event.category,
          location: event.location ?? "",
          start_at: toDatetimeLocal(event.start_at),
          end_at: toDatetimeLocal(event.end_at),
          cover_image_url: event.cover_image_url ?? "",
          is_public: event.is_public,
        }
      : {
          title: "",
          description: "",
          category: "training",
          location: "",
          start_at: "",
          end_at: "",
          cover_image_url: "",
          is_public: true,
        },
  });

  function onSubmit(values: FormValues) {
    const input: UpsertEventInput = {
      ...values,
      start_at: new Date(values.start_at).toISOString(),
      end_at: new Date(values.end_at).toISOString(),
    };
    const mutation = event ? updateEvent.mutate({ id: event.id, ...input }, mutationOptions()) : createEvent.mutate(input, mutationOptions());
    return mutation;
  }

  function mutationOptions() {
    return {
      onSuccess: () => {
        toast.success(event ? "Event diperbarui" : "Event dibuat");
        onOpenChange(false);
        reset();
      },
      onError: () => toast.error("Gagal menyimpan event"),
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Buat Event Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Kategori</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Lokasi</Label>
              <Input id="location" {...register("location")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start_at">Mulai</Label>
              <Input id="start_at" type="datetime-local" {...register("start_at")} />
              {errors.start_at && <p className="text-xs text-danger">{errors.start_at.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="end_at">Selesai</Label>
              <Input id="end_at" type="datetime-local" {...register("end_at")} />
              {errors.end_at && <p className="text-xs text-danger">{errors.end_at.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cover_image_url">URL Cover Image</Label>
            <Input id="cover_image_url" {...register("cover_image_url")} />
            {errors.cover_image_url && <p className="text-xs text-danger">{errors.cover_image_url.message}</p>}
          </div>

          <Controller
            control={control}
            name="is_public"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                Tampil di kalender publik
              </label>
            )}
          />

          <DialogFooter>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {event ? "Simpan Perubahan" : "Buat Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
