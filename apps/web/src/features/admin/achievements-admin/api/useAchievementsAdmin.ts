import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { Achievement } from "@/features/achievements";

export interface AchievementFormValues {
  title: string;
  description: string;
  achieved_at: string;
  icon_or_badge_url: string;
}

export function useAchievementMutations() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["achievements"] });

  const create = useMutation({
    mutationFn: async (values: AchievementFormValues) => {
      const token = await getToken();
      return apiClient.post<Achievement>("/achievements", { ...values, achieved_at: new Date(values.achieved_at).toISOString() }, { token });
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: AchievementFormValues }) => {
      const token = await getToken();
      return apiClient.patch<Achievement>(
        `/achievements/${id}`,
        { ...values, achieved_at: new Date(values.achieved_at).toISOString() },
        { token },
      );
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiClient.delete(`/achievements/${id}`, { token });
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
