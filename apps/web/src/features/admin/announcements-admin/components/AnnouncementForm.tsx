import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnnouncementDTO } from "@/shared/types/api";
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
  type UpsertAnnouncementInput,
} from "../api/useAnnouncementsAdmin";

const schema = z.object({
  title: z.string().min(2, "Judul wajib diisi"),
  content: z.string().min(2, "Konten wajib diisi"),
  urgency: z.enum(["info", "warning", "important"]),
  visibility: z.enum(["public", "members_only"]),
  publish_now: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface AnnouncementFormProps {
  announcement: AnnouncementDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementForm({ announcement, open, onOpenChange }: AnnouncementFormProps) {
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: announcement
      ? {
          title: announcement.title,
          content: announcement.content,
          urgency: announcement.urgency,
          visibility: announcement.visibility,
          publish_now: Boolean(announcement.published_at),
        }
      : { title: "", content: "", urgency: "info", visibility: "public", publish_now: true },
  });

  function onSubmit(values: FormValues) {
    const input: UpsertAnnouncementInput = {
      title: values.title,
      content: values.content,
      urgency: values.urgency,
      visibility: values.visibility,
      published_at: values.publish_now ? new Date().toISOString() : null,
    };
    const onDone = {
      onSuccess: () => {
        toast.success(announcement ? "Pengumuman diperbarui" : "Pengumuman dibuat");
        onOpenChange(false);
        reset();
      },
      onError: () => toast.error("Gagal menyimpan pengumuman"),
    };
    if (announcement) updateAnnouncement.mutate({ id: announcement.id, ...input }, onDone);
    else createAnnouncement.mutate(input, onDone);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit Pengumuman" : "Pengumuman Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Konten (markdown)</Label>
            <Textarea id="content" rows={5} {...register("content")} />
            {errors.content && <p className="text-xs text-danger">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Urgensi</Label>
              <Controller
                control={control}
                name="urgency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Visibilitas</Label>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Publik</SelectItem>
                      <SelectItem value="members_only">Member Saja</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Controller
            control={control}
            name="publish_now"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(Boolean(c))} />
                Publikasikan sekarang (matikan untuk simpan sebagai draft)
              </label>
            )}
          />

          <DialogFooter>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {announcement ? "Simpan Perubahan" : "Buat Pengumuman"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
