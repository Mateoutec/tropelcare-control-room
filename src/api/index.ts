import { env } from '../lib/env';
import { authApi } from './auth';
import { dashboardApi } from './dashboard';
import { sectorsApi } from './sectors';
import { signalsApi } from './signals';
import { tropelsApi } from './tropels';
import { mockApi } from '../mocks/mockApi';
import type { LoginRequest, SignalFeedQuery, TropelQuery, WritableSignalStatus } from '../types/api';

export const api = {
  login(payload: LoginRequest, signal?: AbortSignal) {
    return env.useMocks ? mockApi.login(payload, signal) : authApi.login(payload, signal);
  },
  me(signal?: AbortSignal) {
    return env.useMocks ? mockApi.me(signal) : authApi.me(signal);
  },
  dashboard(signal?: AbortSignal) {
    return env.useMocks ? mockApi.dashboard(signal) : dashboardApi.summary(signal);
  },
  sectors(signal?: AbortSignal) {
    return env.useMocks ? mockApi.sectors(signal) : sectorsApi.list(signal);
  },
  story(id: string, signal?: AbortSignal) {
    return env.useMocks ? mockApi.story(id, signal) : sectorsApi.story(id, signal);
  },
  tropels(query: TropelQuery, signal?: AbortSignal) {
    return env.useMocks ? mockApi.tropels(query, signal) : tropelsApi.list(query, signal);
  },
  signalFeed(query: SignalFeedQuery, signal?: AbortSignal) {
    return env.useMocks ? mockApi.signalFeed(query, signal) : signalsApi.feed(query, signal);
  },
  signalDetail(id: string, signal?: AbortSignal) {
    return env.useMocks ? mockApi.signalDetail(id, signal) : signalsApi.detail(id, signal);
  },
  updateSignalStatus(id: string, status: WritableSignalStatus, signal?: AbortSignal) {
    return env.useMocks ? mockApi.updateSignalStatus(id, status, signal) : signalsApi.updateStatus(id, status, signal);
  },
};
