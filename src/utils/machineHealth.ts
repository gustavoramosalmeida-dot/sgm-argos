import type { QRPoint, QRPointStatus } from '../types/QRPoint';
import type { StatusVisualMaquina } from '../types/Maquina';

export type MaquinaHealthStatus = 'ok' | 'atencao' | 'falha';

export function computeMaquinaHealth(points: QRPoint[]): MaquinaHealthStatus {
  if (!points.length) {
    return 'ok';
  }

  let hasAtencao: boolean = false;

  for (const point of points) {
    const status = (point.status ?? deriveStatusFromHealthScore(point)) as QRPointStatus | undefined;

    if (status === 'falha') {
      return 'falha';
    }

    if (status === 'atencao') {
      hasAtencao = true;
    }
  }

  if (hasAtencao) {
    return 'atencao';
  }

  return 'ok';
}

export function mapHealthToStatusVisual(health: MaquinaHealthStatus): StatusVisualMaquina {
  if (health === 'falha') {
    return 'parada';
  }

  if (health === 'atencao') {
    return 'atencao';
  }

  return 'normal';
}

function deriveStatusFromHealthScore(point: QRPoint): QRPointStatus {
  const score = point.healthScore ?? 100;

  if (score < 60) {
    return 'falha';
  }

  if (score < 85) {
    return 'atencao';
  }

  return 'ok';
}

