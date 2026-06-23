import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FieldLabel, TextInput } from '../../components/Field';
import { useAuth } from './AuthProvider';

interface LocationState {
  from?: { pathname?: string };
}

export const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [teamCode, setTeamCode] = useState('TEAM-001');
  const [email, setEmail] = useState('operator@tuckersoft.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (auth.status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await auth.login({ teamCode, email, password });
      navigate(state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">Tuckersoft</p>
          <h1 className="mt-3 text-3xl font-black text-white">TropelCare Control Room</h1>
          <p className="mt-3 text-sm text-slate-400">Ingresa con las credenciales asignadas por el TA.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <FieldLabel>
            Código de equipo
            <TextInput value={teamCode} onChange={(event) => setTeamCode(event.target.value)} required />
          </FieldLabel>
          <FieldLabel>
            Email
            <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </FieldLabel>
          <FieldLabel>
            Password
            <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password-del-equipo" required />
          </FieldLabel>

          {error && <p className="rounded-xl border border-rose-800 bg-rose-950/60 p-3 text-sm text-rose-200">{error}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar a la consola'}
          </Button>
        </form>
      </Card>
    </main>
  );
};
