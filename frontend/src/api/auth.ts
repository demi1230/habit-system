import { api } from './client';

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, displayName?: string) =>
    api.post<RegisterResponse>('/auth/register', { email, password, displayName }),
};
