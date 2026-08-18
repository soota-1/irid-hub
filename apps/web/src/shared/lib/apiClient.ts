import { env } from "./env";
import type { ApiEnvelope, ApiErrorBody, ApiMeta } from "@/shared/types/api";

/** Thrown whenever the backend returns `success: false` — carries the
 * error code/fields straight from the envelope (docs/Schema.md §4) so
 * callers can branch on `err.code` instead of parsing messages. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string | null;
  body?: unknown;
}

export interface ApiResult<T> {
  data: T;
  meta: ApiMeta | null;
}

async function request<T>(path: string, { token, body, headers, ...init }: RequestOptions = {}): Promise<ApiResult<T>> {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return { data: undefined as T, meta: null };
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;
  if (!envelope.success || !res.ok) {
    throw new ApiClientError(res.status, envelope.error ?? { code: "UNKNOWN_ERROR", message: "Terjadi kesalahan tidak terduga" });
  }
  return { data: envelope.data as T, meta: envelope.meta };
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: "DELETE" }),
};
