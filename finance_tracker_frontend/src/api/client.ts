export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString().replace(/\/+$/, "") ||
  "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem("access_token");
  else localStorage.setItem("access_token", token);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (!res.ok) {
    let detail: unknown = undefined;
    try {
      detail = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(`Request failed: ${res.status}`, res.status, detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}


