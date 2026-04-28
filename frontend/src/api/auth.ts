import { api } from './client';

export interface LoginResponse {
  accessToken: string;
  displayName: string | null;
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

  changePassword: (userId: string, currentPassword: string, newPassword: string) =>
    api.patch(`/auth/users/${userId}/password`, { currentPassword, newPassword }),

  updateLocation: (userId: string, lat: number | null, lng: number | null) =>
    api.patch(`/auth/users/${userId}/location`, { lat, lng }),
};
