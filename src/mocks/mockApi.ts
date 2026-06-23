import { env } from '../lib/env';
import { signalStatusStorage } from '../lib/storage';
import type {
  LoginRequest,
  LoginResponse,
  PageResponse,
  SectorStoryResponse,
  SectorsResponse,
  SignalDto,
  SignalFeedQuery,
  SignalFeedResponse,
  TropelDto,
  TropelQuery,
  UserDto,
  WritableSignalStatus,
} from '../types/api';
import { computeDashboard, createMockDatabase } from './mockData';

let activeTeamCode = 'TEAM-001';
let db = createMockDatabase(activeTeamCode);

const delay = async (signal?: AbortSignal): Promise<void> => {
  const delayMs = Number.isFinite(env.mockDelayMs) ? env.mockDelayMs : 250;
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, delayMs);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Request abortado', 'AbortError'));
    });
  });
};

const userForTeam = (teamCode: string): UserDto => ({
  id: `usr_${teamCode.toLowerCase()}`,
  displayName: 'Operator 1',
  email: 'operator@tuckersoft.com',
  teamCode,
  role: 'OPERATOR',
});

const normalize = (value: string): string => value.trim().toLowerCase();

const encodeCursor = (index: number, filterHash: string): string => window.btoa(JSON.stringify({ index, filterHash }));
const decodeCursor = (cursor: string): { index: number; filterHash: string } | null => {
  try {
    const parsed: unknown = JSON.parse(window.atob(cursor));
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as { index?: unknown; filterHash?: unknown };
    if (typeof candidate.index !== 'number' || typeof candidate.filterHash !== 'string') return null;
    return { index: candidate.index, filterHash: candidate.filterHash };
  } catch {
    return null;
  }
};

const signalFilterHash = (query: SignalFeedQuery): string =>
  JSON.stringify({
    signalType: query.signalType ?? '',
    severity: query.severity ?? '',
    status: query.status ?? '',
    q: query.q ?? '',
  });

const withLocalSignalStatus = (signal: SignalDto): SignalDto => {
  const status = signalStatusStorage.get(signal.id);
  if (status === 'PROCESANDO' || status === 'ATENDIDA' || status === 'RECIBIDA') {
    return { ...signal, status };
  }
  return signal;
};

export const mockApi = {
  async login(payload: LoginRequest, signal?: AbortSignal): Promise<LoginResponse> {
    await delay(signal);
    activeTeamCode = payload.teamCode.trim() || 'TEAM-001';
    db = createMockDatabase(activeTeamCode);
    return {
      token: `mock-token-${activeTeamCode}`,
      expiresAt: '2026-06-22T20:00:00.000Z',
      user: userForTeam(activeTeamCode),
    };
  },

  async me(signal?: AbortSignal): Promise<UserDto> {
    await delay(signal);
    return userForTeam(activeTeamCode);
  },

  async dashboard(signal?: AbortSignal) {
    await delay(signal);
    return computeDashboard(db);
  },

  async sectors(signal?: AbortSignal): Promise<SectorsResponse> {
    await delay(signal);
    return { items: db.sectors };
  },

  async story(id: string, signal?: AbortSignal): Promise<SectorStoryResponse> {
    await delay(signal);
    const story = db.stories[id];
    if (!story) throw new Error('Sector no encontrado');
    return story;
  },

  async tropels(query: TropelQuery, signal?: AbortSignal): Promise<PageResponse<TropelDto>> {
    await delay(signal);
    const search = normalize(query.q ?? '');
    let rows = db.tropels.filter((tropel) => {
      if (query.species && tropel.species !== query.species) return false;
      if (query.vitalState && tropel.vitalState !== query.vitalState) return false;
      if (query.sectorId && tropel.sector.id !== query.sectorId) return false;
      if (search && !normalize(`${tropel.name} ${tropel.guardianName} ${tropel.sector.name}`).includes(search)) return false;
      return true;
    });

    if (query.sort === 'name,asc') rows = rows.sort((a, b) => a.name.localeCompare(b.name));
    if (query.sort === 'updatedAt,desc') rows = rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (query.sort === 'chaosIndex,desc') rows = rows.sort((a, b) => b.chaosIndex - a.chaosIndex);

    const totalElements = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / query.size));
    const start = query.page * query.size;
    const content = rows.slice(start, start + query.size);

    return { content, totalElements, totalPages, currentPage: query.page, size: query.size };
  },

  async signalFeed(query: SignalFeedQuery, signal?: AbortSignal): Promise<SignalFeedResponse> {
    await delay(signal);
    const filterHash = signalFilterHash(query);
    const decoded = query.cursor ? decodeCursor(query.cursor) : null;
    if (query.cursor && (!decoded || decoded.filterHash !== filterHash)) {
      throw new Error('Cursor usado con filtros distintos');
    }

    const search = normalize(query.q ?? '');
    const rows = db.signals.map(withLocalSignalStatus).filter((item) => {
      if (query.signalType && item.signalType !== query.signalType) return false;
      if (query.severity && item.severity !== query.severity) return false;
      if (query.status && item.status !== query.status) return false;
      if (search && !normalize(`${item.id} ${item.rawContent} ${item.tropel.name}`).includes(search)) return false;
      return true;
    });

    const start = decoded?.index ?? 0;
    const limit = Math.min(Math.max(query.limit, 1), 30);
    const items = rows.slice(start, start + limit);
    const nextIndex = start + items.length;
    const hasMore = nextIndex < rows.length;

    return {
      items,
      nextCursor: hasMore ? encodeCursor(nextIndex, filterHash) : null,
      hasMore,
      totalEstimate: rows.length,
    };
  },

  async signalDetail(id: string, signal?: AbortSignal): Promise<SignalDto> {
    await delay(signal);
    const found = db.signals.find((item) => item.id === id);
    if (!found) throw new Error('Señal no encontrada');
    return withLocalSignalStatus(found);
  },

  async updateSignalStatus(id: string, status: WritableSignalStatus, signal?: AbortSignal): Promise<SignalDto> {
    await delay(signal);
    const index = db.signals.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Señal no encontrada');
    const updated: SignalDto = {
      ...db.signals[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    db.signals[index] = updated;
    signalStatusStorage.set(id, status);
    return updated;
  },
};
