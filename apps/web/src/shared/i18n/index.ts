import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonId from "./locales/id/common.json";
import landingId from "./locales/id/landing.json";
import communityId from "./locales/id/community.json";
import eventsId from "./locales/id/events.json";
import schedulesId from "./locales/id/schedules.json";
import announcementsId from "./locales/id/announcements.json";
import galleryId from "./locales/id/gallery.json";
import achievementsId from "./locales/id/achievements.json";
import membershipId from "./locales/id/membership.json";

import commonEn from "./locales/en/common.json";
import landingEn from "./locales/en/landing.json";
import communityEn from "./locales/en/community.json";
import eventsEn from "./locales/en/events.json";
import schedulesEn from "./locales/en/schedules.json";
import announcementsEn from "./locales/en/announcements.json";
import galleryEn from "./locales/en/gallery.json";
import achievementsEn from "./locales/en/achievements.json";
import membershipEn from "./locales/en/membership.json";

/**
 * Public-facing pages only (see plan): admin panel stays hardcoded
 * Indonesian for now, so there's no `admin` namespace here.
 *
 * Detection: browser/OS language (`navigator.language`) via
 * i18next-browser-languagedetector, NOT IP geolocation — no external API,
 * no network call, and the detector already persists the user's manual
 * override to localStorage (`i18nextLng`) on its own, so `useLanguage()`
 * doesn't need its own persistence logic.
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: {
        common: commonId,
        landing: landingId,
        community: communityId,
        events: eventsId,
        schedules: schedulesId,
        announcements: announcementsId,
        gallery: galleryId,
        achievements: achievementsId,
        membership: membershipId,
      },
      en: {
        common: commonEn,
        landing: landingEn,
        community: communityEn,
        events: eventsEn,
        schedules: schedulesEn,
        announcements: announcementsEn,
        gallery: galleryEn,
        achievements: achievementsEn,
        membership: membershipEn,
      },
    },
    ns: [
      "common",
      "landing",
      "community",
      "events",
      "schedules",
      "announcements",
      "gallery",
      "achievements",
      "membership",
    ],
    defaultNS: "common",
    supportedLngs: ["id", "en"],
    nonExplicitSupportedLngs: true,
    // Home base of this community is Indonesia — an unrecognized browser
    // language falls back here rather than to English.
    fallbackLng: "id",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
