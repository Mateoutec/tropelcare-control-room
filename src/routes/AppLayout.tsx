import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '../components/Button';
import { classNames } from '../lib/classNames';
import { useAuth } from '../features/auth/AuthProvider';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tropels', label: 'Tropeles' },
  { to: '/signals', label: 'Señales' },
  { to: '/sectors', label: 'Sectores' },
];

export const AppLayout = () => {
  const auth = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">TropelCare</p>
            <h1 className="text-xl font-black text-white">Control Room</h1>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Navegación principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  classNames(
                    'rounded-xl px-3 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>{auth.user?.teamCode}</span>
            <Button variant="secondary" onClick={auth.logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
