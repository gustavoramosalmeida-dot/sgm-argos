import { Link } from 'react-router-dom';
import type { Planta } from '../../types/Planta';

interface PlantaCardProps {
  planta: Planta;
}

export function PlantaCard({ planta }: PlantaCardProps) {
  const n = planta.quantidadeMaquinas ?? 0;
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <h3 className="font-medium text-slate-900">{planta.nome}</h3>
      <p className="text-sm text-slate-600 mt-1">{planta.descricao}</p>
      <p className="text-sm text-slate-500 mt-2">
        {n} máquina{n !== 1 ? 's' : ''}
      </p>
      <Link
        to={`/plants/${planta.id}`}
        className="mt-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
      >
        Abrir planta
      </Link>
    </div>
  );
}
