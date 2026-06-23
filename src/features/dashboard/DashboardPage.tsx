import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Card } from '../../components/Card';
import { StateBlock } from '../../components/StateBlock';
import { formatDateTime } from '../../lib/format';
import type { DashboardSummary } from '../../types/api';

const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <Card>
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
    {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
  </Card>
);

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    api
      .dashboard(controller.signal)
      .then((summary) => setData(summary))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (isLoading) return <StateBlock title="Cargando dashboard" message="Consultando indicadores del workspace." />;
  if (error) return <StateBlock title="Error en dashboard" message={error} />;
  if (!data) return <StateBlock title="Sin datos" message="La API no devolvió indicadores." />;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-black text-white">Dashboard operativo</h2>
        <p className="mt-2 text-slate-400">Generado: {formatDateTime(data.generatedAt)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tropeles totales" value={data.totalTropels} />
        <StatCard label="Tropeles críticos" value={data.criticalTropels} />
        <StatCard label="Señales abiertas" value={data.openSignals} />
        <StatCard label="Estabilidad promedio" value={`${data.sectorStabilityAvg}%`} />
      </div>

      <Card>
        <h3 className="text-xl font-bold text-white">Señales por severidad</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {Object.entries(data.signalsBySeverity).map(([severity, count]) => (
            <div key={severity} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm text-slate-400">{severity}</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
