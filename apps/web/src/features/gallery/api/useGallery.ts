import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { GalleryItemDTO } from "@/shared/types/api";

export function useGallery(params: { perPage?: number; eventId?: string } = {}) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["gallery", params],
    queryFn: async () => {
      const { data } = await apiClient<GalleryItemDTO[]>("/gallery", {
        query: { per_page: params.perPage, event_id: params.eventId },
      });
      return data;
    },
  });
}
