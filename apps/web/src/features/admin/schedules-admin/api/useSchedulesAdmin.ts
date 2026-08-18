import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { TrainingSchedule } from "@/features/schedules";

export interface ScheduleFormValues {
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  is_active: boolean;
}

export function useSchedulesAdmin() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin", "schedules"],
    queryFn: async () => {
      const token = await getToken();
      return (await apiClient.get<TrainingSchedule[]>("/admin/schedules", { token })).data;
    },
  });
}

export function useScheduleMutations() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });

  const create = useMutation({
    mutationFn: async (values: ScheduleFormValues) => {
      const token = await getToken();
      return apiClient.post<TrainingSchedule>("/schedules", { ...values, day_of_week: Number(values.day_of_week) }, { token });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ScheduleFormValues }) => {
      const token = await getToken();
      return apiClient.patch<TrainingSchedule>(
        `/schedules/${id}`,
        { ...values, day_of_week: Number(values.day_of_week) },
        { token },
      );
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiClient.delete(`/schedules/${id}`, { token });
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
