import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { KickerLabel, GradientMesh } from "@/shared/components";
import { useCommunity } from "@/features/community-profile";
import { HeroScene } from "./HeroScene";

/** Hero composition deliberately avoids the generic "headline left,
 * illustration right" split — the R3F scene overlaps behind/beside the
 * text with a shared gradient-mesh backdrop (uiux.md §5).
 * Headline + CTA copy stay identical across ID/EN — deliberate brand-voice
 * English (uiux.md §5 specifies them verbatim), mirrors how the reference
 * kept "MOVE. CONNECT. CREATE." untranslated. */
export function Hero() {
  const { data: community } = useCommunity();
  const { t } = useTranslation("landing");

  return (
    <section className="relative overflow-hidden">
      <GradientMesh className="opacity-30" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <KickerLabel>
            {community?.name ?? "Iridescent"} · {t("hero.kickerSuffix")}
          </KickerLabel>
          <h1 className="mt-4 font-display text-display leading-[1.02]">
            <span className="block">MOVE.</span>
            <span className="block text-gradient">CONNECT.</span>
            <span className="block">CREATE.</span>
          </h1>
          <p className="mt-6 max-w-md text-body-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gradient" size="lg" asChild className="flex items-center gap-2 py-2">
              <Link to="/gabung">
                {t("hero.primaryCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/jadwal">{t("hero.secondaryCta")}</Link>
            </Button>
          </div>
        </div>

        <HeroScene className="h-72 w-full sm:h-96 lg:h-[28rem]" />
      </div>
    </section>
  );
}
