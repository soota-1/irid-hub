import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { AchievementDTO } from "@/shared/types/api";

export function useAchievements(perPage = 50) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["achievements", perPage],
    queryFn: async () => {
      const { data } = await apiClient<AchievementDTO[]>("/achievements", { query: { per_page: perPage } });
      return data;
    },
  });
}
