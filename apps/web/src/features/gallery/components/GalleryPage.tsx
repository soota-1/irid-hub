import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { KickerLabel, LazyImage, Lightbox } from "@/shared/components";
import { useGallery } from "../api/useGallery";

/** Gallery identity: Mint → Cyan (Design.md §2, uiux.md §11). Masonry via
 * CSS columns; photos stay natural — no gradient/color filters on the
 * images themselves (Design.md §5). */
export function GalleryPage() {
  const { data, isLoading } = useGallery({ perPage: 60 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { t } = useTranslation("gallery");

  const items = (data ?? []).filter((item) => item.type === "photo");

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <KickerLabel>{t("kicker")}</KickerLabel>
      <h1 className="mt-3 font-display text-h1 bg-iri-gallery bg-clip-text text-transparent">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">{t("subtitle")}</p>

      {isLoading && (
        <div className="mt-10 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full break-inside-avoid rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{t("empty")}</p>
      )}

      {!isLoading && items.length > 0 && (
        <div className="mt-10 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative block w-full break-inside-avoid overflow-hidden rounded-md border border-border"
            >
              <LazyImage src={item.thumbnail_url ?? item.media_url} alt={item.caption ?? ""} wrapperClassName="w-full" />
              {item.caption && (
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background/90 to-transparent p-3 text-left text-xs text-foreground transition-transform duration-300 group-hover:translate-y-0">
                  {item.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <Lightbox items={items} index={activeIndex} onClose={() => setActiveIndex(null)} onNavigate={setActiveIndex} />
    </div>
  );
}
