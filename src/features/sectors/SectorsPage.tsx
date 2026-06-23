import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StateBlock } from '../../components/StateBlock';
import { runViewTransition } from '../../lib/viewTransition';
import type { SectorDto } from '../../types/api';

export const SectorsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SectorDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    api
      .sectors(controller.signal)
      .then((response) => setItems(response.items))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar sectores.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (isLoading) return <StateBlock title="Cargando sectores" message="Consultando sectores del workspace." />;
  if (error) return <StateBlock title="Error" message={error} />;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-black text-white">Sectores</h2>
        <p className="mt-2 text-slate-400">Elige un sector para abrir el Story Engine.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((sector) => (
          <Card key={sector.id} className="story-panel">
            <p className="text-sm font-semibold text-emerald-300">{sector.sectorCode}</p>
            <h3 className="mt-2 text-xl font-black text-white">{sector.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{sector.climate}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-slate-900 p-3"><p className="text-slate-500">Cap.</p><p className="font-bold text-white">{sector.capacity}</p></div>
              <div className="rounded-xl bg-slate-900 p-3"><p className="text-slate-500">Carga</p><p className="font-bold text-white">{sector.currentLoad}</p></div>
              <div className="rounded-xl bg-slate-900 p-3"><p className="text-slate-500">Est.</p><p className="font-bold text-white">{sector.stabilityLevel}%</p></div>
            </div>
            <Button className="mt-5 w-full" onClick={() => runViewTransition(() => navigate(`/sectors/${sector.id}/story`))}>
              Abrir historia
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
