import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { EventDTO } from "@/shared/types/api";

export interface UpsertEventInput {
  title: string;
  description?: string;
  category: EventDTO["category"];
  location?: string;
  start_at: string;
  end_at: string;
  cover_image_url?: string;
  is_public: boolean;
}

export function useEventsAdmin() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["admin", "events"],
    queryFn: async () => {
      const { data } = await apiClient<EventDTO[]>("/admin/events", { query: { per_page: 100 } });
      return data;
    },
  });
}

export function useCreateEvent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertEventInput) => {
      const { data } = await apiClient<EventDTO>("/events", { method: "POST", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
}

export function useUpdateEvent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpsertEventInput & { id: string }) => {
      const { data } = await apiClient<EventDTO>(`/events/${id}`, { method: "PATCH", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
}

export function useDeleteEvent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/events/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
}
