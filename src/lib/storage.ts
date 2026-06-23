const TOKEN_KEY = 'tropelcare.token';
const SIGNAL_STATUS_UPDATES_KEY = 'tropelcare.signal-status-updates';

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export type StoredSignalUpdates = Record<string, string>;

const parseSignalUpdates = (raw: string | null): StoredSignalUpdates => {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as StoredSignalUpdates;
  } catch {
    return {};
  }
};

export const signalStatusStorage = {
  getAll(): StoredSignalUpdates {
    return parseSignalUpdates(localStorage.getItem(SIGNAL_STATUS_UPDATES_KEY));
  },
  get(signalId: string): string | undefined {
    return this.getAll()[signalId];
  },
  set(signalId: string, status: string): void {
    const updates = this.getAll();
    updates[signalId] = status;
    localStorage.setItem(SIGNAL_STATUS_UPDATES_KEY, JSON.stringify(updates));
  },
};
