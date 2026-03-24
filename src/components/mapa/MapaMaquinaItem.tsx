import { Link } from 'react-router-dom';
import type { Maquina } from '../../types/Maquina';

interface MapaMaquinaItemProps {
  maquina: Maquina;
}

const statusStyles: Record<string, string> = {
  normal: 'border-emerald-500 bg-emerald-50',
  atencao: 'border-amber-500 bg-amber-50',
  parada: 'border-red-400 bg-red-50',
};

const statusLabels: Record<string, string> = {
  normal: 'Normal',
  atencao: 'Atenção',
  parada: 'Parada',
};

export function MapaMaquinaItem({ maquina }: MapaMaquinaItemProps) {
  const status = maquina.statusVisual ?? 'normal';
  const style: React.CSSProperties = {
    left: maquina.posX,
    top: maquina.posY,
    width: maquina.largura ?? 160,
    height: maquina.altura ?? 100,
  };
  const maquinaId = String(maquina.id);

  return (
    <Link
      to={`/machines/${maquinaId}`}
      style={style}
      className={`absolute rounded-lg border-2 shadow-md p-3 flex flex-col justify-center transition-all hover:shadow-lg hover:scale-[1.02] ${statusStyles[status] ?? statusStyles.normal}`}
    >
      <span className="font-medium text-slate-900 text-sm truncate">{maquina.nome}</span>
      <span className="text-xs text-slate-600 font-mono">{maquina.codigo}</span>
      <span
        className={`mt-1 text-xs font-medium ${
          status === 'normal'
            ? 'text-emerald-700'
            : status === 'atencao'
              ? 'text-amber-700'
              : 'text-red-700'
        }`}
      >
        {statusLabels[status]}
      </span>
    </Link>
  );
}
