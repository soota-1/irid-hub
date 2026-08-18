import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { EventItem } from "@/features/events";

export interface EventFormValues {
  title: string;
  description: string;
  category: string;
  location: string;
  start_at: string;
  end_at: string;
  cover_image_url: string;
  is_public: boolean;
}

export function useEventsAdmin() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin", "events"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<EventItem[]>("/admin/events?per_page=100", { token });
    },
  });
}

export function useEventMutations() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "events"] });

  const create = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const token = await getToken();
      return apiClient.post<EventItem>("/events", values, { token });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: EventFormValues }) => {
      const token = await getToken();
      return apiClient.patch<EventItem>(`/events/${id}`, values, { token });
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiClient.delete(`/events/${id}`, { token });
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
