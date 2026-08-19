import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { GradientMesh } from "@/shared/components";

export function FinalCta() {
  const { t } = useTranslation("landing");

  return (
    <section className="relative overflow-hidden border-t border-border">
      <GradientMesh className="opacity-40" />
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
        <h2 className="font-display text-h1">{t("finalCta.title")}</h2>
        <p className="mt-4 text-body-lg text-muted-foreground">{t("finalCta.subtitle")}</p>
        <Button variant="gradient" size="lg" asChild className="mt-8">
          <Link to="/gabung">{t("finalCta.cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
