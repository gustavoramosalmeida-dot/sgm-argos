import type { QRPoint } from "../../types/QRPoint";
import type { QRInventoryItem } from "../../features/componentEvents/componentEvents.service";
import type { InventoryRadarFilter } from "../../utils/machineHealthAggregate";
import { QRInventoryTable } from "../../components/maquina/QRInventoryTable";

interface MachineInventoryPageProps {
  rows: QRInventoryItem[];
  machineId: string;
  loading?: boolean;
  onViewOnMap: (point: QRPoint) => void;
  radarFilter?: InventoryRadarFilter;
  onRadarFilterChange?: (filter: InventoryRadarFilter) => void;
}

export function MachineInventoryPage({
  rows,
  machineId,
  loading = false,
  onViewOnMap,
  radarFilter,
  onRadarFilterChange,
}: MachineInventoryPageProps) {
  return (
    <div className="min-h-[60vh]">
      <QRInventoryTable
        rows={rows}
        machineId={machineId}
        loading={loading}
        onViewOnMap={onViewOnMap}
        radarFilter={radarFilter}
        onRadarFilterChange={onRadarFilterChange}
      />
    </div>
  );
}
