import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "./providers";
import { AppRoutes } from "./routes";

/** Keeps `<html lang>` in sync with the active i18n language — matters for
 * screen readers and language-aware browser features. Must live inside
 * AppProviders' I18nextProvider, so it's rendered alongside AppRoutes
 * rather than in App itself. */
function HtmlLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language.startsWith("en") ? "en" : "id";
  }, [i18n.language]);

  return null;
}

export default function App() {
  return (
    <AppProviders>
      <HtmlLangSync />
      <AppRoutes />
      <Toaster />
    </AppProviders>
  );
}
