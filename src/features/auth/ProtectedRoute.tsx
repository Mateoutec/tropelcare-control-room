import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { StateBlock } from '../../components/StateBlock';
import { useAuth } from './AuthProvider';

export const ProtectedRoute = () => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'checking') {
    return <div className="mx-auto mt-20 max-w-lg"><StateBlock title="Restaurando sesión" message="Estamos validando tu token de operador." /></div>;
  }

  if (auth.status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
