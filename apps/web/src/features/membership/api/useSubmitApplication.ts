import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/shared/lib/apiClient";
import type { MembershipApplicationDTO } from "@/shared/types/api";
import type { SubmitMembershipApplicationInput } from "../types";

/** Public, rate-limited endpoint — no auth token needed (router.go:
 * POST /membership-applications only has publicRateLimit middleware). */
export function useSubmitApplication() {
  return useMutation({
    mutationFn: async (input: SubmitMembershipApplicationInput) => {
      const { data } = await apiRequest<MembershipApplicationDTO>("/membership-applications", {
        method: "POST",
        body: input,
      });
      return data;
    },
  });
}
