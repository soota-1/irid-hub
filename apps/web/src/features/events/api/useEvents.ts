import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { EventItem } from "../types";

export interface UseEventsParams {
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}

function buildQuery(params: UseEventsParams): string {
  const q = new URLSearchParams();
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  q.set("page", String(params.page ?? 1));
  q.set("per_page", String(params.perPage ?? 100));
  return q.toString();
}

export function useEvents(params: UseEventsParams = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => apiClient.get<EventItem[]>(`/events?${buildQuery(params)}`),
  });
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: async () => (await apiClient.get<EventItem>(`/events/${id}`)).data,
    enabled: !!id,
  });
}

export type RsvpStatus = "going" | "not_going" | "maybe";

export function useRsvp(eventId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: RsvpStatus) => {
      const token = await getToken();
      return apiClient.post(`/events/${eventId}/rsvp`, { status }, { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
