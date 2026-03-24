import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-slate-800 text-white px-6 py-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          SGM — Sistema de Gestão de Máquinas
        </h1>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-300" title={user.username}>
              {user.displayName}
            </span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-md border border-slate-600 px-3 py-1.5 font-medium text-slate-100 hover:bg-slate-700"
            >
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
