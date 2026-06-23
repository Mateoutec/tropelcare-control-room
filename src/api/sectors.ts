import { apiRequest } from './client';
import type { SectorStoryResponse, SectorsResponse } from '../types/api';

export const sectorsApi = {
  list(signal?: AbortSignal): Promise<SectorsResponse> {
    return apiRequest<SectorsResponse>('/sectors', { signal });
  },

  story(id: string, signal?: AbortSignal): Promise<SectorStoryResponse> {
    return apiRequest<SectorStoryResponse>(`/sectors/${encodeURIComponent(id)}/story`, { signal });
  },
};
