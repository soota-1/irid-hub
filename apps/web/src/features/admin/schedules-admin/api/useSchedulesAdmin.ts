import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { TrainingScheduleDTO } from "@/shared/types/api";

export interface UpsertScheduleInput {
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location?: string;
  is_active: boolean;
}

export function useSchedulesAdmin() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ["admin", "schedules"],
    queryFn: async () => {
      const { data } = await apiClient<TrainingScheduleDTO[]>("/admin/schedules");
      return data;
    },
  });
}

export function useCreateSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertScheduleInput) => {
      const { data } = await apiClient<TrainingScheduleDTO>("/schedules", { method: "POST", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] }),
  });
}

export function useUpdateSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpsertScheduleInput & { id: string }) => {
      const { data } = await apiClient<TrainingScheduleDTO>(`/schedules/${id}`, { method: "PATCH", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] }),
  });
}

export function useDeleteSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/schedules/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] }),
  });
}
