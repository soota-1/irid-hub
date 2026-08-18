import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";

export interface Me {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export function useMe() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getToken();
      return (await apiClient.get<Me>("/users/me", { token })).data;
    },
    enabled: !!isSignedIn,
  });
}
