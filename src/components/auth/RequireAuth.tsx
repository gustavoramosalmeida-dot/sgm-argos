import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { PageLoading } from '@/components/ui/PageLoading';

/**
 * Protege rotas internas do SGM: sem sessão válida redireciona para /login com returnUrl.
 */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <PageLoading
        title="Verificando sessão"
        description="A carregar o seu utilizador."
      />
    );
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <Outlet />;
}
