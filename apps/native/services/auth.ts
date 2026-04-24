import type { LoginResponse, User } from 'shared';
import { post, get } from './api';
import { setTokens, clearTokens } from './storage';

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const result = await post<LoginResponse>('/auth/login', payload);
  await setTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await post('/auth/logout');
  } catch {
    // best-effort — clear tokens regardless
  } finally {
    await clearTokens();
  }
}

export async function getMe(): Promise<User> {
  return get<User>('/auth/me');
}
