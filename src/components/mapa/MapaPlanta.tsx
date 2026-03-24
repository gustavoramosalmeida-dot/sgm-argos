import type { Planta } from '../../types/Planta';
import type { Maquina } from '../../types/Maquina';
import { MapaMaquinaItem } from './MapaMaquinaItem';

interface MapaPlantaProps {
  planta: Planta;
  maquinas: Maquina[];
}

const DEFAULT_MAPA_WIDTH = 600;
const DEFAULT_MAPA_HEIGHT = 400;

export function MapaPlanta({ planta, maquinas }: MapaPlantaProps) {
  const width = planta.larguraMapa ?? DEFAULT_MAPA_WIDTH;
  const height = planta.alturaMapa ?? DEFAULT_MAPA_HEIGHT;
  return (
    <div className="space-y-4">
      <div
        className="relative rounded-lg border border-slate-300 bg-slate-100/80 overflow-hidden"
        style={{
          width,
          height,
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {maquinas.map((maquina) => (
          <MapaMaquinaItem key={maquina.id} maquina={maquina} />
        ))}
      </div>
    </div>
  );
}
