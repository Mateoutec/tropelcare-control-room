const normalizeBoolean = (value: string | undefined): boolean => value?.toLowerCase() === 'true';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '',
  useMocks: normalizeBoolean(import.meta.env.VITE_USE_MOCKS),
  mockDelayMs: Number.parseInt(import.meta.env.VITE_MOCK_DELAY_MS ?? '250', 10),
};
