import type { QRPoint } from '../../types/QRPoint';
import type { ComponentEvent, ComponentRadarSummary } from '../../types/ComponentEvent';
import { componentEventsMock } from './componentEvents.mock';
import { calculateComponentRadarSummary } from '../../utils/componentRadar';

function sameDomainId(a: number | string, b: number | string): boolean {
  return String(a) === String(b);
}

export async function getComponentEventsByQRPointId(
  qrPointId: number | string
): Promise<ComponentEvent[]> {
  return Promise.resolve(
    componentEventsMock
      .filter((e) => sameDomainId(e.qrPointId, qrPointId))
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
  );
}

export async function getComponentRadarSummaryByQRPointId(
  qrPointId: number | string
): Promise<ComponentRadarSummary> {
  const events = await getComponentEventsByQRPointId(qrPointId);
  return calculateComponentRadarSummary(events);
}

export interface QRInventoryItem {
  point: QRPoint;
  radar: ComponentRadarSummary;
}

export async function getQRInventoryForMachine(
  qrPoints: QRPoint[]
): Promise<QRInventoryItem[]> {
  const items: QRInventoryItem[] = [];
  for (const point of qrPoints) {
    const events = await getComponentEventsByQRPointId(point.id);
    const radar = calculateComponentRadarSummary(events);
    items.push({ point, radar });
  }
  return items;
}

/**
 * Base para futura timeline consolidada da máquina: simplesmente une
 * eventos de todos os QR points e adiciona o contexto do ponto.
 */
export async function getMachineTimelineEvents(
  qrPoints: QRPoint[]
): Promise<(ComponentEvent & { qrPoint: QRPoint })[]> {
  const all: (ComponentEvent & { qrPoint: QRPoint })[] = [];
  for (const point of qrPoints) {
    const events = await getComponentEventsByQRPointId(point.id);
    all.push(
      ...events.map((e) => ({
        ...e,
        qrPoint: point,
      }))
    );
  }
  return all.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}

