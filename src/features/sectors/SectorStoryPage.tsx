import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Card } from '../../components/Card';
import { StateBlock } from '../../components/StateBlock';
import { classNames } from '../../lib/classNames';
import { percent } from '../../lib/format';
import type { SectorStoryResponse } from '../../types/api';

const colorClasses = ['from-emerald-400', 'from-cyan-400', 'from-violet-400', 'from-amber-400', 'from-rose-400'];

export const SectorStoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<SectorStoryResponse | null>(null);
  const [activeOrder, setActiveOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stageRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    api
      .story(id, controller.signal)
      .then((response) => {
        const ordered = [...response.stages].sort((a, b) => a.order - b.order);
        setStory({ ...response, stages: ordered });
        setActiveOrder(0);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la historia.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const nodes = stageRefs.current.filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const order = visible?.target.getAttribute('data-order');
        if (order) setActiveOrder(Number.parseInt(order, 10));
      },
      { threshold: [0.35, 0.55, 0.75] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [story]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!story) return;
      if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1;
      const next = Math.max(0, Math.min(story.stages.length - 1, activeOrder + direction));
      stageRefs.current[next]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setActiveOrder(next);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeOrder, story]);

  const activeStage = useMemo(() => story?.stages[activeOrder] ?? story?.stages[0], [activeOrder, story]);

  if (isLoading) return <StateBlock title="Cargando Story Engine" message="Trayendo exactamente 8 etapas del sector." />;
  if (error) return <StateBlock title="Error" message={error} />;
  if (!story || !activeStage) return <StateBlock title="Sin historia" message="Este sector no devolvió etapas." />;

  const progress = story.stages.length <= 1 ? 1 : activeOrder / (story.stages.length - 1);

  return (
    <div className="story-panel grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/sectors" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">← Volver a sectores</Link>
          <h2 className="mt-2 text-3xl font-black text-white">{story.sector.name}</h2>
          <p className="mt-1 text-slate-400">{story.sector.climate} · etapa {activeOrder + 1} de {story.stages.length}</p>
        </div>
        <div className="w-full max-w-xs rounded-full bg-slate-800 p-1" aria-label={`Progreso ${percent(progress * 100)}`}>
          <div className="h-3 rounded-full bg-emerald-400 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <aside className="top-28 h-fit lg:sticky">
          <Card className="overflow-hidden">
            <div className={classNames('relative grid min-h-80 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br to-slate-950', colorClasses[activeOrder % colorClasses.length])}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
              <div className="relative text-center">
                <p className="text-sm font-bold uppercase tracking-[0.32em] text-slate-950/70">{activeStage.assetKey}</p>
                <div className="mx-auto mt-6 grid h-36 w-36 place-items-center rounded-[2rem] border border-white/30 bg-white/15 text-5xl shadow-2xl backdrop-blur">
                  {activeStage.order + 1}
                </div>
                <p className="mt-6 text-2xl font-black text-white">{activeStage.dominantEvent}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {Object.entries(activeStage.metrics).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                  <p className="text-xs uppercase text-slate-500">{key}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        <section className="grid gap-12" aria-label="Etapas narrativas">
          {story.stages.map((stage, index) => (
            <article
              key={stage.id}
              ref={(node) => { stageRefs.current[index] = node; }}
              data-order={stage.order}
              tabIndex={0}
              className={classNames(
                'stage-card min-h-[62vh] rounded-3xl border p-6 transition focus:border-emerald-300',
                activeOrder === stage.order ? 'border-emerald-600 bg-slate-950/90' : 'border-slate-800 bg-slate-950/45',
              )}
            >
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-300">Etapa {stage.order + 1}</p>
              <h3 className="mt-4 text-3xl font-black text-white">{stage.title}</h3>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{stage.narrative}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-900 p-4"><p className="text-xs text-slate-500">Evento dominante</p><p className="font-bold text-white">{stage.dominantEvent}</p></div>
                <div className="rounded-2xl bg-slate-900 p-4"><p className="text-xs text-slate-500">Color token</p><p className="font-bold text-white">{stage.colorToken}</p></div>
                <div className="rounded-2xl bg-slate-900 p-4"><p className="text-xs text-slate-500">Progreso data</p><p className="font-bold text-white">{percent(stage.progress * 100)}</p></div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};
