import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/apiClient";
import type { Community } from "../types";

export function useCommunity() {
  return useQuery({
    queryKey: ["community"],
    queryFn: async () => (await apiClient.get<Community>("/community")).data,
    staleTime: 5 * 60_000,
  });
}
