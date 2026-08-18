import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { Announcement } from "../types";

export function useAnnouncements(page = 1) {
  return useQuery({
    queryKey: ["announcements", "public", page],
    queryFn: async () => apiClient.get<Announcement[]>(`/announcements?page=${page}&per_page=20`),
  });
}

export function useInternalAnnouncements(page = 1) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["announcements", "internal", page],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<Announcement[]>(`/announcements/internal?page=${page}&per_page=20`, { token });
    },
  });
}
