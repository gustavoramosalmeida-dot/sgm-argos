import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { getSafeReturnUrl } from '@/utils/safeReturnUrl';

/**
 * Login web: /q → não autenticado → /login?returnUrl=… → POST /api/auth/login (cookie HttpOnly) → returnUrl.
 */
export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, refresh } = useAuth();
  const returnUrlRaw = searchParams.get('returnUrl');

  const safeReturn = useMemo(
    () => getSafeReturnUrl(returnUrlRaw, '/plants'),
    [returnUrlRaw]
  );

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    if (safeReturn.startsWith('http')) {
      window.location.assign(safeReturn);
      return;
    }
    navigate(safeReturn, { replace: true });
  }, [authLoading, user, safeReturn, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(j.message ?? `Falha no login (${res.status})`);
      }
      await refresh();
      if (safeReturn.startsWith('http')) {
        window.location.assign(safeReturn);
      } else {
        navigate(safeReturn, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">
        A carregar…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Entrar no SGM</h1>
        <p className="mt-2 text-sm text-slate-600">
          Utilize o seu utilizador e senha. Após entrar, será redirecionado para o fluxo em curso (ex.: QR
          oficial).
        </p>

        {returnUrlRaw && safeReturn !== returnUrlRaw ? (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            O endereço de retorno foi ajustado por segurança. Será usado:{' '}
            <span className="font-mono break-all">{safeReturn}</span>
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div>
            <label htmlFor="sgm-username" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Utilizador
            </label>
            <input
              id="sgm-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              required
            />
          </div>
          <div>
            <label htmlFor="sgm-password" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Senha
            </label>
            <input
              id="sgm-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/plants" className="font-medium text-slate-700 hover:text-slate-900">
            Voltar às plantas
          </Link>
        </p>
      </div>
    </div>
  );
}
