import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KickerLabel, LazyImage } from "@/shared/components";
import { useGallery } from "@/features/gallery";

export function GalleryPreviewSection() {
  const { data } = useGallery({ perPage: 6 });
  const items = (data ?? []).filter((item) => item.type === "photo");
  const { t } = useTranslation("landing");

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <KickerLabel>{t("gallery.kicker")}</KickerLabel>
          <h2 className="mt-3 font-display text-h2">{t("gallery.title")}</h2>
        </div>
        <Link to="/galeri" className="flex items-center gap-1.5 text-sm font-semibold hover:text-iri-mint">
          {t("gallery.viewAll")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <LazyImage
            key={item.id}
            src={item.thumbnail_url ?? item.media_url}
            alt={item.caption ?? ""}
            wrapperClassName="aspect-square rounded-md"
          />
        ))}
      </div>
    </section>
  );
}
