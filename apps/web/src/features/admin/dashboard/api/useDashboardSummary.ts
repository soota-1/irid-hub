import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { AdminDashboardSummaryDTO } from "@/shared/types/api";

/** Also doubles as the admin-access gate for AdminLayout: 403/401 from
 * this query means "not an officer/admin", handled by the caller. */
export function useDashboardSummary() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["admin", "dashboard", "summary"],
    queryFn: async () => {
      const { data } = await apiClient<AdminDashboardSummaryDTO>("/admin/dashboard/summary");
      return data;
    },
    retry: false,
  });
}
