import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Planta } from '../../types/Planta';
import { getPlantas } from '../../features/plantas/plantas.service';
import { PlantaCard } from '../../components/plantas/PlantaCard';
import { PageLoading } from '../../components/ui/PageLoading';
import { PageErrorAlert } from '../../components/ui/PageErrorAlert';
import { formatLoadError } from '../../utils/apiErrorMessage';

export function PlantasPage() {
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlantas()
      .then(setPlantas)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageLoading
        title="Carregando plantas"
        description="Sincronizando dados com o servidor."
      />
    );
  }

  if (error) {
    const { message, detail } = formatLoadError(
      error,
      'Não foi possível carregar as plantas. Verifique a conexão e se o servidor está disponível.'
    );
    return (
      <PageErrorAlert
        title="Plantas indisponíveis no momento"
        message={message}
        detail={detail}
      />
    );
  }

  if (plantas.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Plantas</h2>
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-800">Nenhuma planta cadastrada</p>
          <p className="mt-2 text-sm text-slate-600">
            Cadastre sites no backend para exibi-los aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold text-slate-800">Plantas</h2>
        {import.meta.env.DEV ? (
          <Link
            to="/machines/e1b35c6d-4f7a-5b8e-2c9d-0a1e3f4b5c6d"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 underline"
          >
            Dev: abrir máquina por UUID →
          </Link>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plantas.map((planta) => (
          <PlantaCard key={planta.id} planta={planta} />
        ))}
      </div>
    </div>
  );
}
