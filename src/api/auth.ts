import { apiRequest } from './client';
import type { LoginRequest, LoginResponse, UserDto } from '../types/api';

export const authApi = {
  login(payload: LoginRequest, signal?: AbortSignal): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      signal,
      auth: false,
    });
  },

  me(signal?: AbortSignal): Promise<UserDto> {
    return apiRequest<UserDto>('/auth/me', { signal });
  },
};
