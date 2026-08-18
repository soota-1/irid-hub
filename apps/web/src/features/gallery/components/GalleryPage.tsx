import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/shared/components";
import { useGallery } from "../api/useGallery";
import { LazyImage } from "./LazyImage";
import { Lightbox } from "./Lightbox";

export function GalleryPage() {
  const { data, isPending, isError } = useGallery();
  const items = data?.data ?? [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-h1">Galeri</h1>
      <p className="text-surface-muted mt-1">Dokumentasi momen-momen komunitas.</p>

      {isError && <p className="text-danger mt-8">Gagal memuat galeri.</p>}

      {isPending && (
        <div className="mt-8 columns-2 sm:columns-3 gap-4 [&>*]:mb-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="break-inside-avoid" style={{ height: `${120 + (i % 3) * 60}px` }} />
          ))}
        </div>
      )}

      {!isPending && items.length === 0 && !isError && <p className="text-surface-muted mt-8">Belum ada foto/video.</p>}

      <div className="mt-8 columns-2 sm:columns-3 gap-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(i)}
            className="relative block w-full mb-4 break-inside-avoid rounded-md overflow-hidden group"
          >
            <LazyImage
              src={(item.type === "video" ? item.thumbnail_url : item.media_url) ?? item.media_url ?? ""}
              alt={item.caption ?? ""}
              className="w-full rounded-md group-hover:opacity-90 transition-opacity"
            />
            {item.type === "video" && (
              <span className="absolute inset-0 flex items-center justify-center text-white/90">
                <PlayCircle size={36} />
              </span>
            )}
          </button>
        ))}
      </div>

      <Lightbox items={items} index={activeIndex} onClose={() => setActiveIndex(null)} onNavigate={setActiveIndex} />
    </div>
  );
}
