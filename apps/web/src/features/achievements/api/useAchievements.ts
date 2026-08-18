import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/apiClient";
import type { Achievement } from "../types";

export function useAchievements(page = 1) {
  return useQuery({
    queryKey: ["achievements", page],
    queryFn: async () => apiClient.get<Achievement[]>(`/achievements?page=${page}&per_page=30`),
  });
}
