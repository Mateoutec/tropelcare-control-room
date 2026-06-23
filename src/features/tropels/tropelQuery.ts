import type { Species, TropelQuery, TropelSort, VitalState } from '../../types/api';
import { SPECIES, TROPEL_SORT_OPTIONS, VITAL_STATES } from '../../types/api';

const isSpecies = (value: string | null): value is Species => SPECIES.includes(value as Species);
const isVitalState = (value: string | null): value is VitalState => VITAL_STATES.includes(value as VitalState);
const isSort = (value: string | null): value is TropelSort => TROPEL_SORT_OPTIONS.includes(value as TropelSort);

const parseSize = (value: string | null): 10 | 20 | 50 => {
  if (value === '10' || value === '20' || value === '50') return Number(value) as 10 | 20 | 50;
  return 20;
};

const parsePage = (value: string | null): number => {
  const page = Number.parseInt(value ?? '0', 10);
  return Number.isFinite(page) && page >= 0 ? page : 0;
};

export const parseTropelQuery = (params: URLSearchParams): TropelQuery => {
  const species = params.get('species');
  const vitalState = params.get('vitalState');
  const sort = params.get('sort');

  return {
    page: parsePage(params.get('page')),
    size: parseSize(params.get('size')),
    species: isSpecies(species) ? species : undefined,
    vitalState: isVitalState(vitalState) ? vitalState : undefined,
    sectorId: params.get('sectorId') || undefined,
    q: (params.get('q') ?? '').slice(0, 80) || undefined,
    sort: isSort(sort) ? sort : 'updatedAt,desc',
  };
};

export const writeTropelQuery = (current: URLSearchParams, patch: Partial<Record<keyof TropelQuery, string | number | undefined>>, resetPage = true): URLSearchParams => {
  const next = new URLSearchParams(current);

  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === '') next.delete(key);
    else next.set(key, String(value));
  });

  if (resetPage) next.set('page', '0');
  if (!next.get('size')) next.set('size', '20');
  if (!next.get('sort')) next.set('sort', 'updatedAt,desc');

  return next;
};
