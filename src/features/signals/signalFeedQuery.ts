import type { Severity, SignalFeedQuery, SignalStatus, SignalType } from '../../types/api';
import { SEVERITIES, SIGNAL_STATUSES, SIGNAL_TYPES } from '../../types/api';

const isSignalType = (value: string | null): value is SignalType => SIGNAL_TYPES.includes(value as SignalType);
const isSeverity = (value: string | null): value is Severity => SEVERITIES.includes(value as Severity);
const isSignalStatus = (value: string | null): value is SignalStatus => SIGNAL_STATUSES.includes(value as SignalStatus);

export const parseSignalFeedQuery = (params: URLSearchParams): Omit<SignalFeedQuery, 'cursor'> => {
  const signalType = params.get('signalType');
  const severity = params.get('severity');
  const status = params.get('status');

  return {
    limit: 15,
    signalType: isSignalType(signalType) ? signalType : undefined,
    severity: isSeverity(severity) ? severity : undefined,
    status: isSignalStatus(status) ? status : undefined,
    q: (params.get('q') ?? '').slice(0, 80) || undefined,
  };
};

export const writeSignalFeedQuery = (current: URLSearchParams, patch: Partial<Record<keyof SignalFeedQuery, string | undefined>>): URLSearchParams => {
  const next = new URLSearchParams(current);
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === '') next.delete(key);
    else next.set(key, value);
  });
  next.delete('cursor');
  return next;
};
