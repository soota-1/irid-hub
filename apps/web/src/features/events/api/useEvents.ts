import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { EventDTO } from "@/shared/types/api";
import type { RsvpStatus } from "@/shared/lib/rsvpStatus";

interface UseEventsParams {
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}

export function useEvents(params: UseEventsParams = {}) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const { data, meta } = await apiClient<EventDTO[]>("/events", {
        query: { from: params.from, to: params.to, page: params.page, per_page: params.perPage },
      });
      return { items: data, meta };
    },
  });
}

export function useEvent(id: string | undefined) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["events", id],
    queryFn: async () => {
      const { data } = await apiClient<EventDTO>(`/events/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useRsvpEvent(eventId: string) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: RsvpStatus) => {
      const { data } = await apiClient(`/events/${eventId}/rsvp`, { method: "POST", body: { status } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
