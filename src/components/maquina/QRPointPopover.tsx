import type { QRPoint } from '../../types/QRPoint';

interface QRPointPopoverProps {
  point: QRPoint;
  onClose: () => void;
}

/**
 * Popover com informações do QR point: código, descrição, posição.
 * Posicionado acima do marcador (mesmo sistema de coordenadas % da imagem).
 */
export function QRPointPopover({ point, onClose }: QRPointPopoverProps) {
  return (
    <div
      className="absolute z-20 min-w-[200px] rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        transform: 'translate(-50%, calc(-100% - 12px))',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-mono text-sm font-medium text-slate-800">{point.codigo}</p>
          <p className="text-sm text-slate-600">{point.descricao}</p>
          {point.tipo && (
            <p className="text-xs text-slate-500 capitalize">{point.tipo}</p>
          )}
          {(point.healthScore !== undefined ||
            point.ultimaInspecao ||
            point.proximaManutencao ||
            (point.alertas && point.alertas.length > 0)) && (
            <div className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">
              <p className="mb-1 font-semibold text-slate-700">Saúde do componente</p>
              {point.healthScore !== undefined && (
                <p>
                  <span className="font-medium">Health Score:</span> {point.healthScore}
                </p>
              )}
              {point.ultimaInspecao && (
                <p>
                  <span className="font-medium">Última inspeção:</span> {point.ultimaInspecao}
                </p>
              )}
              {point.proximaManutencao && (
                <p>
                  <span className="font-medium">Próxima manutenção:</span> {point.proximaManutencao}
                </p>
              )}
              {point.alertas && point.alertas.length > 0 && (
                <div className="mt-1">
                  <p className="font-medium">Alertas:</p>
                  <ul className="list-inside list-disc">
                    {point.alertas.map((alerta, idx) => (
                      <li key={idx}>{alerta}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {point.status && (
            <p
              className={`text-xs font-medium ${
                point.status === 'ok'
                  ? 'text-emerald-600'
                  : point.status === 'atencao'
                    ? 'text-amber-600'
                    : 'text-red-600'
              }`}
            >
              Status: {point.status === 'ok' ? 'OK' : point.status === 'atencao' ? 'Atenção' : 'Falha'}
            </p>
          )}
          <p className="text-xs text-slate-400">
            Posição: {point.x.toFixed(1)}%, {point.y.toFixed(1)}%
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Fechar"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
