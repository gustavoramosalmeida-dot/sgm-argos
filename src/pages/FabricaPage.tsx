import { useEffect, useState } from 'react';
import type { Planta } from '../types/Planta';
import type { Maquina } from '../types/Maquina';
import { getPlantas } from '../features/plantas/plantas.service';
import { getMachines } from '@/services/sgm';
import type { MachineSummary } from '@/types/sgm-api';
import { mapHealthToStatusVisual } from '../utils/machineHealth';
import type { MaquinaHealthStatus } from '../utils/machineHealth';
import { Link } from 'react-router-dom';
import { MapaPlanta } from '../components/mapa/MapaPlanta';

type ViewMode = 'lista' | 'mapa';

interface MaquinaWithHealth extends Maquina {
  health: MaquinaHealthStatus;
}

interface PlantaWithMaquinas extends Planta {
  maquinas: MaquinaWithHealth[];
}

const healthDot: Record<MaquinaHealthStatus, string> = {
  ok: '🟢',
  atencao: '🟡',
  falha: '🔴',
};

const healthLabel: Record<MaquinaHealthStatus, string> = {
  ok: 'OK',
  atencao: 'Atenção',
  falha: 'Falha',
};

/** Alinhado ao `mapStatus` de MapaPlantaPage / status da API (`failure` / `warning`). */
function machineSummaryStatusToHealth(status: string | null): MaquinaHealthStatus {
  if (status === 'failure') return 'falha';
  if (status === 'warning') return 'atencao';
  return 'ok';
}

function mapMachineSummaryToMaquinaWithHealth(
  m: MachineSummary,
  plantaId: string,
  index: number
): MaquinaWithHealth {
  const health = machineSummaryStatusToHealth(m.status);
  return {
    id: m.id,
    plantaId,
    nome: m.name,
    codigo: m.code ?? String(m.id),
    codigoQrRaiz: m.qrRootCode ?? undefined,
    descricao: m.description ?? '',
    posX: 20 + (index % 3) * 180,
    posY: 20 + Math.floor(index / 3) * 100,
    statusVisual: mapHealthToStatusVisual(health),
    health,
  };
}

export function FabricaPage() {
  const [plantas, setPlantas] = useState<PlantaWithMaquinas[]>([]);
  const [machineSummaries, setMachineSummaries] = useState<MachineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('lista');

  useEffect(() => {
    Promise.all([getPlantas(), getMachines()])
      .then(([plantasList, machinesRes]) => {
        const machinesList = machinesRes.items;
        setMachineSummaries(machinesList);

        const bySiteId = new Map<string, MachineSummary[]>();
        for (const m of machinesList) {
          const sid = m.site?.id;
          if (!sid) continue;
          if (!bySiteId.has(sid)) bySiteId.set(sid, []);
          bySiteId.get(sid)!.push(m);
        }

        const plantasWithMaquinas: PlantaWithMaquinas[] = plantasList.map((planta) => {
          const raw = bySiteId.get(planta.id) ?? [];
          const maquinas = raw.map((m, idx) =>
            mapMachineSummaryToMaquinaWithHealth(m, planta.id, idx)
          );
          return { ...planta, maquinas };
        });

        setPlantas(plantasWithMaquinas);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Carregando visão da fábrica...</div>;
  }

  const totalMaquinas = machineSummaries.length;
  const orphanCount = machineSummaries.filter((m) => !m.site?.id).length;

  const byHealth = machineSummaries.reduce<Record<MaquinaHealthStatus, number>>(
    (acc, m) => {
      const h = machineSummaryStatusToHealth(m.status);
      acc[h] = (acc[h] ?? 0) + 1;
      return acc;
    },
    { ok: 0, atencao: 0, falha: 0 }
  );

  const maquinasForMapa = (planta: PlantaWithMaquinas): Maquina[] =>
    planta.maquinas.map((m) => ({
      ...m,
      statusVisual: mapHealthToStatusVisual(m.health),
    }));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">
          Visão global da fábrica
        </h2>
        <p className="text-sm text-slate-600">
          Todas as plantas, máquinas e seus estados — o &quot;Google Maps&quot; da
          fábrica. Planta → Máquinas → Componentes → Saúde. Dados de máquinas e
          status vêm da API.
        </p>
      </header>

      {/* Resumo operacional */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Plantas</div>
            <div className="text-xl font-semibold text-slate-900">{plantas.length}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Máquinas</div>
            <div className="text-xl font-semibold text-slate-900">{totalMaquinas}</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">{healthDot.ok} OK</div>
            <div className="text-xl font-semibold text-emerald-800">{byHealth.ok}</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">{healthDot.atencao} Atenção</div>
            <div className="text-xl font-semibold text-amber-800">{byHealth.atencao}</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-red-700 uppercase tracking-wide">{healthDot.falha} Falha</div>
            <div className="text-xl font-semibold text-red-800">{byHealth.falha}</div>
          </div>
        </div>
        {orphanCount > 0 ? (
          <p className="text-xs text-slate-500">
            {orphanCount} máquina(s) na API sem site associado — não aparecem agrupadas por planta.
          </p>
        ) : null}
      </div>

      {/* Alternância Lista / Mapa */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setViewMode('lista')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            viewMode === 'lista'
              ? 'bg-slate-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => setViewMode('mapa')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            viewMode === 'mapa'
              ? 'bg-slate-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mapa
        </button>
      </div>

      {viewMode === 'lista' ? (
        <div className="space-y-6">
          {plantas.map((planta) => (
            <section
              key={planta.id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm p-4"
            >
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{planta.nome}</h3>
                  <p className="text-xs text-slate-500">{planta.descricao}</p>
                </div>
                <Link
                  to={`/plants/${planta.id}`}
                  className="text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  Ver mapa da planta →
                </Link>
              </div>

              {planta.maquinas.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma máquina nesta planta.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {planta.maquinas.map((maquina) => (
                    <li key={maquina.id} className="flex items-center gap-2">
                      <span className="text-base" title={healthLabel[maquina.health]}>
                        {healthDot[maquina.health]}
                      </span>
                      <Link
                        to={`/machines/${maquina.id}`}
                        className="text-slate-800 hover:text-slate-900"
                      >
                        {maquina.nome}
                      </Link>
                      <span className="text-xs text-slate-500 font-mono">
                        {maquina.codigo}
                      </span>
                      <span className="ml-auto text-[11px] uppercase tracking-wide text-slate-500">
                        {healthLabel[maquina.health]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {plantas.map((planta) => (
            <section
              key={planta.id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm p-4"
            >
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{planta.nome}</h3>
                  <p className="text-xs text-slate-500">{planta.descricao}</p>
                </div>
                <Link
                  to={`/plants/${planta.id}`}
                  className="text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  Ver mapa da planta →
                </Link>
              </div>
              {planta.maquinas.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 text-sm">
                  Nenhuma máquina nesta planta.
                </div>
              ) : (
                <MapaPlanta planta={planta} maquinas={maquinasForMapa(planta)} />
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
