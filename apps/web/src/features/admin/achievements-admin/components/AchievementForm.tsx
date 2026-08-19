import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AchievementDTO } from "@/shared/types/api";
import {
  useCreateAchievement,
  useUpdateAchievement,
  type UpsertAchievementInput,
} from "../api/useAchievementsAdmin";

const schema = z.object({
  title: z.string().min(2, "Judul wajib diisi"),
  description: z.string().optional(),
  achieved_at: z.string().min(1, "Wajib diisi"),
});

type FormValues = z.infer<typeof schema>;

interface AchievementFormProps {
  achievement: AchievementDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AchievementForm({ achievement, open, onOpenChange }: AchievementFormProps) {
  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: achievement
      ? {
          title: achievement.title,
          description: achievement.description ?? "",
          achieved_at: achievement.achieved_at?.slice(0, 10) ?? "",
        }
      : { title: "", description: "", achieved_at: "" },
  });

  function onSubmit(values: FormValues) {
    const input: UpsertAchievementInput = {
      title: values.title,
      description: values.description,
      achieved_at: values.achieved_at,
    };
    const onDone = {
      onSuccess: () => {
        toast.success(achievement ? "Prestasi diperbarui" : "Prestasi dibuat");
        onOpenChange(false);
        reset();
      },
      onError: () => toast.error("Gagal menyimpan prestasi"),
    };
    if (achievement) updateAchievement.mutate({ id: achievement.id, ...input }, onDone);
    else createAchievement.mutate(input, onDone);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{achievement ? "Edit Prestasi" : "Prestasi Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="achieved_at">Tanggal Dicapai</Label>
            <Input id="achieved_at" type="date" {...register("achieved_at")} />
            {errors.achieved_at && <p className="text-xs text-danger">{errors.achieved_at.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {achievement ? "Simpan Perubahan" : "Buat Prestasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
