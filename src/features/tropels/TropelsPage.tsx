import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FieldLabel, SelectInput, TextInput } from '../../components/Field';
import { StateBlock } from '../../components/StateBlock';
import { formatDateTime } from '../../lib/format';
import type { PageResponse, SectorDto, TropelDto } from '../../types/api';
import { SPECIES, TROPEL_SORT_OPTIONS, VITAL_STATES } from '../../types/api';
import { parseTropelQuery, writeTropelQuery } from './tropelQuery';

export const TropelsPage = () => {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseTropelQuery(params), [params]);
  const [page, setPage] = useState<PageResponse<TropelDto> | null>(null);
  const [sectors, setSectors] = useState<SectorDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    api
      .sectors(controller.signal)
      .then((response) => setSectors(response.items))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    api
      .tropels(query, controller.signal)
      .then((response) => setPage(response))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar Tropeles.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  const update = (patch: Partial<Record<keyof typeof query, string | number | undefined>>, resetPage = true) => {
    setParams(writeTropelQuery(params, patch, resetPage));
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-black text-white">Atlas de Tropeles</h2>
        <p className="mt-2 text-slate-400">Paginación, filtros, búsqueda y ordenamiento sincronizados con la URL.</p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <FieldLabel>
            Buscar
            <TextInput value={query.q ?? ''} maxLength={80} placeholder="Nombre, guardián..." onChange={(event) => update({ q: event.target.value })} />
          </FieldLabel>
          <FieldLabel>
            Especie
            <SelectInput value={query.species ?? ''} onChange={(event) => update({ species: event.target.value })}>
              <option value="">Todas</option>
              {SPECIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
          </FieldLabel>
          <FieldLabel>
            Estado vital
            <SelectInput value={query.vitalState ?? ''} onChange={(event) => update({ vitalState: event.target.value })}>
              <option value="">Todos</option>
              {VITAL_STATES.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
          </FieldLabel>
          <FieldLabel>
            Sector
            <SelectInput value={query.sectorId ?? ''} onChange={(event) => update({ sectorId: event.target.value })}>
              <option value="">Todos</option>
              {sectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.sectorCode} · {sector.name}</option>)}
            </SelectInput>
          </FieldLabel>
          <FieldLabel>
            Orden
            <SelectInput value={query.sort} onChange={(event) => update({ sort: event.target.value })}>
              {TROPEL_SORT_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
          </FieldLabel>
          <FieldLabel>
            Tamaño
            <SelectInput value={query.size} onChange={(event) => update({ size: event.target.value })}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </SelectInput>
          </FieldLabel>
        </div>
      </Card>

      {error && <StateBlock title="Error al cargar" message={error} />}

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-800 p-4 text-sm text-slate-400">
          <span>{isLoading ? 'Cargando...' : `${page?.totalElements ?? 0} resultados`}</span>
          <span>Página {(page?.currentPage ?? query.page) + 1} de {page?.totalPages ?? 1}</span>
        </div>

        {!isLoading && page?.content.length === 0 && <div className="p-6"><StateBlock title="Sin resultados" message="Prueba cambiando filtros o búsqueda." /></div>}

        <div className="divide-y divide-slate-800">
          {(page?.content ?? []).map((tropel) => (
            <article key={tropel.id} className="grid gap-3 p-4 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-center">
              <div>
                <p className="font-bold text-white">{tropel.name}</p>
                <p className="text-sm text-slate-400">{tropel.species} · {tropel.guardianName}</p>
              </div>
              <div className="text-sm text-slate-300">{tropel.vitalState}</div>
              <div className="text-sm text-slate-300">Caos {tropel.chaosIndex} · Energía {tropel.energyLevel}</div>
              <div className="text-sm text-slate-400">{tropel.sector.sectorCode} · {formatDateTime(tropel.updatedAt)}</div>
            </article>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" disabled={query.page <= 0 || isLoading} onClick={() => update({ page: Math.max(0, query.page - 1) }, false)}>
          Anterior
        </Button>
        <Button variant="secondary" disabled={isLoading || !page || query.page + 1 >= page.totalPages} onClick={() => update({ page: query.page + 1 }, false)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
};
