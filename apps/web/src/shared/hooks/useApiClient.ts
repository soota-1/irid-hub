import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";
import { apiRequest, type ApiResult } from "@/shared/lib/apiClient";

/** Returns an `apiRequest`-shaped function that auto-attaches the current
 * Clerk session token. Public GET calls work fine without a signed-in user
 * (getToken resolves to null and the header is simply omitted). */
export function useApiClient() {
  const { getToken } = useAuth();

  return useCallback(
    async <T>(path: string, options: Omit<Parameters<typeof apiRequest<T>>[1], "token"> = {}): Promise<ApiResult<T>> => {
      const token = await getToken();
      return apiRequest<T>(path, { ...options, token });
    },
    [getToken],
  );
}
