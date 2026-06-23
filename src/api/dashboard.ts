import { apiRequest } from './client';
import type { DashboardSummary } from '../types/api';

export const dashboardApi = {
  summary(signal?: AbortSignal): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>('/dashboard/summary', { signal });
  },
};
