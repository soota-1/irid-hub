import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { UserDTO } from "@/shared/types/api";

export function useMe() {
  const apiClient = useApiClient();
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const { data } = await apiClient<UserDTO>("/users/me");
      return data;
    },
    enabled: Boolean(isSignedIn),
  });
}
