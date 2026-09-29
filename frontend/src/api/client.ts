// In dev, Vite proxies /api to http://localhost:3000, preserving the prefix.
// In prod, set VITE_API_URL to the API base (e.g. https://api.example.com/api).
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
    if (res.status === 401 && token && !['/auth/login', '/auth/register'].includes(path) && getToken() === token) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('display_name');
      window.dispatchEvent(new Event('auth:expired'));
    }
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join('. ') : body.message;
    const err = new Error(message ?? res.statusText) as Error & { status: number; body: unknown };
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, options),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
