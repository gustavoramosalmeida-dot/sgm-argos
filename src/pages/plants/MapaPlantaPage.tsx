import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Planta } from '../../types/Planta';
import type { Maquina, StatusVisualMaquina } from '../../types/Maquina';
import { getPlantaById } from '../../features/plantas/plantas.service';
import { getMachines } from '@/services/sgm';
import type { MachineSummary } from '@/types/sgm-api';
import { MapaPlanta } from '../../components/mapa/MapaPlanta';
import { MachineFormDrawer } from '../../components/machines/MachineFormDrawer';
import { PageLoading } from '../../components/ui/PageLoading';
import { PageErrorAlert } from '../../components/ui/PageErrorAlert';
import { formatLoadError } from '../../utils/apiErrorMessage';

function mapStatus(status: string | null): StatusVisualMaquina {
  if (status === 'failure') return 'parada';
  if (status === 'warning') return 'atencao';
  return 'normal';
}

function mapApiMachineToMaquina(m: MachineSummary, siteId: string, index: number): Maquina {
  return {
    id: m.id,
    plantaId: siteId,
    nome: m.name,
    codigo: m.code ?? m.id,
    descricao: m.description ?? '',
    posX: 20 + (index % 3) * 180,
    posY: 20 + Math.floor(index / 3) * 100,
    statusVisual: mapStatus(m.status),
  };
}

const emptyForm = { name: '', code: '', description: '', imageUrl: '' };

export function MapaPlantaPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [planta, setPlanta] = useState<Planta | null>(null);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [machineSummaries, setMachineSummaries] = useState<MachineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [drawerInitial, setDrawerInitial] = useState(emptyForm);

  const loadData = useCallback(async () => {
    if (!siteId) return;
    setError(null);
    setLoading(true);
    try {
      const [p, res] = await Promise.all([getPlantaById(siteId), getMachines({ siteId })]);
      setPlanta(p ?? null);
      const list = res?.items ?? [];
      setMachineSummaries(list);
      setMaquinas(list.map((m, i) => mapApiMachineToMaquina(m, siteId, i)));
    } catch (err) {
      setPlanta(null);
      setMaquinas([]);
      setMachineSummaries([]);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (!siteId) {
      setLoading(false);
      return;
    }
    void loadData();
  }, [siteId, loadData]);

  function openCreate() {
    setDrawerMode('create');
    setEditingMachineId(null);
    setDrawerInitial(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(machineId: string) {
    const m = machineSummaries.find((x) => x.id === machineId);
    if (!m) return;
    setDrawerMode('edit');
    setEditingMachineId(machineId);
    setDrawerInitial({
      name: m.name,
      code: m.code ?? '',
      description: m.description ?? '',
      imageUrl: '',
    });
    setDrawerOpen(true);
  }

  if (loading) {
    return (
      <PageLoading
        title="Carregando planta"
        description="Buscando dados do site e das máquinas."
      />
    );
  }

  if (error) {
    const { message, detail } = formatLoadError(
      error,
      'Não foi possível carregar esta planta. Verifique a conexão e se o servidor está disponível.'
    );
    return (
      <PageErrorAlert
        title="Não foi possível abrir a planta"
        message={message}
        detail={detail}
        backTo={{ label: '← Voltar às plantas', to: '/plants' }}
      />
    );
  }

  if (!planta || !siteId) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-700">
        <p className="font-medium text-slate-900">Planta não encontrada</p>
        <p className="mt-2 text-sm text-slate-600">
          O link pode estar incorreto ou o site não existe mais.
        </p>
        <Link
          to="/plants"
          className="mt-4 inline-block text-sm font-medium text-slate-800 underline underline-offset-2"
        >
          ← Voltar às plantas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">{planta.nome}</h2>
          <p className="text-slate-600">{planta.descricao}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
        >
          Nova máquina
        </button>
      </div>

      {maquinas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-800">Nenhuma máquina nesta planta</p>
          <p className="mt-2 text-sm text-slate-600">
            Cadastre uma máquina para começar a mapear QR e ativos.
          </p>
        </div>
      ) : (
        <>
          <MapaPlanta planta={planta} maquinas={maquinas} />
          <section className="mt-6" aria-label="Lista de máquinas">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Máquinas</h3>
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {maquinas.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Link
                    to={`/machines/${m.id}`}
                    className="font-medium text-slate-900 hover:underline min-w-0 flex-1 truncate"
                  >
                    {m.nome}
                  </Link>
                  <span className="text-xs font-mono text-slate-500 truncate max-w-[12rem]">{m.codigo}</span>
                  <button
                    type="button"
                    onClick={() => openEdit(String(m.id))}
                    className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <MachineFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        siteId={siteId}
        machineId={editingMachineId}
        initialValues={drawerInitial}
        onClose={() => setDrawerOpen(false)}
        onSaved={async (res) => {
          const wasCreate = drawerMode === 'create';
          await loadData();
          setDrawerOpen(false);
          if (wasCreate) {
            navigate(`/machines/${res.id}`);
          }
        }}
      />
    </div>
  );
}
