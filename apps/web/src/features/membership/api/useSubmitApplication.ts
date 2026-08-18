import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@/shared/lib/apiClient";
import type { MembershipApplication, MembershipApplicationRequest } from "../types";

export function useSubmitApplication() {
  return useMutation({
    mutationFn: async (body: MembershipApplicationRequest) =>
      (await apiClient.post<MembershipApplication>("/membership-applications", body)).data,
  });
}

export { ApiClientError };
