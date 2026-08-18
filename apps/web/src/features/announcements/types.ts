import type { components } from "@irid-hub/shared-types";

export type Announcement = components["schemas"]["handler.announcementDTO"];

export const urgencyAccent: Record<string, string> = {
  info: "border-l-info",
  warning: "border-l-warning",
  important: "border-l-danger",
};

export const urgencyLabel: Record<string, string> = {
  info: "Info",
  warning: "Perhatian",
  important: "Penting",
};
