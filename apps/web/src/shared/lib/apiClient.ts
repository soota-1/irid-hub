import { env } from "./env";
import type { ApiErrorBody, Envelope, PaginatedMeta } from "@/shared/types/api";

export class ApiError extends Error {
  code: string;
  fields?: Record<string, string>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.fields = body.fields;
  }
}

export interface ApiResult<T> {
  data: T;
  meta: PaginatedMeta | null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${env.apiBaseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Thin fetch wrapper that unwraps the {success,data,meta,error} envelope
 * from docs/Schema.md §4 and injects the Clerk bearer token when provided. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, token, query } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return { data: undefined as T, meta: null };
  }

  const json = (await res.json()) as Envelope<T>;

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.error ?? { code: "INTERNAL_ERROR", message: "Terjadi kesalahan tak terduga" },
    );
  }

  return { data: json.data, meta: json.meta };
}
