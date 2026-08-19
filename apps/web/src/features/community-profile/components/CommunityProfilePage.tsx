import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { KickerLabel, GradientMesh, LazyImage } from "@/shared/components";
import { useCommunity } from "../api/useCommunity";

export function CommunityProfilePage() {
  const { data: community, isLoading } = useCommunity();
  const { t } = useTranslation("community");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="mt-6 h-8 w-1/2" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }

  if (!community) return null;

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <GradientMesh className="opacity-20" />
        {community.cover_image_url && (
          <LazyImage src={community.cover_image_url} alt="" wrapperClassName="h-64 w-full sm:h-80" />
        )}
        <div className="relative mx-auto max-w-4xl px-5 py-12">
          <KickerLabel>{t("kicker")}</KickerLabel>
          <h1 className="mt-3 font-display text-h1">{community.name}</h1>
          {community.tagline && <p className="mt-2 text-body-lg text-muted-foreground">{community.tagline}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-12">
        {community.description ? (
          <article className="prose prose-invert max-w-none text-foreground/90">
            <ReactMarkdown>{community.description}</ReactMarkdown>
          </article>
        ) : (
          <p className="text-muted-foreground">{t("storyPlaceholder")}</p>
        )}

        <div className="mt-10 rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="font-display text-h3">{t("ctaTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("ctaSubtitle")}</p>
          <Button variant="gradient" asChild className="mt-5">
            <Link to="/gabung">{t("ctaButton")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
