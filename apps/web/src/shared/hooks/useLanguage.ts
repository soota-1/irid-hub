import { useTranslation } from "react-i18next";

export type Language = "id" | "en";

/** Thin wrapper mirroring useTheme()'s ergonomics — but unlike theme,
 * language doesn't need its own localStorage persistence: i18next-browser-
 * languagedetector already caches the user's choice under `i18nextLng`. */
export function useLanguage() {
  const { i18n } = useTranslation();
  const language: Language = i18n.language.startsWith("en") ? "en" : "id";
  const toggleLanguage = () => i18n.changeLanguage(language === "id" ? "en" : "id");
  return { language, toggleLanguage };
}
