import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { TrainingScheduleDTO } from "@/shared/types/api";

export function useSchedules() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data } = await apiClient<TrainingScheduleDTO[]>("/schedules");
      return data;
    },
  });
}
