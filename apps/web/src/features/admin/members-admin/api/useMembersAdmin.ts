import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { MembershipApplication } from "@/features/membership";

export interface Membership {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  bio: string | null;
}

export function useMembershipApplications(status?: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin", "membership-applications", status],
    queryFn: async () => {
      const token = await getToken();
      const q = new URLSearchParams({ per_page: "100" });
      if (status) q.set("status", status);
      return apiClient.get<MembershipApplication[]>(`/membership-applications?${q}`, { token });
    },
  });
}

export function useApplicationMutations() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "membership-applications"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
  };

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiClient.patch(`/membership-applications/${id}/approve`, undefined, { token });
    },
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiClient.patch(`/membership-applications/${id}/reject`, undefined, { token });
    },
    onSuccess: invalidate,
  });

  return { approve, reject };
}

export function useMembers() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin", "members"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<Membership[]>("/members?per_page=100", { token });
    },
  });
}

export function useUpdateMemberRole() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const token = await getToken();
      return apiClient.patch<Membership>(`/members/${id}/role`, { role }, { token });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
  });
}
