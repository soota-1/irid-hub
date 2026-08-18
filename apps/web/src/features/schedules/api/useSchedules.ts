import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/apiClient";
import type { TrainingSchedule } from "../types";

export function useSchedules() {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => (await apiClient.get<TrainingSchedule[]>("/schedules")).data,
    staleTime: 60_000,
  });
}
