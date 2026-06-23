export const SPECIES = ['BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY'] as const;
export type Species = (typeof SPECIES)[number];

export const VITAL_STATES = ['ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO'] as const;
export type VitalState = (typeof VITAL_STATES)[number];

export const SIGNAL_TYPES = [
  'HAMBRE',
  'ABANDONO',
  'MUTACION',
  'FUGA',
  'CONFLICTO',
  'REPRODUCCION_MASIVA',
  'SENAL_CORRUPTA',
] as const;
export type SignalType = (typeof SIGNAL_TYPES)[number];

export const SEVERITIES = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SIGNAL_STATUSES = ['RECIBIDA', 'PROCESANDO', 'ATENDIDA'] as const;
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];
export type WritableSignalStatus = Exclude<SignalStatus, 'RECIBIDA'>;

export const CLIMATES = ['PIXEL_FOREST', 'NEON_CAVE', 'CLOUD_AQUARIUM', 'RETRO_ARCADE'] as const;
export type Climate = (typeof CLIMATES)[number];

export const TROPEL_SORT_OPTIONS = ['name,asc', 'updatedAt,desc', 'chaosIndex,desc'] as const;
export type TropelSort = (typeof TROPEL_SORT_OPTIONS)[number];

export interface ApiErrorBody {
  error: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'RATE_LIMITED' | 'INTERNAL_ERROR' | string;
  message: string;
  timestamp: string;
  path: string;
  details: Record<string, unknown>;
}

export interface UserDto {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: 'OPERATOR' | string;
}

export interface LoginRequest {
  teamCode: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserDto;
}

export interface DashboardSummary {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: Record<Severity, number>;
  generatedAt: string;
}

export interface SectorLiteDto {
  id: string;
  sectorCode: string;
  name: string;
}

export interface TropelDto {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: SectorLiteDto;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface TropelQuery {
  page: number;
  size: 10 | 20 | 50;
  species?: Species;
  vitalState?: VitalState;
  sectorId?: string;
  q?: string;
  sort: TropelSort;
}

export interface SignalTropelDto {
  id: string;
  name: string;
  species: Species;
}

export interface SignalDto {
  id: string;
  signalType: SignalType;
  severity: Severity;
  status: SignalStatus;
  rawContent: string;
  tropel: SignalTropelDto;
  createdAt: string;
  updatedAt: string;
}

export interface SignalFeedQuery {
  cursor?: string;
  limit: number;
  signalType?: SignalType;
  severity?: Severity;
  status?: SignalStatus;
  q?: string;
}

export interface SignalFeedResponse {
  items: SignalDto[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface SectorDto {
  id: string;
  sectorCode: string;
  name: string;
  climate: Climate;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface SectorsResponse {
  items: SectorDto[];
}

export interface StoryMetricMap {
  stability: number;
  energy: number;
  alerts: number;
  [key: string]: number;
}

export interface SectorStoryStageDto {
  id: string;
  order: number;
  title: string;
  narrative: string;
  dominantEvent: SignalType;
  metrics: StoryMetricMap;
  assetKey: string;
  colorToken: string;
  progress: number;
}

export interface SectorStoryResponse {
  sector: {
    id: string;
    name: string;
    climate: Climate;
  };
  stages: SectorStoryStageDto[];
}
