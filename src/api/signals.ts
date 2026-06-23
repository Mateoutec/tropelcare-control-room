import { apiRequest } from './client';
import type { SignalDto, SignalFeedQuery, SignalFeedResponse, WritableSignalStatus } from '../types/api';

const appendOptional = (params: URLSearchParams, key: string, value: string | undefined): void => {
  if (value && value.trim().length > 0) params.set(key, value.trim());
};

export const signalsApi = {
  feed(query: SignalFeedQuery, signal?: AbortSignal): Promise<SignalFeedResponse> {
    const params = new URLSearchParams();
    params.set('limit', String(query.limit));
    appendOptional(params, 'cursor', query.cursor);
    appendOptional(params, 'signalType', query.signalType);
    appendOptional(params, 'severity', query.severity);
    appendOptional(params, 'status', query.status);
    appendOptional(params, 'q', query.q);

    return apiRequest<SignalFeedResponse>(`/signals/feed?${params.toString()}`, { signal });
  },

  detail(id: string, signal?: AbortSignal): Promise<SignalDto> {
    return apiRequest<SignalDto>(`/signals/${encodeURIComponent(id)}`, { signal });
  },

  updateStatus(id: string, status: WritableSignalStatus, signal?: AbortSignal): Promise<SignalDto> {
    return apiRequest<SignalDto>(`/signals/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status },
      signal,
    });
  },
};
