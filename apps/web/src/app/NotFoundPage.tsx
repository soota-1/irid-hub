import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { KickerLabel } from "@/shared/components";

export default function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-5 py-32 text-center">
      <KickerLabel>{t("notFound.kicker")}</KickerLabel>
      <h1 className="font-display text-h1">{t("notFound.title")}</h1>
      <p className="text-muted-foreground">{t("notFound.description")}</p>
      <Button variant="gradient" asChild className="mt-2">
        <Link to="/">{t("backToHome")}</Link>
      </Button>
    </div>
  );
}
