import { API_URL, MOCK, STAFF_TOKEN } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

/** The one fetch helper: JSON in and out, X-Staff-Token when VITE_STAFF_TOKEN is set, `{error, code}` -> ApiError. */
export async function api<T>(path: string, init: { method?: "GET" | "POST" | "PATCH"; body?: unknown } = {}): Promise<T> {
  if (MOCK) throw new ApiError("Mock mode (VITE_MOCK=1): there is no API to call", 0, "MOCK");
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (STAFF_TOKEN) headers["x-staff-token"] = STAFF_TOKEN;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(`Can't reach the API at ${API_URL}`, 0, "NETWORK");
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(json?.error ?? `${res.status} ${res.statusText}`, res.status, json?.code);
  return json as T;
}
