import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { classNames } from '../../lib/classNames';
import { formatDateTime } from '../../lib/format';
import type { SignalDto } from '../../types/api';

const severityClass = {
  LEVE: 'border-emerald-800 text-emerald-200',
  MODERADO: 'border-amber-800 text-amber-200',
  GRAVE: 'border-orange-800 text-orange-200',
  CRITICO: 'border-rose-800 text-rose-200',
};

export const SignalCard = ({ signal }: { signal: SignalDto }) => {
  const rememberScroll = () => {
    sessionStorage.setItem('tropelcare.signals-scroll', String(window.scrollY));
  };

  return (
    <Card className="transition hover:border-emerald-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={classNames('rounded-full border px-2 py-1 text-xs font-bold', severityClass[signal.severity])}>{signal.severity}</span>
            <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{signal.signalType}</span>
            <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{signal.status}</span>
          </div>
          <h3 className="mt-3 text-lg font-black text-white">{signal.id} · {signal.tropel.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{signal.rawContent}</p>
          <p className="mt-3 text-xs text-slate-500">Creada {formatDateTime(signal.createdAt)}</p>
        </div>
        <Link
          to={`/signals/${signal.id}`}
          onClick={rememberScroll}
          className="rounded-xl bg-slate-800 px-4 py-2 text-center text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Abrir detalle
        </Link>
      </div>
    </Card>
  );
};
