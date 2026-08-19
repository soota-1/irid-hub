import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { AnnouncementDTO } from "@/shared/types/api";

export interface UpsertAnnouncementInput {
  title: string;
  content: string;
  urgency: AnnouncementDTO["urgency"];
  visibility: AnnouncementDTO["visibility"];
  published_at?: string | null;
}

export function useAnnouncementsAdmin() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const { data } = await apiClient<AnnouncementDTO[]>("/admin/announcements", { query: { per_page: 100 } });
      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertAnnouncementInput) => {
      const { data } = await apiClient<AnnouncementDTO>("/announcements", { method: "POST", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpsertAnnouncementInput & { id: string }) => {
      const { data } = await apiClient<AnnouncementDTO>(`/announcements/${id}`, { method: "PATCH", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/announcements/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] }),
  });
}
