import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAY_NAMES, type TrainingScheduleDTO } from "../../../schedules/types";
import { useCreateSchedule, useUpdateSchedule, type UpsertScheduleInput } from "../api/useSchedulesAdmin";

const schema = z.object({
  title: z.string().min(2, "Judul wajib diisi"),
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().min(1, "Wajib diisi"),
  end_time: z.string().min(1, "Wajib diisi"),
  location: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface ScheduleFormProps {
  schedule: TrainingScheduleDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleForm({ schedule, open, onOpenChange }: ScheduleFormProps) {
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: schedule
      ? {
          title: schedule.title,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          location: schedule.location ?? "",
          is_active: schedule.is_active,
        }
      : { title: "", day_of_week: 1, start_time: "", end_time: "", location: "", is_active: true },
  });

  function onSubmit(values: FormValues) {
    const input: UpsertScheduleInput = values;
    const onDone = {
      onSuccess: () => {
        toast.success(schedule ? "Jadwal diperbarui" : "Jadwal dibuat");
        onOpenChange(false);
        reset();
      },
      onError: () => toast.error("Gagal menyimpan jadwal"),
    };
    if (schedule) updateSchedule.mutate({ id: schedule.id, ...input }, onDone);
    else createSchedule.mutate(input, onDone);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit Jadwal" : "Jadwal Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Hari</Label>
            <Controller
              control={control}
              name="day_of_week"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((day, index) => (
                      <SelectItem key={day} value={String(index)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start_time">Mulai</Label>
              <Input id="start_time" type="time" {...register("start_time")} />
              {errors.start_time && <p className="text-xs text-danger">{errors.start_time.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="end_time">Selesai</Label>
              <Input id="end_time" type="time" {...register("end_time")} />
              {errors.end_time && <p className="text-xs text-danger">{errors.end_time.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Lokasi</Label>
            <Input id="location" {...register("location")} />
          </div>

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(Boolean(c))} />
                Aktif
              </label>
            )}
          />

          <DialogFooter>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {schedule ? "Simpan Perubahan" : "Buat Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
