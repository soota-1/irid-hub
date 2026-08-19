import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { MembershipApplicationDTO, MembershipDTO } from "@/shared/types/api";

export function useMembershipApplications(status?: MembershipApplicationDTO["status"]) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ["admin", "membership-applications", status],
    queryFn: async () => {
      const { data } = await apiClient<MembershipApplicationDTO[]>("/membership-applications", {
        query: { status, per_page: 100 },
      });
      return data;
    },
  });
}

export function useApproveApplication() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient<MembershipApplicationDTO>(`/membership-applications/${id}/approve`, {
        method: "PATCH",
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "membership-applications"] }),
  });
}

export function useRejectApplication() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient<MembershipApplicationDTO>(`/membership-applications/${id}/reject`, {
        method: "PATCH",
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "membership-applications"] }),
  });
}

export function useMembers(params: { role?: MembershipDTO["role"]; status?: MembershipDTO["status"] } = {}) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ["admin", "members", params],
    queryFn: async () => {
      const { data } = await apiClient<MembershipDTO[]>("/members", {
        query: { role: params.role, status: params.status, per_page: 100 },
      });
      return data;
    },
  });
}

export function useUpdateMemberRole() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: MembershipDTO["role"] }) => {
      const { data } = await apiClient<MembershipDTO>(`/members/${id}/role`, { method: "PATCH", body: { role } });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "members"] }),
  });
}
