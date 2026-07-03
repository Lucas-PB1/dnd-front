import { ApiError } from "@/shared/api/dnd-api/api-error";
import { getDndApiBaseUrl, isDndApiConfigured } from "@/shared/api/dnd-api/env";

export type ApiFetchOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (!isDndApiConfigured()) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada — veja .env.example");
  }

  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${getDndApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Catálogo público — sem Bearer */
export function catalogFetch<T>(
  path: string,
  init?: Omit<ApiFetchOptions, "token">,
): Promise<T> {
  return apiFetch<T>(path, init);
}

/** Rotas /characters/* — exige JWT Supabase */
export function gameFetch<T>(
  path: string,
  token: string,
  init?: Omit<ApiFetchOptions, "token">,
): Promise<T> {
  return apiFetch<T>(path, { ...init, token });
}
