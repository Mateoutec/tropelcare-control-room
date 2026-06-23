import type { ApiErrorBody } from '../types/api';
import { env } from '../lib/env';

type TokenGetter = () => string | null;
let tokenGetter: TokenGetter = () => null;

export const setTokenGetter = (getter: TokenGetter): void => {
  tokenGetter = getter;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const isJsonResponse = (response: Response): boolean =>
  response.headers.get('content-type')?.includes('application/json') ?? false;

const buildUrl = (path: string): string => {
  if (!env.apiBaseUrl) {
    throw new Error('Falta VITE_API_BASE_URL o activa VITE_USE_MOCKS=true para desarrollo.');
  }

  return `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  signal?: AbortSignal;
  auth?: boolean;
}

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const headers = new Headers();
  headers.set('Accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = tokenGetter();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const responseBody: unknown = isJsonResponse(response) ? await response.json() : null;

  if (!response.ok) {
    const errorBody = responseBody && typeof responseBody === 'object' ? (responseBody as ApiErrorBody) : null;
    throw new ApiError(response.status, errorBody, errorBody?.message ?? `Error HTTP ${response.status}`);
  }

  return responseBody as T;
};
