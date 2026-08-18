import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/apiClient";
import type { GalleryItem } from "../types";

export function useGallery(eventId?: string, page = 1) {
  return useQuery({
    queryKey: ["gallery", eventId, page],
    queryFn: async () => {
      const q = new URLSearchParams({ page: String(page), per_page: "30" });
      if (eventId) q.set("event_id", eventId);
      return apiClient.get<GalleryItem[]>(`/gallery?${q.toString()}`);
    },
  });
}
