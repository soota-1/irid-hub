import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { CommunityDTO } from "@/shared/types/api";

export function useCommunity() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["community"],
    queryFn: async () => {
      const { data } = await apiClient<CommunityDTO>("/community");
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
