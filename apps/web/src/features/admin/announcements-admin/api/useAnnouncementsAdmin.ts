import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { Announcement } from "@/features/announcements";

export interface AnnouncementFormValues {
  title: string;
  content: string;
  urgency: string;
  visibility: string;
  published: boolean;
}

export function useAnnouncementsAdmin() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<Announcement[]>("/admin/announcements?per_page=100", { token });
    },
  });
}

function toBody(values: AnnouncementFormValues) {
  return {
    title: values.title,
    content: values.content,
    urgency: values.urgency,
    visibility: values.visibility,
    published_at: values.published ? new Date().toISOString() : null,
  };
}

export function useAnnouncementMutations() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });

  const create = useMutation({
    mutationFn: async (values: AnnouncementFormValues) => {
      const token = await getToken();
      return apiClient.post<Announcement>("/announcements", toBody(values), { token });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: AnnouncementFormValues }) => {
      const token = await getToken();
      return apiClient.patch<Announcement>(`/announcements/${id}`, toBody(values), { token });
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiClient.delete(`/announcements/${id}`, { token });
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
