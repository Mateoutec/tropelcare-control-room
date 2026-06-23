import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FieldLabel, SelectInput, TextInput } from '../../components/Field';
import { StateBlock } from '../../components/StateBlock';
import { signalStatusStorage } from '../../lib/storage';
import type { SignalDto } from '../../types/api';
import { SEVERITIES, SIGNAL_STATUSES, SIGNAL_TYPES } from '../../types/api';
import { SignalCard } from './SignalCard';
import { parseSignalFeedQuery, writeSignalFeedQuery } from './signalFeedQuery';

const mergeLocalStatus = (signal: SignalDto): SignalDto => {
  const status = signalStatusStorage.get(signal.id);
  if (status === 'RECIBIDA' || status === 'PROCESANDO' || status === 'ATENDIDA') return { ...signal, status };
  return signal;
};

export const SignalFeedPage = () => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseSignalFeedQuery(params), [params]);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const [items, setItems] = useState<SignalDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const restoredScrollRef = useRef(false);

  const applyItems = useCallback((incoming: SignalDto[], append: boolean) => {
    setItems((current) => {
      const base = append ? current : [];
      const seen = append ? new Set(seenIdsRef.current) : new Set<string>();
      const fresh: SignalDto[] = [];
      incoming.map(mergeLocalStatus).forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          fresh.push(item);
        }
      });
      seenIdsRef.current = seen;
      return [...base, ...fresh];
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsInitialLoading(true);
    setError(null);
    setHasMore(true);
    setNextCursor(null);
    seenIdsRef.current = new Set();

    api
      .signalFeed(filters, controller.signal)
      .then((response) => {
        applyItems(response.items, false);
        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
        setTotalEstimate(response.totalEstimate);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setItems([]);
        setError(err instanceof Error ? err.message : 'No se pudo cargar el feed.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsInitialLoading(false);
      });

    return () => controller.abort();
  }, [applyItems, filterKey, filters]);

  useEffect(() => {
    if (restoredScrollRef.current || isInitialLoading || items.length === 0) return;
    const saved = Number.parseInt(sessionStorage.getItem('tropelcare.signals-scroll') ?? '', 10);
    if (Number.isFinite(saved) && saved > 0) {
      restoredScrollRef.current = true;
      window.requestAnimationFrame(() => window.scrollTo({ top: saved }));
    }
  }, [isInitialLoading, items.length]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore || isInitialLoading) return;
    const controller = new AbortController();
    setIsLoadingMore(true);
    setError(null);
    try {
      const response = await api.signalFeed({ ...filters, cursor: nextCursor }, controller.signal);
      applyItems(response.items, true);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      setTotalEstimate(response.totalEstimate);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'No se pudo cargar la siguiente página.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [applyItems, filters, hasMore, isInitialLoading, isLoadingMore, nextCursor]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void loadMore();
      }
    }, { rootMargin: '500px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const update = (patch: Partial<Record<'signalType' | 'severity' | 'status' | 'q', string | undefined>>) => {
    sessionStorage.removeItem('tropelcare.signals-scroll');
    restoredScrollRef.current = false;
    setParams(writeSignalFeedQuery(params, patch));
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-black text-white">Feed infinito de Señales</h2>
        <p className="mt-2 text-slate-400">Cursor-based, deduplicado, con filtros persistidos en URL.</p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-4">
          <FieldLabel>
            Buscar
            <TextInput value={filters.q ?? ''} maxLength={80} placeholder="ID, tropel, contenido..." onChange={(event) => update({ q: event.target.value })} />
          </FieldLabel>
          <FieldLabel>
            Tipo
            <SelectInput value={filters.signalType ?? ''} onChange={(event) => update({ signalType: event.target.value })}>
              <option value="">Todos</option>
              {SIGNAL_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
          </FieldLabel>
          <FieldLabel>
            Severidad
            <SelectInput value={filters.severity ?? ''} onChange={(event) => update({ severity: event.target.value })}>
              <option value="">Todas</option>
              {SEVERITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
          </FieldLabel>
          <FieldLabel>
            Estado
            <SelectInput value={filters.status ?? ''} onChange={(event) => update({ status: event.target.value })}>
              <option value="">Todos</option>
              {SIGNAL_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
          </FieldLabel>
        </div>
      </Card>

      <div className="text-sm text-slate-400">Mostrando {items.length} de ~{totalEstimate}</div>

      {isInitialLoading && <StateBlock title="Cargando feed" message="Solicitando primera página del cursor." />}
      {!isInitialLoading && items.length === 0 && !error && <StateBlock title="Sin señales" message="No hay señales con esos filtros." />}

      <div className="grid gap-4">
        {items.map((signal) => <SignalCard key={signal.id} signal={signal} />)}
      </div>

      {error && (
        <Card className="border-rose-900 bg-rose-950/40">
          <p className="font-bold text-rose-100">Error recuperable</p>
          <p className="mt-1 text-sm text-rose-200">{error}</p>
          <Button className="mt-4" variant="secondary" onClick={() => void loadMore()}>Reintentar</Button>
        </Card>
      )}

      <div ref={sentinelRef} className="h-10" aria-hidden="true" />

      {isLoadingMore && <p className="text-center text-sm text-slate-400">Cargando más señales...</p>}
      {!hasMore && items.length > 0 && <p className="text-center text-sm text-slate-500">Fin de lista.</p>}
    </div>
  );
};
