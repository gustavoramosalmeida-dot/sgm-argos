import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMachines } from '@/services/sgm';
import type { MachineSummary } from '@/types/sgm-api';

export function MaquinasPage() {
  const [machines, setMachines] = useState<MachineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMachines()
      .then((res) => setMachines(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Carregando máquinas...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-medium">Erro ao carregar máquinas</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-xs mt-2 text-red-600">
          Verifique se o backend está rodando em http://localhost:3333 e se a API
          responde em /api/sgm/machines
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">
          Lista de máquinas
        </h2>
        <p className="text-sm text-slate-600">
          Dados vindos da API <code className="bg-slate-100 px-1 rounded">/api/sgm/machines</code> via proxy do Vite.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        {machines.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nenhuma máquina encontrada.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {machines.map((m) => (
              <li key={m.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/machines/${m.id}`}
                    className="font-medium text-slate-900 hover:text-slate-700"
                  >
                    {m.name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    {m.code && (
                      <span className="font-mono">{m.code}</span>
                    )}
                    {m.site?.name && (
                      <span>· {m.site.name}</span>
                    )}
                    {m.qrRootCode && (
                      <span className="text-slate-400" title="QR raiz">· {m.qrRootCode}</span>
                    )}
                  </div>
                  {m.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {m.description}
                    </p>
                  )}
                </div>
                {m.status && (
                  <span className="text-xs uppercase tracking-wide text-slate-500 shrink-0">
                    {m.status}
                  </span>
                )}
                <div className="text-xs text-slate-400 shrink-0 tabular-nums">
                  {m.totals.qrPoints} QR · {m.totals.components} comp. · {m.totals.events} ev.
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
