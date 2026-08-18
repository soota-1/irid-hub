import { useRef } from "react";
import { Plus, Trash2, PlayCircle } from "lucide-react";
import { useGallery } from "@/features/gallery";
import { Button, Skeleton } from "@/shared/components";
import { useUploadGalleryItem, useDeleteGalleryItem } from "../api/useGalleryAdmin";

export function GalleryAdminPage() {
  const { data, isPending } = useGallery();
  const items = data?.data ?? [];
  const upload = useUploadGalleryItem();
  const remove = useDeleteGalleryItem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate({ file });
    e.target.value = "";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h2">Galeri</h1>
        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
          <Plus size={16} className="mr-1.5" /> {upload.isPending ? "Mengunggah..." : "Unggah"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" className="hidden" onChange={handleFileChange} />
      </div>

      {upload.isError && <p className="text-danger text-sm mb-4">Gagal mengunggah file.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {isPending &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}

        {!isPending &&
          items.map((item) => (
            <div key={item.id} className="relative group aspect-square rounded-md overflow-hidden border border-neutral-200">
              <img
                src={(item.type === "video" ? item.thumbnail_url : item.media_url) ?? item.media_url ?? ""}
                alt={item.caption ?? ""}
                className="w-full h-full object-cover"
              />
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center text-white/90 bg-neutral-950/20">
                  <PlayCircle size={28} />
                </span>
              )}
              <button
                onClick={() => {
                  if (confirm("Hapus item galeri ini?")) remove.mutate(item.id!);
                }}
                aria-label="Hapus"
                className="absolute top-1.5 right-1.5 bg-neutral-950/70 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
