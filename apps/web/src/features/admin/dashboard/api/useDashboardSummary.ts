import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";

export interface DashboardSummary {
  active_member_count: number;
  pending_applications: number;
  upcoming_event_count: number;
}

export function useDashboardSummary() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: async () => {
      const token = await getToken();
      return (await apiClient.get<DashboardSummary>("/admin/dashboard/summary", { token })).data;
    },
    retry: false,
  });
}
