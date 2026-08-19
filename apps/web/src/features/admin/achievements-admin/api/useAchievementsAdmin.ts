import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { AchievementDTO } from "@/shared/types/api";

export interface UpsertAchievementInput {
  title: string;
  description?: string;
  achieved_at: string;
  icon_or_badge_url?: string;
  member_id?: string;
}

export function useAchievementsAdmin() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ["admin", "achievements"],
    queryFn: async () => {
      const { data } = await apiClient<AchievementDTO[]>("/achievements", { query: { per_page: 100 } });
      return data;
    },
  });
}

export function useCreateAchievement() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertAchievementInput) => {
      const { data } = await apiClient<AchievementDTO>("/achievements", { method: "POST", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] }),
  });
}

export function useUpdateAchievement() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpsertAchievementInput & { id: string }) => {
      const { data } = await apiClient<AchievementDTO>(`/achievements/${id}`, { method: "PATCH", body: input });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] }),
  });
}

export function useDeleteAchievement() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/achievements/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "achievements"] }),
  });
}
