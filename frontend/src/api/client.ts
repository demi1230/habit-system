// In dev, Vite proxies /api → http://localhost:3000 (strips the /api prefix).
// In prod, set VITE_API_URL to the full backend origin (e.g. https://api.example.com).
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (USE_MOCK) {
    const { mockRequest } = await import('./mock-router');
    return mockRequest<T>(path, options);
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('display_name');
      window.location.href = '/login';
    }
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message ?? res.statusText) as Error & { status: number; body: unknown };
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
};
