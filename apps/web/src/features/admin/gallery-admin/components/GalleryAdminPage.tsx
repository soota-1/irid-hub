import { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LazyImage } from "@/shared/components";
import { useGalleryAdmin, useUploadGalleryItem, useDeleteGalleryItem } from "../api/useGalleryAdmin";

export function GalleryAdminPage() {
  const { data, isLoading } = useGalleryAdmin();
  const upload = useUploadGalleryItem();
  const deleteItem = useDeleteGalleryItem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate(
      { file, caption },
      {
        onSuccess: () => {
          toast.success("Foto berhasil diunggah");
          setCaption("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: () => toast.error("Gagal mengunggah foto"),
      },
    );
  }

  return (
    <div>
      <h1 className="font-display text-h2">Galeri</h1>

      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="caption">Caption (opsional)</Label>
          <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Foundation class, Kemang" />
        </div>
        <Button
          variant="gradient"
          disabled={upload.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> {upload.isPending ? "Mengunggah..." : "Unggah Foto"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleFileChange} />
      </div>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Memuat galeri...</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(data ?? []).map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-md border border-border">
              <LazyImage src={item.thumbnail_url ?? item.media_url} alt={item.caption ?? ""} wrapperClassName="aspect-square" />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Hapus"
                className="absolute right-2 top-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => {
                  if (!window.confirm("Hapus foto ini?")) return;
                  deleteItem.mutate(item.id, {
                    onSuccess: () => toast.success("Foto dihapus"),
                    onError: () => toast.error("Gagal menghapus foto"),
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
