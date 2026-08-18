import { Link } from "react-router-dom";
import { useGallery } from "@/features/gallery";
import { Skeleton } from "@/shared/components";

export function GalleryPreviewSection() {
  const { data, isPending } = useGallery();
  const items = (data?.data ?? []).slice(0, 6);

  if (!isPending && items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-h2">Galeri</h2>
        <Link to="/galeri" className="text-sm font-medium text-iri-violet hover:underline">
          Lihat semua
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {isPending
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-md" />)
          : items.map((item) => (
              <Link
                key={item.id}
                to="/galeri"
                className="aspect-square rounded-md overflow-hidden block group"
              >
                <img
                  src={(item.type === "video" ? item.thumbnail_url : item.media_url) ?? item.media_url ?? ""}
                  alt={item.caption ?? ""}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            ))}
      </div>
    </section>
  );
}
