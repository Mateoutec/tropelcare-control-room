import type {
  Climate,
  DashboardSummary,
  SectorDto,
  SectorStoryResponse,
  SectorStoryStageDto,
  Severity,
  SignalDto,
  SignalStatus,
  Species,
  TropelDto,
  VitalState,
} from '../types/api';
import { CLIMATES, SEVERITIES, SIGNAL_STATUSES, SIGNAL_TYPES, SPECIES, VITAL_STATES } from '../types/api';

type MockDatabase = {
  sectors: SectorDto[];
  tropels: TropelDto[];
  signals: SignalDto[];
  stories: Record<string, SectorStoryResponse>;
};

const sectorNames = [
  'Bosque Norte',
  'Cueva Neón',
  'Acuario de Nubes',
  'Arcade Central',
  'Jardín Glitch',
  'Lago Pixel',
  'Torre Prisma',
  'Núcleo Retro',
  'Pantano Chispa',
  'Valle Blob',
  'Domo Dormilón',
  'Puerto Caótico',
];

const guardians = ['Ada', 'Linus', 'Grace', 'Ken', 'Hedy', 'Alan', 'Radia', 'Edsger'];
const rawContents = [
  'Patrón de energía por debajo del umbral',
  'Aumento de caos detectado en el sector',
  'Pulso irregular con riesgo de mutación',
  'Señal repetida desde el borde del perímetro',
  'Conflicto menor entre tropeles cercanos',
  'Actividad masiva en crecimiento',
  'Lectura corrupta requiere revisión manual',
];

const hashSeed = (input: string): number =>
  Array.from(input).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 2166136261);

const createRandom = (seedText: string): (() => number) => {
  let seed = hashSeed(seedText);
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
};

const pick = <T>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length) % items.length];
const pad = (value: number): string => String(value).padStart(3, '0');
const daysAgo = (days: number, minutes: number): string => {
  const base = new Date('2026-06-22T15:00:00.000Z');
  base.setDate(base.getDate() - days);
  base.setMinutes(base.getMinutes() - minutes);
  return base.toISOString();
};

const buildStages = (sector: SectorDto, random: () => number): SectorStoryStageDto[] =>
  Array.from({ length: 8 }, (_, index) => {
    const stability = Math.max(5, Math.min(99, sector.stabilityLevel + Math.round((random() - 0.5) * 24)));
    const energy = Math.max(10, Math.min(100, 45 + Math.round(random() * 50)));
    const alerts = Math.max(0, Math.round(random() * 12));
    const dominantEvent = pick(SIGNAL_TYPES, random);
    return {
      id: `stage_${sector.id}_${index}`,
      order: index,
      title: ['Primer pulso', 'Eco de carga', 'Ruido latente', 'Crisis suave', 'Patrón vivo', 'Giro de energía', 'Equilibrio final', 'Cierre estable'][index],
      narrative: `Etapa ${index + 1}: ${sector.name} muestra un evento ${dominantEvent.toLowerCase()} con estabilidad ${stability} y energía ${energy}.`,
      dominantEvent,
      metrics: { stability, energy, alerts },
      assetKey: `${sector.climate.toLowerCase()}-${index}`,
      colorToken: ['emerald', 'cyan', 'violet', 'amber', 'rose'][index % 5],
      progress: index / 7,
    };
  });

export const createMockDatabase = (teamCode: string): MockDatabase => {
  const random = createRandom(teamCode);

  const sectors: SectorDto[] = Array.from({ length: 12 }, (_, index) => {
    const climate: Climate = CLIMATES[index % CLIMATES.length];
    const capacity = 16 + Math.floor(random() * 18);
    const currentLoad = Math.max(4, Math.min(capacity, 8 + Math.floor(random() * capacity)));
    return {
      id: `sec_${pad(index + 1)}`,
      sectorCode: `SEC-${String(index + 1).padStart(2, '0')}`,
      name: sectorNames[index],
      climate,
      capacity,
      currentLoad,
      stabilityLevel: 45 + Math.floor(random() * 48),
    };
  });

  const tropels: TropelDto[] = Array.from({ length: 120 }, (_, index) => {
    const sector = sectors[index % sectors.length];
    const species: Species = pick(SPECIES, random);
    const vitalState: VitalState = pick(VITAL_STATES, random);
    const chaosIndex = Math.floor(random() * 100);
    return {
      id: `trp_${pad(index + 1)}`,
      name: `${species.toLowerCase()}-${pad(index + 1)}`,
      species,
      vitalState,
      energyLevel: Math.floor(20 + random() * 80),
      chaosIndex,
      mutationStage: Math.floor(random() * 5),
      guardianName: pick(guardians, random),
      sector: {
        id: sector.id,
        name: sector.name,
        sectorCode: sector.sectorCode,
      },
      createdAt: daysAgo(8 + (index % 9), index * 5),
      updatedAt: daysAgo(index % 4, index * 13),
    };
  });

  const signals: SignalDto[] = Array.from({ length: 600 }, (_, index) => {
    const tropel = tropels[index % tropels.length];
    const status: SignalStatus = index % 5 === 0 ? 'ATENDIDA' : pick(SIGNAL_STATUSES, random);
    return {
      id: `sig_${pad(index + 1)}`,
      signalType: pick(SIGNAL_TYPES, random),
      severity: pick(SEVERITIES, random),
      status,
      rawContent: pick(rawContents, random),
      tropel: {
        id: tropel.id,
        name: tropel.name,
        species: tropel.species,
      },
      createdAt: daysAgo(Math.floor(index / 90), index * 3),
      updatedAt: daysAgo(Math.floor(index / 100), index * 2),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));

  const stories = sectors.reduce<Record<string, SectorStoryResponse>>((acc, sector) => {
    acc[sector.id] = {
      sector: {
        id: sector.id,
        name: sector.name,
        climate: sector.climate,
      },
      stages: buildStages(sector, random),
    };
    return acc;
  }, {});

  return { sectors, tropels, signals, stories };
};

export const computeDashboard = (db: MockDatabase): DashboardSummary => {
  const openSignals = db.signals.filter((signal) => signal.status !== 'ATENDIDA').length;
  const signalsBySeverity = SEVERITIES.reduce<Record<Severity, number>>((acc, severity) => {
    acc[severity] = db.signals.filter((signal) => signal.severity === severity).length;
    return acc;
  }, { LEVE: 0, MODERADO: 0, GRAVE: 0, CRITICO: 0 });

  return {
    totalTropels: db.tropels.length,
    criticalTropels: db.tropels.filter((tropel) => tropel.vitalState === 'CRITICO').length,
    openSignals,
    sectorStabilityAvg: Math.round(db.sectors.reduce((sum, sector) => sum + sector.stabilityLevel, 0) / db.sectors.length),
    signalsBySeverity,
    generatedAt: new Date('2026-06-22T15:00:00.000Z').toISOString(),
  };
};
