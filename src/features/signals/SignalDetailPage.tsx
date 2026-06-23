import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StateBlock } from '../../components/StateBlock';
import { formatDateTime } from '../../lib/format';
import { signalStatusStorage } from '../../lib/storage';
import type { SignalDto, WritableSignalStatus } from '../../types/api';

export const SignalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [signal, setSignal] = useState<SignalDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    api
      .signalDetail(id, controller.signal)
      .then((response) => setSignal(response))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la señal.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const updateStatus = async (status: WritableSignalStatus) => {
    if (!id || !signal) return;
    const previous = signal;
    setActionError(null);
    setConfirmation(null);
    setIsSaving(true);
    try {
      const updated = await api.updateSignalStatus(id, status);
      setSignal(updated);
      signalStatusStorage.set(id, updated.status);
      setConfirmation(`Estado actualizado a ${updated.status}.`);
    } catch (err) {
      setSignal(previous);
      setActionError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <StateBlock title="Cargando señal" message="Consultando el detalle real." />;
  if (error) return <StateBlock title="Error" message={error} />;
  if (!signal) return <StateBlock title="Sin datos" message="La señal no existe o no pertenece al workspace." />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/signals" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">← Volver al feed</Link>
          <h2 className="mt-2 text-3xl font-black text-white">Detalle de {signal.id}</h2>
        </div>
        <Button variant="secondary" onClick={() => navigate('/signals')}>Cerrar detalle</Button>
      </div>

      <Card>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-200">{signal.signalType}</span>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-200">{signal.severity}</span>
              <span className="rounded-full border border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-200">{signal.status}</span>
            </div>
            <p className="mt-5 text-xl font-bold text-white">{signal.rawContent}</p>
            <dl className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div><dt className="text-slate-500">Tropel</dt><dd>{signal.tropel.name} · {signal.tropel.species}</dd></div>
              <div><dt className="text-slate-500">Creada</dt><dd>{formatDateTime(signal.createdAt)}</dd></div>
              <div><dt className="text-slate-500">Actualizada</dt><dd>{formatDateTime(signal.updatedAt)}</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="font-bold text-white">Atender señal</h3>
            <p className="mt-2 text-sm text-slate-400">Solo se permite cambiar a PROCESANDO o ATENDIDA.</p>
            <div className="mt-5 grid gap-3">
              <Button disabled={isSaving || signal.status === 'PROCESANDO'} onClick={() => void updateStatus('PROCESANDO')}>Marcar PROCESANDO</Button>
              <Button disabled={isSaving || signal.status === 'ATENDIDA'} onClick={() => void updateStatus('ATENDIDA')}>Marcar ATENDIDA</Button>
            </div>
            {isSaving && <p className="mt-3 text-sm text-slate-400">Actualizando...</p>}
            {confirmation && <p className="mt-3 rounded-xl border border-emerald-900 bg-emerald-950/50 p-3 text-sm text-emerald-200">{confirmation}</p>}
            {actionError && <p className="mt-3 rounded-xl border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-200">{actionError}</p>}
          </div>
        </div>
      </Card>
    </div>
  );
};
