import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { AnnouncementDTO } from "@/shared/types/api";

/** Public announcements for everyone; members additionally see
 * members-only ones from /announcements/internal (Schema.md §2.8). */
export function useAnnouncements() {
  const apiClient = useApiClient();
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["announcements", isSignedIn],
    queryFn: async () => {
      if (isSignedIn) {
        const { data } = await apiClient<AnnouncementDTO[]>("/announcements/internal");
        return data;
      }
      const { data } = await apiClient<AnnouncementDTO[]>("/announcements");
      return data;
    },
  });
}
