import type { RadarStatus } from '../types/ComponentEvent';

/** Filtro do inventário alinhado ao mini radar (Todos + cada status). */
export type InventoryRadarFilter = 'all' | RadarStatus;
import type { QRInventoryItem } from '../features/componentEvents/componentEvents.service';
import { isQrPointLinkedToAsset } from './qrPointLink';

/**
 * Ordem de gravidade para o status agregado da máquina (pior primeiro).
 * Regra explícita MVP: o "worst" é o primeiro status nesta ordem com contagem > 0.
 */
export const MACHINE_HEALTH_SEVERITY_ORDER: readonly RadarStatus[] = [
  'VENCIDO',
  'ATENCAO',
  'SEM_HISTORICO',
  'OK',
] as const;

export type MachineHealthSnapshot = {
  counts: Record<RadarStatus, number>;
  worst: RadarStatus;
  qrWithoutAsset: number;
  totalQr: number;
  /** Primeiro QR (ordem do inventário) no status agregado mais crítico. */
  mostCriticalPointId?: string;
};

function emptyCounts(): Record<RadarStatus, number> {
  return {
    OK: 0,
    ATENCAO: 0,
    VENCIDO: 0,
    SEM_HISTORICO: 0,
  };
}

function worstFromCounts(counts: Record<RadarStatus, number>): RadarStatus {
  for (const s of MACHINE_HEALTH_SEVERITY_ORDER) {
    if (counts[s] > 0) return s;
  }
  return 'OK';
}

/**
 * Agrega saúde da máquina a partir do inventário já montado no front.
 * Base por item: `ComponentRadarSummary.radarStatus` (derivado de eventos mock por QR + `calculateComponentRadarSummary`).
 */
export function aggregateMachineHealth(items: QRInventoryItem[]): MachineHealthSnapshot {
  const counts = emptyCounts();
  let qrWithoutAsset = 0;

  for (const { point, radar } of items) {
    counts[radar.radarStatus] += 1;
    if (!isQrPointLinkedToAsset(point)) qrWithoutAsset += 1;
  }

  const totalQr = items.length;
  const worst = totalQr === 0 ? 'OK' : worstFromCounts(counts);

  let mostCriticalPointId: string | undefined;
  if (totalQr > 0) {
    const match = items.find((i) => i.radar.radarStatus === worst);
    if (match) mostCriticalPointId = String(match.point.id);
  }

  return {
    counts,
    worst,
    qrWithoutAsset,
    totalQr,
    mostCriticalPointId,
  };
}
