import { apiRequest } from './client';
import type { PageResponse, TropelDto, TropelQuery } from '../types/api';

const appendOptional = (params: URLSearchParams, key: string, value: string | undefined): void => {
  if (value && value.trim().length > 0) params.set(key, value.trim());
};

export const tropelsApi = {
  list(query: TropelQuery, signal?: AbortSignal): Promise<PageResponse<TropelDto>> {
    const params = new URLSearchParams();
    params.set('page', String(query.page));
    params.set('size', String(query.size));
    params.set('sort', query.sort);
    appendOptional(params, 'species', query.species);
    appendOptional(params, 'vitalState', query.vitalState);
    appendOptional(params, 'sectorId', query.sectorId);
    appendOptional(params, 'q', query.q);

    return apiRequest<PageResponse<TropelDto>>(`/tropels?${params.toString()}`, { signal });
  },

  detail(id: string, signal?: AbortSignal): Promise<TropelDto> {
    return apiRequest<TropelDto>(`/tropels/${encodeURIComponent(id)}`, { signal });
  },
};
