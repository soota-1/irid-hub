import { id as idLocale, enUS } from "date-fns/locale";
import { useLanguage } from "./useLanguage";

/** date-fns locale object matching the active UI language — swap in for
 * every `format(date, ..., { locale })` call on public pages. */
export function useDateLocale() {
  const { language } = useLanguage();
  return language === "en" ? enUS : idLocale;
}
