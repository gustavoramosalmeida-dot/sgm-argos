import { useMemo, useState } from 'react';
import type { QRPoint, QRPointStatus } from '../../types/QRPoint';
import { QRPointDeleteConfirm } from './QRPointDeleteConfirm';

interface QRPointEditorProps {
  point: QRPoint;
  allPoints: QRPoint[];
  onSave: (updated: QRPoint) => void | Promise<void>;
  onDelete: (id: number | string) => void | Promise<void>;
  /** Painel compacto no editor visual: oculta blocos secundários e reduz ruído. */
  embedded?: boolean;
}

const QR_POINT_TYPES = [
  { value: 'motor', label: 'Motor' },
  { value: 'sensor', label: 'Sensor' },
  { value: 'painel', label: 'Painel' },
  { value: 'correia', label: 'Correia' },
  { value: 'atuador', label: 'Atuador' },
  { value: 'estrutura', label: 'Estrutura' },
  { value: 'outro', label: 'Outro' },
] as const;

type QRPointTipo = (typeof QR_POINT_TYPES)[number]['value'];

const QR_POINT_STATUS: { value: QRPointStatus; label: string }[] = [
  { value: 'ok', label: 'OK' },
  { value: 'atencao', label: 'Atenção' },
  { value: 'falha', label: 'Falha' },
];

export function QRPointEditor({ point, allPoints, onSave, onDelete, embedded = false }: QRPointEditorProps) {
  const [codigo, setCodigo] = useState(point.codigo);
  const [descricao, setDescricao] = useState(point.descricao);
  const [tipo, setTipo] = useState<QRPointTipo>(
    (point.tipo as QRPointTipo) && QR_POINT_TYPES.some((t) => t.value === point.tipo)
      ? (point.tipo as QRPointTipo)
      : 'outro'
  );
  const [status, setStatus] = useState<QRPointStatus>(point.status ?? 'ok');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasCodeConflict = useMemo(() => {
    const normalized = codigo.trim();
    if (!normalized) return false;
    return allPoints.some(
      (p) => p.id !== point.id && p.codigo.trim().toLowerCase() === normalized.toLowerCase()
    );
  }, [allPoints, codigo, point.id]);

  const handleSave = async () => {
    const trimmedCodigo = codigo.trim();
    const trimmedDescricao = descricao.trim();

    if (!trimmedCodigo) {
      setError('Informe um código para o QR point.');
      return;
    }

    if (!trimmedDescricao || trimmedDescricao.length < 5) {
      setError('Informe uma descrição mínima (pelo menos 5 caracteres).');
      return;
    }

    if (hasCodeConflict) {
      setError('Já existe outro QR point com este código nesta máquina.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          ...point,
          codigo: trimmedCodigo,
          descricao: trimmedDescricao,
          tipo,
          status,
        })
      );
    } catch {
      setError('Não foi possível salvar as alterações do ponto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await Promise.resolve(onDelete(point.id));
      setConfirmDelete(false);
    } catch {
      setError('Não foi possível remover o ponto.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${embedded ? 'p-3' : 'p-4'}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {embedded ? 'Editar ponto' : 'Editor de QR point'}
        </p>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
          ID {point.id}
        </span>
      </div>

      <div className={`mb-3 space-y-1 ${embedded ? 'mb-2' : ''}`}>
        <p className="text-xs text-slate-500">
          Posição: {point.x.toFixed(1)}%, {point.y.toFixed(1)}%
        </p>
        {tipo && !embedded && (
          <p className="text-xs text-slate-400 capitalize">Tipo: {tipo}</p>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="qr-codigo">
            Código
          </label>
          <input
            id="qr-codigo"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={saving || deleting}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-xs font-medium text-slate-700"
            htmlFor="qr-descricao"
          >
            Descrição
          </label>
          <textarea
            id="qr-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={embedded ? 2 : 3}
            className="block w-full resize-none rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={saving || deleting}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-xs font-medium text-slate-700"
            htmlFor="qr-tipo"
          >
            Tipo do componente
          </label>
          <select
            id="qr-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as QRPointTipo)}
            className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={saving || deleting}
          >
            {QR_POINT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="mb-1 block text-xs font-medium text-slate-700"
            htmlFor="qr-status"
          >
            Status operacional
          </label>
          <select
            id="qr-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as QRPointStatus)}
            className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={saving || deleting}
          >
            {QR_POINT_STATUS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!embedded ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/80 p-3">
          {/* Estrutura para integração ARGOS (Prompt 10) — exibição mock */}
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
              Dados de saúde (preparado para ARGOS)
            </p>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Health score</dt>
                <dd className="font-mono text-slate-700">
                  {point.healthScore != null ? `${point.healthScore}%` : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Última inspeção</dt>
                <dd className="text-slate-700">{point.ultimaInspecao ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Próxima manutenção</dt>
                <dd className="text-slate-700">{point.proximaManutencao ?? '—'}</dd>
              </div>
              {point.alertas && point.alertas.length > 0 && (
                <div>
                  <dt className="text-slate-500 mb-0.5">Alertas</dt>
                  <dd className="text-slate-700">
                    <ul className="list-disc list-inside space-y-0.5">
                      {point.alertas.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
        </div>
      ) : null}

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={saving || deleting}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? 'Removendo…' : 'Remover QR point'}
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || deleting}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>

      {confirmDelete && (
        <QRPointDeleteConfirm
          codigo={point.codigo}
          descricao={point.descricao}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
}

